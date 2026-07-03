# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev             # start dev server (vite, --host, port 6660)
npm run build            # production build
npm run preview          # preview production build
npm run check            # svelte-kit sync + svelte-check (type checking)
npm run check:watch      # svelte-check in watch mode
npm run lint             # prettier --check + eslint
npm run format           # prettier --write
```

No test runner is configured (no `test` script, no test files) — `npm run check` and `npm run lint` are the only automated verification. Both `yarn.lock` and `package-lock.json` exist; either works, but stick to whichever you last used so the other lockfile doesn't drift.

Requires a `.env` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (see `.env.example`) — the Supabase client is created at module load in `src/lib/db.ts`, so even `npm run build` will crash without these set.

## Architecture

A SvelteKit 1 (Svelte 3) photo gallery, styled with Tailwind, deployed to Netlify (`@sveltejs/adapter-netlify`). Public gallery + a single-owner admin portal for uploading/managing photos, backed entirely by Supabase (Postgres + Storage + Auth).

- **`/`** — public gallery home: grid of albums (`src/routes/+page.svelte` + `+page.ts` load via `db.albums.allWithCover()`).
- **`/album/[slug]`** — album detail: photo grid (`PhotoGrid`) + full-screen viewer (`Lightbox`).
- **`/admin`** — album management (create/edit/delete/reorder), gated by `src/routes/admin/+layout.svelte`.
- **`/admin/login`** — email/password sign-in (no signup route anywhere — the owner account is created once, manually, in the Supabase Dashboard).
- **`/admin/[albumId]`** — photo management within one album: upload, reorder, edit captions, delete.

### Data model & security boundary

Schema lives in `supabase-setup.sql` at the repo root (not Supabase-CLI-managed — a one-time script run manually in the Supabase SQL Editor). Two tables, `albums` and `photos` (photos FK to albums, `on delete cascade`), plus a public `gallery` Storage bucket.

**The actual access control is Postgres RLS + Storage policies**, not the app: both tables and the bucket allow public `select`, but `insert`/`update`/`delete` are restricted to a single hardcoded `auth.uid()` — the owner's Supabase user ID, pasted into the SQL script after creating that one account. The `/admin` route guard (`src/routes/admin/+layout.svelte`, checking `$lib/auth`'s `user` store) is UX only — it just avoids flashing admin UI at a signed-out visitor. Don't treat it as the security boundary when reasoning about what an anonymous visitor can or can't do.

`/admin` and everything under it has `export const ssr = false` (`src/routes/admin/+layout.ts`) — Supabase's session lives in browser storage, so admin pages only ever render client-side; the public routes above it are still SSR'd normally.

### Data layer (`src/lib/`)

- **`db.ts`** — the Supabase client (`supabase`) plus a default-exported `{ albums, photos }` namespace wrapping all Postgres/Storage calls (`albums.all/byId/bySlug/allWithCover/create/update/remove`, `photos.byAlbum/create/update/remove/publicUrl/upload`). Route/component code should go through this, not call `supabase.from(...)` directly.
- **`auth.ts`** — the single source of truth for auth state: a `user` writable (`undefined` = session not yet resolved, `null` = signed out, `User` = signed in) plus `signIn`/`signOut`. Populated once at module load via `getSession()`/`onAuthStateChange`.
- **`shared.ts`** — `Album`/`Photo` types matching the SQL schema.
- **`stores.ts`** — just the toast system (`toasts`, `addToast`, `dismissToast`).

### Upload flow

Uploads go directly from the browser to Supabase Storage (`db.photos.upload`) — never proxied through a Netlify function, which sidesteps Netlify's ~6MB sync function payload ceiling. After the Storage upload succeeds, a `photos` row is inserted with the resulting `storage_path`; public URLs are derived on demand via `db.photos.publicUrl()` (`storage.from('gallery').getPublicUrl(...)`), not stored.

### Forms

`src/lib/components/forms/` is a Svelte-context-based form kit (`svelte-forms-lib` + `yup`): `Form.svelte` provides context, `Field`/`Label`/`ErrorMessage`/`TextArea`/`PasswordField` are primitives, `labeledComponents/Labeled*.svelte` are the pre-composed components to use directly (`LabeledField`, `LabeledTextarea`, `LabeledPassword`). `validation.ts` is a trimmed custom `yup` instance (just `password` and `slug` rules) — extend it there and mirror new rules in `index.d.ts`'s module augmentation.

### Path aliases

`$lib` → `src/lib` (standard SvelteKit alias).
