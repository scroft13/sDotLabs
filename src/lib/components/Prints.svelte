<script>
  let photo = {
    title: 'Milky Way Over Paul Reservoir',
    imageUrl: 'matte-paper-framed-poster-with-mat-(in)-black-16x20-front-687e5e33527b1.png',
    description:
      'A stunning view of the Milky Way galaxy captured over Paul Reservoir, showcasing the beauty of our universe.',
    basePrice: 400.0,
    frameOptions: ['Black', 'Natural', 'White'],
  };

  let selectedFrame = photo.frameOptions[0];
  $: finalPrice = photo.basePrice;

  function buyNow() {
    // TODO: Integrate with Shopify Buy SDK
    console.log(`Buy Now clicked for ${photo.title} - Frame: ${selectedFrame}`);
  }
</script>

<div class="print-container">
  <div class="card">
    <img src={photo.imageUrl} alt={photo.description} class="photo" />
    <div class="info">
      <h2>{photo.title}</h2>
      <p class="description">{photo.description}</p>

      <label for="frameSelect">Choose a Frame:</label>
      <select id="frameSelect" bind:value={selectedFrame}>
        {#each photo.frameOptions as option}
          <option value={option}>{option}</option>
        {/each}
      </select>

      <div class="price">Price: ${finalPrice.toFixed(2)}</div>
      <button class="buy-button" on:click={buyNow}>Buy Now</button>
    </div>
  </div>
</div>

<style>
  .print-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background-color: #f8f9fa;
    min-height: 100vh;
  }

  .card {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .photo {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-bottom: 1px solid #eee;
  }

  .info {
    padding: 1.5rem;
    width: 100%;
    text-align: center;
  }

  h2 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  .description {
    font-size: 1rem;
    color: #555;
    margin-bottom: 1.5rem;
  }

  label {
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
  }

  select {
    padding: 0.5rem;
    width: 100%;
    font-size: 1rem;
    margin-bottom: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c3e50;
    margin-top: 0.5rem;
  }
  .buy-button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #1a73e8;
    color: white;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .buy-button:hover {
    background-color: #1669c1;
  }
</style>
