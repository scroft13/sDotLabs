const PRODIGI_LIVE_API = 'https://api.prodigi.com';
const PRODIGI_SANDBOX_API = 'https://api.sandbox.prodigi.com';

// Our catalog's frameColor values are the customer-facing labels (matching
// the swatch UI and the old Printful naming); Prodigi's actual
// attributes.color values differ for some of them.
const PRODIGI_COLOR_ATTRIBUTE: Record<string, string> = {
  oak: 'natural',
};

export function prodigiColorAttribute(frameColor: string): string {
  return PRODIGI_COLOR_ATTRIBUTE[frameColor] ?? frameColor;
}

export type ProdigiRecipient = {
  name: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    postalOrZipCode: string;
    countryCode: string;
    townOrCity: string;
    stateOrCounty?: string;
  };
};

export type ProdigiOrderInput = {
  merchantReference: string;
  recipient: ProdigiRecipient;
  items: {
    sku: string;
    copies: number;
    sizing: 'fillPrintArea' | 'fitPrintArea';
    attributes?: Record<string, string>;
    assets: { printArea: string; url: string }[];
  }[];
};

export async function createProdigiOrder(
  apiKey: string,
  order: ProdigiOrderInput,
  sandbox: boolean,
): Promise<{ id: string; status: string }> {
  const base = sandbox ? PRODIGI_SANDBOX_API : PRODIGI_LIVE_API;
  const res = await fetch(`${base}/v4.0/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({ shippingMethod: 'Budget', ...order }),
  });
  const body = (await res.json()) as {
    outcome?: string;
    order?: { id: string; status?: { stage?: string } };
    error?: { message?: string };
  };
  if (!res.ok || !body.order) {
    throw new Error(
      `Prodigi order failed (${res.status}): ${body.error?.message ?? body.outcome ?? 'unknown'}`,
    );
  }
  return { id: body.order.id, status: body.order.status?.stage ?? 'unknown' };
}
