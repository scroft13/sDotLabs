<script lang="ts">
  // import Resume from '$lib/components/Resume.svelte';
  import SideMenu from '$lib/components/SideMenu.svelte';
  import { AtSymbolIcon, PhoneIcon } from '@rgossiaux/svelte-heroicons/solid';
  import Fa from 'svelte-fa';
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import { faFacebook } from '@fortawesome/free-brands-svg-icons';

  // import { flip } from 'svelte/animate';
  // import { circIn } from 'svelte/easing';

  let descriptorArray: string[] = [
    'Web Developer',
    'Father',
    '12th Man',
    'Code Monkey',
    'Mariner',
    'Whovian',
    'Electrician',
    'Wrench Turner',
    'Gardner',
    'Dog Trainer',
    'Plumber',
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
<div
  class="fixed flex w-full items-center h-12  justify-center bg-white  bg-opacity-95 backdrop-blur-sm"
>
  <div class="fixed flex justify-evenly w-full max-w-lg px-4">
    <a href="/" class="">Home </a>
    <a href="#resume" class="">Resume </a>
    <a href="#contact" class="">Contact</a>
  </div>
</div>
<div class="snap-both w-full">
  <div
    class="flex flex-col items-center justify-center h-[100vh] snap-center snap-proximity shrink-0"
  >
    <img src={imgSrc} alt="" class=" w-4/5 lg:w-1/3 aspect-auto rounded-full shadow-sm" />
    <div class="w-full text-center flex flex-col">
      <h1>Hello, my name is Shaun Croft</h1>
      <div class="text-left flex w-full items-center justify-center self-start">
        I am a &nbsp;
        <div class="flex border-b-2 min-w-[175px] justify-center">
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
  <div id="resume" class="flex flex-col w-full 2xl:justify-around shrink-0 min-h-[100vh]">
    <div class="mx-4 xl:mx-16 bg-orange-100 flex flex-grow">
      <iframe src="resume.pdf" title="S. Croft Resume" class="w-full flex-grow" marginheight="5" />
    </div>
    <div class=" flex items-center justify-center h-min flex-shrink my-10">
      <a href="resume.pdf" download="S_Croft_Resume">[PDF Download]</a>
    </div>
  </div>
  <div id="contact" class="flex h-[100vh] snap-center items-center justify-center shrink-0 ">
    <div class="flex flex-row  gap-12 flex-wrap justify-evenly">
      <a class="w-20" href="tel:+18023042113" title="(802)304-2113">
        <PhoneIcon />
      </a>
      <a href="mailto:scroft@me.com" title="scroft@me.com" class="w-20">
        <AtSymbolIcon />
      </a>
      <a
        href="https://www.facebook.com/shaun.croft.12"
        target="_blank"
        title="Facebook Profile"
        class="w-20"
        rel="noreferrer"
      >
        <Fa icon={faFacebook} size="5x" />
      </a>
      <a
        href="https://github.com/scroft13"
        target="_blank"
        title="github.com/scroft13"
        class="w-20"
        rel="noreferrer"
      >
        <Fa icon={faGithub} size="5x" />
      </a>
    </div>
  </div>
</div>
