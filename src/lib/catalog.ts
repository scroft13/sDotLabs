import catalogJson from '$catalog';
import type { Photo, PrintAspectRatio } from './shared';

export type PrintVariant = {
  sku: string;
  prodigiSku: string;
  size: string;
  // Manufactured print-area pixel dimensions -- NOT always the same aspect
  // ratio as the nominal product size (e.g. a framed product's mat cutout
  // can be a different ratio than the frame's own labeled size), so this is
  // what aspect/resolution math is based on, not widthIn/heightIn.
  printAreaWidthPx: number;
  printAreaHeightPx: number;
  aspectRatio: '2:3' | '4:5' | '3:4' | '1:1' | '2:1';
  frameColor?: string;
  costCents: number;
  shippingCents: number;
  retailCents: number;
};

export type PrintProduct = {
  id: string;
  label: string;
  description: string;
  variants: PrintVariant[];
};

export type Catalog = {
  currency: string;
  // Max acceptable upscale factor before warning the resolution is too low
  // (1 = photo must have at least as many pixels as the print area wants;
  // >1 tolerates some upscaling, matching a print-quality cushion).
  maxUpscale: number;
  products: PrintProduct[];
};

export const catalog = catalogJson as Catalog;

export function formatPrice(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

// How much the photo would need to be scaled up to fill this print area at
// 1:1 pixel mapping. <=1 means the photo already has enough resolution
// (it'll be scaled down); >1 means upscaling beyond native resolution.
// Null when the photo has no stored pixel dimensions (older uploads).
export function resolutionScale(photo: Photo, variant: PrintVariant): number | null {
  if (!photo.width || !photo.height) return null;
  const photoLandscape = photo.width >= photo.height;
  const areaLong = Math.max(variant.printAreaWidthPx, variant.printAreaHeightPx);
  const areaShort = Math.min(variant.printAreaWidthPx, variant.printAreaHeightPx);
  const photoLong = photoLandscape ? photo.width : photo.height;
  const photoShort = photoLandscape ? photo.height : photo.width;
  return Math.max(areaLong / photoLong, areaShort / photoShort);
}

// Orders are placed to fit (never cropped, see functions/src/index.ts), so a
// mismatched aspect ratio just means a plain border on two sides rather than
// a full-bleed print. Returns the fractional mismatch (0 = exact fit) or
// null without dims, so callers can note when that border will be visible.
export function aspectMismatch(photo: Photo, variant: PrintVariant): number | null {
  if (!photo.width || !photo.height) return null;
  const photoAspect = Math.max(photo.width, photo.height) / Math.min(photo.width, photo.height);
  const printAspect =
    Math.max(variant.printAreaWidthPx, variant.printAreaHeightPx) /
    Math.min(variant.printAreaWidthPx, variant.printAreaHeightPx);
  return Math.abs(photoAspect - printAspect) / printAspect;
}

// Long-side/short-side ratio for each category, for comparing against a
// photo's own (also long/short normalized) aspect ratio.
const ASPECT_RATIOS: Record<'2:3' | '4:5' | '3:4' | '1:1' | '2:1', number> = {
  '2:3': 3 / 2,
  '4:5': 5 / 4,
  '3:4': 4 / 3,
  '1:1': 1,
  '2:1': 2,
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
    '2:3' | '4:5' | '3:4' | '1:1' | '2:1',
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
