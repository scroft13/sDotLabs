<script lang="ts">
  // import netlifyIdentity from 'netlify-identity-widget';
  // import { goto } from '$app/navigation';
  // import { redirectURL, user } from '../../store';
  // import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/db';
  import type { User } from '@supabase/supabase-js';
  let email: string = '';
  let password: string = '';

  // onMount(() => {
  //   netlifyIdentity.init();
  //   console.log(netlifyIdentity);
  // });
  let user: User | null = null;

  onMount(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // user = session?.user ?? null;
      console.log(session);
    });

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_, session) => {
      const currentUser = session?.user;
      user = currentUser ?? null;
    });

    console.log(user);
    return () => {
      authListener?.unsubscribe();
    };
  });

  // $: isLoggedIn = !!$user;
  // $: username = $user !== null ? $user?.username : ' there!';
  // $: netlifyIdentity.on('close', () => {
  //   console.log('close now');
  // });

  // function handleUserAction(action: 'logout' | 'signup' | 'login') {
  //   console.log($user);
  //   // if (!browser) return; //ONLY CLIENT SIDE!!!!
  //   if (action === 'login' || action === 'signup') {netlifyIdentity.init('')
  //     netlifyIdentity.open(action);
  //     netlifyIdentity.on('login', (u) => {
  //       user?.login(u);
  //       netlifyIdentity.close();
  //       if ($redirectURL !== '') {
  //         goto($redirectURL);
  //         redirectURL.clearRedirectURL();
  //       }
  //     });
  //   } else if (action === 'logout') {
  //     goto('/');
  //     user?.logout();
  //     netlifyIdentity.logout();
  //   }
  //   netlifyIdentity.on('close', () => {
  //     console.log('close now');
  //   });
  //   console.log($user);
  // }
  function login() {
    supabase.auth
      .signInWithPassword({ email: email, password: password })
      .then(({ data: { session } }) => {
        user = session?.user ?? null;
      })
      .catch(({ data }) => console.log(data));
    console.log(user);

    // const {
    //   data: { subscription: authListener },
    // } = supabase.auth.onAuthStateChange((_, session) => {
    //   const currentUser = session?.user;
    //   user = currentUser ?? null;
    // });
  }
  function signup() {
    supabase.auth.signUp({ email: email, password: password });
    supabase.auth.getSession().then(({ data: { session } }) => {
      user = session?.user ?? null;
    });

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_, session) => {
      const currentUser = session?.user;
      user = currentUser ?? null;
    });

    console.log(user);
    return () => {
      authListener?.unsubscribe();
    };
  }
  function logout() {
    supabase.auth.signOut();
  }
  $: console.log(email, password);
</script>

<div class="">
  {#if user?.email}
    <a href="/gt7/userCars">Your Cars</a>

    <p>Hello {user.email}</p>
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
