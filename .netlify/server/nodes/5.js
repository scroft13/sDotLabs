

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/gt7/allCars/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.f2db5414.js","_app/immutable/chunks/index.97164529.js","_app/immutable/chunks/CarCard.0c885a4e.js","_app/immutable/chunks/stores.6d6f5e35.js","_app/immutable/chunks/index.91f9b936.js","_app/immutable/chunks/preload-helper.a4192956.js"];
export const stylesheets = [];
export const fonts = [];
