import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import { catalog, dpiFor, findVariant } from './catalog';
import { containFitPosition, createPrintfulOrder } from './printful';
import { publicUrl } from './publicUrl';

initializeApp();
const db = getFirestore();

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const PRINTFUL_API_KEY = defineSecret('PRINTFUL_API_KEY');
// Launch safety net: while 'false', Printful orders are created as free,
// deletable drafts the owner confirms manually in the Printful dashboard.
const PRINTFUL_CONFIRM = defineString('PRINTFUL_CONFIRM', { default: 'false' });

// Origins allowed to receive Stripe redirects. Guards against a third party
// using this callable to mint checkout sessions that bounce buyers (and
// their payments for our photos) through some other site.
const ORIGIN_ALLOWLIST = [
  /^https:\/\/(www\.)?sdotlabs\.com$/,
  /^https:\/\/sdotlabs-2\.(web\.app|firebaseapp\.com)$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
];
const CANCEL_PATH_RE = /^\/album\/[\w-]+\/photo\/[\w-]+\/?$/;

export const createCheckoutSession = onCall(
  { secrets: [STRIPE_SECRET_KEY], cors: true },
  async (request) => {
    const { photoId, sku, origin, cancelPath } = (request.data ?? {}) as Record<string, unknown>;

    if (typeof photoId !== 'string' || typeof sku !== 'string') {
      throw new HttpsError('invalid-argument', 'photoId and sku are required');
    }
    if (typeof origin !== 'string' || !ORIGIN_ALLOWLIST.some((re) => re.test(origin))) {
      throw new HttpsError('invalid-argument', 'Unrecognized origin');
    }
    if (typeof cancelPath !== 'string' || !CANCEL_PATH_RE.test(cancelPath)) {
      throw new HttpsError('invalid-argument', 'Invalid cancel path');
    }

    const found = findVariant(sku);
    if (!found) throw new HttpsError('not-found', 'Unknown product sku');
    const { variant, productLabel } = found;

    const photoSnap = await db.doc(`photos/${photoId}`).get();
    if (!photoSnap.exists) throw new HttpsError('not-found', 'Photo not found');
    const photo = photoSnap.data() as {
      storage_path: string;
      title?: string | null;
      width?: number | null;
      height?: number | null;
    };

    const dpi = dpiFor(photo.width ?? null, photo.height ?? null, variant);
    if (dpi !== null && dpi < catalog.minDpi) {
      throw new HttpsError(
        'failed-precondition',
        'This photo does not have enough resolution for that print size',
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const title = photo.title || 'Untitled';
    const frameNote = variant.frameColor ? `, ${variant.frameColor} frame` : '';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: catalog.currency,
            unit_amount: variant.retailCents,
            product_data: {
              name: `“${title}” — ${productLabel}, ${variant.size}${frameNote}`,
              images: [publicUrl(photo.storage_path)],
            },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: catalog.shipping.label,
            fixed_amount: { amount: catalog.shipping.flatCents, currency: catalog.currency },
          },
        },
      ],
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      // ?order=1 reopens the order panel when the buyer backs out of Checkout.
      cancel_url: `${origin}${cancelPath}?order=1`,
      metadata: {
        photoId,
        storagePath: photo.storage_path,
        sku,
        printfulVariantId: String(variant.printfulVariantId),
        // Carried through to the webhook so the Printful order can be placed
        // to fit the photo's own aspect ratio instead of cropping it.
        photoWidth: photo.width ? String(photo.width) : '',
        photoHeight: photo.height ? String(photo.height) : '',
      },
    });

    return { url: session.url };
  },
);

