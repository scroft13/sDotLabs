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

export type PrintfulFilePosition = {
  area_width: number;
  area_height: number;
  width: number;
  height: number;
  top: number;
  left: number;
  limit_to_print_area: true;
};

export type PrintfulOrderInput = {
  external_id: string;
  recipient: PrintfulRecipient;
  items: {
    variant_id: number;
    quantity: number;
    files: { url: string; position?: PrintfulFilePosition }[];
  }[];
};

// Printful's default behavior crops a file to fill the print area. Passing
// an explicit position instead fits the whole photo inside the area at its
// own aspect ratio, centered -- any leftover space just prints blank, which
// reads as an intentional margin rather than a cropped edge.
export function containFitPosition(
  photoWidthPx: number,
  photoHeightPx: number,
  areaWidthPx: number,
  areaHeightPx: number,
): PrintfulFilePosition {
  const scale = Math.min(areaWidthPx / photoWidthPx, areaHeightPx / photoHeightPx);
  const width = Math.round(photoWidthPx * scale);
  const height = Math.round(photoHeightPx * scale);
  return {
    area_width: areaWidthPx,
    area_height: areaHeightPx,
    width,
    height,
    left: Math.round((areaWidthPx - width) / 2),
    top: Math.round((areaHeightPx - height) / 2),
    limit_to_print_area: true,
  };
}

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
