import db from '$lib/db';
import { DEFAULT_SITE } from '$lib/site';
import type { LayoutLoad } from './$types';

export const ssr = false;

// Site content (banner + home title/subtitle) is above-the-fold on every
// route, so it's awaited here rather than streamed -- one tiny doc read.
// A failed read falls back to defaults so the site never breaks on it.
export const load: LayoutLoad = async () => {
  const site = await db.settings.site().catch(() => DEFAULT_SITE);
  return { site };
};
