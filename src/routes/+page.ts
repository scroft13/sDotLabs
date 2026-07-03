import db from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const albums = await db.albums.allWithCover();
  return { albums };
};
