<script lang="ts">
  import { onMount } from 'svelte';
  import db from '$lib/db';
  import {
    contrastText,
    DEFAULT_THEME,
    FONT_LABELS,
    FONT_STACKS,
    THEME_PRESETS,
    type FontPairing,
    type ThemeSettings,
  } from '$lib/site';
  import { addToast } from '$lib/stores';

  let theme: ThemeSettings = { ...DEFAULT_THEME };
  let loaded = false;
  let saving = false;

  onMount(async () => {
    theme = (await db.settings.site()).theme;
    loaded = true;
  });

  const colorFields: {
    key: 'bg' | 'ink' | 'muted' | 'accent' | 'mat';
    label: string;
    hint: string;
  }[] = [
    { key: 'bg', label: 'Background', hint: 'The page color.' },
    { key: 'ink', label: 'Text', hint: 'Headings and body text.' },
    { key: 'muted', label: 'Muted text', hint: 'Captions, labels, secondary text.' },
    { key: 'accent', label: 'Accent', hint: 'Rules, buttons, and emphasis.' },
    { key: 'mat', label: 'Frame mat', hint: 'Mat board behind photos on the gallery wall.' },
  ];
  const fonts = Object.keys(FONT_LABELS) as FontPairing[];

  function applyPreset(preset: ThemeSettings) {
    theme = { ...preset };
  }

  $: previewOnAccent = contrastText(theme.accent);
  $: previewDisplay = FONT_STACKS[theme.font].display;
  $: previewBody = FONT_STACKS[theme.font].body;

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
    saving = true;
    try {
      await db.settings.setSite({ theme });
      toast('success', 'Theme saved');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Could not save theme');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Theme — Admin</title>
</svelte:head>

<main class="admin-page">
  <h1>Theme</h1>

  {#if !loaded}
    <p class="muted">Loading…</p>
  {:else}
    <div class="card">
      <div class="section-label">Presets</div>
      <div class="presets">
        {#each THEME_PRESETS as preset (preset.key)}
          <button type="button" class="preset" on:click={() => applyPreset(preset.theme)}>
            <span class="chips">
              <span style={`background: ${preset.theme.bg}`} />
              <span style={`background: ${preset.theme.ink}`} />
              <span style={`background: ${preset.theme.accent}`} />
            </span>
            <span class="preset-label">{preset.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="card">
      <div class="section-label">Colors</div>
      <div class="colors">
        {#each colorFields as field (field.key)}
          <div class="color-field">
            <span class="cf-label">{field.label}</span>
            <div class="cf-row">
              <input type="color" bind:value={theme[field.key]} aria-label={field.label} />
              <input class="hex" type="text" bind:value={theme[field.key]} spellcheck="false" />
            </div>
            <span class="hint">{field.hint}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="card">
      <div class="section-label">Typography</div>
      <label class="font-field">
        <span class="cf-label">Font pairing</span>
        <select bind:value={theme.font}>
          {#each fonts as key (key)}
            <option value={key}>{FONT_LABELS[key]}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="card">
      <div class="section-label">Preview</div>
      <div
        class="preview"
        style={`background: ${theme.bg}; color: ${theme.ink}; font-family: ${previewBody}`}
      >
        <div class="pv-eyebrow" style={`color: ${theme.muted}`}>EXPERIMENTS IN LIGHT</div>
        <div class="pv-title" style={`font-family: ${previewDisplay}; color: ${theme.ink}`}>
          The Light Lab
        </div>
        <div class="pv-rule" style={`background: ${theme.accent}`} />
        <p class="pv-body" style={`color: ${theme.muted}`}>
          A gallery of framed, museum-quality prints.
        </p>
        <div
          class="pv-frame"
          style={`box-shadow: 0 0 0 1px color-mix(in srgb, ${theme.ink} 18%, transparent), 0 16px 30px -14px rgba(0,0,0,0.5)`}
        >
          <div class="pv-mat" style={`background: ${theme.mat}`}>
            <div class="pv-photo" />
          </div>
        </div>
        <span class="pv-button" style={`background: ${theme.accent}; color: ${previewOnAccent}`}>
          ORDER A PRINT
        </span>
      </div>
    </div>
    <p class="hint mat-note">
      The mat here is the gallery-wall display only — the mat shown while ordering a print always
      matches the real product.
    </p>

    <button class="btn-primary" disabled={saving} on:click={save}>
      {saving ? 'Saving…' : 'Save theme'}
    </button>
  {/if}
</main>

<style>
  main {
    max-width: 720px;
  }
  .card {
    margin-bottom: 1.5rem;
  }
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .preset {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem 0.4rem 0.4rem;
    border: 1px solid #d5cfc4;
    border-radius: 999px;
    background: #fff;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .preset:hover {
    border-color: #1a1a1a;
  }
  .chips {
    display: inline-flex;
  }
  .chips span {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.15);
    margin-left: -5px;
  }
  .chips span:first-child {
    margin-left: 0;
  }
  .colors {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }
  .cf-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
  }
  .cf-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .cf-row input[type='color'] {
    width: 2.75rem;
    height: 2.25rem;
    padding: 0;
    border: 1px solid #d5cfc4;
    border-radius: 6px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .hex {
    text-transform: lowercase;
    font-family: Menlo, Consolas, monospace;
  }
  .hint {
    display: block;
    margin-top: 0.35rem;
    font-size: 0.78rem;
    color: #8a8680;
  }
  .font-field .cf-label {
    margin-bottom: 0.35rem;
  }
  .preview {
    border-radius: 8px;
    padding: 2.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.9rem;
    border: 1px solid #e7e3db;
  }
  .pv-eyebrow {
    font-size: 11px;
    letter-spacing: 0.28em;
  }
  .pv-title {
    font-size: 2.4rem;
    font-weight: 400;
    line-height: 1;
  }
  .pv-rule {
    width: 40px;
    height: 1px;
  }
  .pv-body {
    margin: 0;
    font-size: 0.85rem;
    letter-spacing: 0.03em;
  }
  .pv-button {
    margin-top: 0.5rem;
    font-size: 11px;
    letter-spacing: 0.22em;
    padding: 12px 26px;
  }
  .pv-frame {
    background: #161616;
    padding: 9px;
    margin-top: 0.25rem;
  }
  .pv-mat {
    padding: 14px;
  }
  .pv-photo {
    width: 130px;
    height: 86px;
    background: linear-gradient(135deg, #6d8fa6, #2f3b46);
  }
  .mat-note {
    margin-top: 0.6rem;
  }
</style>
