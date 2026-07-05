import catalogJson from '$catalog';
import type { Photo, PrintAspectRatio } from './shared';

export type PrintVariant = {
  sku: string;
  printfulVariantId: number;
  size: string;
  widthIn: number;
  heightIn: number;
  aspectRatio: '2:3' | '4:5' | '3:4';
  printAreaWidthPx: number;
  printAreaHeightPx: number;
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

// Orders are placed to fit (never cropped, see functions/src/index.ts), so a
// mismatched aspect ratio just means a plain border on two sides rather than
// a full-bleed print. Returns the fractional mismatch (0 = exact fit) or
// null without dims, so callers can note when that border will be visible.
export function aspectMismatch(photo: Photo, variant: PrintVariant): number | null {
  if (!photo.width || !photo.height) return null;
  const photoAspect = Math.max(photo.width, photo.height) / Math.min(photo.width, photo.height);
  const printAspect =
    Math.max(variant.widthIn, variant.heightIn) / Math.min(variant.widthIn, variant.heightIn);
  return Math.abs(photoAspect - printAspect) / printAspect;
}

// Long-side/short-side ratio for each category, for comparing against a
// photo's own (also long/short normalized) aspect ratio.
const ASPECT_RATIOS: Record<'2:3' | '4:5' | '3:4', number> = {
  '2:3': 3 / 2,
  '4:5': 5 / 4,
  '3:4': 4 / 3,
};
const AUTO_MATCH_TOLERANCE = 0.03;

// Which manufactured aspect category a photo should be sold as: the admin's
// explicit override if set, otherwise whichever category its own dimensions
// are closest to -- but only if that's a close-enough match to look
// deliberate (within 3%); otherwise null, so the panel falls back to
// offering every size with the existing border note.
export function resolveAspectCategory(photo: Photo): PrintAspectRatio {
  if (photo.printAspectRatio) return photo.printAspectRatio;
  if (!photo.width || !photo.height) return null;

  const photoRatio = Math.max(photo.width, photo.height) / Math.min(photo.width, photo.height);
  let best: PrintAspectRatio = null;
  let bestDiff = Infinity;
  for (const [category, ratio] of Object.entries(ASPECT_RATIOS) as [
    '2:3' | '4:5' | '3:4',
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
