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

No `.env` is needed — the Firebase web config is hardcoded in `src/lib/firebase.ts` (it's public by design; access control lives entirely in the security rules).

Deploys are manual: `npm run build` then `firebase deploy --only hosting` (requires `firebase login` and access to the `sdotlabs-2` Firebase project; `firebase-tools` isn't a project dependency — run it via `npx firebase-tools` from outside this repo if `npm run build`'s `.npmrc` `engine-strict=true` conflicts with your local Node version). Rules/index changes deploy separately: `firebase deploy --only firestore` / `--only storage`.

## Architecture

A SvelteKit 1 (Svelte 3) photo gallery, styled with Tailwind, built as a static SPA (`@sveltejs/adapter-static`, SPA fallback mode) and deployed to Firebase Hosting (project `sdotlabs-2`, config in `firebase.json`/`.firebaserc`). Public gallery + a single-owner admin portal for uploading/managing photos, backed entirely by Firebase (Firestore + Storage + Auth). The public design is an editorial "gallery wall": framed/matted photos (`GalleryFrame`) on a masonry wall, serif display type (Cormorant Garamond), EXIF captions.

- **`/`** — public gallery home: masonry wall of album covers (`src/routes/+page.svelte` + `+page.ts` load via `db.albums.allWithCover()`).
- **`/album/[slug]`** — album detail: framed photo wall (`PhotoGrid`) + full-screen viewer (`Lightbox`).
- **`/admin`** — album management (create/edit/delete/reorder), gated by `src/routes/admin/+layout.svelte`.
- **`/admin/login`** — email/password sign-in (no signup route anywhere — the owner account is created once, manually, in the Firebase Console).
- **`/admin/[albumId]`** — photo management within one album: upload, reorder, edit captions, delete.

### Data model & security boundary

Two top-level Firestore collections, `albums` and `photos` (photos reference their album via an `album_id` field — snake_case field names throughout, kept from the original Postgres schema so the `Album`/`Photo` types in `shared.ts` never changed). Photos carry optional `exif` (ISO/aperture/shutter/focal length, extracted client-side by `exifr` at upload). The `photos (album_id, sort_order)` composite index lives in `firestore.indexes.json`. There is no cascade delete in Firestore — `db.albums.remove()` deletes the album's photo docs and storage objects client-side, and `db.photos.remove()` clears a pointing `cover_photo_id` (both behaviors the old Postgres FKs used to provide).

**The actual access control is the Firestore + Storage security rules** (`firestore.rules` / `storage.rules`), not the app: public reads, but all writes restricted to a single hardcoded owner uid pasted into both rules files after creating the one Firebase Auth account. The `/admin` route guard (`src/routes/admin/+layout.svelte`, checking `$lib/auth`'s `user` store) is UX only — it just avoids flashing admin UI at a signed-out visitor. Don't treat it as the security boundary when reasoning about what an anonymous visitor can or can't do.

The whole app has `export const ssr = false` at the root (`src/routes/+layout.ts`) — there is no server runtime (Firebase Hosting serves static files only), so every route renders client-side; `firebase.json` rewrites all paths to `/index.html` so deep links resolve via client-side routing. `src/routes/admin/+layout.ts` also sets `ssr = false`, which is now redundant with the root but harmless.

### Data layer (`src/lib/`)

- **`firebase.ts`** — Firebase app init (hardcoded public web config) exporting `auth`/`firestore`/`storage`.
- **`db.ts`** — a default-exported `{ albums, photos }` namespace wrapping all Firestore/Storage calls (`albums.all/byId/bySlug/allWithCover/create/update/remove`, `photos.byAlbum/create/update/remove/publicUrl/upload`). Route/component code should go through this, not call Firestore APIs directly. Converters in here map Firestore docs (server `Timestamp`s, missing optional fields) onto the plain `Album`/`Photo` types; Firestore rejects `undefined` values, so writes pass through `stripUndefined`.
- **`auth.ts`** — the single source of truth for auth state: a `user` writable (`undefined` = session not yet resolved, `null` = signed out, `User` = signed in) plus `signIn`/`signOut`, backed by `onAuthStateChanged`.
- **`shared.ts`** — `Album`/`Photo`/`PhotoExif` types.
- **`stores.ts`** — just the toast system (`toasts`, `addToast`, `dismissToast`).

### Upload flow

Uploads go directly from the browser to Firebase Storage (`db.photos.upload`, path `{albumId}/{uuid}.{ext}`) — there's no backend to proxy through (Firebase Hosting serves static files only). After the Storage upload succeeds, a `photos` doc is created with the resulting `storage_path` plus client-extracted EXIF; public URLs are derived on demand via `db.photos.publicUrl()` (a constructed `firebasestorage.googleapis.com/...?alt=media` URL — works tokenless because the Storage rules allow public reads), not stored.

### Forms

`src/lib/components/forms/` is a Svelte-context-based form kit (`svelte-forms-lib` + `yup`): `Form.svelte` provides context, `Field`/`Label`/`ErrorMessage`/`TextArea`/`PasswordField` are primitives, `labeledComponents/Labeled*.svelte` are the pre-composed components to use directly (`LabeledField`, `LabeledTextarea`, `LabeledPassword`). `validation.ts` is a trimmed custom `yup` instance (just `password` and `slug` rules) — extend it there and mirror new rules in `index.d.ts`'s module augmentation.

### Path aliases

`$lib` → `src/lib` (standard SvelteKit alias).
