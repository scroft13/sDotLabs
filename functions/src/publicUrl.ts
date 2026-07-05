// Duplicate of src/lib/db.ts's publicUrl -- both sides derive the same
// tokenless media URL, which works because the Storage rules allow public
// reads. Keep the bucket name in sync with src/lib/firebase.ts.
const STORAGE_BUCKET = 'sdotlabs-2';

export function publicUrl(storagePath: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(
    storagePath,
  )}?alt=media`;
}
