<script lang="ts">
  import PhotoGrid from '$lib/components/PhotoGrid.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import SiteNav from '$lib/components/SiteNav.svelte';
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
  {#if data.photos.length === 0}
    <p class="empty">No photos in this album yet.</p>
  {:else}
    <PhotoGrid photos={data.photos} albumSlug={data.album.slug} />
  {/if}
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
    color: #8a8680;
    transition: color 0.15s ease;
  }
  .back:hover {
    color: #1a1a1a;
  }
  h1 {
    margin: 0;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 400;
    font-size: 44px;
    letter-spacing: 0.02em;
  }
  .description {
    margin: 0;
    font-size: 13px;
    letter-spacing: 0.08em;
    color: #6f6b64;
    max-width: 560px;
  }
  .rule {
    width: 40px;
    height: 1px;
    background: #1a1a1a;
  }
  main {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 48px 120px;
  }
  .empty {
    text-align: center;
    color: #8a8680;
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
