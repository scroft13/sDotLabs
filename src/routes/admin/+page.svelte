<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import AlbumForm from '$lib/components/admin/AlbumForm.svelte';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import db from '$lib/db';
  import type { Album } from '$lib/shared';
  import type { PageData } from './$types';

  export let data: PageData;

  let editingId: string | null = null;
  let creating = false;
  let deletingAlbum: Album | null = null;

  $: nextSortOrder = data.albums.length ? Math.max(...data.albums.map((a) => a.sort_order)) + 1 : 0;

  async function refresh() {
    editingId = null;
    creating = false;
    await invalidateAll();
  }

  async function move(album: Album, direction: -1 | 1) {
    const albums = [...data.albums];
    const index = albums.findIndex((a) => a.id === album.id);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= albums.length) return;
    [albums[index], albums[swapIndex]] = [albums[swapIndex], albums[index]];
    // Reassign sequential sort_order values from the new order rather than
    // swapping the two albums' existing values, since albums created before
    // this fix all share sort_order 0 and a plain swap would be a no-op.
    await Promise.all(albums.map((a, i) => db.albums.update(a.id, { sort_order: i })));
    await invalidateAll();
  }

  async function confirmDelete() {
    if (!deletingAlbum) return;
    await db.albums.remove(deletingAlbum.id);
    deletingAlbum = null;
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Albums — Admin</title>
</svelte:head>

<main class="admin-page">
  <div class="page-head">
    <h1>Albums</h1>
    {#if !creating}
      <button class="btn-primary" on:click={() => (creating = true)}>New album</button>
    {/if}
  </div>

  {#if creating}
    <div class="card new-card">
      <div class="section-label">New album</div>
      <AlbumForm {nextSortOrder} on:saved={refresh} />
      <button class="link" on:click={() => (creating = false)}>Cancel</button>
    </div>
  {/if}

  {#if data.albums.length === 0}
    <p class="muted empty">No albums yet. Create your first one above.</p>
  {:else}
    <ul class="album-list">
      {#each data.albums as album, index (album.id)}
        <li class="card album-row">
          {#if editingId === album.id}
            <div class="section-label">Edit album</div>
            <AlbumForm {album} on:saved={refresh} />
            <button class="link" on:click={() => (editingId = null)}>Cancel</button>
          {:else}
            <div class="row">
              <div class="info">
                <strong>{album.title}</strong>
                <span class="muted">/{album.slug}</span>
              </div>
              <div class="actions">
                <button
                  class="btn-ghost"
                  disabled={index === 0}
                  title="Move up"
                  on:click={() => move(album, -1)}>↑</button
                >
                <button
                  class="btn-ghost"
                  disabled={index === data.albums.length - 1}
                  title="Move down"
                  on:click={() => move(album, 1)}>↓</button
                >
                <a class="btn" href={`/admin/${album.id}`}>Photos</a>
                <button class="btn" on:click={() => (editingId = album.id)}>Edit</button>
                <button class="btn-danger" on:click={() => (deletingAlbum = album)}>Delete</button>
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</main>

{#if deletingAlbum}
  <ConfirmationModal
    open={!!deletingAlbum}
    confirmationMessage={`Delete album "${deletingAlbum.title}"? This also deletes all of its photos.`}
    on:confirmed={confirmDelete}
    on:close={() => (deletingAlbum = null)}
  />
{/if}

<style>
  .page-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .page-head :global(h1) {
    margin-bottom: 0;
  }
  .new-card {
    margin: 1.5rem 0;
  }
  .empty {
    margin-top: 2rem;
  }
  .album-list {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .album-row {
    padding: 1rem 1.25rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .info {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    min-width: 0;
  }
  .info strong {
    font-size: 1rem;
  }
  .info .muted {
    font-size: 0.85rem;
  }
  .actions {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
  .actions a {
    text-decoration: none;
  }
  .link {
    background: none;
    border: 0;
    text-decoration: underline;
    cursor: pointer;
    color: #6f6b64;
    padding: 0;
    margin-top: 0.75rem;
    font-size: 0.85rem;
  }
</style>
