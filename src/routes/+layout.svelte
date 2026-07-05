<script lang="ts">
  import Toasts from '$lib/components/Toasts.svelte';
  import '../app.css';
</script>

<Toasts />

<slot />

<style>
  :root {
    --primary-color: 0 0% 9%;
    --secondary-color: 0 0% 20%;
  }

  :global(body) {
    background: #fbfaf8;
    color: #1a1a1a;
  }
</style>
