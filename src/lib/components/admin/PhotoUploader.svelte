<script lang="ts">
  import db from '$lib/db';
  import { addToast } from '$lib/stores';
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

  async function handleFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    uploading = true;
    let sortOrder = nextSortOrder;
    for (const file of files) {
      try {
        const [storagePath, size] = await Promise.all([
          db.photos.upload(albumId, file),
          readImageSize(file),
        ]);
        await db.photos.create({
          album_id: albumId,
          storage_path: storagePath,
          sort_order: sortOrder++,
          width: size?.width,
          height: size?.height,
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
