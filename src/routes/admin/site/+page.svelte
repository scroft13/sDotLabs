<script lang="ts">
  import { onMount } from 'svelte';
  import db from '$lib/db';
  import { bannerTextColor, DEFAULT_SITE, type SiteSettings } from '$lib/site';
  import { addToast } from '$lib/stores';

  let settings: SiteSettings = structuredClone(DEFAULT_SITE);
  let loaded = false;
  let saving = false;

  // Quick-pick accents for the banner (ink, oak, deep red, forest, plum);
  // the color input allows anything else.
  const BANNER_PRESETS = ['#1a1a1a', '#a86f3e', '#8a2f2f', '#2f5233', '#4a2f4a'];

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
          color: settings.banner.color,
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

<main class="admin-page">
  <h1>Site settings</h1>

  {#if !loaded}
    <p class="muted">Loading…</p>
  {:else}
    <div class="card">
      <div class="section-label">Home page</div>
      <label class="field">
        <span>Title</span>
        <input type="text" bind:value={settings.title} placeholder={DEFAULT_SITE.title} />
      </label>
      <label class="field">
        <span>Subtitle</span>
        <input type="text" bind:value={settings.subtitle} placeholder={DEFAULT_SITE.subtitle} />
        <span class="hint">Small line above the title. Leave blank to hide it.</span>
      </label>
    </div>

    <div class="card">
      <div class="section-label">Sale banner</div>
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

      <div class="field">
        <span>Accent color</span>
        <div class="color-row">
          <input type="color" bind:value={settings.banner.color} aria-label="Banner color" />
          {#each BANNER_PRESETS as preset (preset)}
            <button
              type="button"
              class="swatch"
              class:selected={settings.banner.color.toLowerCase() === preset}
              style={`background: ${preset}`}
              aria-label={`Use ${preset}`}
              on:click={() => (settings.banner.color = preset)}
            />
          {/each}
        </div>
        <span class="hint">Text color adjusts automatically for contrast.</span>
      </div>

      <div class="section-label preview-label">Preview</div>
      {#if settings.banner.text.trim()}
        <div
          class="banner-preview"
          style={`background: ${settings.banner.color}; color: ${bannerTextColor(
            settings.banner.color,
          )}`}
        >
          {settings.banner.text}
        </div>
      {:else}
        <p class="hint">Add banner text to see a preview.</p>
      {/if}
    </div>

    <button class="btn-primary" disabled={saving} on:click={save}>
      {saving ? 'Saving…' : 'Save settings'}
    </button>
  {/if}
</main>

<style>
  main {
    max-width: 640px;
  }
  .card {
    margin-bottom: 1.5rem;
  }
  .field {
    display: block;
    margin-bottom: 1rem;
  }
  .field:last-child {
    margin-bottom: 0;
  }
  .field > span {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }
  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    cursor: pointer;
  }
  /* Tailwind's form reset strips the native checkbox (appearance: none), so
     render a custom box. */
  .checkbox input {
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border: 1px solid #d5cfc4;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    position: relative;
  }
  .checkbox input:checked {
    background: #1a1a1a;
    border-color: #1a1a1a;
  }
  .checkbox input:checked::after {
    content: '✓';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fbfaf8;
    font-size: 12px;
  }
  .checkbox input:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.12);
  }
  .hint {
    display: block;
    margin-top: 0.3rem;
    font-size: 0.8rem;
    color: #8a8680;
  }
  .preview-label {
    margin-top: 1.25rem;
  }
  .banner-preview {
    padding: 10px 24px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .color-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .color-row input[type='color'] {
    width: 3rem;
    height: 2rem;
    padding: 0;
    border: 1px solid #c9c4bc;
    cursor: pointer;
  }
  .swatch {
    width: 1.75rem;
    height: 1.75rem;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    cursor: pointer;
    padding: 0;
  }
  .swatch.selected {
    outline: 2px solid #1a1a1a;
    outline-offset: 2px;
  }
</style>
