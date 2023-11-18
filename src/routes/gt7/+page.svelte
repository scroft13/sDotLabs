<script lang="ts">
  import netlifyIdentity from 'netlify-identity-widget';
  import { goto } from '$app/navigation';
  import { redirectURL, user } from '../../store';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('now a');
    netlifyIdentity.init();
  });

  $: isLoggedIn = !!$user;
  $: username = $user !== null ? $user?.username : ' there!';

  function handleUserAction(action: 'logout' | 'signup' | 'login') {
    console.log('now');
    if (!browser) return; //ONLY CLIENT SIDE!!!!
    if (action === 'login' || action === 'signup') {
      netlifyIdentity.open(action);
      netlifyIdentity.on('login', (u) => {
        user?.login(u);
        netlifyIdentity.close();
        if ($redirectURL !== '') {
          goto($redirectURL);
          redirectURL.clearRedirectURL();
        }
      });
    } else if (action === 'logout') {
      goto('/');
      user?.logout();
      netlifyIdentity.logout();
    }
  }
</script>

<a href="/gt7/allCars">All Cars</a>
<a href="/gt7/hagerty">Hagerty Cars</a>

{#if isLoggedIn}
  <div class="center">
    <p>Hello {username}</p>
    <div>
      <button on:click={() => handleUserAction('logout')}>Log Out</button>
    </div>
  </div>
{:else}
  <div class="center">
    <p>You are not logged in.</p>
    <div>
      <button on:click={() => handleUserAction('login')}>Log In</button>
      <button on:click={() => handleUserAction('signup')}>Sign Up</button>
    </div>
  </div>
{/if}
