

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.ec47c2fe.js","_app/immutable/chunks/index.97164529.js","_app/immutable/chunks/singletons.86894116.js","_app/immutable/chunks/index.91f9b936.js"];
export const stylesheets = [];
export const fonts = [];
