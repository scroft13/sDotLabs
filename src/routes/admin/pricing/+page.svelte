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

  let multiplier: number | null = DEFAULT_MULTIPLIER;
  // Shipping charge inputs in dollars. type="number" binds a number (or null
  // when the field is empty); null/NaN means pass Prodigi's cost through.
  let shippingInput: Record<string, number | null> = {};
  let loaded = false;
  let saving = false;

  onMount(async () => {
    const settings = await db.settings.pricing();
    if (settings) {
      multiplier = settings.multiplier;
      shippingInput = Object.fromEntries(
        Object.entries(settings.shipping).map(([sku, cents]) => [sku, cents / 100]),
      );
    }
    loaded = true;
  });

  function chargedCents(row: Row): number {
    const dollars = shippingInput[row.prodigiSku];
    if (dollars == null || !Number.isFinite(dollars) || dollars < 0)
      return row.variant.shippingCents;
    return Math.round(dollars * 100);
  }

  async function save() {
    if (multiplier == null || !Number.isFinite(multiplier) || multiplier < 1) {
      addToast({
        id: Math.floor(Math.random() * 100000),
        type: 'error',
        message: 'Multiplier must be a number of at least 1 (or it would sell below cost)',
        dismissible: true,
        timeout: 4000,
      });
      return;
    }
    saving = true;
    const shipping: Record<string, number> = {};
    for (const row of rows) {
      const dollars = shippingInput[row.prodigiSku];
      if (dollars == null || !Number.isFinite(dollars) || dollars < 0) continue;
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

<main class="admin-page">
  <h1>Pricing</h1>

  {#if !loaded}
    <p class="muted">Loading…</p>
  {:else}
    <div class="card multiplier">
      <label for="multiplier" class="section-label">Cost multiplier</label>
      <input id="multiplier" type="number" step="0.1" min="1" bind:value={multiplier} />
      <p class="hint">
        Price = Prodigi cost × multiplier, rounded to the dollar. Applies to every variant.
      </p>
    </div>

    <table class="admin-table">
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

    <button class="btn-primary save" disabled={saving} on:click={save}>
      {saving ? 'Saving…' : 'Save pricing'}
    </button>
    <p class="hint">
      Leave a shipping field blank to charge Prodigi’s real cost. Set it lower (or 0) to eat the
      difference — the “Ship margin” column shows what each order costs you.
    </p>
  {/if}
</main>

<style>
  .multiplier {
    margin-bottom: 1.5rem;
  }
  /* id/compound selectors below out-specify the shared full-width input rule. */
  #multiplier {
    width: 6rem;
  }
  .hint {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: #8a8680;
  }
  .admin-table :global(td.price) {
    font-weight: 600;
  }
  .admin-table :global(td.eaten) {
    color: #b3261e;
  }
  .admin-table .ship-input {
    width: 5.5rem;
    text-align: right;
  }
  .save {
    margin-top: 1.5rem;
  }
</style>
