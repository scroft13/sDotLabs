import { createClient } from '@supabase/supabase-js';
import type { Album, Photo } from './shared';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const GALLERY_BUCKET = 'gallery';

export default {
  albums: {
    async all(): Promise<Album[]> {
      const { data, error } = await supabase.from('albums').select().order('sort_order');
      if (error) throw error;
      return data;
    },
    async byId(id: string): Promise<Album | null> {
      const { data, error } = await supabase.from('albums').select().eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async bySlug(slug: string): Promise<Album | null> {
      const { data, error } = await supabase
        .from('albums')
        .select()
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    // Albums plus each one's cover thumbnail (explicit cover_photo_id, falling
    // back to the first photo by sort_order), for the homepage grid.
    async allWithCover(): Promise<(Album & { coverStoragePath: string | null })[]> {
      const { data, error } = await supabase
        .from('albums')
        .select('*, photos!photos_album_id_fkey(id, storage_path, sort_order)')
        .order('sort_order');
      if (error) throw error;
      return (data ?? []).map((album) => {
        const photos = [...album.photos].sort((a, b) => a.sort_order - b.sort_order);
        const cover = photos.find((p) => p.id === album.cover_photo_id) ?? photos[0];
        return { ...album, coverStoragePath: cover?.storage_path ?? null };
      });
    },
    async create(input: {
      slug: string;
      title: string;
      description?: string | null;
    }): Promise<Album> {
      const { data, error } = await supabase.from('albums').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    async update(
      id: string,
      patch: Partial<Pick<Album, 'title' | 'slug' | 'description' | 'sort_order' | 'cover_photo_id'>>,
    ): Promise<void> {
      const { error } = await supabase.from('albums').update(patch).eq('id', id);
      if (error) throw error;
    },
    async remove(id: string): Promise<void> {
      const { data: albumPhotos, error: fetchError } = await supabase
        .from('photos')
        .select('storage_path')
        .eq('album_id', id);
      if (fetchError) throw fetchError;

      const paths = (albumPhotos ?? []).map((p) => p.storage_path);
      if (paths.length) {
        const { error: storageError } = await supabase.storage.from(GALLERY_BUCKET).remove(paths);
        if (storageError) throw storageError;
      }

      const { error } = await supabase.from('albums').delete().eq('id', id);
      if (error) throw error;
    },
  },
  photos: {
    async byAlbum(albumId: string): Promise<Photo[]> {
      const { data, error } = await supabase
        .from('photos')
        .select()
        .eq('album_id', albumId)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    async create(input: {
      album_id: string;
      storage_path: string;
      title?: string;
      caption?: string;
      width?: number;
      height?: number;
      sort_order: number;
    }): Promise<Photo> {
      const { data, error } = await supabase.from('photos').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    async update(
      id: string,
      patch: Partial<Pick<Photo, 'title' | 'caption' | 'sort_order'>>,
    ): Promise<void> {
      const { error } = await supabase.from('photos').update(patch).eq('id', id);
      if (error) throw error;
    },
    async remove(id: string, storagePath: string): Promise<void> {
      const { error: storageError } = await supabase.storage
        .from(GALLERY_BUCKET)
        .remove([storagePath]);
      if (storageError) throw storageError;

      const { error } = await supabase.from('photos').delete().eq('id', id);
      if (error) throw error;
    },
    publicUrl(storagePath: string): string {
      return supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath).data.publicUrl;
    },
    async upload(albumId: string, file: File): Promise<string> {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${albumId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(GALLERY_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      return path;
    },
  },
};
