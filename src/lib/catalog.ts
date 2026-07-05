import catalogJson from '$catalog';
import type { Photo } from './shared';

export type PrintVariant = {
  sku: string;
  printfulVariantId: number;
  size: string;
  widthIn: number;
  heightIn: number;
  frameColor?: string;
  costCents: number;
  retailCents: number;
};

export type PrintProduct = {
  id: string;
  label: string;
  description: string;
  printfulProductId: number;
  variants: PrintVariant[];
};

export type Catalog = {
  currency: string;
  shipping: { flatCents: number; label: string };
  minDpi: number;
  products: PrintProduct[];
};

export const catalog = catalogJson as Catalog;

export function formatPrice(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

// Effective DPI if the photo were printed at this size, using whichever
// orientation of the print fits the photo best. Null when the photo has no
// stored pixel dimensions (older uploads) -- callers should skip the guard.
export function dpiFor(photo: Photo, variant: PrintVariant): number | null {
  if (!photo.width || !photo.height) return null;
  const landscape = photo.width >= photo.height;
  const printW = landscape
    ? Math.max(variant.widthIn, variant.heightIn)
    : Math.min(variant.widthIn, variant.heightIn);
  const printH = landscape
    ? Math.min(variant.widthIn, variant.heightIn)
    : Math.max(variant.widthIn, variant.heightIn);
  return Math.min(photo.width / printW, photo.height / printH);
}

// Printful center-crops when the photo's aspect doesn't match the print's.
// Returns the fractional mismatch (0 = perfect fit) or null without dims.
export function aspectMismatch(photo: Photo, variant: PrintVariant): number | null {
  if (!photo.width || !photo.height) return null;
  const photoAspect =
    Math.max(photo.width, photo.height) / Math.min(photo.width, photo.height);
  const printAspect =
    Math.max(variant.widthIn, variant.heightIn) / Math.min(variant.widthIn, variant.heightIn);
  return Math.abs(photoAspect - printAspect) / printAspect;
}
