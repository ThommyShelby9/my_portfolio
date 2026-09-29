import 'server-only';
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let cached: Firestore | null | undefined;

function initApp(): App | null {
  if (getApps().length > 0) return getApp();
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-rostel-portfolio' });
  }
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!encoded) return null;
  try {
    const json = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    return initializeApp({
      credential: cert(json),
      projectId: process.env.FIREBASE_PROJECT_ID || json.project_id,
    });
  } catch {
    return null;
  }
}

/** Lazily initialised Admin Firestore, or null when not configured. Never throws. */
export function getDb(): Firestore | null {
  if (cached !== undefined) return cached;
  try {
    const app = initApp();
    cached = app ? getFirestore(app) : null;
  } catch {
    cached = null;
  }
  return cached;
}
