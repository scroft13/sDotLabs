import catalogJson from './catalog.json';

export type PrintVariant = {
  sku: string;
  printfulVariantId: number;
  size: string;
  widthIn: number;
  heightIn: number;
  // Pixel dimensions of Printful's print area for this variant (300 DPI) --
  // used to place the photo without cropping (see functions/src/index.ts).
  printAreaWidthPx: number;
  printAreaHeightPx: number;
  frameColor?: string;
  costCents: number;
  retailCents: number;
};

export type Catalog = {
  currency: string;
  shipping: { flatCents: number; label: string };
  minDpi: number;
  products: {
    id: string;
    label: string;
    description: string;
    printfulProductId: number;
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

// Server-side mirror of the client's DPI guard (client is advisory only).
export function dpiFor(
  photoWidth: number | null,
  photoHeight: number | null,
  variant: PrintVariant,
): number | null {
  if (!photoWidth || !photoHeight) return null;
  const landscape = photoWidth >= photoHeight;
  const printW = landscape
    ? Math.max(variant.widthIn, variant.heightIn)
    : Math.min(variant.widthIn, variant.heightIn);
  const printH = landscape
    ? Math.min(variant.widthIn, variant.heightIn)
    : Math.max(variant.widthIn, variant.heightIn);
  return Math.min(photoWidth / printW, photoHeight / printH);
}
