<script lang="ts">
  import GalleryFrame from '$lib/components/GalleryFrame.svelte';
  import db from '$lib/db';
  import type { Photo } from '$lib/shared';

  export let photos: Photo[];
  export let albumSlug: string;
</script>

<div class="photo-grid">
  {#each photos as photo (photo.id)}
    <a class="photo-tile" href={`/album/${albumSlug}/photo/${photo.id}`}>
      <GalleryFrame title={photo.title ?? photo.caption} exif={photo.exif}>
        <img src={db.photos.publicUrl(photo.storage_path)} alt={photo.title ?? ''} loading="lazy" />
      </GalleryFrame>
    </a>
  {/each}
</div>

<style>
  /* Justified rows: every framed photo is the same height, its width set by
     the photo's aspect ratio, so mixed ratios still line up on a common
     baseline instead of a ragged masonry. Row height scales down on narrow
     screens so a wide panorama can't overflow. */
  .photo-grid {
    --wall-h: 240px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 44px;
    row-gap: 8px;
  }
  .photo-tile {
    display: block;
    text-decoration: none;
    color: inherit;
  }
  .photo-tile :global(.gallery-frame) {
    margin: 0 0 40px;
  }
  .photo-tile img {
    display: block;
    height: var(--wall-h);
    width: auto;
  }
  @media (max-width: 900px) {
    .photo-grid {
      --wall-h: 180px;
      column-gap: 32px;
    }
  }
  /* Below the phone breakpoint a wide panorama at any uniform height would
     overflow the viewport, so drop the row layout for a single column of
     full-width frames -- the conventional mobile photo feed. */
  @media (max-width: 640px) {
    .photo-grid {
      flex-direction: column;
      align-items: center;
      row-gap: 0;
    }
    .photo-tile {
      width: 100%;
      max-width: 380px;
    }
    .photo-tile img {
      width: 100%;
      height: auto;
    }
  }
</style>
