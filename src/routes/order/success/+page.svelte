<script lang="ts">
  import { page } from '$app/stores';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import SiteNav from '$lib/components/SiteNav.svelte';

  $: sessionId = $page.url.searchParams.get('session_id');
</script>

<svelte:head>
  <title>Thank you — sdotlabs</title>
</svelte:head>

<SiteNav />

<main>
  <div class="rule" />
  <h1>Thank you</h1>
  <p>
    Your print is on its way to production. A receipt has been emailed to you, and every piece is
    made to order — expect it to ship within 2–5 business days.
  </p>
  {#if sessionId}
    <p class="reference">
      Questions? Write to
      <a href={`mailto:hello@sdotlabs.com?subject=Print order ${sessionId}`}>hello@sdotlabs.com</a>
      and reference order <span class="mono">{sessionId.slice(-12)}</span>.
    </p>
  {/if}
  <a href="/" class="back-link">RETURN TO THE GALLERY</a>
</main>

<SiteFooter />

<style>
  main {
    max-width: 560px;
    margin: 0 auto;
    padding: 72px 32px 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
  }
  .rule {
    width: 40px;
    height: 1px;
    background: var(--accent);
  }
  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 44px;
  }
  p {
    margin: 0;
    font-size: 14px;
    letter-spacing: 0.04em;
    line-height: 1.7;
    color: var(--muted);
  }
  .reference a {
    color: inherit;
  }
  .mono {
    font-family: Menlo, Consolas, monospace;
    font-size: 12px;
  }
  .back-link {
    margin-top: 16px;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-decoration: none;
    color: var(--ink);
    border-bottom: 1px solid #c9c4bc;
    padding-bottom: 3px;
  }
  .back-link:hover {
    border-bottom-color: var(--ink);
  }
</style>
