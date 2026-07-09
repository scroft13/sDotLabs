<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user, signOut } from '$lib/auth';

  $: path = $page.url.pathname;
  $: isLoginPage = path === '/admin/login';

  // Route guarding here is UX only (avoids flashing admin UI at a signed-out
  // visitor) -- the real access control is the Firestore / Storage security
  // rules keyed to the owner's uid (firestore.rules / storage.rules).
  $: if ($user === null && !isLoginPage) {
    goto('/admin/login');
  }
  $: if ($user && isLoginPage) {
    goto('/admin');
  }

  // Albums is the default section and also covers album detail pages
  // (/admin/[albumId]); Site and Pricing are their own top-level sections.
  const tabs = [
    { href: '/admin', label: 'Albums' },
    { href: '/admin/site', label: 'Site' },
    { href: '/admin/theme', label: 'Theme' },
    { href: '/admin/pricing', label: 'Pricing' },
  ];
  // Albums (/admin and /admin/[albumId]) is the fallback; the others match
  // their own path prefix.
  $: activeHref = tabs.slice(1).find((t) => path.startsWith(t.href))?.href ?? '/admin';
</script>

<div class="admin-shell">
  {#if $user === undefined}
    <p class="admin-status">Loading…</p>
  {:else if $user === null && !isLoginPage}
    <p class="admin-status">Redirecting…</p>
  {:else}
    {#if $user && !isLoginPage}
      <header class="admin-header">
        <a href="/admin" class="brand"><span class="mark">[s.labs]</span> admin</a>
        <div class="header-actions">
          <a href="/" target="_blank" rel="noopener">View site ↗</a>
          <button type="button" on:click={() => signOut()}>Sign out</button>
        </div>
      </header>
      <nav class="admin-tabs" aria-label="Admin sections">
        {#each tabs as tab (tab.href)}
          <a href={tab.href} class="tab" class:active={activeHref === tab.href}>{tab.label}</a>
        {/each}
      </nav>
    {/if}
    <slot />
  {/if}
</div>

<style>
  /* --- Admin design system ------------------------------------------------
     Scoped under .admin-shell so it only styles the admin area. Warm palette
     matching the public site (cream page, ink text, serif titles), with clean
     form controls and button helpers the pages share. */
  /* Admin keeps its own neutral palette regardless of the public theme. */
  .admin-shell {
    min-height: 100vh;
    background: #fbfaf8;
    color: #1a1a1a;
    font-family: 'Inter', sans-serif;
  }
  .admin-status {
    padding: 3rem 1.5rem;
    color: #8a8680;
    text-align: center;
  }

  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    max-width: 960px;
    margin: 0 auto;
    padding: 1.25rem 1.5rem 1rem;
  }
  .brand {
    text-decoration: none;
    color: #1a1a1a;
    font-size: 0.95rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #8a8680;
  }
  .brand .mark {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.35rem;
    letter-spacing: normal;
    text-transform: none;
    color: #1a1a1a;
    margin-right: 0.35rem;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .header-actions a {
    color: #6f6b64;
    text-decoration: none;
    font-size: 0.85rem;
  }
  .header-actions a:hover {
    color: #1a1a1a;
  }
  .header-actions button {
    background: none;
    border: 1px solid #d5cfc4;
    color: #6f6b64;
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .header-actions button:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  .admin-tabs {
    display: flex;
    gap: 1.75rem;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 1.5rem;
    border-bottom: 1px solid #e7e3db;
  }
  .tab {
    position: relative;
    padding: 0.6rem 0.1rem 0.9rem;
    text-decoration: none;
    color: #8a8680;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
  }
  .tab:hover {
    color: #1a1a1a;
  }
  .tab.active {
    color: #1a1a1a;
  }
  .tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: #1a1a1a;
  }

  /* --- Shared page + control styles (global within admin) --- */
  .admin-shell :global(.admin-page) {
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  .admin-shell :global(.admin-page h1) {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 400;
    font-size: 2rem;
    letter-spacing: 0.01em;
    margin: 0 0 1.5rem;
  }
  .admin-shell :global(.section-label) {
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #8a8680;
    margin: 0 0 0.75rem;
    font-weight: 600;
  }
  .admin-shell :global(.card) {
    background: #fff;
    border: 1px solid #e7e3db;
    border-radius: 10px;
    padding: 1.5rem;
  }
  .admin-shell :global(.muted) {
    color: #8a8680;
  }

  .admin-shell :global(input[type='text']),
  .admin-shell :global(input[type='number']),
  .admin-shell :global(input[type='email']),
  .admin-shell :global(input[type='password']),
  .admin-shell :global(textarea),
  .admin-shell :global(select) {
    width: 100%;
    padding: 0.55rem 0.7rem;
    border: 1px solid #d5cfc4;
    border-radius: 6px;
    background: #fff;
    color: #1a1a1a;
    font-size: 0.9rem;
    font-family: inherit;
  }
  .admin-shell :global(input:focus),
  .admin-shell :global(textarea:focus),
  .admin-shell :global(select:focus) {
    outline: none;
    border-color: #1a1a1a;
    box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.08);
  }
  .admin-shell :global(input.invalid) {
    border-color: #b3261e;
  }

  /* Button helpers -- pages add these classes to plain <button>s. */
  .admin-shell :global(.btn),
  .admin-shell :global(.btn-primary),
  .admin-shell :global(.btn-danger),
  .admin-shell :global(.btn-ghost) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid #d5cfc4;
    background: #fff;
    color: #1a1a1a;
    font-size: 0.85rem;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, opacity 0.15s ease;
  }
  .admin-shell :global(.btn:hover),
  .admin-shell :global(.btn-ghost:hover) {
    border-color: #1a1a1a;
  }
  .admin-shell :global(.btn-primary) {
    background: #1a1a1a;
    border-color: #1a1a1a;
    color: #fbfaf8;
  }
  .admin-shell :global(.btn-primary:hover) {
    opacity: 0.88;
  }
  .admin-shell :global(.btn-danger) {
    border-color: #e3c7c4;
    color: #b3261e;
  }
  .admin-shell :global(.btn-danger:hover) {
    background: #fbeceb;
    border-color: #b3261e;
  }
  .admin-shell :global(.btn-ghost) {
    border-color: transparent;
    background: transparent;
    padding: 0.4rem 0.55rem;
    color: #6f6b64;
  }
  .admin-shell :global(.btn:disabled),
  .admin-shell :global(.btn-primary:disabled),
  .admin-shell :global(.btn-danger:disabled),
  .admin-shell :global(.btn-ghost:disabled) {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Data tables (pricing). */
  .admin-shell :global(table.admin-table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .admin-shell :global(.admin-table th),
  .admin-shell :global(.admin-table td) {
    padding: 0.55rem 0.6rem;
    border-bottom: 1px solid #eee9e1;
    text-align: left;
  }
  .admin-shell :global(.admin-table th) {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8a8680;
    font-weight: 600;
  }
  .admin-shell :global(.admin-table th.num),
  .admin-shell :global(.admin-table td.num) {
    text-align: right;
  }
</style>
