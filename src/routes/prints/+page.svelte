<script lang="ts">
  import { catalog, formatPrice } from '$lib/catalog';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import SiteNav from '$lib/components/SiteNav.svelte';
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
    <em>Order a print</em> — each one is produced when you order it, and ships within 2–5 business
    days.
  </p>

  <div class="editions">
    {#each catalog.products as product (product.id)}
      <section class="edition">
        <h2>{product.label}</h2>
        <p class="description">{product.description}</p>
        <ul>
          {#each [...new Set(product.variants.map((v) => v.size))] as size (size)}
            {@const variant = product.variants.find((v) => v.size === size)}
            {#if variant}
              <li>
                <span>{size}</span>
                <span class="dots" />
                <span>{formatPrice(variant.retailCents)}</span>
              </li>
            {/if}
          {/each}
        </ul>
        {#if product.variants.some((v) => v.frameColor)}
          <p class="frames-note">
            Frames in black, red oak, and white — semi-hardwood with an off-white mat and acrylite
            front, ready to hang.
          </p>
        {/if}
      </section>
    {/each}
  </div>

  <p class="shipping">
    {formatPrice(catalog.shipping.flatCents)} flat {catalog.shipping.label.toLowerCase()} to the US
    and Canada.
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
    color: #6f6b64;
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
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 400;
    font-size: 26px;
    text-align: center;
  }
  .description,
  .frames-note {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.05em;
    line-height: 1.6;
    color: #a8a39b;
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
    color: #1a1a1a;
  }
  .dots {
    flex: 1;
    border-bottom: 1px dotted #c9c4bc;
  }
  .shipping {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    color: #6f6b64;
  }
  .cta {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-decoration: none;
    color: #1a1a1a;
    border: 1px solid #1a1a1a;
    padding: 12px 28px;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .cta:hover {
    background: #1a1a1a;
    color: #fbfaf8;
  }
</style>
