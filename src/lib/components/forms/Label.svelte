<script lang="ts">
  import { getFormContext } from '../../utils';
  export let name: string;
  export let title: string;
  export let disabled: boolean;
  const { schema } = getFormContext();

  const fieldInfo = schema.fields[name].describe() as {
    tests: { name: string }[];
    optional: boolean;
  };
  const required =
    fieldInfo.optional === false ||
    fieldInfo.tests.find((set) => set.name === 'required') !== undefined;
</script>

<label for={name} {...$$props}>
  <div
    class={disabled
      ? 'flex items-start text-gray-200 dark:text-gray-600'
      : 'flex items-start dark:text-gray-200'}
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html title}
    {#if required}
      <span class="text-red-400">&nbsp;*</span>
    {/if}
  </div>
</label>
