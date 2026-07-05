<script lang="ts">
  import { parse as parseExif } from 'exifr';
  import db from '$lib/db';
  import { addToast } from '$lib/stores';
  import type { PhotoExif } from '$lib/shared';
  import { createEventDispatcher } from 'svelte';

  export let albumId: string;
  export let nextSortOrder: number;

  const dispatch = createEventDispatcher<{ uploaded: void }>();
  let uploading = false;

  function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  }

  function formatShutterSpeed(seconds: number): string {
    return seconds >= 1 ? `${seconds}s` : `1/${Math.round(1 / seconds)}s`;
  }

  // Most images have no EXIF (screenshots, social-media re-exports, etc.) or
  // exifr can't parse the format -- either way, missing EXIF shouldn't block
  // the upload, so this resolves to null rather than throwing.
  async function readExif(file: File): Promise<PhotoExif | null> {
    try {
      const tags = await parseExif(file, ['ISO', 'FNumber', 'ExposureTime', 'FocalLength']);
      if (!tags) return null;
      const { ISO, FNumber, ExposureTime, FocalLength } = tags;
      if (ISO == null && FNumber == null && ExposureTime == null && FocalLength == null) {
        return null;
      }
      return {
        iso: ISO ?? null,
        aperture: FNumber ?? null,
        shutterSpeed: ExposureTime ? formatShutterSpeed(ExposureTime) : null,
        focalLength: FocalLength ? Math.round(FocalLength) : null,
      };
    } catch {
      return null;
    }
  }

  async function handleFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    uploading = true;
    let sortOrder = nextSortOrder;
    for (const file of files) {
      try {
        const [storagePath, size, exif] = await Promise.all([
          db.photos.upload(albumId, file),
          readImageSize(file),
          readExif(file),
        ]);
        await db.photos.create({
          album_id: albumId,
          storage_path: storagePath,
          sort_order: sortOrder++,
          width: size?.width,
          height: size?.height,
          exif: exif ?? undefined,
        });
      } catch (err) {
        addToast({
          id: Math.floor(Math.random() * 100000),
          type: 'error',
          message: err instanceof Error ? err.message : 'Upload failed',
          dismissible: true,
          timeout: 4000,
        });
      }
    }
    uploading = false;
    input.value = '';
    dispatch('uploaded');
  }
</script>

<label class="uploader" class:uploading>
  <input type="file" accept="image/*" multiple on:change={handleFiles} disabled={uploading} />
  {uploading ? 'Uploading...' : 'Upload Photos'}
</label>

<style>
  .uploader {
    display: inline-block;
    padding: 0.6rem 1.2rem;
    border: 1px dashed #555;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  .uploader.uploading {
    opacity: 0.6;
    cursor: default;
  }
  .uploader input {
    display: none;
  }
</style>
