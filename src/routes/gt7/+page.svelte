<script lang="ts">
  import { onMount } from 'svelte';
  import db, { supabase, type UserCar } from '$lib/db';
  import type { User } from '@supabase/supabase-js';
  import { addToast, carWantedListStore } from '$lib/stores';
  import CarCard from '$lib/components/CarCard.svelte';

  // let message = 'Hello, World!';
  // let type = 'success';
  let dismissible = true;
  let timeout = 3000;

  let email: string = '';
  let password: string = '';
  let carList: UserCar[] = [];

  $: carWantedListStore.subscribe((x) => (carList = x));
  let user: User | null = null;

  onMount(async () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      user = session?.user ?? null;
      carWantedListStore.subscribe((x) => {
        if (x === undefined) {
          console.log('setting carlist to empty array');
          carWantedListStore.update(() => []);
        }
      });
    });

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_, session) => {
      const currentUser = session?.user;
      user = currentUser ?? null;
    });

    return () => {
      authListener?.unsubscribe();
    };
  });

  function login() {
    supabase.auth
      .signInWithPassword({ email: email, password: password })
      .then(({ data: { session } }) => {
        user = session?.user ?? null;
      })
      .catch(({ data }) => console.log(data));
  }

  function signup() {
    supabase.auth.signUp({ email: email, password: password });
    supabase.auth.getSession().then(({ data: { session } }) => {
      user = session?.user ?? null;
      addToast({
        id: 1,
        message: 'Please check confirmation email to login',
        type: 'success',
        dismissible,
        timeout,
      });
    });

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_, session) => {
      const currentUser = session?.user;
      user = currentUser ?? null;
    });

    db.createUser.create();
    return () => {
      authListener?.unsubscribe();
    };
  }
  function logout() {
    supabase.auth.signOut();
  }
</script>

<div class="">
  {#if user?.email}
    <p>Hello {user.email}</p>
    <a href="/gt7/userCars">Your Cars</a>
    <div class="flex flex-wrap gap-3 justify-evenly">
      {#each carList as car}
        <CarCard make={car.make} model={car.model} price={car.price} id={car.id} />
      {/each}
    </div>
    <div>
      <button on:click={() => logout()}>Log Out</button>
    </div>
  {:else}
    <p>
      You are not logged in. If you would like to save the cars you own, or your wanted cars for
      later, create an account.
    </p>
    <form action="">
      <input
        id={email}
        placeholder="Enter your Email"
        bind:value={email}
        type="text"
        step="any"
        class="pl-5"
        {...$$props}
      />
      <input
        id={password}
        placeholder="Enter your Password"
        bind:value={password}
        type="password"
        step="any"
        class="pl-5"
        {...$$props}
      />
    </form>
    <div class="w-full flex justify-evenly m-10">
      <button on:click={() => login()}>Log In</button>
      <button on:click={() => signup()}>Sign Up</button>
    </div>
  {/if}
</div>
