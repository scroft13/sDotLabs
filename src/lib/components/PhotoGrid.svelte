<script lang="ts">
  import GalleryFrame from '$lib/components/GalleryFrame.svelte';
  import db from '$lib/db';
  import type { Photo } from '$lib/shared';
  import { createEventDispatcher } from 'svelte';

  export let photos: Photo[];

  const dispatch = createEventDispatcher<{ select: number }>();
</script>

<div class="photo-grid">
  {#each photos as photo, index (photo.id)}
    <button class="photo-tile" on:click={() => dispatch('select', index)}>
      <GalleryFrame title={photo.title ?? photo.caption} exif={photo.exif}>
        <img src={db.photos.publicUrl(photo.storage_path)} alt={photo.title ?? ''} loading="lazy" />
      </GalleryFrame>
    </button>
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
    padding: 0;
    margin: 0;
    border: 0;
    background: none;
    cursor: pointer;
    break-inside: avoid;
    text-align: inherit;
    font: inherit;
  }
  .photo-tile img {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
