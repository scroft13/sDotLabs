import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { deleteObject, ref, uploadBytes } from 'firebase/storage';
import { firestore, storage, STORAGE_BUCKET } from './firebase';
import type { Album, Photo, PhotoExif } from './shared';

const albumsCol = collection(firestore, 'albums');
const photosCol = collection(firestore, 'photos');

// crypto.randomUUID() only exists in secure contexts (HTTPS, or specifically
// http://localhost) -- falls back so local dev over a LAN IP still works.
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// Firestore rejects `undefined` field values outright (unlike SQL nulls),
// so optional fields have to be dropped from the payload before writing.
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

function isoDate(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();
}

function toAlbum(snap: DocumentSnapshot | QueryDocumentSnapshot): Album {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    slug: data.slug,
    title: data.title,
    description: data.description ?? null,
    cover_photo_id: data.cover_photo_id ?? null,
    sort_order: data.sort_order ?? 0,
    created_at: isoDate(data.created_at),
  };
}

function toPhoto(snap: DocumentSnapshot | QueryDocumentSnapshot): Photo {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    album_id: data.album_id,
    storage_path: data.storage_path,
    title: data.title ?? null,
    caption: data.caption ?? null,
    sort_order: data.sort_order ?? 0,
    width: data.width ?? null,
    height: data.height ?? null,
    exif: data.exif ?? null,
    printAspectRatio: data.printAspectRatio ?? null,
    created_at: isoDate(data.created_at),
  };
}

async function coverForAlbum(
  album: Album,
): Promise<{ storagePath: string | null; exif: PhotoExif | null }> {
  if (album.cover_photo_id) {
    const snap = await getDoc(doc(photosCol, album.cover_photo_id));
    if (snap.exists()) {
      const photo = toPhoto(snap);
      return { storagePath: photo.storage_path, exif: photo.exif };
    }
  }
  const firstPhoto = await getDocs(
    query(photosCol, where('album_id', '==', album.id), orderBy('sort_order'), limit(1)),
  );
  if (firstPhoto.empty) return { storagePath: null, exif: null };
  const photo = toPhoto(firstPhoto.docs[0]);
  return { storagePath: photo.storage_path, exif: photo.exif };
}

export default {
  albums: {
    async all(): Promise<Album[]> {
      const snap = await getDocs(query(albumsCol, orderBy('sort_order')));
      return snap.docs.map(toAlbum);
    },
    async byId(id: string): Promise<Album | null> {
      const snap = await getDoc(doc(albumsCol, id));
      return snap.exists() ? toAlbum(snap) : null;
    },
    async bySlug(slug: string): Promise<Album | null> {
      const snap = await getDocs(query(albumsCol, where('slug', '==', slug), limit(1)));
      return snap.empty ? null : toAlbum(snap.docs[0]);
    },
    // Albums plus each one's cover thumbnail (explicit cover_photo_id, falling
    // back to the first photo by sort_order), for the homepage wall. Firestore
    // has no joins, so covers are resolved with one extra read per album --
    // fine at personal-gallery scale.
    async allWithCover(): Promise<
      (Album & { coverStoragePath: string | null; coverExif: PhotoExif | null })[]
    > {
      const albums = await this.all();
      return Promise.all(
        albums.map(async (album) => {
          const cover = await coverForAlbum(album);
          return { ...album, coverStoragePath: cover.storagePath, coverExif: cover.exif };
        }),
      );
    },
    async create(input: {
      slug: string;
      title: string;
      description?: string | null;
      sort_order?: number;
    }): Promise<Album> {
      const payload = stripUndefined({
        ...input,
        sort_order: input.sort_order ?? 0,
        cover_photo_id: null,
        created_at: serverTimestamp(),
      });
      const created = await addDoc(albumsCol, payload);
      const snap = await getDoc(created);
      return toAlbum(snap);
    },
    async update(
      id: string,
      patch: Partial<
        Pick<Album, 'title' | 'slug' | 'description' | 'sort_order' | 'cover_photo_id'>
      >,
    ): Promise<void> {
      await updateDoc(doc(albumsCol, id), stripUndefined({ ...patch }));
    },
    async remove(id: string): Promise<void> {
      // No cascading deletes in Firestore -- clean up this album's photos
      // (docs and storage objects) client-side before removing the album.
      const albumPhotos = await getDocs(query(photosCol, where('album_id', '==', id)));
      await Promise.all(
        albumPhotos.docs.map(async (photoSnap) => {
          const photo = toPhoto(photoSnap);
          await deleteObject(ref(storage, photo.storage_path)).catch(() => {
            // Missing storage object shouldn't block deleting the record.
          });
          await deleteDoc(photoSnap.ref);
        }),
      );
      await deleteDoc(doc(albumsCol, id));
    },
  },
  photos: {
    async byAlbum(albumId: string): Promise<Photo[]> {
      const snap = await getDocs(
        query(photosCol, where('album_id', '==', albumId), orderBy('sort_order')),
      );
      return snap.docs.map(toPhoto);
    },
    async create(input: {
      album_id: string;
      storage_path: string;
      title?: string;
      caption?: string;
      width?: number;
      height?: number;
      sort_order: number;
      exif?: PhotoExif;
    }): Promise<Photo> {
      const payload = stripUndefined({ ...input, created_at: serverTimestamp() });
      const created = await addDoc(photosCol, payload);
      const snap = await getDoc(created);
      return toPhoto(snap);
    },
    async update(
      id: string,
      patch: Partial<Pick<Photo, 'title' | 'caption' | 'sort_order' | 'printAspectRatio'>>,
    ): Promise<void> {
      await updateDoc(doc(photosCol, id), stripUndefined({ ...patch }));
    },
    async remove(id: string, storagePath: string): Promise<void> {
      await deleteObject(ref(storage, storagePath)).catch(() => {
        // Missing storage object shouldn't block deleting the record.
      });

      // Postgres used an ON DELETE SET NULL FK for album covers; replicate
      // that here so an album never points at a deleted cover photo.
      const photoSnap = await getDoc(doc(photosCol, id));
      if (photoSnap.exists()) {
        const albumId = photoSnap.data().album_id;
        if (albumId) {
          const albumSnap = await getDoc(doc(albumsCol, albumId));
          if (albumSnap.exists() && albumSnap.data().cover_photo_id === id) {
            await updateDoc(albumSnap.ref, { cover_photo_id: null });
          }
        }
      }

      await deleteDoc(doc(photosCol, id));
    },
    publicUrl(storagePath: string): string {
      // Storage rules allow public reads, so the plain REST media URL works
      // without a download token and this can stay synchronous.
      return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(
        storagePath,
      )}?alt=media`;
    },
    async upload(albumId: string, file: File): Promise<string> {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${albumId}/${generateId()}.${ext}`;
      await uploadBytes(ref(storage, path), file, {
        contentType: file.type || 'image/jpeg',
        cacheControl: 'public, max-age=3600',
      });
      return path;
    },
  },
};
