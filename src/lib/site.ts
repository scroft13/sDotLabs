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
  };
};

export const DEFAULT_SITE: SiteSettings = {
  title: 'The Light Lab',
  subtitle: 'EXPERIMENTS IN LIGHT',
  banner: { enabled: false, text: '', link: '' },
};

// Coerce an arbitrary Firestore doc (or nothing) into a complete, safe
// SiteSettings, filling every missing field from the defaults.
export function toSiteSettings(data: Record<string, unknown> | undefined | null): SiteSettings {
  const banner = (data?.banner ?? {}) as Record<string, unknown>;
  return {
    title: typeof data?.title === 'string' && data.title.trim() ? data.title : DEFAULT_SITE.title,
    subtitle:
      typeof data?.subtitle === 'string' && data.subtitle.trim()
        ? data.subtitle
        : DEFAULT_SITE.subtitle,
    banner: {
      enabled: banner.enabled === true,
      text: typeof banner.text === 'string' ? banner.text : '',
      link: typeof banner.link === 'string' ? banner.link : '',
    },
  };
}
