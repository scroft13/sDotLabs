<script>
  import HamburgerIcon from '$lib/components/HamburgerIcon.svelte';
  import SideMenu from '$lib/components/SideMenu.svelte';
  let sideMenuIsOpen = false;
</script>

<SideMenu bind:sideMenuIsOpen />

<div class="w-full flex justify-end sticky">
  <button
    on:click={() => {
      sideMenuIsOpen = !sideMenuIsOpen;
    }}
  >
    <HamburgerIcon />
  </button>
</div>

<div class="flex justify-center items-center flex-col">
  <slot />
</div>
