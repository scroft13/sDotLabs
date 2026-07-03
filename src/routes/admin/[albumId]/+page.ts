import db from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const album = await db.albums.byId(params.albumId);
  if (!album) throw error(404, 'Album not found');
  const photos = await db.photos.byAlbum(album.id);
  return { album, photos };
};
