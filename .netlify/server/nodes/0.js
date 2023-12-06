

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.b3d841a1.js","_app/immutable/chunks/index.97164529.js","_app/immutable/chunks/stores.6d6f5e35.js","_app/immutable/chunks/index.91f9b936.js","_app/immutable/chunks/preload-helper.a4192956.js"];
export const stylesheets = ["_app/immutable/assets/0.e0e9a488.css"];
export const fonts = [];
