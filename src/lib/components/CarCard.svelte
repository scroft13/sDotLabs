<script lang="ts">
  import { numberFormat2 } from '$lib/shared';

  export let make: string;
  export let model: string;
  export let price: number = 0;
  export let id: string;
</script>

<!-- class="border flex flex-col items-center justify-center w-full lg:w-96 bg-[url('/static/gt7/carImages{id}.jpeg')]" -->
<!-- style="background-image: url('/gt7/carImages/{id}.jpeg')" -->
<div
  class="border flex flex-col items-center justify-center w-full lg:w-96 bg-blue-300 bg-cover bg-center"
>
  <p>
    {make}
  </p>
  <p>
    {model}
  </p>
  <p>
    {numberFormat2.format(price).split('.')[0]}
  </p>
  <img src="/gt7/carImages/{id}.jpeg" alt="car image" class="w-15 " />
</div>
