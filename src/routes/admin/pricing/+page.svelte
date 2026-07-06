<script lang="ts">
  import { onMount } from 'svelte';
  import { catalog, formatPrice } from '$lib/catalog';
  import type { PrintVariant } from '$lib/catalog';
  import { DEFAULT_MULTIPLIER, retailCentsFor } from '$lib/pricing';
  import db from '$lib/db';
  import { addToast } from '$lib/stores';

  // One row per priced group -- colors of the same product/size/mount share
  // a prodigiSku and therefore a price, so they collapse here.
  type Row = {
    prodigiSku: string;
    productLabel: string;
    size: string;
    mount: string;
    variant: PrintVariant;
  };
  const rows: Row[] = [];
  for (const product of catalog.products) {
    const seen = new Set<string>();
    for (const variant of product.variants) {
      if (seen.has(variant.prodigiSku)) continue;
      seen.add(variant.prodigiSku);
      rows.push({
        prodigiSku: variant.prodigiSku,
        productLabel: product.label,
        size: variant.size,
        mount: variant.mount ? (variant.mount === 'matted' ? 'Matted' : 'No mat') : '—',
        variant,
      });
    }
  }

  let multiplier = DEFAULT_MULTIPLIER;
  // Shipping charge inputs in dollars ('' = pass Prodigi's cost through).
  let shippingInput: Record<string, string> = {};
  let loaded = false;
  let saving = false;

  onMount(async () => {
    const settings = await db.settings.pricing();
    if (settings) {
      multiplier = settings.multiplier;
      shippingInput = Object.fromEntries(
        Object.entries(settings.shipping).map(([sku, cents]) => [sku, (cents / 100).toFixed(2)]),
      );
    }
    loaded = true;
  });

  function chargedCents(row: Row): number {
    const raw = shippingInput[row.prodigiSku];
    if (raw === undefined || raw.trim() === '') return row.variant.shippingCents;
    const dollars = Number(raw);
    return Number.isFinite(dollars) && dollars >= 0
      ? Math.round(dollars * 100)
      : row.variant.shippingCents;
  }

  async function save() {
    if (multiplier < 1) {
      addToast({
        id: Math.floor(Math.random() * 100000),
        type: 'error',
        message: 'Multiplier below 1 would sell prints under cost',
        dismissible: true,
        timeout: 4000,
      });
      return;
    }
    saving = true;
    const shipping: Record<string, number> = {};
    for (const row of rows) {
      const raw = shippingInput[row.prodigiSku];
      if (raw === undefined || raw.trim() === '') continue;
      const dollars = Number(raw);
      if (!Number.isFinite(dollars) || dollars < 0) continue;
      const cents = Math.round(dollars * 100);
      // Only store real overrides -- matching Prodigi's cost is the default.
      if (cents !== row.variant.shippingCents) shipping[row.prodigiSku] = cents;
    }
    try {
      await db.settings.setPricing({ multiplier, shipping });
      addToast({
        id: Math.floor(Math.random() * 100000),
        type: 'success',
        message: 'Pricing saved',
        dismissible: true,
        timeout: 3000,
      });
    } catch (err) {
      addToast({
        id: Math.floor(Math.random() * 100000),
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not save pricing',
        dismissible: true,
        timeout: 4000,
      });
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Pricing</title>
</svelte:head>

<main>
  <a href="/admin" class="back">&larr; Albums</a>
  <h1>Pricing</h1>

  {#if !loaded}
    <p class="secondary-text">Loading…</p>
  {:else}
    <section class="multiplier">
      <label for="multiplier">Cost multiplier</label>
      <input id="multiplier" type="number" step="0.1" min="1" bind:value={multiplier} />
      <p class="hint">
        Price = Prodigi cost × multiplier, rounded to the dollar. Applies to every variant.
      </p>
    </section>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Size</th>
          <th>Mat</th>
          <th class="num">Cost</th>
          <th class="num">Price</th>
          <th class="num">Prodigi ship</th>
          <th class="num">You charge</th>
          <th class="num">Ship margin</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.prodigiSku)}
          {@const charged = chargedCents(row)}
          {@const margin = charged - row.variant.shippingCents}
          <tr>
            <td>{row.productLabel}</td>
            <td>{row.size}</td>
            <td>{row.mount}</td>
            <td class="num">{formatPrice(row.variant.costCents)}</td>
            <td class="num price">{formatPrice(retailCentsFor(row.variant, multiplier))}</td>
            <td class="num">{formatPrice(row.variant.shippingCents)}</td>
            <td class="num">
              <input
                class="ship-input"
                type="number"
                step="0.01"
                min="0"
                placeholder={(row.variant.shippingCents / 100).toFixed(2)}
                bind:value={shippingInput[row.prodigiSku]}
              />
            </td>
            <td class="num" class:eaten={margin < 0}>
              {margin === 0 ? '—' : formatPrice(margin)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <button class="save" disabled={saving} on:click={save}>
      {saving ? 'Saving…' : 'Save pricing'}
    </button>
    <p class="hint">
      Leave a shipping field blank to charge Prodigi’s real cost. Set it lower (or 0) to eat the
      difference — the “Ship margin” column shows what each order costs you.
    </p>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  .back {
    font-size: 0.85rem;
    color: inherit;
  }
  h1 {
    margin: 0.5rem 0 1.5rem;
  }
  .multiplier {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }
  .multiplier label {
    font-weight: 600;
  }
  .multiplier input {
    width: 5rem;
    padding: 0.4rem 0.6rem;
    border: 1px solid #c9c4bc;
  }
  .hint {
    width: 100%;
    margin: 0.25rem 0 0;
    font-size: 0.8rem;
    color: #6f6b64;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  th,
  td {
    padding: 0.5rem 0.5rem;
    border-bottom: 1px solid #e5e5e5;
    text-align: left;
  }
  th.num,
  td.num {
    text-align: right;
  }
  td.price {
    font-weight: 600;
  }
  td.eaten {
    color: #dc2626;
  }
  .ship-input {
    width: 5.5rem;
    padding: 0.3rem 0.4rem;
    border: 1px solid #c9c4bc;
    text-align: right;
  }
  .save {
    margin-top: 1.5rem;
    padding: 0.6rem 1.4rem;
    background: #1a1a1a;
    color: #fff;
    border: 0;
    cursor: pointer;
  }
  .save:disabled {
    opacity: 0.5;
  }
</style>
