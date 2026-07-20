export type Album = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_photo_id: string | null;
  sort_order: number;
  created_at: string;
};

export type PhotoExif = {
  iso: number | null;
  aperture: number | null;
  shutterSpeed: string | null;
  focalLength: number | null;
};

// Which manufactured print aspect ratio this photo should be sold as, so the
// order panel can offer only sizes that fit without a border. Null means
// auto-detect from width/height. '1:1' is square, '2:1' is panoramic.
export type PrintAspectRatio = '2:3' | '4:5' | '3:4' | '1:1' | '2:1' | null;

export type Photo = {
  id: string;
  album_id: string;
  storage_path: string;
  // Resized derivatives generated server-side after upload (see functions/
  // resizeImage.ts) -- null until that function finishes, or for photos
  // uploaded before it existed and not yet backfilled. Display code should
  // fall back to storage_path when null.
  thumb_path: string | null;
  display_path: string | null;
  title: string | null;
  caption: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  exif: PhotoExif | null;
  printAspectRatio: PrintAspectRatio;
  created_at: string;
};