export const stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PRINTFUL_API_KEY] },
  async (req, res) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers['stripe-signature'] as string,
        STRIPE_WEBHOOK_SECRET.value(),
      );
    } catch {
      res.status(400).send('Invalid signature');
      return;
    }

    if (event.type !== 'checkout.session.completed') {
      res.status(200).send('Ignored');
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const orderRef = db.doc(`orders/${session.id}`);

    // Idempotency guard: create() throws ALREADY_EXISTS on Stripe redelivery.
    // Only re-attempt Printful when the previous attempt recorded a failure.
    try {
      await orderRef.create({
        status: 'processing',
        photo_id: meta.photoId ?? null,
        sku: meta.sku ?? null,
        amount_total: session.amount_total,
        currency: session.currency,
        email: session.customer_details?.email ?? null,
        created_at: FieldValue.serverTimestamp(),
      });
    } catch {
      const existing = await orderRef.get();
      const retryableStatuses = ['printful_failed', 'missing_shipping'];
      if (!retryableStatuses.includes(existing.data()?.status)) {
        res.status(200).send('Duplicate');
        return;
      }
    }

    // Stripe moved Checkout Session shipping details under
    // `collected_information.shipping_details` in newer API versions --
    // whichever version the webhook endpoint is configured for determines
    // the actual payload shape, independent of this SDK's typings, so check
    // both locations rather than trusting the (possibly stale) type defs.
    const sessionAny = session as unknown as {
      shipping_details?: Stripe.Checkout.Session.ShippingDetails | null;
      collected_information?: { shipping_details?: Stripe.Checkout.Session.ShippingDetails | null };
    };
    const shipping =
      sessionAny.collected_information?.shipping_details ?? sessionAny.shipping_details;
    const address = shipping?.address;
    if (!shipping || !address) {
      await orderRef.update({ status: 'missing_shipping' });
      res.status(200).send('No shipping details');
      return;
    }

    // Fit the photo into the print area instead of letting Printful crop it
    // to fill -- only possible when we know both the photo's pixel
    // dimensions (older uploads may not) and the variant's print area.
    const variantForOrder = findVariant(meta.sku ?? '')?.variant;
    const photoWidth = Number(meta.photoWidth);
    const photoHeight = Number(meta.photoHeight);
    const position =
      variantForOrder && photoWidth && photoHeight
        ? containFitPosition(
            photoWidth,
            photoHeight,
            variantForOrder.printAreaWidthPx,
            variantForOrder.printAreaHeightPx,
          )
        : undefined;

    try {
      const printfulOrder = await createPrintfulOrder(
        PRINTFUL_API_KEY.value(),
        {
          // Printful caps external_id at 32 chars; the full Stripe session id
          // (~66 chars) exceeds that, so use its trailing random segment --
          // Firestore's own idempotency guard still keys off the full id.
          external_id: session.id.slice(-32),
          recipient: {
            name: shipping.name ?? session.customer_details?.name ?? 'Customer',
            address1: address.line1 ?? '',
            address2: address.line2 ?? undefined,
            city: address.city ?? '',
            state_code: address.state ?? undefined,
            country_code: address.country ?? 'US',
            zip: address.postal_code ?? undefined,
            email: session.customer_details?.email ?? undefined,
          },
          items: [
            {
              variant_id: Number(meta.printfulVariantId),
              quantity: 1,
              files: [{ url: publicUrl(meta.storagePath ?? ''), position }],
            },
          ],
        },
        PRINTFUL_CONFIRM.value() === 'true',
      );

      await orderRef.update({
        status: PRINTFUL_CONFIRM.value() === 'true' ? 'submitted' : 'draft_created',
        printful_order_id: printfulOrder.id,
        printful_status: printfulOrder.status,
        shipping: {
          name: shipping.name ?? null,
          city: address.city ?? null,
          state: address.state ?? null,
          country: address.country ?? null,
        },
      });
      res.status(200).send('OK');
    } catch (err) {
      await orderRef.update({
        status: 'printful_failed',
        error: err instanceof Error ? err.message : String(err),
      });
      // 500 makes Stripe retry; the guard above allows the retry through.
      res.status(500).send('Printful order failed');
    }
  },
);
