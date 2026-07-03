<script lang="ts">
  import db from '$lib/db';
  import type { Album } from '$lib/shared';

  export let album: Album;
  export let coverStoragePath: string | null;
</script>

<a href={`/album/${album.slug}`} class="album-card">
  <div class="cover">
    {#if coverStoragePath}
      <img src={db.photos.publicUrl(coverStoragePath)} alt={album.title} loading="lazy" />
    {:else}
      <div class="cover-empty" />
    {/if}
  </div>
  <h2>{album.title}</h2>
  {#if album.description}
    <p>{album.description}</p>
  {/if}
</a>

<style>
  .album-card {
    display: block;
    color: inherit;
    text-decoration: none;
  }
  .cover {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: 0.25rem;
    background: #111;
  }
  .cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .album-card:hover .cover img {
    transform: scale(1.03);
  }
  .cover-empty {
    width: 100%;
    height: 100%;
    background: #222;
  }
  h2 {
    margin: 0.75rem 0 0.25rem;
    font-size: 1.1rem;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.7;
  }
</style>
