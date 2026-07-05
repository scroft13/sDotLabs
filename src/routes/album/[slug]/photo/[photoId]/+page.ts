import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  const { album, photos } = await parent();
  const index = photos.findIndex((p) => p.id === params.photoId);
  if (index === -1) throw error(404, 'Photo not found');
  return { album, photos, index };
};
