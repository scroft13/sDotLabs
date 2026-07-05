// Firebase auth session lives in browser storage; rendering the admin
// section only client-side keeps auth state and rules-scoped data in sync
// (no SSR request ever has the owner's session available to it).
export const ssr = false;
