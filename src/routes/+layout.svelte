<script lang="ts">
  import '../app.css';
</script>

<slot />

<style>
  :root {
    --primary-color: 44 61% 77%;
    --secondary-color: 326 27% 71%;
    --tertiary-color: 60 1% 42%;
    --surface-base: 0 0% 100%;
    --surface-100: 0 0% 96%;
    --surface-200: 0 0% 88%;
    --surface-300: 0 0% 80%;

    --text-base: 0 0% 42%;
    --text-muted: 0 0% 72%;
  }
</style>
