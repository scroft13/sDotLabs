<script lang="ts">
  import { page } from '$app/stores';
  import Toasts from '$lib/components/Toasts.svelte';
  import { bannerTextColor } from '$lib/site';
  import type { LayoutData } from './$types';
  import '../app.css';

  export let data: LayoutData;

  // The sales banner is public marketing -- show it on the gallery/prints
  // side, never over the admin tools.
  $: isAdmin = $page.url.pathname.startsWith('/admin');
  $: banner = data.site.banner;
  $: showBanner = !isAdmin && banner.enabled && banner.text.trim().length > 0;
  $: bannerStyle = `background: ${banner.color}; color: ${bannerTextColor(banner.color)}`;
</script>

<Toasts />

{#if showBanner}
  {#if banner.link.trim()}
    <a class="site-banner" href={banner.link} style={bannerStyle}>{banner.text}</a>
  {:else}
    <div class="site-banner" style={bannerStyle}>{banner.text}</div>
  {/if}
{/if}

<slot />

<style>
  :root {
    --primary-color: 0 0% 9%;
    --secondary-color: 0 0% 20%;
  }

  :global(body) {
    background: #fbfaf8;
    color: #1a1a1a;
  }

  .site-banner {
    display: block;
    padding: 10px 24px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    text-decoration: none;
  }
  a.site-banner:hover {
    filter: brightness(0.9);
  }
</style>
