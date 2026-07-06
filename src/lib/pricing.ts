import type { PrintVariant } from './catalog';

// Admin-editable pricing knobs stored in Firestore at settings/pricing
// (public read -- prices are public anyway -- owner-only write; see
// firestore.rules). The checkout function reads the same doc, so what the
// site displays is always what Stripe charges.
//
// - multiplier: retail = Prodigi cost x multiplier, rounded to the dollar.
//   2.5 reproduces the catalog's baked-in retailCents exactly.
// - shipping: per-product-group override of what the buyer is charged for
//   shipping, keyed by prodigiSku (colors share a price). Absent = pass
//   Prodigi's real cost through; lower (or 0) = the owner eats the rest.
export type PricingSettings = {
  multiplier: number;
  shipping: Record<string, number>;
};

export const DEFAULT_MULTIPLIER = 2.5;

export function retailCentsFor(variant: PrintVariant, multiplier: number | null): number {
  if (!multiplier || multiplier <= 0) return variant.retailCents;
  return Math.round((variant.costCents * multiplier) / 100) * 100;
}

export function shippingCentsFor(
  variant: PrintVariant,
  shipping: Record<string, number> | null,
): number {
  const override = shipping?.[variant.prodigiSku];
  return typeof override === 'number' && override >= 0 ? override : variant.shippingCents;
}
