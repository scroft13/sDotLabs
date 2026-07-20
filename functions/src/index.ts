import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import {
  catalog,
  findVariant,
  resolutionScale,
  resolveAspectCategory,
  type PrintAspectRatio,
} from './catalog';
import { parsePricingSettings, retailCentsFor, shippingCentsFor } from './pricing';
import { createProdigiOrder, prodigiColorAttribute } from './prodigi';
import { publicUrl } from './publicUrl';
import { backfillThumbnails, resizeImage } from './resizeImage';

export { backfillThumbnails, resizeImage };

initializeApp();
const db = getFirestore();

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const PRODIGI_API_KEY = defineSecret('PRODIGI_API_KEY');
// Prodigi has no per-order draft/confirm mode like Printful did -- the
// sandbox environment (never fulfils, never charges) is the safety net
// instead. Flip to 'false' only once verified end-to-end (see plan).
const PRODIGI_SANDBOX = defineString('PRODIGI_SANDBOX', { default: 'true' });

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
      printAspectRatio?: PrintAspectRatio;
    };

    // Prints are always full-bleed (fillPrintArea), so only sizes matching
    // the photo's aspect category may be sold -- anything else would crop
    // visibly rather than leave paper borders.
    const category = resolveAspectCategory(
      photo.printAspectRatio ?? null,
      photo.width ?? null,
      photo.height ?? null,
    );
    if (category !== variant.aspectRatio) {
      throw new HttpsError(
        'failed-precondition',
        "This print size does not match the photo's aspect ratio",
      );
    }

    const scale = resolutionScale(photo.width ?? null, photo.height ?? null, variant);
    if (scale !== null && scale > catalog.maxUpscale) {
      throw new HttpsError(
        'failed-precondition',
        'This photo does not have enough resolution for that print size',
      );
    }

    // Admin-tuned pricing knobs (multiplier + per-product shipping charge);
    // the client reads the same doc, so display and charge stay in lockstep.
    const pricingSnap = await db.doc('settings/pricing').get();
    const pricing = parsePricingSettings(pricingSnap.data());

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
            unit_amount: retailCentsFor(variant, pricing.multiplier),
            product_data: {
              name: `“${title}” — ${productLabel}, ${variant.size}${frameNote}`,
              images: [publicUrl(photo.storage_path)],
            },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      // What the buyer is charged for shipping: Prodigi's real per-product
      // cost by default (it varies a lot -- framed pieces ship for several
      // times a bare print), or the admin's override when the owner chooses
      // to eat part of it.
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: 'Tracked shipping',
            fixed_amount: {
              amount: shippingCentsFor(variant, pricing.shipping),
              currency: catalog.currency,
            },
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
      },
    });

    return { url: session.url };
  },
);

export const stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PRODIGI_API_KEY] },
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
    // Only re-attempt Prodigi when the previous attempt recorded a failure.
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
      const retryableStatuses = ['prodigi_failed', 'missing_shipping'];
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

    const variantForOrder = findVariant(meta.sku ?? '')?.variant;
    if (!variantForOrder) {
      await orderRef.update({ status: 'prodigi_failed', error: 'Unknown sku in order metadata' });
      res.status(500).send('Unknown sku');
      return;
    }

    try {
      const prodigiOrder = await createProdigiOrder(
        PRODIGI_API_KEY.value(),
        {
          merchantReference: session.id,
          recipient: {
            name: shipping.name ?? session.customer_details?.name ?? 'Customer',
            email: session.customer_details?.email ?? undefined,
            address: {
              line1: address.line1 ?? '',
              line2: address.line2 ?? undefined,
              postalOrZipCode: address.postal_code ?? '',
              countryCode: address.country ?? 'US',
              townOrCity: address.city ?? '',
              stateOrCounty: address.state ?? undefined,
            },
          },
          items: [
            {
              sku: variantForOrder.prodigiSku,
              copies: 1,
              // Full-bleed: the photo always fills the paper edge to edge.
              // Checkout only sells sizes matching the photo's aspect
              // category, so at most a sub-3%-tolerance sliver ever gets
              // shaved -- never a visible crop, and never a paper border.
              sizing: 'fillPrintArea',
              attributes: variantForOrder.frameColor
                ? { color: prodigiColorAttribute(variantForOrder.frameColor) }
                : {},
              assets: [{ printArea: 'default', url: publicUrl(meta.storagePath ?? '') }],
            },
          ],
        },
        PRODIGI_SANDBOX.value() === 'true',
      );

      await orderRef.update({
        status: 'submitted',
        prodigi_order_id: prodigiOrder.id,
        prodigi_status: prodigiOrder.status,
        prodigi_sandbox: PRODIGI_SANDBOX.value() === 'true',
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
        status: 'prodigi_failed',
        error: err instanceof Error ? err.message : String(err),
      });
      // 500 makes Stripe retry; the guard above allows the retry through.
      res.status(500).send('Prodigi order failed');
    }
  },
);
