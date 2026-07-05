<script lang="ts">
  import { createForm } from 'svelte-forms-lib';
  import { goto } from '$app/navigation';
  import Form from '$lib/components/forms/Form.svelte';
  import LabeledField from '$lib/components/forms/labeledComponents/LabeledField.svelte';
  import LabeledPassword from '$lib/components/forms/labeledComponents/LabeledPassword.svelte';
  import SubmitButton from '$lib/components/forms/SubmitButton.svelte';
  import yup from '$lib/components/forms/validation';
  import { signIn } from '$lib/auth';
  import { addToast } from '$lib/stores';

  const formSchema = yup.object().shape({
    email: yup.string().email().required().default(''),
    password: yup.string().required().default(''),
  });

  type FormData = yup.InferType<typeof formSchema>;

  const formState = createForm<FormData>({
    initialValues: formSchema.cast({}) as FormData,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        addToast({
          id: Math.floor(Math.random() * 100000),
          type: 'error',
          message: error.message,
          dismissible: true,
          timeout: 4000,
        });
        return;
      }
      goto('/admin');
    },
  });
</script>

<svelte:head>
  <title>Admin Login</title>
</svelte:head>

<main>
  <h1>Admin Login</h1>
  <Form context={{ ...formState, schema: formSchema }}>
    <LabeledField name="email" label="Email" type="text" placeholder="you@example.com" />
    <LabeledPassword name="password" label="Password" />
    <SubmitButton buttonName="Sign In" class="submit-button mt-4" />
  </Form>
</main>

<style>
  main {
    max-width: 360px;
    margin: 4rem auto;
    padding: 0 1.5rem;
  }
  h1 {
    margin-bottom: 1.5rem;
  }
</style>
