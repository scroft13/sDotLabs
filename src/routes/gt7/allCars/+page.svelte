<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let allCars: { ID: string; ShortName: string; Maker: string }[] = [];
  let makers: { ID: string; Name: string; Country: string }[] = [];

  onMount(async () => {
    allCars = await d3.csv('https://ddm999.github.io/gt7info/data/db/cars.csv');
    makers = await d3.csv('https://ddm999.github.io/gt7info/data/db/maker.csv');
    console.log(makers);
  });
</script>

<li>
  {#each allCars as car}
    <ul>
      <li>
        {#each makers as maker}
          {#if car.Maker === maker.ID}
            {maker.Name}
          {/if}
        {/each}
        {car.ShortName}
      </li>
    </ul>
  {/each}
</li>
