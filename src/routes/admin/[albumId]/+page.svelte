<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import PhotoUploader from '$lib/components/admin/PhotoUploader.svelte';
  import PhotoEditForm from '$lib/components/admin/PhotoEditForm.svelte';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import db from '$lib/db';
  import type { Photo } from '$lib/shared';
  import type { PageData } from './$types';

  export let data: PageData;

  let editingId: string | null = null;
  let deletingPhoto: Photo | null = null;

  $: nextSortOrder = data.photos.length
    ? Math.max(...data.photos.map((p) => p.sort_order)) + 1
    : 0;

  async function move(photo: Photo, direction: -1 | 1) {
    const photos = data.photos;
    const index = photos.findIndex((p) => p.id === photo.id);
    const swapWith = photos[index + direction];
    if (!swapWith) return;
    await db.photos.update(photo.id, { sort_order: swapWith.sort_order });
    await db.photos.update(swapWith.id, { sort_order: photo.sort_order });
    await invalidateAll();
  }

  async function confirmDelete() {
    if (!deletingPhoto) return;
    await db.photos.remove(deletingPhoto.id, deletingPhoto.storage_path);
    deletingPhoto = null;
    await invalidateAll();
  }

  async function refresh() {
    editingId = null;
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>{data.album.title} - Photos</title>
</svelte:head>

<main>
  <a href="/admin" class="back">&larr; Albums</a>
  <h1>{data.album.title}</h1>

  <PhotoUploader albumId={data.album.id} {nextSortOrder} on:uploaded={refresh} />

  {#if data.photos.length === 0}
    <p class="secondary-text mt-4">No photos in this album yet.</p>
  {:else}
    <ul class="photo-list">
      {#each data.photos as photo, index (photo.id)}
        <li>
          <img src={db.photos.publicUrl(photo.storage_path)} alt={photo.title ?? ''} />
          <div class="photo-body">
            {#if editingId === photo.id}
              <PhotoEditForm {photo} on:saved={refresh} />
              <button class="link" on:click={() => (editingId = null)}>Cancel</button>
            {:else}
              <div class="photo-meta">
                <strong>{photo.title || 'Untitled'}</strong>
                {#if photo.caption}
                  <p class="secondary-text">{photo.caption}</p>
                {/if}
              </div>
              <div class="actions">
                <button disabled={index === 0} on:click={() => move(photo, -1)}>&uarr;</button>
                <button disabled={index === data.photos.length - 1} on:click={() => move(photo, 1)}
                  >&darr;</button
                >
                <button on:click={() => (editingId = photo.id)}>Edit</button>
                <button class="danger" on:click={() => (deletingPhoto = photo)}>Delete</button>
              </div>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</main>

{#if deletingPhoto}
  <ConfirmationModal
    open={!!deletingPhoto}
    confirmationMessage="Delete this photo?"
    on:confirmed={confirmDelete}
    on:close={() => (deletingPhoto = null)}
  />
{/if}

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  .back {
    display: inline-block;
    margin-bottom: 1.5rem;
    color: inherit;
    opacity: 0.7;
    text-decoration: none;
  }
  h1 {
    margin-bottom: 1.5rem;
  }
  .photo-list {
    list-style: none;
    padding: 0;
    margin: 2rem 0 0;
  }
  .photo-list li {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #2a2a2a;
  }
  .photo-list img {
    width: 120px;
    height: 90px;
    object-fit: cover;
    border-radius: 0.25rem;
    flex-shrink: 0;
  }
  .photo-body {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
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
