// Admin-editable site content stored in Firestore at settings/site (public
// read, owner-only write; see firestore.rules). Loaded in the root layout
// so the banner shows site-wide and the home page title/subtitle are
// editable. Missing doc or fields fall back to these defaults.
// Curated display+body font pairings the theme can switch between. Only these
// families are @imported in app.css.
export type FontPairing = 'editorial' | 'classic' | 'modern';
export const FONT_STACKS: Record<FontPairing, { display: string; body: string }> = {
  editorial: { display: "'Cormorant Garamond', Georgia, serif", body: "'Inter', sans-serif" },
  classic: { display: "'Playfair Display', Georgia, serif", body: "'Inter', sans-serif" },
  modern: { display: "'Inter', sans-serif", body: "'Inter', sans-serif" },
};
export const FONT_LABELS: Record<FontPairing, string> = {
  editorial: 'Editorial (Cormorant + Inter)',
  classic: 'Classic (Playfair + Inter)',
  modern: 'Modern (Inter)',
};

// The site's core palette + type. Applied as CSS variables in the root layout
// (see themeVars) and edited on /admin/theme.
export type ThemeSettings = {
  bg: string; // page background
  ink: string; // primary text + headings
  muted: string; // secondary text
  accent: string; // rules, active nav, primary buttons
  font: FontPairing;
};

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
  theme: ThemeSettings;
};

export const DEFAULT_BANNER_COLOR = '#1a1a1a';

export const DEFAULT_THEME: ThemeSettings = {
  bg: '#fbfaf8',
  ink: '#1a1a1a',
  muted: '#6f6b64',
  accent: '#1a1a1a',
  font: 'editorial',
};

// A few tested full palettes for one-click theming.
export const THEME_PRESETS: { key: string; label: string; theme: ThemeSettings }[] = [
  { key: 'gallery', label: 'Gallery', theme: DEFAULT_THEME },
  {
    key: 'paper',
    label: 'Paper',
    theme: { bg: '#ffffff', ink: '#1c1c1c', muted: '#6b6b6b', accent: '#1c1c1c', font: 'classic' },
  },
  {
    key: 'charcoal',
    label: 'Charcoal',
    theme: {
      bg: '#18171b',
      ink: '#efece6',
      muted: '#a49f96',
      accent: '#d8c39a',
      font: 'editorial',
    },
  },
  {
    key: 'sand',
    label: 'Sand',
    theme: {
      bg: '#f3ede1',
      ink: '#2a2620',
      muted: '#7c7364',
      accent: '#9a6a3c',
      font: 'editorial',
    },
  },
  {
    key: 'ink',
    label: 'Ink & Sky',
    theme: { bg: '#f7f8fa', ink: '#12233a', muted: '#5a6b80', accent: '#2f6db0', font: 'modern' },
  },
];

export const DEFAULT_SITE: SiteSettings = {
  title: 'The Light Lab',
  subtitle: 'EXPERIMENTS IN LIGHT',
  banner: { enabled: false, text: '', link: '', color: DEFAULT_BANNER_COLOR },
  theme: DEFAULT_THEME,
};

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

function hexOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback;
}

// Coerce an arbitrary Firestore doc (or nothing) into a complete, safe
// SiteSettings. Note the difference between "field absent" and "field set to
// empty": title falls back to the default when blank (the home page always
// needs one, and the admin form blocks saving it empty), but subtitle
// respects an explicit empty string so the owner can hide it -- it only
// falls back to the default when the field isn't a string at all (fresh doc).
export function toSiteSettings(data: Record<string, unknown> | undefined | null): SiteSettings {
  const banner = (data?.banner ?? {}) as Record<string, unknown>;
  const theme = (data?.theme ?? {}) as Record<string, unknown>;
  const font: FontPairing =
    theme.font === 'classic' || theme.font === 'modern' || theme.font === 'editorial'
      ? theme.font
      : DEFAULT_THEME.font;
  return {
    title: typeof data?.title === 'string' && data.title.trim() ? data.title : DEFAULT_SITE.title,
    subtitle: typeof data?.subtitle === 'string' ? data.subtitle : DEFAULT_SITE.subtitle,
    banner: {
      enabled: banner.enabled === true,
      text: typeof banner.text === 'string' ? banner.text : '',
      link: typeof banner.link === 'string' ? banner.link : '',
      color: hexOr(banner.color, DEFAULT_BANNER_COLOR),
    },
    theme: {
      bg: hexOr(theme.bg, DEFAULT_THEME.bg),
      ink: hexOr(theme.ink, DEFAULT_THEME.ink),
      muted: hexOr(theme.muted, DEFAULT_THEME.muted),
      accent: hexOr(theme.accent, DEFAULT_THEME.accent),
      font,
    },
  };
}

// The CSS custom properties the root layout sets on :root from a theme.
// on-accent is derived so text on accent buttons/rules stays legible.
export function themeVars(theme: ThemeSettings): Record<string, string> {
  return {
    '--bg': theme.bg,
    '--ink': theme.ink,
    '--muted': theme.muted,
    '--accent': theme.accent,
    '--on-accent': contrastText(theme.accent),
    '--font-display': FONT_STACKS[theme.font].display,
    '--font-body': FONT_STACKS[theme.font].body,
  };
}

// Cream or ink, whichever is readable on the given background.
export function contrastText(bgHex: string): string {
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

// Readable banner text (cream or ink) for a banner background.
export function bannerTextColor(bgHex: string): string {
  return contrastText(bgHex);
}
