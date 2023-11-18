<script lang="ts">
  import { onMount } from 'svelte';
  import { getJson } from '$lib/shared';
  import CarCard from '$lib/components/CarCard.svelte';

  let hagertys: {
    dailyrace: [];
    legend: {
      cars: {
        carid: string;
        credits: number;
        estimatedays: number;
        manufacturer: string;
        maxestimatedays: number;
        name: string;
        new: false;
        region: string;
        state: string;
      }[];
      date: string;
    };
    updatetimestamp: string;
    used: [];
  } = {
    dailyrace: [],
    legend: {
      cars: [
        {
          carid: '1925',
          credits: 500000,
          estimatedays: -2,
          manufacturer: 'Shelby',
          maxestimatedays: -2,
          name: "G.T.350 '65",
          new: false,
          region: 'us',
          state: 'normal',
        },
      ],
      date: '',
    },
    updatetimestamp: '',
    used: [],
  };
  onMount(async () => {
    hagertys = await getJson('https://ddm999.github.io/gt7info/data.json');
    console.log(hagertys);
  });
</script>

<div class="main-padding">
  Last Updated: {hagertys.updatetimestamp}
  <div class="flex mx-4 lg:mx-16 xl:mx-40 flex-wrap">
    {#each hagertys.legend.cars as car}
      <CarCard make={car.manufacturer} model={car.name} price={car.credits} id={car.carid} />
    {/each}
  </div>
</div>
