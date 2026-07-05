<script lang="ts">
  import type { PhotoExif } from '$lib/shared';

  export let title: string | null = null;
  export let exif: PhotoExif | null = null;

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
  <div class="frame">
    <div class="mat">
      <div class="print">
        <slot />
      </div>
    </div>
  </div>
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
