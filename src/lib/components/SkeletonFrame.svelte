<script lang="ts">
  // Loading placeholder shaped like a framed photo on the wall: same frame,
  // mat, and caption footprint as GalleryFrame, with a shimmering print.
  // The print height follows the wall's --wall-h so skeleton rows line up
  // with the real justified rows that replace them.
  export let aspect = 3 / 2;
</script>

<div class="gallery-frame skeleton" aria-hidden="true">
  <div class="frame">
    <div class="mat">
      <div class="print skeleton-shimmer" style={`aspect-ratio: ${aspect}`} />
    </div>
  </div>
  <div class="caption-bar skeleton-shimmer" />
</div>

<style>
  .skeleton {
    break-inside: avoid;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }
  .frame {
    background: #161616;
    padding: 16px;
    box-shadow: 0 24px 44px -20px rgba(30, 25, 18, 0.4), 0 3px 8px rgba(30, 25, 18, 0.16);
    opacity: 0.55;
  }
  .mat {
    background: #fdfdfb;
    padding: 34px;
  }
  .print {
    height: var(--wall-h, 240px);
  }
  .caption-bar {
    width: 120px;
    height: 10px;
  }
</style>
