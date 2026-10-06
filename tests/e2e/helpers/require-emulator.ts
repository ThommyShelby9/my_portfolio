import type { APIRequestContext } from '@playwright/test';

/**
 * Aborts a spec that writes to Firestore when the app server under test is not wired to the emulator
 * (for example a reused server started with real credentials). /api/health reports it.
 */
export async function requireEmulator(request: APIRequestContext): Promise<void> {
  const res = await request.get('/api/health');
  const body = (await res.json().catch(() => ({}))) as { emulator?: boolean };
  if (body.emulator !== true) {
    throw new Error(
      'Refusing to run: the app server is not connected to the Firestore emulator (FIRESTORE_EMULATOR_HOST is unset), ' +
        'so this spec could write to the real project. Restart the server through Playwright without PW_REUSE, or start it with the emulator.',
    );
  }
}
