import type { APIRequestContext } from '@playwright/test';

/**
 * True when the app server under test writes to the Firestore emulator. The emulator is opt-in
 * (PW_EMULATOR=1, it runs on Java); specs that write to Firestore skip themselves without it, and
 * never run against a server wired to the real project. /api/health reports it.
 */
export async function emulatorActive(request: APIRequestContext): Promise<boolean> {
  const res = await request.get('/api/health');
  const body = (await res.json().catch(() => ({}))) as { emulator?: boolean };
  return body.emulator === true;
}

export const EMULATOR_SKIP_REASON = 'Firestore emulator not running (opt-in: PW_EMULATOR=1 pnpm test:e2e)';
