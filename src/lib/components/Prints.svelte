<script>
  let photo = {
    title: 'Sunset Over Still Water',
    imageUrl: '/images/sunset-still-water.jpg',
    description: 'A peaceful sunset reflecting off the lake surface.',
    basePrice: 49.0,
    frameOptions: [
      { name: 'Black', priceModifier: 0 },
      { name: 'Natural', priceModifier: 5 },
      { name: 'White', priceModifier: 3 },
    ],
  };

  let selectedFrame = photo.frameOptions[0];
  $: finalPrice = photo.basePrice + selectedFrame.priceModifier;
</script>

<div class="print-container">
  <h2>{photo.title}</h2>
  <img src={photo.imageUrl} alt={photo.description} />
  <p>{photo.description}</p>

  <label for="frameSelect">Choose a Frame:</label>
  <select id="frameSelect" bind:value={selectedFrame}>
    {#each photo.frameOptions as option}
      <option value={option}>{option.name} (+${option.priceModifier})</option>
    {/each}
  </select>

  <div class="price">Price: ${finalPrice.toFixed(2)}</div>
</div>

<style>
  .print-container {
    max-width: 600px;
    margin: auto;
    text-align: center;
    font-family: sans-serif;
  }
  img {
    width: 100%;
    height: auto;
    border: 2px solid #ccc;
  }
  select {
    padding: 8px;
    margin-top: 12px;
  }
  .price {
    margin-top: 12px;
    font-size: 1.2rem;
    font-weight: bold;
  }
</style>
