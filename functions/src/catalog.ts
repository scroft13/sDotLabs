import catalogJson from './catalog.json';

export type PrintVariant = {
  sku: string;
  prodigiSku: string;
  size: string;
  // Manufactured print-area pixel dimensions -- not always the same aspect
  // ratio as the nominal product size (e.g. a framed product's mat cutout
  // can be a different ratio than the frame's own labeled size).
  printAreaWidthPx: number;
  printAreaHeightPx: number;
  // Matches Photo['printAspectRatio'] in src/lib/shared.ts -- lets the order
  // panel offer only variants that fit a given photo without a border.
  aspectRatio: '2:3' | '4:5' | '3:4' | '1:1' | '2:1';
  frameColor?: string;
  // Only present on framed variants -- Prodigi's matted vs. unmatted mount is
  // a distinct product (different prodigiSku), not an order-time attribute.
  mount?: 'matted' | 'unmatted';
  costCents: number;
  shippingCents: number;
  retailCents: number;
};

export type Catalog = {
  currency: string;
  maxUpscale: number;
  products: {
    id: string;
    label: string;
    description: string;
    variants: PrintVariant[];
  }[];
};

export const catalog = catalogJson as Catalog;

export function findVariant(sku: string): { variant: PrintVariant; productLabel: string } | null {
  for (const product of catalog.products) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { variant, productLabel: product.label };
  }
  return null;
}

export type PrintAspectRatio = '2:3' | '4:5' | '3:4' | '1:1' | '2:1' | null;

const ASPECT_RATIOS: Record<Exclude<PrintAspectRatio, null>, number> = {
  '2:3': 3 / 2,
  '4:5': 5 / 4,
  '3:4': 4 / 3,
  '1:1': 1,
  '2:1': 2,
};
const AUTO_MATCH_TOLERANCE = 0.03;

// Server-side mirror of the client's category resolution (client filter is
// UX only -- this is the authoritative check). Prints always fill the paper
// edge to edge, so a variant may only be sold for a photo whose resolved
// category matches the variant's aspectRatio; null means no prints at all.
export function resolveAspectCategory(
  override: PrintAspectRatio | undefined,
  width: number | null,
  height: number | null,
): PrintAspectRatio {
  if (override) return override;
  if (!width || !height) return null;

  const photoRatio = Math.max(width, height) / Math.min(width, height);
  let best: PrintAspectRatio = null;
  let bestDiff = Infinity;
  for (const [category, ratio] of Object.entries(ASPECT_RATIOS) as [
    Exclude<PrintAspectRatio, null>,
    number,
  ][]) {
    const diff = Math.abs(photoRatio - ratio) / ratio;
    if (diff < bestDiff) {
      best = category;
      bestDiff = diff;
    }
  }
  return bestDiff <= AUTO_MATCH_TOLERANCE ? best : null;
}

// Server-side mirror of the client's resolution guard (client is advisory
// only -- this is the authoritative check).
export function resolutionScale(
  photoWidth: number | null,
  photoHeight: number | null,
  variant: PrintVariant,
): number | null {
  if (!photoWidth || !photoHeight) return null;
  const photoLandscape = photoWidth >= photoHeight;
  const areaLong = Math.max(variant.printAreaWidthPx, variant.printAreaHeightPx);
  const areaShort = Math.min(variant.printAreaWidthPx, variant.printAreaHeightPx);
  const photoLong = photoLandscape ? photoWidth : photoHeight;
  const photoShort = photoLandscape ? photoHeight : photoWidth;
  return Math.max(areaLong / photoLong, areaShort / photoShort);
}
