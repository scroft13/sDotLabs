<script lang="ts">
  import PhotoGrid from '$lib/components/PhotoGrid.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import SiteNav from '$lib/components/SiteNav.svelte';
  import SkeletonFrame from '$lib/components/SkeletonFrame.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>{data.album.title} — sdotlabs</title>
</svelte:head>

<SiteNav />

<header>
  <a href="/" class="back">&larr; GALLERY</a>
  <h1>{data.album.title}</h1>
  {#if data.album.description}
    <p class="description">{data.album.description}</p>
  {/if}
  <div class="rule" />
</header>

<main>
  {#await data.lazy.photos}
    <div class="skeleton-grid">
      {#each [3 / 2, 3 / 2, 3 / 2, 3 / 2] as aspect, i (i)}
        <SkeletonFrame {aspect} />
      {/each}
    </div>
  {:then photos}
    {#if photos.length === 0}
      <p class="empty">No photos in this album yet.</p>
    {:else}
      <PhotoGrid {photos} albumSlug={data.album.slug} />
    {/if}
  {:catch}
    <p class="empty">Couldn’t load this album — try refreshing.</p>
  {/await}
</main>

<SiteFooter />

<style>
  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 32px 32px 64px;
    text-align: center;
  }
  .back {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-decoration: none;
    color: var(--muted);
    transition: color 0.15s ease;
  }
  .back:hover {
    color: var(--ink);
  }
  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 44px;
    letter-spacing: 0.02em;
  }
  .description {
    margin: 0;
    font-size: 13px;
    letter-spacing: 0.08em;
    color: var(--muted);
    max-width: 560px;
  }
  .rule {
    width: 40px;
    height: 1px;
    background: var(--accent);
  }
  main {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 48px 120px;
  }
  /* Mirrors PhotoGrid's justified-row layout so skeletons occupy the same
     footprint as the frames that replace them. */
  .skeleton-grid {
    --wall-h: 250px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 44px;
    row-gap: 8px;
  }
  .skeleton-grid :global(.gallery-frame) {
    margin: 0 0 40px;
  }
  .empty {
    text-align: center;
    color: var(--muted);
  }
  @media (max-width: 900px) {
    .skeleton-grid {
      --wall-h: 180px;
      column-gap: 32px;
    }
  }
  @media (max-width: 640px) {
    .skeleton-grid {
      --wall-h: 140px;
    }
  }
  @media (max-width: 640px) {
    main {
      padding: 0 24px 80px;
    }
    h1 {
      font-size: 34px;
    }
  }
</style>
