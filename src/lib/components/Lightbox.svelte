<script lang="ts">
  import {
    Dialog,
    DialogOverlay,
    TransitionChild,
    TransitionRoot,
  } from '@rgossiaux/svelte-headlessui';
  import { XIcon } from '@rgossiaux/svelte-heroicons/outline';
  import db from '$lib/db';
  import type { Photo } from '$lib/shared';
  import { createEventDispatcher } from 'svelte';

  export let photos: Photo[];
  export let open = false;
  export let index = 0;

  const dispatch = createEventDispatcher();

  function close() {
    open = false;
    dispatch('close');
  }

  function prev() {
    index = (index - 1 + photos.length) % photos.length;
  }

  function next() {
    index = (index + 1) % photos.length;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  }

  $: photo = photos[index];
</script>

<svelte:window on:keydown={handleKeydown} />

<TransitionRoot as="div" show={open} appear={true}>
  <Dialog as="div" class="fixed inset-0 z-40 overflow-y-hidden" on:close={close}>
    <TransitionChild
      appear={true}
      as="div"
      enter="transition-opacity ease-out duration-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <DialogOverlay class="lightbox-overlay" />
    </TransitionChild>
    <TransitionChild
      appear={true}
      as="div"
      enter="transition ease-out duration-200 transform"
      enterFrom="scale-95 opacity-0"
      enterTo="scale-100 opacity-100"
      leave="transition ease-in duration-150 transform"
      leaveFrom="scale-100 opacity-100"
      leaveTo="scale-95 opacity-0"
    >
      <div class="lightbox-content">
        <button class="close" on:click|preventDefault={close}>
          <span class="sr-only">Close</span>
          <XIcon class="h-6 w-6" />
        </button>
        {#if photos.length > 1}
          <button class="nav prev" on:click|preventDefault={prev}>
            <span class="sr-only">Previous</span>‹
          </button>
          <button class="nav next" on:click|preventDefault={next}>
            <span class="sr-only">Next</span>›
          </button>
        {/if}
        {#if photo}
          <figure>
            <img src={db.photos.publicUrl(photo.storage_path)} alt={photo.title ?? ''} />
            {#if photo.caption}
              <figcaption>{photo.caption}</figcaption>
            {/if}
          </figure>
        {/if}
      </div>
    </TransitionChild>
  </Dialog>
</TransitionRoot>

<style>
  :global(.lightbox-overlay) {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
  }
  .lightbox-content {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  figure {
    margin: 0;
    max-width: 92vw;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  figure img {
    max-width: 92vw;
    max-height: 85vh;
    object-fit: contain;
  }
  figcaption {
    color: #eee;
    margin-top: 0.75rem;
    text-align: center;
  }
  button.close,
  button.nav {
    position: fixed;
    background: none;
    border: 0;
    color: #fff;
    cursor: pointer;
    z-index: 50;
  }
  button.close {
    top: 1rem;
    right: 1rem;
  }
  button.nav {
    top: 50%;
    transform: translateY(-50%);
    font-size: 3rem;
    line-height: 1;
    padding: 0.5rem 1rem;
  }
  button.prev {
    left: 0.5rem;
  }
  button.next {
    right: 0.5rem;
  }
</style>
