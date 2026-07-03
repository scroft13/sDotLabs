<script lang="ts">
  import AlbumCard from '$lib/components/AlbumCard.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Gallery</title>
</svelte:head>

<main>
  <h1>Gallery</h1>
  {#if data.albums.length === 0}
    <p class="empty">No albums yet.</p>
  {:else}
    <div class="album-grid">
      {#each data.albums as album (album.id)}
        <AlbumCard {album} coverStoragePath={album.coverStoragePath} />
      {/each}
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  h1 {
    margin-bottom: 1.5rem;
  }
  .album-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  .empty {
    opacity: 0.6;
  }
</style>
