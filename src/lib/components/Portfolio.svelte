<script lang="ts">
  import { onMount } from 'svelte';

  let enlargedIndex: any | number = null;
  let imagesPerRow = 0;
  let randomImages: string[] = [];
  let imgElement: HTMLImageElement | null = null;

  function recenterImage() {
    if (!imgElement) return;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get image dimensions and position
    const { width, height } = imgElement.getBoundingClientRect();

    // Calculate offsets to center the image
    const offsetX = (viewportWidth - width) / 2;
    const offsetY = (viewportHeight - height) / 2;

    // Apply the offsets as CSS transforms
    imgElement.style.position = 'absolute';
    imgElement.style.left = `${offsetX}px`;
    imgElement.style.top = `${offsetY}px`;
    imgElement.style.transform = 'translate(0, 0)';
  }
  async function toggleEnlarged(index: number) {
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

  onMount(async () => {
    updateImagesPerRow();
    window.addEventListener('resize', updateImagesPerRow);
    return () => {
      window.removeEventListener('resize', updateImagesPerRow);
    };
  });

  export function load() {
    const getRandomImages = (count: number = 20): string[] => {
      const baseUrl = 'https://picsum.photos/400';
      const images: string[] = [];
      for (let i = 0; i < count; i++) {
        images.push(`${baseUrl}?random=${Math.random()}`);
      }
      return images;
    };

    return getRandomImages();
  }

  randomImages = load();
</script>

<div class="gallery">
  {#if randomImages.length >= 25}
    {#each randomImages as image, index}
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <img
        src={image}
        alt="Portfolio Image {index + 1}"
        class:enlarged={enlargedIndex === index}
        on:click={() => {
          toggleEnlarged(index);
          recenterImage();
        }}
        on:keydown={(e) => e.key === 'Enter' && toggleEnlarged(index)}
      />
    {/each}
  {:else}
    {#each Array(20) as _}
      <div class="h-96">
        <div class="skeleton-block" />
      </div>
    {/each}
  {/if}
</div>

<style>
  .gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
    width: 100%;
    justify-content: center;
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
    box-shadow: 5px 5px 12px #999;
  }
  .gallery img:hover {
    transform: scale(1.2); /* Grows by 20% */
    z-index: 25;
  }

  .gallery img.enlarged {
    max-width: var(--enlarged-image-width);
    max-height: var(--enlarged-image-width);
  }
  .gallery img.enlarged:hover {
    transform: scale(1);
    z-index: 10;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    .gallery img {
      max-width: calc(50% - 10px);
      max-height: calc(50% - 10px);
    }
  }
</style>
