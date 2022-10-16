<script type="ts">
  import { flip } from 'svelte/animate';
  import { circIn } from 'svelte/easing';

  let descriptorArray: string[] = [
    'Web Developer',
    'Father',
    '12th Man',
    'Code Monkey',
    'Mariners Fan',
  ];

  let imgSrc = '/profilePic.jpeg';
  let currentDescriptorIndex = 0;

  $: descriptorLength = descriptorArray.length;

  setInterval(() => {
    if (currentDescriptorIndex < descriptorLength - 1) {
      currentDescriptorIndex++;
    } else {
      currentDescriptorIndex = 0;
    }
  }, 3000);
</script>

<div class="flex flex-col items-center justify-center h-[100vh]">
  <img src={imgSrc} alt="" class=" w-4/5 lg:w-1/3 aspect-auto rounded-full" />
  <div class="w-full text-center flex flex-col">
    <h1>Hello, my name is Shaun Croft</h1>
    <div class="text-left flex w-full items-center justify-center self-start">
      I am a &nbsp;
      <div class="px-3 flex border-b-2">
        <div class="whitespace-nowrap">
          {#each descriptorArray as descriptor, index (descriptor)}
            <p>
              {#if index == currentDescriptorIndex}
                {descriptor}
              {/if}
            </p>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
