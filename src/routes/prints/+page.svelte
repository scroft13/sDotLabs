<script lang="ts">
  import { onMount } from 'svelte';
  import { catalog, formatPrice } from '$lib/catalog';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import SiteNav from '$lib/components/SiteNav.svelte';
  import db from '$lib/db';
  import { retailCentsFor, type PricingSettings } from '$lib/pricing';

  // Real Classic-frame moulding corners (Prodigi product photography),
  // matching the black/oak/white frame colors offered in the order panel.
  const FRAME_FINISHES = [
    { label: 'Black', src: '/prints/frame-black.jpg' },
    { label: 'Oak', src: '/prints/frame-oak.jpg' },
    { label: 'White', src: '/prints/frame-white.jpg' },
  ];

  // Admin-tuned pricing; until it loads the catalog's baked-in prices show.
  let pricing: PricingSettings | null = null;
  onMount(async () => {
    pricing = await db.settings.pricing().catch(() => null);
  });
</script>

<svelte:head>
  <title>Prints — sdotlabs</title>
</svelte:head>

<SiteNav />

<header>
  <div class="eyebrow">MADE TO ORDER</div>
  <h1>Prints</h1>
  <div class="rule" />
</header>

<main>
  <p class="intro">
    Every photograph in the gallery is available as an archival print. Open any photo and choose
    <em>Order a print</em> — each one is produced when you order it, and ships within 2–5 business days.
  </p>

  <figure class="hero">
    <img
      src="/prints/frame-detail.jpg"
      alt="Corner detail of a matted print in a black Classic frame"
      loading="lazy"
    />
    <figcaption>Classic frame, matted — corner detail.</figcaption>
  </figure>

  <div class="editions">
    {#each catalog.products as product (product.id)}
      {@const isFramed = product.id === 'framed'}
      <section class="edition">
        <h2>{product.label}</h2>
        <p class="description">{product.description}</p>
        {#if isFramed}
          <div class="finishes">
            {#each FRAME_FINISHES as finish (finish.label)}
              <figure class="finish">
                <img src={finish.src} alt={`${finish.label} Classic frame corner`} loading="lazy" />
                <figcaption>{finish.label}</figcaption>
              </figure>
            {/each}
          </div>
        {/if}
        <ul>
          {#each [...new Set(product.variants.map((v) => v.size))] as size (size)}
            {@const variant = product.variants.find((v) => v.size === size)}
            {#if variant}
              <li>
                <span>{size}</span>
                <span class="dots" />
                <span>{formatPrice(retailCentsFor(variant, pricing?.multiplier ?? null))}</span>
              </li>
            {/if}
          {/each}
        </ul>
      </section>
    {/each}
  </div>

  <p class="shipping">
    Shipping is calculated at checkout, based on size — tracked to the US and Canada.
  </p>

  <a href="/" class="cta">BROWSE THE GALLERY</a>
</main>

<SiteFooter />

<style>
  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 56px 32px 48px;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.32em;
    color: var(--muted);
  }
  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 52px;
    letter-spacing: 0.02em;
  }
  .rule {
    width: 40px;
    height: 1px;
    background: var(--accent);
  }
  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 32px 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }
  .intro {
    margin: 0;
    max-width: 520px;
    text-align: center;
    font-size: 14px;
    letter-spacing: 0.04em;
    line-height: 1.7;
    color: var(--muted);
  }
  .hero {
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .hero img {
    width: 100%;
    height: auto;
    display: block;
    box-shadow: 0 24px 44px -20px rgba(30, 25, 18, 0.4), 0 3px 8px rgba(30, 25, 18, 0.16);
  }
  .hero figcaption {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .finishes {
    display: flex;
    justify-content: center;
    gap: 18px;
  }
  .finish {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .finish img {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }
  .finish figcaption {
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .editions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 48px;
    width: 100%;
  }
  .edition {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .edition h2 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 26px;
    text-align: center;
  }
  .description {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.05em;
    line-height: 1.6;
    color: var(--muted);
    text-align: center;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  li {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 13px;
    letter-spacing: 0.08em;
    color: var(--ink);
  }
  .dots {
    flex: 1;
    border-bottom: 1px dotted #c9c4bc;
  }
  .shipping {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  .cta {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-decoration: none;
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: 12px 28px;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .cta:hover {
    background: var(--accent);
    color: var(--on-accent);
  }
</style>
