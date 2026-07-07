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
  <div class="card login-card">
    <div class="brand"><span class="mark">[s.labs]</span> admin</div>
    <h1>Sign in</h1>
    <Form context={{ ...formState, schema: formSchema }}>
      <LabeledField name="email" label="Email" type="text" placeholder="you@example.com" />
      <LabeledPassword name="password" label="Password" />
      <SubmitButton buttonName="Sign In" class="submit-button mt-4" />
    </Form>
  </div>
</main>

<style>
  main {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
  }
  .login-card {
    width: 100%;
    max-width: 360px;
  }
  .brand {
    font-size: 0.8rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #8a8680;
    margin-bottom: 1.25rem;
  }
  .brand .mark {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.3rem;
    letter-spacing: normal;
    text-transform: none;
    color: #1a1a1a;
    margin-right: 0.35rem;
  }
  h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 400;
    font-size: 1.8rem;
    margin: 0 0 1.25rem;
  }
</style>
