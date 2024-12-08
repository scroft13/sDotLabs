<script lang="ts">
  import { onMount } from 'svelte';

  let enlargedIndex: any | number = null;
  let imagesPerRow = 0;

  function toggleEnlarged(index: number) {
    enlargedIndex = enlargedIndex === index ? null : index;
  }

  function updateImagesPerRow() {
    const viewportWidth = window.innerWidth;
    imagesPerRow = Math.floor(viewportWidth / 400);
    const gapWidth = (imagesPerRow - 1) * 10;
    let enlargedImageWidth = imagesPerRow * 400 + gapWidth;
    enlargedImageWidth >= 1600 ? (enlargedImageWidth = 1600) : null;
    const enlargedImageWidthString = enlargedImageWidth.toString() + 'px';
    console.log(enlargedImageWidth.toString() + 'px');
    document.documentElement.style.setProperty('--enlarged-image-width', enlargedImageWidthString);
  }

  onMount(() => {
    updateImagesPerRow();
    window.addEventListener('resize', updateImagesPerRow);
    return () => {
      window.removeEventListener('resize', updateImagesPerRow);
    };
  });
</script>

<div class="gallery">
  {#each Array.from({ length: 20 }) as _, index}
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <img
      src="https://via.placeholder.com/400"
      alt="Portfolio Image {index + 1}"
      class:enlarged={enlargedIndex === index}
      on:click={() => toggleEnlarged(index)}
      on:keydown={(e) => e.key === 'Enter' && toggleEnlarged(index)}
    />
  {/each}
</div>

<style>
  .gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    /* justify-content: center; */
    width: 100%;
    align-content: center;
  }

  .gallery img {
    width: 100%;
    max-width: 400px;
    height: auto;
    max-height: 400px;
    cursor: pointer;
    transition: transform 0.3s ease, z-index 0.3s ease;
    border-radius: 10px;
  }

  .gallery img.enlarged {
    max-width: var(--enlarged-image-width);
    max-height: var(--enlarged-image-width);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    .gallery img {
      max-width: calc(50% - 10px);
      max-height: calc(50% - 10px);
    }
  }
</style>
