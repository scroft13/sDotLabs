// Removes the loading-shimmer class once an <img> has real content to show.
// Checks `complete` immediately (a cached image resolves before any `load`
// listener can attach, so relying on the event alone misses that case) and
// falls back to `load`/`error` for anything still in flight.
export function shimmerUntilLoaded(node: HTMLImageElement) {
  function clear() {
    node.classList.remove('skeleton-shimmer');
  }
  if (node.complete) {
    clear();
  } else {
    node.addEventListener('load', clear);
    node.addEventListener('error', clear);
  }
  return {
    destroy() {
      node.removeEventListener('load', clear);
      node.removeEventListener('error', clear);
    }
  };
}
