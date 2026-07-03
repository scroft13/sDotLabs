<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="mx-4 lg:mx-16 xl:mx-40 h-[50vh] flex items-center justify-center">
  <div class="flex flex-col items-center">
    <p class="text-primary text-4xl text-center">
      Error {$page.status} - {$page.error?.message ?? 'Something went wrong'}
    </p>
    <a href="/" class="text-primary mt-4">Back Home</a>
  </div>
</div>
