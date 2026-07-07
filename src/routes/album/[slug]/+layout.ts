import db from '$lib/db';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

// Shared by the album page and the photo detail page beneath it -- the
// client-side router caches this, so album->photo navigation is instant.
// The album itself is awaited (the header and 404 need it); the photo list
// is returned as a promise so the album page can show skeleton frames while
// it resolves. The photo detail page awaits it in its own load.
export const load: LayoutLoad = async ({ params }) => {
  const album = await db.albums.bySlug(params.slug);
  if (!album) throw error(404, 'Album not found');
  return { album, lazy: { photos: db.photos.byAlbum(album.id) } };
};
