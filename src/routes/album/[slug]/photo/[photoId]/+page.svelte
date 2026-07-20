<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import GalleryFrame from '$lib/components/GalleryFrame.svelte';
  import PrintOrderPanel from '$lib/components/PrintOrderPanel.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import SiteNav from '$lib/components/SiteNav.svelte';
  import db from '$lib/db';
  import type { PageData } from './$types';

  export let data: PageData;

  // ?order=1 reopens the panel when Stripe's cancel_url returns here.
  let orderOpen = $page.url.searchParams.get('order') === '1';

  $: ({ album, photos, index } = data);
  $: photo = photos[index];
  $: prevPhoto = photos[(index - 1 + photos.length) % photos.length];
  $: nextPhoto = photos[(index + 1) % photos.length];
  $: hasSiblings = photos.length > 1;

  // Size the framed unit so it fits the viewport: the frame+mat add ~100px
  // around the print, and ~260px of the viewport goes to nav/captions.
  $: aspect = photo.width && photo.height ? photo.width / photo.height : null;
  $: frameMaxWidth = aspect ? `min(880px, calc((100vh - 260px) * ${aspect} + 100px))` : '880px';

  function photoHref(p: { id: string }): string {
    return `/album/${album.slug}/photo/${p.id}`;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!hasSiblings && e.key !== 'Escape') return;
    if (e.key === 'ArrowLeft') goto(photoHref(prevPhoto), { keepFocus: true });
    else if (e.key === 'ArrowRight') goto(photoHref(nextPhoto), { keepFocus: true });
    else if (e.key === 'Escape') goto(`/album/${album.slug}`);
  }

  // Preload neighbors so prev/next feels instant.
  $: if (browser && hasSiblings) {
    for (const neighbor of [prevPhoto, nextPhoto]) {
      const img = new Image();
      img.src = db.photos.publicUrl(neighbor.display_path ?? neighbor.storage_path);
    }
  }
</script>

<svelte:head>
  <title>{photo.title ?? album.title} — sdotlabs</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<SiteNav />

<main>
  <header>
    <a href={`/album/${album.slug}`} class="back">&larr; {album.title.toUpperCase()}</a>
  </header>

  <div class="stage">
    {#if hasSiblings}
      <a href={photoHref(prevPhoto)} class="nav-arrow" aria-label="Previous photo">&#8249;</a>
    {/if}
    <div class="frame-wrap" style={`max-width: ${frameMaxWidth}`}>
      <GalleryFrame title={photo.title} exif={photo.exif}>
        <img
          src={db.photos.publicUrl(photo.display_path ?? photo.storage_path)}
          alt={photo.title ?? ''}
          class="skeleton-shimmer"
          style={aspect ? `aspect-ratio: ${aspect}` : undefined}
        />
      </GalleryFrame>
    </div>
    {#if hasSiblings}
      <a href={photoHref(nextPhoto)} class="nav-arrow" aria-label="Next photo">&#8250;</a>
    {/if}
  </div>

  {#if photo.caption && photo.caption !== photo.title}
    <p class="caption">{photo.caption}</p>
  {/if}

  {#if orderOpen}
    <PrintOrderPanel {photo} />
  {:else}
    <div class="order-toggle-wrap">
      <button class="order-toggle" on:click={() => (orderOpen = true)}>ORDER A PRINT</button>
    </div>
  {/if}
</main>

<SiteFooter />

<style>
  main {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 48px 96px;
  }
  header {
    display: flex;
    justify-content: center;
    padding: 8px 0 40px;
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
  .stage {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }
  .frame-wrap {
    flex: 1;
  }
  .frame-wrap img {
    display: block;
    width: 100%;
    height: auto;
  }
  .nav-arrow {
    font-family: var(--font-display);
    font-size: 44px;
    line-height: 1;
    color: var(--muted);
    text-decoration: none;
    padding: 12px;
    user-select: none;
    transition: color 0.15s ease;
  }
  .nav-arrow:hover {
    color: var(--ink);
  }
  .caption {
    max-width: 560px;
    margin: 8px auto 0;
    text-align: center;
    font-size: 13px;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  .order-toggle-wrap {
    display: flex;
    justify-content: center;
    margin-top: 48px;
  }
  .order-toggle {
    background: none;
    border: 1px solid var(--accent);
    color: var(--accent);
    font-size: 11px;
    letter-spacing: 0.22em;
    padding: 12px 28px;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .order-toggle:hover {
    background: var(--accent);
    color: var(--on-accent);
  }
  @media (max-width: 640px) {
    main {
      padding: 0 16px 64px;
    }
    .stage {
      gap: 8px;
    }
    .nav-arrow {
      padding: 8px 4px;
    }
  }
</style>
