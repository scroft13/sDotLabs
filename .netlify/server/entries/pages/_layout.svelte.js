import { c as create_ssr_component } from "../../chunks/index.js";
const app = "";
const _layout_svelte_svelte_type_style_lang = "";
const css = {
  code: ":root{--primary-color:44 61% 77%;--secondary-color:326 27% 71%;--tertiary-color:60 1% 42%;--surface-base:0 0% 100%;--surface-100:0 0% 96%;--surface-200:0 0% 88%;--surface-300:0 0% 80%;--text-base:0 0% 42%;--text-muted:0 0% 72%}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
