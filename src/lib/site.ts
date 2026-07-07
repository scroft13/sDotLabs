// Admin-editable site content stored in Firestore at settings/site (public
// read, owner-only write; see firestore.rules). Loaded in the root layout
// so the banner shows site-wide and the home page title/subtitle are
// editable. Missing doc or fields fall back to these defaults.
export type SiteSettings = {
  title: string;
  subtitle: string;
  banner: {
    enabled: boolean;
    text: string;
    // Optional href -- when set the whole banner is a link (e.g. "/prints").
    link: string;
    // Background accent color (hex); text auto-contrasts (see bannerTextColor).
    color: string;
  };
};

export const DEFAULT_BANNER_COLOR = '#1a1a1a';

export const DEFAULT_SITE: SiteSettings = {
  title: 'The Light Lab',
  subtitle: 'EXPERIMENTS IN LIGHT',
  banner: { enabled: false, text: '', link: '', color: DEFAULT_BANNER_COLOR },
};

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

// Coerce an arbitrary Firestore doc (or nothing) into a complete, safe
// SiteSettings. Note the difference between "field absent" and "field set to
// empty": title falls back to the default when blank (the home page always
// needs one, and the admin form blocks saving it empty), but subtitle
// respects an explicit empty string so the owner can hide it -- it only
// falls back to the default when the field isn't a string at all (fresh doc).
export function toSiteSettings(data: Record<string, unknown> | undefined | null): SiteSettings {
  const banner = (data?.banner ?? {}) as Record<string, unknown>;
  return {
    title: typeof data?.title === 'string' && data.title.trim() ? data.title : DEFAULT_SITE.title,
    subtitle: typeof data?.subtitle === 'string' ? data.subtitle : DEFAULT_SITE.subtitle,
    banner: {
      enabled: banner.enabled === true,
      text: typeof banner.text === 'string' ? banner.text : '',
      link: typeof banner.link === 'string' ? banner.link : '',
      color:
        typeof banner.color === 'string' && HEX_COLOR.test(banner.color)
          ? banner.color
          : DEFAULT_BANNER_COLOR,
    },
  };
}

// Pick readable text (cream or ink) for a banner background by its perceived
// luminance, so a light accent gets dark text and vice versa.
export function bannerTextColor(bgHex: string): string {
  const hex = bgHex.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex.slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 145 ? '#1a1a1a' : '#fbfaf8';
}
