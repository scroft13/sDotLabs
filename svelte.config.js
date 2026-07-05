import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({ postcss: true }),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false,
    }),
    alias: {
      // Single source of truth for the print catalog: the functions deploy
      // bundle owns the file (server-side price authority), the client
      // imports the very same JSON for the picker UI.
      $catalog: 'functions/src/catalog.json',
    },
  },
};

export default config;
