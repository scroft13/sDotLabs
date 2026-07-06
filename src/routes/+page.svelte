<script lang="ts">
  import GalleryFrame from '$lib/components/GalleryFrame.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import SiteNav from '$lib/components/SiteNav.svelte';
  import db from '$lib/db';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>The Light Lab — sdotlabs</title>
</svelte:head>

<SiteNav />

<header id="top">
  <div class="eyebrow">EXPERIMENTS IN LIGHT</div>
  <h1>The Light Lab</h1>
  <div class="rule" />
</header>

<main id="gallery">
  {#if data.albums.length === 0}
    <p class="empty">No albums yet.</p>
  {:else}
    {#each data.albums as album (album.id)}
      <a href={`/album/${album.slug}`} class="frame-link">
        <GalleryFrame title={album.title} exif={album.coverExif}>
          {#if album.coverStoragePath}
            <img
              src={db.photos.publicUrl(album.coverStoragePath)}
              alt={album.title}
              loading="lazy"
            />
          {:else}
            <div class="cover-empty" />
          {/if}
        </GalleryFrame>
      </a>
    {/each}
  {/if}
</main>

<SiteFooter />

<style>
  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 56px 32px 64px;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.32em;
    color: #8a8680;
  }
  h1 {
    margin: 0;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 400;
    font-size: 52px;
    letter-spacing: 0.02em;
  }
  .rule {
    width: 40px;
    height: 1px;
    background: #1a1a1a;
  }
  /* Justified rows: uniform frame height, width follows each cover's aspect
     ratio (see PhotoGrid for the same treatment on album pages). */
  main {
    --wall-h: 240px;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 48px 120px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 44px;
    row-gap: 8px;
  }
  .frame-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }
  .frame-link :global(.gallery-frame) {
    margin: 0 0 40px;
  }
  .frame-link img {
    display: block;
    height: var(--wall-h);
    width: auto;
  }
  .cover-empty {
    height: var(--wall-h);
    aspect-ratio: 4 / 3;
    background: #eceae6;
  }
  .empty {
    text-align: center;
    color: #8a8680;
  }
  @media (max-width: 900px) {
    main {
      --wall-h: 180px;
      column-gap: 32px;
    }
  }
  /* Single column of full-width frames on phones -- see PhotoGrid for why. */
  @media (max-width: 640px) {
    main {
      flex-direction: column;
      align-items: center;
      padding: 0 24px 80px;
      row-gap: 0;
    }
    .frame-link {
      width: 100%;
      max-width: 380px;
    }
    .frame-link img,
    .cover-empty {
      width: 100%;
      height: auto;
    }
    h1 {
      font-size: 38px;
    }
  }
</style>
