<script lang="ts">
  import { onMount } from 'svelte';
  import { getJson } from '$lib/shared';
  import CarCard from '$lib/components/CarCard.svelte';

  let ucd: {
    dailyrace: [];
    legend: [];
    updatetimestamp: string;
    used: {
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
  } = {
    dailyrace: [],
    legend: [],
    updatetimestamp: '',
    used: {
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
  };
  onMount(async () => {
    ucd = await getJson('https://ddm999.github.io/gt7info/data.json');
  });
</script>

<div class="main-padding mx-4 lg:mx-16 xl:mx-40 mb-20">
  <p class="mb-4">
    Last Updated: {new Date(ucd.updatetimestamp).toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}
  </p>
  <div class="flex flex-wrap gap-3 justify-evenly">
    {#each ucd.used.cars as car}
      <CarCard make={car.manufacturer} model={car.name} price={car.credits} id={car.carid} />
    {/each}
  </div>
</div>
