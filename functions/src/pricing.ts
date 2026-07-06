import type { PrintVariant } from './catalog';

// Server-side mirror of src/lib/pricing.ts -- this is the authoritative
// copy (the client's is display-only). Reads the admin-tuned knobs from
// settings/pricing; absent doc or fields fall back to the catalog's
// baked-in retailCents/shippingCents.
export type PricingSettings = {
  multiplier: number | null;
  shipping: Record<string, number>;
};

export function parsePricingSettings(
  data: FirebaseFirestore.DocumentData | undefined,
): PricingSettings {
  // Clamp to >=1 so a fat-fingered multiplier can't sell below cost.
  const multiplier =
    data && typeof data.multiplier === 'number' && data.multiplier >= 1 ? data.multiplier : null;
  const shipping =
    data && data.shipping && typeof data.shipping === 'object'
      ? (data.shipping as Record<string, number>)
      : {};
  return { multiplier, shipping };
}

export function retailCentsFor(variant: PrintVariant, multiplier: number | null): number {
  if (!multiplier || multiplier <= 0) return variant.retailCents;
  return Math.round((variant.costCents * multiplier) / 100) * 100;
}

export function shippingCentsFor(variant: PrintVariant, shipping: Record<string, number>): number {
  const override = shipping[variant.prodigiSku];
  return typeof override === 'number' && override >= 0
    ? Math.round(override)
    : variant.shippingCents;
}
