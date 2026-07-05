import { sveltekit } from '@sveltejs/kit/vite';
import { searchForWorkspaceRoot, type UserConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

const config: UserConfig = {
  plugins: [
    sveltekit(),
    Icons({
      compiler: 'svelte',
    }),
  ],
  server: {
    fs: {
      // functions/ has its own package.json, so Vite treats it as a separate
      // package root and excludes it from the default allowlist even though
      // it's a normal subdirectory -- needed for the $catalog alias to load
      // functions/src/catalog.json in dev.
      allow: [searchForWorkspaceRoot(process.cwd()), 'functions'],
    },
  },
};

export default config;
