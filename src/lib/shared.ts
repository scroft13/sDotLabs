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
  title: string | null;
  caption: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  exif: PhotoExif | null;
  printAspectRatio: PrintAspectRatio;
  created_at: string;
};
