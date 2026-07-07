import db from '$lib/db';
import type { PageLoad } from './$types';

// Deliberately not awaited: the page shell renders immediately and shows
// skeleton frames via {#await} while the albums (plus one cover read per
// album) resolve.
export const load: PageLoad = () => {
  return { lazy: { albums: db.albums.allWithCover() } };
};
