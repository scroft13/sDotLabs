<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import AlbumForm from '$lib/components/admin/AlbumForm.svelte';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import db from '$lib/db';
  import type { Album } from '$lib/shared';
  import type { PageData } from './$types';

  export let data: PageData;

  let editingId: string | null = null;
  let deletingAlbum: Album | null = null;

  async function refresh() {
    editingId = null;
    await invalidateAll();
  }

  async function move(album: Album, direction: -1 | 1) {
    const albums = data.albums;
    const index = albums.findIndex((a) => a.id === album.id);
    const swapWith = albums[index + direction];
    if (!swapWith) return;
    await db.albums.update(album.id, { sort_order: swapWith.sort_order });
    await db.albums.update(swapWith.id, { sort_order: album.sort_order });
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
  <title>Manage Albums</title>
</svelte:head>

<main>
  <section class="new-album">
    <h2>New Album</h2>
    <AlbumForm on:saved={refresh} />
  </section>

  <section>
    <h2>Albums</h2>
    {#if data.albums.length === 0}
      <p class="secondary-text">No albums yet.</p>
    {:else}
      <ul>
        {#each data.albums as album, index (album.id)}
          <li>
            {#if editingId === album.id}
              <AlbumForm {album} on:saved={refresh} />
              <button class="link" on:click={() => (editingId = null)}>Cancel</button>
            {:else}
              <div class="row">
                <div class="info">
                  <strong>{album.title}</strong>
                  <span class="secondary-text">/{album.slug}</span>
                </div>
                <div class="actions">
                  <button disabled={index === 0} on:click={() => move(album, -1)}>&uarr;</button>
                  <button disabled={index === data.albums.length - 1} on:click={() => move(album, 1)}
                    >&darr;</button
                  >
                  <a href={`/admin/${album.id}`}>Photos</a>
                  <button on:click={() => (editingId = album.id)}>Edit</button>
                  <button class="danger" on:click={() => (deletingAlbum = album)}>Delete</button>
                </div>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
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
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  h2 {
    margin-bottom: 1rem;
  }
  .new-album {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #2a2a2a;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #2a2a2a;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .actions a {
    color: inherit;
  }
  button.link {
    background: none;
    border: 0;
    text-decoration: underline;
    cursor: pointer;
    color: inherit;
    padding: 0;
    margin-top: 0.5rem;
  }
  button.danger {
    color: #ff8888;
  }
</style>
