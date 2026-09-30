export const dynamic = 'force-dynamic';

// `emulator` only says whether a Firestore emulator is configured; the e2e specs that write use it to
// refuse to run against a real project. It exposes no host, credential or project id.
export function GET() {
  return Response.json({ ok: true, emulator: Boolean(process.env.FIRESTORE_EMULATOR_HOST) }, { headers: { 'cache-control': 'no-store' } });
}
