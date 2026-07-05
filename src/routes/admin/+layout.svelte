<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user, signOut } from '$lib/auth';

  $: isLoginPage = $page.url.pathname === '/admin/login';

  // Route guarding here is UX only (avoids flashing admin UI at a signed-out
  // visitor) -- the real access control is the Firestore / Storage security
  // rules keyed to the owner's uid (firestore.rules / storage.rules).
  $: if ($user === null && !isLoginPage) {
    goto('/admin/login');
  }
  $: if ($user && isLoginPage) {
    goto('/admin');
  }
</script>

{#if $user === undefined}
  <p class="p-6 secondary-text">Loading...</p>
{:else if $user === null && !isLoginPage}
  <p class="p-6 secondary-text">Redirecting...</p>
{:else}
  {#if $user && !isLoginPage}
    <nav class="admin-nav">
      <div class="nav-left">
        <a href="/" class="site-link"><span class="mark">[S.]</span> View Site</a>
        <a href="/admin">Albums</a>
      </div>
      <button on:click={() => signOut()}>Sign Out</button>
    </nav>
  {/if}
  <slot />
{/if}

<style>
  .admin-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e5e5;
  }
  .admin-nav a {
    color: inherit;
    text-decoration: none;
    font-weight: 500;
  }
  .nav-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  .site-link {
    color: #6f6b64;
  }
  .site-link:hover {
    color: inherit;
  }
  .site-link .mark {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 500;
  }
  .admin-nav button {
    background: none;
    border: 1px solid #444;
    color: inherit;
    padding: 0.4rem 0.9rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }
</style>
