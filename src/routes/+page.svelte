<script lang="ts">
  import Resume from '$lib/components/Resume.svelte';
  import SideMenu from '$lib/components/SideMenu.svelte';
  // import { flip } from 'svelte/animate';
  // import { circIn } from 'svelte/easing';

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

  setInterval(() => {
    if (currentDescriptorIndex < descriptorLength - 1) {
      currentDescriptorIndex++;
    } else {
      currentDescriptorIndex = 0;
    }
  }, 3000);
</script>

<SideMenu bind:sideMenuIsOpen />
<div class="fixed flex w-full items-center h-12  justify-center bg-white ">
  <div class="fixed flex justify-between w-full max-w-lg px-4">
    <a href="/" class="">Home </a>
    <a href="#resume" class="">Resume </a>
    <a href="#contact" class="">Contact</a>
  </div>
</div>
<div class="snap-both">
  <div
    class="flex flex-col items-center justify-center h-[100vh] snap-center snap-proximity shrink-0"
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
  <div id="resume" class="flex  snap-center w-full items-center justify-center shrink-0">
    <!-- <Resume url={'/resume.pdf'} /> -->
    <div class="w-1/2">
      <iframe
        src="resume.pdf"
        style="width: 100%;height: 100%;border: none;"
        title="S. Croft Resume"
      />
    </div>
    <div><a href="resume.pdf" download="S_Croft_Resume">PDF Download</a></div>
  </div>
  <div id="contact" class="flex h-[100vh] snap-center w-full items-center justify-center shrink-0">
    Contact
  </div>
</div>
