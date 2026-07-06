<script lang="ts">
  import { createForm } from 'svelte-forms-lib';
  import { catalog, formatPrice, resolveAspectCategory } from '$lib/catalog';
  import Form from '$lib/components/forms/Form.svelte';
  import LabeledField from '$lib/components/forms/labeledComponents/LabeledField.svelte';
  import LabeledTextarea from '$lib/components/forms/labeledComponents/LabeledTextarea.svelte';
  import SubmitButton from '$lib/components/forms/SubmitButton.svelte';
  import yup from '$lib/components/forms/validation';
  import db from '$lib/db';
  import { retailCentsFor, shippingCentsFor, type PricingSettings } from '$lib/pricing';
  import type { Photo } from '$lib/shared';
  import { createEventDispatcher, onMount } from 'svelte';

  export let photo: Photo;

  const dispatch = createEventDispatcher<{ saved: void }>();

  // What this photo actually sells for, per variant group (colors share a
  // price), using the same admin-tuned settings checkout uses.
  let pricing: PricingSettings | null = null;
  onMount(async () => {
    pricing = await db.settings.pricing().catch(() => null);
  });

  $: priceRows = (() => {
    const category = resolveAspectCategory(photo);
    if (!category) return [];
    const rows: { key: string; label: string; retail: number; shipping: number }[] = [];
    for (const product of catalog.products) {
      const seen = new Set<string>();
      for (const variant of product.variants) {
        if (variant.aspectRatio !== category || seen.has(variant.prodigiSku)) continue;
        seen.add(variant.prodigiSku);
        const mount = variant.mount ? (variant.mount === 'matted' ? ' · matted' : ' · no mat') : '';
        rows.push({
          key: variant.prodigiSku,
          label: `${product.label} ${variant.size}${mount}`,
          retail: retailCentsFor(variant, pricing?.multiplier ?? null),
          shipping: shippingCentsFor(variant, pricing?.shipping ?? null),
        });
      }
    }
    return rows;
  })();

  const formSchema = yup.object().shape({
    title: yup.string().default(photo.title ?? ''),
    caption: yup.string().default(photo.caption ?? ''),
    printAspectRatio: yup.string().default(photo.printAspectRatio ?? ''),
  });
  type FormData = yup.InferType<typeof formSchema>;

  const formState = createForm<FormData>({
    initialValues: formSchema.cast({}) as FormData,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      await db.photos.update(photo.id, {
        title: values.title || null,
        caption: values.caption || null,
        printAspectRatio: (values.printAspectRatio || null) as Photo['printAspectRatio'],
      });
      dispatch('saved');
    },
  });
  const { form, handleChange } = formState;
</script>

<Form context={{ ...formState, schema: formSchema }}>
  <LabeledField name="title" label="Title" type="text" />
  <LabeledTextarea name="caption" label="Caption" />
  <div class="print-aspect-field">
    <label for="printAspectRatio">Print aspect ratio</label>
    <select
      id="printAspectRatio"
      name="printAspectRatio"
      value={$form.printAspectRatio}
      on:change={handleChange}
    >
      <option value="">Auto-detect from photo dimensions</option>
      <option value="2:3">2:3 (e.g. 12×18)</option>
      <option value="4:5">4:5 (e.g. 16×20)</option>
      <option value="3:4">3:4 (e.g. 18×24)</option>
      <option value="1:1">1:1 Square</option>
      <option value="2:1">2:1 Panoramic</option>
    </select>
  </div>
  <SubmitButton buttonName="Save" class="submit-button mt-2" />
</Form>

<div class="price-list">
  <div class="price-list-label">Print prices for this photo</div>
  {#if priceRows.length === 0}
    <p class="price-empty">None — this photo’s proportions don’t match an offered print ratio.</p>
  {:else}
    <ul>
      {#each priceRows as row (row.key)}
        <li>
          <span>{row.label}</span>
          <span class="price-value"
            >{formatPrice(row.retail)} + {formatPrice(row.shipping)} ship</span
          >
        </li>
      {/each}
    </ul>
    <p class="price-empty">
      Set the multiplier and shipping on the <a href="/admin/pricing">pricing page</a>.
    </p>
  {/if}
</div>

<style>
  .print-aspect-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.75rem;
  }
  .print-aspect-field label {
    font-size: 0.875rem;
  }
  .print-aspect-field select {
    padding: 0.4rem 0.6rem;
    border: 1px solid #c9c4bc;
    background: #fff;
    color: #1a1a1a;
  }
  .price-list {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e5e5;
    font-size: 0.85rem;
  }
  .price-list-label {
    font-weight: 600;
    margin-bottom: 0.4rem;
  }
  .price-list ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .price-list li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.2rem 0;
  }
  .price-value {
    white-space: nowrap;
  }
  .price-empty {
    margin: 0.4rem 0 0;
    color: #6f6b64;
    font-size: 0.8rem;
  }
  .price-empty a {
    color: inherit;
  }
</style>
