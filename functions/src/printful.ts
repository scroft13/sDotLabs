const PRINTFUL_API = 'https://api.printful.com';
// This account has multiple stores, so the Orders API requires the caller
// to say which one every order belongs to.
const PRINTFUL_STORE_ID = 16443344; // "S.Labs"

export type PrintfulRecipient = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip?: string;
  email?: string;
};

export type PrintfulOrderInput = {
  external_id: string;
  recipient: PrintfulRecipient;
  items: { variant_id: number; quantity: number; files: { url: string }[] }[];
};

export async function createPrintfulOrder(
  apiKey: string,
  order: PrintfulOrderInput,
  confirm: boolean,
): Promise<{ id: number; status: string }> {
  const res = await fetch(`${PRINTFUL_API}/orders?confirm=${confirm ? 1 : 0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-PF-Store-Id': String(PRINTFUL_STORE_ID),
    },
    body: JSON.stringify(order),
  });
  const body = (await res.json()) as {
    result?: { id: number; status: string };
    error?: { message?: string };
  };
  if (!res.ok || !body.result) {
    throw new Error(`Printful order failed (${res.status}): ${body.error?.message ?? 'unknown'}`);
  }
  return body.result;
}
