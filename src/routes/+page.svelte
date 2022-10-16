<script type="ts">
  import SideMenu from '$lib/components/SideMenu.svelte';
  import { flip } from 'svelte/animate';
  import { circIn } from 'svelte/easing';
  //   import { HamburgerIcon } from '@rgossiaux/svelte-heroicons/solid';

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
  let sideMenuIsOpen = false;

  //   setInterval(() => {
  //     if (currentDescriptorIndex < descriptorLength - 1) {
  //       currentDescriptorIndex++;
  //     } else {
  //       currentDescriptorIndex = 0;
  //     }
  //   }, 3000);
</script>

<SideMenu bind:sideMenuIsOpen />
<div class="snap-both">
  <div
    class="flex flex-col items-center justify-center h-[100vh] snap-center snap-proximity shrink-0"
  >
    <button on:click={() => (sideMenuIsOpen = true)} class="fixed self-end top-2"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 mt-2 mr-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clip-rule="evenodd"
        />
      </svg></button
    >
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
  <div class="flex h-[100vh] snap-center w-full items-center justify-center shrink-0">Resume</div>
  <div class="flex h-[100vh] snap-center w-full items-center justify-center shrink-0">Contact</div>
</div>
