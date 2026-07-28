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
  let pendingFiles: { file: File; url: string }[] = [];
  let uploadIndex = 0;
  let uploadTotal = 0;
  let uploadFraction = 0;

  $: overallProgress = uploadTotal
    ? Math.round(((uploadIndex - 1 + uploadFraction) / uploadTotal) * 100)
    : 0;

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

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    pendingFiles = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
  }

  function cancelSelection() {
    for (const { url } of pendingFiles) URL.revokeObjectURL(url);
    pendingFiles = [];
  }

  async function confirmUpload() {
    const files = pendingFiles;
    uploading = true;
    uploadIndex = 0;
    uploadTotal = files.length;
    uploadFraction = 0;
    let sortOrder = nextSortOrder;
    for (const { file, url } of files) {
      uploadIndex++;
      uploadFraction = 0;
      try {
        const [storagePath, size, exif] = await Promise.all([
          db.photos.upload(albumId, file, (fraction) => (uploadFraction = fraction)),
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
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    uploading = false;
    pendingFiles = [];
    dispatch('uploaded');
  }
</script>

{#if pendingFiles.length}
  <div class="preview-panel">
    <div class="preview-grid">
      {#each pendingFiles as { url }}
        <img class="preview-thumb" src={url} alt="" />
      {/each}
    </div>
    {#if uploading}
      <div class="progress">
        <div class="progress-track">
          <div class="progress-fill" style="width: {overallProgress}%" />
        </div>
        <span class="progress-label"
          >Uploading photo {uploadIndex} of {uploadTotal} — {overallProgress}%</span
        >
      </div>
    {/if}
    <div class="preview-actions">
      <button type="button" on:click={confirmUpload} disabled={uploading}>
        {uploading
          ? 'Uploading...'
          : `Upload ${pendingFiles.length} Photo${pendingFiles.length === 1 ? '' : 's'}`}
      </button>
      <button type="button" on:click={cancelSelection} disabled={uploading}>Cancel</button>
    </div>
  </div>
{:else}
  <label class="uploader">
    <input type="file" accept="image/*" multiple on:change={handleFileSelect} />
    Upload Photos
  </label>
{/if}

<style>
  .uploader {
    display: inline-block;
    padding: 0.6rem 1.2rem;
    border: 1px dashed #555;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  .uploader input {
    display: none;
  }

  .preview-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .preview-thumb {
    width: 96px;
    height: 96px;
    object-fit: cover;
    border-radius: 0.25rem;
    border: 1px solid #444;
  }
  .preview-actions {
    display: flex;
    gap: 0.5rem;
  }
  .preview-actions button {
    padding: 0.6rem 1.2rem;
    border-radius: 0.25rem;
    border: 1px solid #555;
    cursor: pointer;
    background: transparent;
    color: inherit;
    font: inherit;
  }
  .preview-actions button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .progress {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .progress-track {
    flex: 1;
    height: 0.4rem;
    background: #333;
    border-radius: 999px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: currentColor;
    border-radius: 999px;
    transition: width 0.15s ease-out;
  }
  .progress-label {
    font-size: 0.85rem;
    color: #999;
    white-space: nowrap;
  }
</style>
