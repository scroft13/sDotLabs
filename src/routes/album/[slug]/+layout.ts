import db from '$lib/db';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

// Shared by the album page and the photo detail page beneath it -- the
// client-side router caches this, so album->photo navigation is instant.
export const load: LayoutLoad = async ({ params }) => {
  const album = await db.albums.bySlug(params.slug);
  if (!album) throw error(404, 'Album not found');
  const photos = await db.photos.byAlbum(album.id);
  return { album, photos };
};
