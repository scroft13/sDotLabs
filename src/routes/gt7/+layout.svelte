<script>
  import HamburgerIcon from '$lib/components/HamburgerIcon.svelte';
  import SideMenu from '$lib/components/SideMenu.svelte';
  let sideMenuIsOpen = false;
</script>

<div class="flex justify-end">
  <button
    on:click={() => {
      sideMenuIsOpen = !sideMenuIsOpen;
    }}
  >
    <HamburgerIcon />
  </button>
</div>
<SideMenu bind:sideMenuIsOpen />
<slot />
