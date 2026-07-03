import { writable } from 'svelte/store';

export type ToastType = {
  id: number;
  type: 'error' | 'success' | 'info';
  message: string;
  dismissible: boolean;
  timeout: number;
};

export const toasts = writable<ToastType[]>([]);

export const addToast = (toast: ToastType) => {
  // Setup some sensible defaults for a toast.
  const defaults = {
    id: Math.floor(Math.random() * 10000),
    type: 'info',
    dismissible: true,
    timeout: 3000,
  };

  const merged = { ...defaults, ...toast };

  // Push the toast to the top of the list of toasts
  toasts.update((all) => [merged, ...all]);

  // If toast is dismissible, dismiss it after "timeout" amount of time.
  if (merged.timeout) setTimeout(() => dismissToast(merged.id), merged.timeout);
};

export const dismissToast = (id: number) => {
  toasts.update((all) => all.filter((t: ToastType) => t.id !== id));
};
