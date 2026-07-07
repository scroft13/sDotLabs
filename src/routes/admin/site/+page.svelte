<script lang="ts">
  import { onMount } from 'svelte';
  import db from '$lib/db';
  import { DEFAULT_SITE, type SiteSettings } from '$lib/site';
  import { addToast } from '$lib/stores';

  let settings: SiteSettings = structuredClone(DEFAULT_SITE);
  let loaded = false;
  let saving = false;

  onMount(async () => {
    settings = await db.settings.site();
    loaded = true;
  });

  function toast(type: 'success' | 'error', message: string) {
    addToast({
      id: Math.floor(Math.random() * 100000),
      type,
      message,
      dismissible: true,
      timeout: type === 'error' ? 4000 : 3000,
    });
  }

  async function save() {
    if (!settings.title.trim()) {
      toast('error', 'Title can’t be empty');
      return;
    }
    saving = true;
    try {
      await db.settings.setSite({
        title: settings.title.trim(),
        subtitle: settings.subtitle.trim(),
        banner: {
          enabled: settings.banner.enabled,
          text: settings.banner.text.trim(),
          link: settings.banner.link.trim(),
        },
      });
      toast('success', 'Site settings saved');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Could not save settings');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Site settings</title>
</svelte:head>

<main>
  <a href="/admin" class="back">&larr; Albums</a>
  <h1>Site settings</h1>

  {#if !loaded}
    <p class="secondary-text">Loading…</p>
  {:else}
    <section>
      <h2>Home page</h2>
      <label class="field">
        <span>Title</span>
        <input type="text" bind:value={settings.title} placeholder={DEFAULT_SITE.title} />
      </label>
      <label class="field">
        <span>Subtitle</span>
        <input type="text" bind:value={settings.subtitle} placeholder={DEFAULT_SITE.subtitle} />
        <span class="hint">Small line above the title. Leave blank to hide it.</span>
      </label>
    </section>

    <section>
      <h2>Sale banner</h2>
      <label class="checkbox">
        <input type="checkbox" bind:checked={settings.banner.enabled} />
        <span>Show the banner across the site</span>
      </label>
      <label class="field">
        <span>Banner text</span>
        <input
          type="text"
          bind:value={settings.banner.text}
          placeholder="e.g. Holiday sale — 20% off all prints through Dec 31"
        />
      </label>
      <label class="field">
        <span>Link (optional)</span>
        <input type="text" bind:value={settings.banner.link} placeholder="/prints" />
        <span class="hint">Where the banner links to when clicked. Leave blank for no link.</span>
      </label>

      <div class="preview-label">Preview</div>
      {#if settings.banner.text.trim()}
        <div class="banner-preview">{settings.banner.text}</div>
      {:else}
        <p class="hint">Add banner text to see a preview.</p>
      {/if}
    </section>

    <button class="save" disabled={saving} on:click={save}>
      {saving ? 'Saving…' : 'Save settings'}
    </button>
  {/if}
</main>

<style>
  main {
    max-width: 640px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  .back {
    font-size: 0.85rem;
    color: inherit;
  }
  h1 {
    margin: 0.5rem 0 1.5rem;
  }
  h2 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
  }
  section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e5e5;
  }
  .field {
    display: block;
    margin-bottom: 1rem;
  }
  .field > span {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }
  .field input {
    width: 100%;
    padding: 0.5rem 0.6rem;
    border: 1px solid #c9c4bc;
  }
  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  .hint {
    display: block;
    margin-top: 0.3rem;
    font-size: 0.8rem;
    color: #6f6b64;
  }
  .preview-label {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a8680;
    margin-bottom: 0.5rem;
  }
  .banner-preview {
    padding: 10px 24px;
    background: #1a1a1a;
    color: #fbfaf8;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .save {
    padding: 0.6rem 1.4rem;
    background: #1a1a1a;
    color: #fff;
    border: 0;
    cursor: pointer;
  }
  .save:disabled {
    opacity: 0.5;
  }
</style>
