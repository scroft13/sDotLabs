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
  .photo-grid {
    columns: 3 300px;
    column-gap: 56px;
  }
  .photo-tile {
    display: block;
    width: 100%;
    break-inside: avoid;
    text-decoration: none;
    color: inherit;
  }
  .photo-tile img {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
