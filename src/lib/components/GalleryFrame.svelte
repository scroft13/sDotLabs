<script lang="ts">
  import type { PhotoExif } from '$lib/shared';

  export let title: string | null = null;
  export let exif: PhotoExif | null = null;
  export let framed = true;
  export let frameColor = '#161616';
  export let matted = true;

  $: exifLine = exif
    ? [
        exif.iso != null ? `ISO ${exif.iso}` : null,
        exif.aperture != null ? `ƒ/${exif.aperture}` : null,
        exif.shutterSpeed,
        exif.focalLength != null ? `${exif.focalLength}mm` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';
</script>

<figure class="gallery-frame">
  {#if framed}
    <div class="frame" style={`background: ${frameColor}`}>
      <div class="mat" class:no-mat={!matted}>
        <div class="print">
          <slot />
        </div>
      </div>
    </div>
  {:else}
    <div class="mat unframed">
      <div class="print">
        <slot />
      </div>
    </div>
  {/if}
  {#if title || exifLine}
    <figcaption>
      {#if title}
        <div class="caption-title">{title}</div>
      {/if}
      {#if exifLine}
        <div class="caption-exif">{exifLine}</div>
      {/if}
    </figcaption>
  {/if}
</figure>

<style>
  .gallery-frame {
    break-inside: avoid;
    margin: 0 0 64px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .frame {
    background: #161616;
    padding: 16px;
    box-shadow: 0 24px 44px -20px rgba(30, 25, 18, 0.4), 0 3px 8px rgba(30, 25, 18, 0.16);
  }
  .mat {
    background: #fdfdfb;
    padding: 34px;
  }
  /* Unmatted: the print sits almost flush in the frame, just a thin recessed
     edge instead of a visible mat board. */
  .mat.no-mat {
    background: rgba(0, 0, 0, 0.06);
    padding: 6px;
  }
  .mat.unframed {
    box-shadow: 0 10px 24px -12px rgba(30, 25, 18, 0.3), 0 2px 5px rgba(30, 25, 18, 0.12);
  }
  .print {
    border: 1px solid rgba(0, 0, 0, 0.14);
  }
  figcaption {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }
  .caption-title {
    font-size: 12px;
    letter-spacing: 0.08em;
    color: #6f6b64;
  }
  .caption-exif {
    font-family: Menlo, Consolas, monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: #a8a39b;
  }
</style>
