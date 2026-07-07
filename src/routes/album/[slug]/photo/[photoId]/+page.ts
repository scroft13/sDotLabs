import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  const { album, lazy } = await parent();
  // Awaited here (unlike the album page) because this page can't render a
  // meaningful skeleton without knowing the photo. Coming from the album
  // page the promise is already resolved, so navigation stays instant.
  const photos = await lazy.photos;
  const index = photos.findIndex((p) => p.id === params.photoId);
  if (index === -1) throw error(404, 'Photo not found');
  return { album, photos, index };
};
