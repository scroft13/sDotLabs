<script lang="ts">
  import { createForm } from 'svelte-forms-lib';
  import Form from '$lib/components/forms/Form.svelte';
  import LabeledField from '$lib/components/forms/labeledComponents/LabeledField.svelte';
  import LabeledTextarea from '$lib/components/forms/labeledComponents/LabeledTextarea.svelte';
  import SubmitButton from '$lib/components/forms/SubmitButton.svelte';
  import yup from '$lib/components/forms/validation';
  import db from '$lib/db';
  import type { Album } from '$lib/shared';
  import { addToast } from '$lib/stores';
  import { createEventDispatcher } from 'svelte';

  export let album: Album | null = null;

  const dispatch = createEventDispatcher<{ saved: void }>();

  const formSchema = yup.object().shape({
    title: yup.string().required().default(album?.title ?? ''),
    slug: yup.string().required().slug().default(album?.slug ?? ''),
    description: yup.string().default(album?.description ?? ''),
  });

  type FormData = yup.InferType<typeof formSchema>;

  const formState = createForm<FormData>({
    initialValues: formSchema.cast({}) as FormData,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      const patch = {
        title: values.title,
        slug: values.slug,
        description: values.description || null,
      };
      if (album) {
        await db.albums.update(album.id, patch);
      } else {
        await db.albums.create(patch);
      }
      addToast({
        id: Math.floor(Math.random() * 100000),
        type: 'success',
        message: album ? 'Album updated' : 'Album created',
        dismissible: true,
        timeout: 2500,
      });
      dispatch('saved');
    },
  });
</script>

<Form context={{ ...formState, schema: formSchema }}>
  <LabeledField name="title" label="Title" type="text" placeholder="e.g. Iceland 2024" />
  <LabeledField name="slug" label="Slug" type="text" placeholder="e.g. iceland-2024" />
  <LabeledTextarea name="description" label="Description" />
  <SubmitButton buttonName={album ? 'Save' : 'Create Album'} class="submit-button mt-2" />
</Form>
