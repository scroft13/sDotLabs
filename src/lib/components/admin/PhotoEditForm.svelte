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
  });
  type FormData = yup.InferType<typeof formSchema>;

  const formState = createForm<FormData>({
    initialValues: formSchema.cast({}) as FormData,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      await db.photos.update(photo.id, {
        title: values.title || null,
        caption: values.caption || null,
      });
      dispatch('saved');
    },
  });
</script>

<Form context={{ ...formState, schema: formSchema }}>
  <LabeledField name="title" label="Title" type="text" />
  <LabeledTextarea name="caption" label="Caption" />
  <SubmitButton buttonName="Save" class="submit-button mt-2" />
</Form>
