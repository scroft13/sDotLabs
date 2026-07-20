import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import sharp from 'sharp';

// The manually created bucket uploads actually go to -- see firebase.ts for
// why (the auto-provisioned default bucket is stuck read-only).
const BUCKET_NAME = 'sdotlabs-2';
const OWNER_UID = 'AbzprqTmVHOF1fCMt84c7aWa7o73';

const THUMB_MAX = 800; // wall/grid tiles never render taller than ~250px
const DISPLAY_MAX = 2000; // lightbox, shown up to ~880px wide today

// Derivatives live next to the original with this suffix before the
// extension -- also lets the Storage trigger recognize and skip its own
// output so writing a derivative doesn't re-trigger itself.
const DERIVATIVE_RE = /_(thumb|display)\.[^./]+$/;

function derivativePath(originalPath: string, suffix: 'thumb' | 'display'): string {
  const dot = originalPath.lastIndexOf('.');
  return dot === -1
    ? `${originalPath}_${suffix}`
    : `${originalPath.slice(0, dot)}_${suffix}${originalPath.slice(dot)}`;
}

async function generateDerivatives(originalPath: string): Promise<void> {
  const bucket = getStorage().bucket(BUCKET_NAME);
  const [buffer] = await bucket.file(originalPath).download();

  const thumbPath = derivativePath(originalPath, 'thumb');
  const displayPath = derivativePath(originalPath, 'display');

  const [thumbBuffer, displayBuffer] = await Promise.all([
    sharp(buffer)
      .rotate() // bake in EXIF orientation -- derivatives drop the EXIF tag itself
      .resize({ width: THUMB_MAX, height: THUMB_MAX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toBuffer(),
    sharp(buffer)
      .rotate()
      .resize({ width: DISPLAY_MAX, height: DISPLAY_MAX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer(),
  ]);

  const cacheControl = 'public, max-age=31536000, immutable';
  await Promise.all([
    bucket
      .file(thumbPath)
      .save(thumbBuffer, { metadata: { contentType: 'image/jpeg', cacheControl } }),
    bucket
      .file(displayPath)
      .save(displayBuffer, { metadata: { contentType: 'image/jpeg', cacheControl } }),
  ]);

  const snap = await getFirestore()
    .collection('photos')
    .where('storage_path', '==', originalPath)
    .limit(1)
    .get();
  if (!snap.empty) {
    await snap.docs[0].ref.update({ thumb_path: thumbPath, display_path: displayPath });
  }
}

// Fires on every new photo upload. Skips its own derivative output (via
// DERIVATIVE_RE) so it doesn't trigger itself, and swallows errors (e.g. an
// exotic format sharp can't decode) rather than throwing -- the photo just
// keeps falling back to the full-size original in that case.
export const resizeImage = onObjectFinalized(
  { bucket: BUCKET_NAME, cpu: 2, memory: '512MiB' },
  async (event) => {
    const filePath = event.data.name;
    if (!filePath || DERIVATIVE_RE.test(filePath)) return;
    if (!event.data.contentType?.startsWith('image/')) return;

    try {
      await generateDerivatives(filePath);
    } catch (err) {
      logger.error(`resizeImage failed for ${filePath}`, err);
    }
  },
);

// One-time admin action to backfill derivatives for photos uploaded before
// resizeImage existed. Owner-gated like every other write in this app.
// Safe to re-run -- only processes photos still missing a derivative.
export const backfillThumbnails = onCall(
  { timeoutSeconds: 540, memory: '512MiB' },
  async (request) => {
    if (request.auth?.uid !== OWNER_UID) {
      throw new HttpsError('permission-denied', 'Owner only');
    }

    const snap = await getFirestore().collection('photos').get();
    const missing = snap.docs.filter((d) => !d.data().thumb_path || !d.data().display_path);

    let processed = 0;
    const failures: string[] = [];
    const CONCURRENCY = 4;
    for (let i = 0; i < missing.length; i += CONCURRENCY) {
      const batch = missing.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (doc) => {
          const storagePath = doc.data().storage_path as string | undefined;
          if (!storagePath) {
            failures.push(doc.id);
            return;
          }
          try {
            await generateDerivatives(storagePath);
            processed++;
          } catch (err) {
            logger.error(`backfillThumbnails failed for photo ${doc.id}`, err);
            failures.push(doc.id);
          }
        }),
      );
    }

    return { total: missing.length, processed, failed: failures };
  },
);
