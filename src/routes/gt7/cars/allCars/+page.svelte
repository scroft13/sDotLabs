<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import CarCard from '$lib/components/CarCard.svelte';

  let allCars: { ID: string; ShortName: string; Maker: string }[] = [];
  let makers: { ID: string; Name: string; Country: string }[] = [];

  onMount(async () => {
    allCars = await d3.csv('https://ddm999.github.io/gt7info/data/db/cars.csv');
    makers = await d3.csv('https://ddm999.github.io/gt7info/data/db/maker.csv');
  });
</script>

<div class="flex flex-wrap gap-3 justify-evenly">
  {#each allCars as car}
    {#each makers as maker}
      {#if car.Maker === maker.ID}
        <CarCard make={maker.Name} model={car.ShortName} id={car.ID} />
      {/if}
    {/each}
  {/each}
</div>
