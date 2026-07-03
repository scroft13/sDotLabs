<script lang="ts">
  import PhotoGrid from '$lib/components/PhotoGrid.svelte';
  import Lightbox from '$lib/components/Lightbox.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let lightboxOpen = false;
  let lightboxIndex = 0;

  function openLightbox(e: CustomEvent<number>) {
    lightboxIndex = e.detail;
    lightboxOpen = true;
  }
</script>

<svelte:head>
  <title>{data.album.title}</title>
</svelte:head>

<main>
  <a href="/" class="back">&larr; Gallery</a>
  <h1>{data.album.title}</h1>
  {#if data.album.description}
    <p class="description">{data.album.description}</p>
  {/if}

  {#if data.photos.length === 0}
    <p class="empty">No photos in this album yet.</p>
  {:else}
    <PhotoGrid photos={data.photos} on:select={openLightbox} />
  {/if}
</main>

<Lightbox photos={data.photos} bind:open={lightboxOpen} bind:index={lightboxIndex} />

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  .back {
    display: inline-block;
    margin-bottom: 1.5rem;
    color: inherit;
    opacity: 0.7;
    text-decoration: none;
  }
  .back:hover {
    opacity: 1;
  }
  h1 {
    margin-bottom: 0.5rem;
  }
  .description {
    opacity: 0.7;
    margin-bottom: 1.5rem;
  }
  .empty {
    opacity: 0.6;
  }
</style>
