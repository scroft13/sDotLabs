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
  created_at: string;
};
