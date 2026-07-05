<script lang="ts">
  import { httpsCallable } from 'firebase/functions';
  import { aspectMismatch, catalog, dpiFor, formatPrice } from '$lib/catalog';
  import type { PrintVariant } from '$lib/catalog';
  import { functions } from '$lib/firebase';
  import type { Photo } from '$lib/shared';
  import { addToast } from '$lib/stores';

  export let photo: Photo;

  const FRAME_SWATCHES: Record<string, string> = {
    black: '#161616',
    oak: '#a86f3e',
    white: '#fdfdfb',
  };

  let productId = catalog.products[0].id;
  let redirecting = false;

  $: product = catalog.products.find((p) => p.id === productId) ?? catalog.products[0];
  $: sizes = [...new Set(product.variants.map((v) => v.size))];
  $: frameColors = [...new Set(product.variants.map((v) => v.frameColor).filter(Boolean))] as string[];

  let selectedSize = '';
  let selectedFrame = '';
  $: if (!sizes.includes(selectedSize)) selectedSize = firstOrderableSize(sizes) ?? sizes[0];
  $: if (frameColors.length && !frameColors.includes(selectedFrame)) selectedFrame = frameColors[0];

  $: variant = product.variants.find(
    (v) => v.size === selectedSize && (!frameColors.length || v.frameColor === selectedFrame),
  );

  function variantForSize(size: string): PrintVariant {
    return product.variants.find((v) => v.size === size) as PrintVariant;
  }

  function sizeTooSmall(size: string): boolean {
    const dpi = dpiFor(photo, variantForSize(size));
    return dpi !== null && dpi < catalog.minDpi;
  }

  function firstOrderableSize(list: string[]): string | undefined {
    return list.find((s) => !sizeTooSmall(s));
  }

  $: cropNote = variant ? (aspectMismatch(photo, variant) ?? 0) > 0.05 : false;

  async function order() {
    if (!variant || redirecting) return;
    redirecting = true;
    try {
      const createSession = httpsCallable<
        { photoId: string; sku: string; origin: string; cancelPath: string },
        { url: string }
      >(functions, 'createCheckoutSession');
      const { data } = await createSession({
        photoId: photo.id,
        sku: variant.sku,
        origin: location.origin,
        cancelPath: location.pathname,
      });
      location.assign(data.url);
    } catch (err) {
      redirecting = false;
      addToast({
        id: Math.floor(Math.random() * 100000),
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not start checkout',
        dismissible: true,
        timeout: 4000,
      });
    }
  }
</script>

<section class="order-panel">
  <div class="rule" />
  <h2>Order a print</h2>

  <div class="field">
    <div class="field-label">EDITION</div>
    <div class="options">
      {#each catalog.products as p (p.id)}
        <button class="option" class:selected={productId === p.id} on:click={() => (productId = p.id)}>
          {p.label}
        </button>
      {/each}
    </div>
    <p class="field-note">{product.description}</p>
  </div>

  <div class="field">
    <div class="field-label">SIZE</div>
    <div class="options">
      {#each sizes as size (size)}
        {@const disabled = sizeTooSmall(size)}
        <button
          class="option"
          class:selected={selectedSize === size}
          {disabled}
          title={disabled ? 'This photo does not have enough resolution for this size' : undefined}
          on:click={() => (selectedSize = size)}
        >
          {size}
        </button>
      {/each}
    </div>
    {#if sizes.some(sizeTooSmall)}
      <p class="field-note">Grayed sizes exceed this photo’s resolution.</p>
    {/if}
  </div>

  {#if frameColors.length}
    <div class="field">
      <div class="field-label">FRAME</div>
      <div class="options">
        {#each frameColors as color (color)}
          <button
            class="swatch"
            class:selected={selectedFrame === color}
            style={`background: ${FRAME_SWATCHES[color] ?? '#ccc'}`}
            aria-label={`${color} frame`}
            title={`${color} frame`}
            on:click={() => (selectedFrame = color)}
          />
        {/each}
      </div>
    </div>
  {/if}

  {#if cropNote}
    <p class="crop-note">This size differs from the photo’s native proportions — the image will be cropped to fit.</p>
  {/if}

  {#if variant}
    <button class="order-button" disabled={redirecting} on:click={order}>
      {redirecting ? 'REDIRECTING…' : `ORDER — ${formatPrice(variant.retailCents)}`}
    </button>
    <p class="shipping-note">
      Plus {formatPrice(catalog.shipping.flatCents)} {catalog.shipping.label.toLowerCase()}. Made to
      order, ships in 2–5 business days.
    </p>
  {/if}
</section>

<style>
  .order-panel {
    max-width: 480px;
    margin: 48px auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    text-align: center;
  }
  .rule {
    width: 40px;
    height: 1px;
    background: #1a1a1a;
  }
  h2 {
    margin: 0;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 400;
    font-size: 30px;
  }
  .field {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .field-label {
    font-size: 10px;
    letter-spacing: 0.28em;
    color: #8a8680;
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  .option {
    background: none;
    border: 1px solid #c9c4bc;
    color: #1a1a1a;
    font-size: 12px;
    letter-spacing: 0.08em;
    padding: 8px 16px;
    cursor: pointer;
    transition: border-color 0.15s ease;
  }
  .option:hover:not(:disabled) {
    border-color: #1a1a1a;
  }
  .option.selected {
    border-color: #1a1a1a;
    background: #1a1a1a;
    color: #fbfaf8;
  }
  .option:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .swatch {
    width: 28px;
    height: 28px;
    border: 1px solid rgba(0, 0, 0, 0.25);
    cursor: pointer;
    padding: 0;
  }
  .swatch.selected {
    outline: 2px solid #1a1a1a;
    outline-offset: 2px;
  }
  .field-note,
  .shipping-note {
    margin: 0;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: #a8a39b;
    max-width: 360px;
  }
  .crop-note {
    margin: 0;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: #8a8680;
    max-width: 360px;
  }
  .order-button {
    background: #1a1a1a;
    color: #fbfaf8;
    border: 0;
    font-size: 12px;
    letter-spacing: 0.22em;
    padding: 14px 34px;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .order-button:hover:not(:disabled) {
    opacity: 0.85;
  }
  .order-button:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
