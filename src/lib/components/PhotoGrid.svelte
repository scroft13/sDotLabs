<script lang="ts">
  import db from '$lib/db';
  import type { Photo } from '$lib/shared';
  import { createEventDispatcher } from 'svelte';

  export let photos: Photo[];

  const dispatch = createEventDispatcher<{ select: number }>();
</script>

<div class="photo-grid">
  {#each photos as photo, index (photo.id)}
    <button class="photo-tile" on:click={() => dispatch('select', index)}>
      <img src={db.photos.publicUrl(photo.storage_path)} alt={photo.title ?? ''} loading="lazy" />
    </button>
  {/each}
</div>

<style>
  .photo-grid {
    columns: 4 220px;
    column-gap: 0.75rem;
  }
  .photo-tile {
    display: block;
    width: 100%;
    padding: 0;
    margin: 0 0 0.75rem;
    border: 0;
    background: none;
    cursor: pointer;
    break-inside: avoid;
  }
  .photo-tile img {
    width: 100%;
    display: block;
    border-radius: 0.25rem;
  }
</style>
