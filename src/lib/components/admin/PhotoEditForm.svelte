<script lang="ts">
  import { createForm } from 'svelte-forms-lib';
  import Form from '$lib/components/forms/Form.svelte';
  import LabeledField from '$lib/components/forms/labeledComponents/LabeledField.svelte';
  import LabeledTextarea from '$lib/components/forms/labeledComponents/LabeledTextarea.svelte';
  import SubmitButton from '$lib/components/forms/SubmitButton.svelte';
  import yup from '$lib/components/forms/validation';
  import db from '$lib/db';
  import type { Photo } from '$lib/shared';
  import { createEventDispatcher } from 'svelte';

  export let photo: Photo;

  const dispatch = createEventDispatcher<{ saved: void }>();

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
    </select>
  </div>
  <SubmitButton buttonName="Save" class="submit-button mt-2" />
</Form>

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
</style>
