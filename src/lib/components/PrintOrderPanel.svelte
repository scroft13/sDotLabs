<script lang="ts">
  import { httpsCallable } from 'firebase/functions';
  import { catalog, formatPrice, resolutionScale, resolveAspectCategory } from '$lib/catalog';
  import type { PrintVariant } from '$lib/catalog';
  import db from '$lib/db';
  import { functions } from '$lib/firebase';
  import { retailCentsFor, shippingCentsFor, type PricingSettings } from '$lib/pricing';
  import type { Photo } from '$lib/shared';
  import { addToast } from '$lib/stores';
  import { onMount } from 'svelte';

  export let photo: Photo;

  // Admin-tuned pricing (multiplier + shipping overrides). Checkout computes
  // from the same doc server-side, so these numbers match what Stripe
  // charges; until it loads, the catalog's baked-in prices show.
  let pricing: PricingSettings | null = null;
  onMount(async () => {
    pricing = await db.settings.pricing().catch(() => null);
  });

  const FRAME_SWATCHES: Record<string, string> = {
    black: '#161616',
    oak: '#a86f3e',
    white: '#fdfdfb',
  };

  // Real Classic-frame moulding corners (see static/prints) shown as the
  // frame-color swatches, so buyers see the actual wood/finish, not a flat
  // color chip. Falls back to the hex swatch above if a color has no image.
  const FRAME_THUMBS: Record<string, string> = {
    black: '/prints/frame-black.jpg',
    oak: '/prints/frame-oak.jpg',
    white: '/prints/frame-white.jpg',
  };

  let productId = catalog.products[0].id;
  let redirecting = false;

  $: product = catalog.products.find((p) => p.id === productId) ?? catalog.products[0];
  // Only sizes matching this photo's aspect category (override or
  // auto-detected) are ever sold -- prints always fill the paper edge to
  // edge, so a photo without a confident category gets no sizes at all
  // rather than a print with blank paper borders.
  $: resolvedCategory = resolveAspectCategory(photo);
  $: matchingVariants = resolvedCategory
    ? product.variants.filter((v) => v.aspectRatio === resolvedCategory)
    : [];
  // Matted vs. unmatted is a distinct Prodigi product, not every size/aspect
  // combo has both (e.g. 4:5 currently has no matted option) -- so mounts are
  // derived per aspect category, and size/frame options narrow further once
  // a mount is picked.
  $: mounts = [...new Set(matchingVariants.map((v) => v.mount).filter(Boolean))] as (
    | 'matted'
    | 'unmatted'
  )[];

  let selectedSize = '';
  let selectedFrame = '';
  let selectedMount: 'matted' | 'unmatted' | '' = '';
  $: if (mounts.length && !mounts.includes(selectedMount as 'matted' | 'unmatted')) {
    selectedMount = mounts.includes('matted') ? 'matted' : mounts[0];
  }
  $: mountVariants = mounts.length
    ? matchingVariants.filter((v) => v.mount === selectedMount)
    : matchingVariants;
  $: sizes = [...new Set(mountVariants.map((v) => v.size))];
  $: frameColors = [...new Set(mountVariants.map((v) => v.frameColor).filter(Boolean))] as string[];

  // Re-pick the size when the current one leaves the list or is too small for
  // this photo (e.g. after switching mount), preferring the first orderable
  // one so the panel never lands on a grayed-out size by default.
  $: if (!sizes.includes(selectedSize) || sizeTooSmall(selectedSize))
    selectedSize = firstOrderableSize(sizes) ?? sizes[0];
  $: if (frameColors.length && !frameColors.includes(selectedFrame)) selectedFrame = frameColors[0];

  $: variant = mountVariants.find(
    (v) => v.size === selectedSize && (!frameColors.length || v.frameColor === selectedFrame),
  );
  // True when even the chosen size can't be met by this photo's resolution --
  // every size is grayed out, so there's nothing orderable.
  $: selectedTooSmall = !!selectedSize && sizeTooSmall(selectedSize);

  function variantForSize(size: string): PrintVariant {
    return mountVariants.find((v) => v.size === size) as PrintVariant;
  }

  function sizeTooSmall(size: string): boolean {
    const scale = resolutionScale(photo, variantForSize(size));
    return scale !== null && scale > catalog.maxUpscale;
  }

  function firstOrderableSize(list: string[]): string | undefined {
    return list.find((s) => !sizeTooSmall(s));
  }

  // --- Exact-proportion preview -------------------------------------------
  // The preview is computed from the product's real dimensions so it matches
  // what ships: the Classic frame moulding has a 20mm face, and the mat
  // border is derived per variant from (nominal frame size - mat opening)/2,
  // where the opening comes from the print-area pixels at 300dpi. The photo
  // is drawn object-fit:cover inside the true opening ratio, so any center
  // crop Prodigi's fillPrintArea would make (e.g. matted panoramics) is shown
  // exactly rather than idealized away.
  const FRAME_FACE_IN = 20 / 25.4;
  const PREVIEW_MAX_W = 320;
  const PREVIEW_MAX_H = 300;

  $: photoLandscape = (photo.width ?? 1) >= (photo.height ?? 1);

  type PreviewGeom = { framePx: number; matPx: number; openWpx: number; openHpx: number };

  function previewGeometry(v: PrintVariant, framed: boolean, landscape: boolean): PreviewGeom {
    // Catalog sizes are listed portrait (e.g. "12″×16″"); orient to the photo.
    const m = v.size.match(/^(\d+)″×(\d+)″$/);
    let frameW = m ? Number(m[1]) : v.printAreaWidthPx / 300;
    let frameH = m ? Number(m[2]) : v.printAreaHeightPx / 300;
    let openW = v.printAreaWidthPx / 300;
    let openH = v.printAreaHeightPx / 300;
    if (landscape) {
      [frameW, frameH] = [frameH, frameW];
      [openW, openH] = [openH, openW];
    }
    const face = framed ? FRAME_FACE_IN : 0;
    // Unmatted glaze equals the print area bar manufacturing slack, so the
    // derived border collapses to ~0 and only the moulding shows.
    const mat = framed ? Math.max(0, (frameW - openW) / 2) : 0;
    const outerW = (framed ? frameW : openW) + 2 * face;
    const outerH = (framed ? frameH : openH) + 2 * face;
    const scale = Math.min(PREVIEW_MAX_W / outerW, PREVIEW_MAX_H / outerH);
    return {
      framePx: face * scale,
      matPx: mat * scale,
      openWpx: openW * scale,
      openHpx: openH * scale,
    };
  }

  $: geom = variant ? previewGeometry(variant, productId === 'framed', photoLandscape) : null;

  // Fractional trim fillPrintArea will make when the opening's ratio differs
  // from the photo's (only matted panoramics today). 0 when they match.
  function cropFraction(v: PrintVariant): number {
    if (!photo.width || !photo.height) return 0;
    const photoR = Math.max(photo.width, photo.height) / Math.min(photo.width, photo.height);
    const openR =
      Math.max(v.printAreaWidthPx, v.printAreaHeightPx) /
      Math.min(v.printAreaWidthPx, v.printAreaHeightPx);
    return openR > photoR ? 1 - photoR / openR : 1 - openR / photoR;
  }

  $: cropFrac = variant ? cropFraction(variant) : 0;
  // The trimmed dimension: a more-elongated opening eats the photo's short
  // side (height for landscape), a squarer one eats the long side.
  $: cropDimension = (() => {
    if (!variant || !photo.width || !photo.height) return 'edges';
    const photoR = Math.max(photo.width, photo.height) / Math.min(photo.width, photo.height);
    const openR =
      Math.max(variant.printAreaWidthPx, variant.printAreaHeightPx) /
      Math.min(variant.printAreaWidthPx, variant.printAreaHeightPx);
    const eatsShort = openR > photoR;
    return eatsShort === photoLandscape ? 'height' : 'width';
  })();

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

  {#if geom}
    <div class="preview">
      {#if productId === 'framed'}
        <div
          class="pv-frame"
          style={`padding: ${geom.framePx}px; background: ${
            FRAME_SWATCHES[selectedFrame] ?? '#161616'
          }`}
        >
          <div class="pv-mat" style={`padding: ${geom.matPx}px`}>
            <div class="pv-open" style={`width: ${geom.openWpx}px; height: ${geom.openHpx}px`}>
              <img src={db.photos.publicUrl(photo.storage_path)} alt="" />
            </div>
          </div>
        </div>
      {:else}
        <div class="pv-open pv-bare" style={`width: ${geom.openWpx}px; height: ${geom.openHpx}px`}>
          <img src={db.photos.publicUrl(photo.storage_path)} alt="" />
        </div>
      {/if}
    </div>
    {#if cropFrac > 0.01}
      <p class="crop-note">
        The mat opening on this size is a slightly different shape — about {Math.round(
          cropFrac * 100,
        )}% of the photo’s {cropDimension} is trimmed to fill it, exactly as shown above.
      </p>
    {/if}
  {/if}

  <div class="field">
    <div class="field-label">EDITION</div>
    <div class="options">
      {#each catalog.products as p (p.id)}
        <button
          class="option"
          class:selected={productId === p.id}
          on:click={() => (productId = p.id)}
        >
          {p.label}
        </button>
      {/each}
    </div>
    <p class="field-note">{product.description}</p>
  </div>

  {#if !resolvedCategory}
    <p class="crop-note">
      Prints aren’t available for this photo yet — its proportions don’t match one of the offered
      print ratios.
    </p>
  {/if}

  {#if mounts.length > 1}
    <div class="field">
      <div class="field-label">MAT</div>
      <div class="options">
        {#each mounts as mount (mount)}
          <button
            class="option"
            class:selected={selectedMount === mount}
            on:click={() => (selectedMount = mount)}
          >
            {mount === 'matted' ? 'Matted' : 'No Mat'}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if sizes.length}
    <div class="field">
      <div class="field-label">SIZE</div>
      <div class="options">
        {#each sizes as size (size)}
          {@const disabled = sizeTooSmall(size)}
          <button
            class="option"
            class:selected={selectedSize === size}
            {disabled}
            title={disabled
              ? 'This photo does not have enough resolution for this size'
              : undefined}
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
  {/if}

  {#if frameColors.length}
    <div class="field">
      <div class="field-label">FRAME</div>
      <div class="options">
        {#each frameColors as color (color)}
          <button
            class="swatch"
            class:selected={selectedFrame === color}
            aria-label={`${color} frame`}
            title={`${color} frame`}
            on:click={() => (selectedFrame = color)}
          >
            {#if FRAME_THUMBS[color]}
              <img src={FRAME_THUMBS[color]} alt="" />
            {:else}
              <span class="swatch-fill" style={`background: ${FRAME_SWATCHES[color] ?? '#ccc'}`} />
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if variant}
    <button class="order-button" disabled={redirecting || selectedTooSmall} on:click={order}>
      {#if selectedTooSmall}
        NOT ENOUGH RESOLUTION
      {:else if redirecting}
        REDIRECTING…
      {:else}
        ORDER — {formatPrice(retailCentsFor(variant, pricing?.multiplier ?? null))}
      {/if}
    </button>
    <p class="shipping-note">
      Plus {formatPrice(shippingCentsFor(variant, pricing?.shipping ?? null))} tracked shipping. Made
      to order, ships in 2–5 business days.
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
    background: var(--accent);
  }
  .preview {
    display: flex;
    justify-content: center;
  }
  .pv-frame {
    box-shadow: 0 24px 44px -20px rgba(30, 25, 18, 0.4), 0 3px 8px rgba(30, 25, 18, 0.16);
  }
  .pv-mat {
    background: #fdfdfb;
  }
  .pv-open {
    position: relative;
    overflow: hidden;
    background: #eceae6;
    /* Mat bevel edge around the opening. */
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.14);
  }
  .pv-open img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .pv-bare {
    box-shadow: 0 10px 24px -12px rgba(30, 25, 18, 0.3), 0 2px 5px rgba(30, 25, 18, 0.12);
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
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
    color: var(--muted);
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
    color: var(--ink);
    font-size: 12px;
    letter-spacing: 0.08em;
    padding: 8px 16px;
    cursor: pointer;
    transition: border-color 0.15s ease;
  }
  .option:hover:not(:disabled) {
    border-color: var(--ink);
  }
  .option.selected {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--on-accent);
  }
  .option:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .swatch {
    width: 40px;
    height: 40px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    background: none;
    line-height: 0;
  }
  .swatch img,
  .swatch-fill {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .swatch.selected {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .field-note,
  .shipping-note {
    margin: 0;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--muted);
    max-width: 360px;
  }
  .crop-note {
    margin: 0;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--muted);
    max-width: 360px;
  }
  .order-button {
    background: var(--accent);
    color: var(--on-accent);
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
