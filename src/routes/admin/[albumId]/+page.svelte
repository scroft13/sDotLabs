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

  $: nextSortOrder = data.photos.length ? Math.max(...data.photos.map((p) => p.sort_order)) + 1 : 0;

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
  <title>{data.album.title} — Photos</title>
</svelte:head>

<main class="admin-page">
  <a href="/admin" class="back">← Albums</a>
  <h1>{data.album.title}</h1>

  <div class="card uploader-card">
    <div class="section-label">Add photos</div>
    <PhotoUploader albumId={data.album.id} {nextSortOrder} on:uploaded={refresh} />
  </div>

  {#if data.photos.length === 0}
    <p class="muted empty">No photos in this album yet.</p>
  {:else}
    <ul class="photo-list">
      {#each data.photos as photo, index (photo.id)}
        <li class="card photo-item">
          <img
            src={db.photos.publicUrl(photo.thumb_path ?? photo.storage_path)}
            alt={photo.title ?? ''}
          />
          <div class="photo-body">
            {#if editingId === photo.id}
              <PhotoEditForm {photo} on:saved={refresh} />
              <button class="link" on:click={() => (editingId = null)}>Cancel</button>
            {:else}
              <div class="photo-meta">
                <strong>{photo.title || 'Untitled'}</strong>
                {#if photo.caption}
                  <p class="muted caption">{photo.caption}</p>
                {/if}
              </div>
              <div class="actions">
                <button
                  class="btn-ghost"
                  disabled={index === 0}
                  title="Move up"
                  on:click={() => move(photo, -1)}>↑</button
                >
                <button
                  class="btn-ghost"
                  disabled={index === data.photos.length - 1}
                  title="Move down"
                  on:click={() => move(photo, 1)}>↓</button
                >
                <button class="btn" on:click={() => (editingId = photo.id)}>Edit</button>
                <button class="btn-danger" on:click={() => (deletingPhoto = photo)}>Delete</button>
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
  .back {
    display: inline-block;
    margin-bottom: 1rem;
    color: #8a8680;
    text-decoration: none;
    font-size: 0.85rem;
  }
  .back:hover {
    color: #1a1a1a;
  }
  .uploader-card {
    margin-bottom: 1.5rem;
  }
  .empty {
    margin-top: 1rem;
  }
  .photo-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .photo-item {
    display: flex;
    gap: 1.25rem;
    padding: 1rem 1.25rem;
    align-items: flex-start;
  }
  .photo-item img {
    width: 120px;
    height: 90px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
  }
  .photo-body {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    min-width: 0;
  }
  .photo-meta strong {
    font-size: 1rem;
  }
  .caption {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
  }
  .actions {
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
    align-items: center;
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
