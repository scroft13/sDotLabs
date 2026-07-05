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
