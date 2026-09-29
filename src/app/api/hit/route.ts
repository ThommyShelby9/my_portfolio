import { getDb } from '@/lib/server/firestore';
import { countryCode, dayKey, isBot, isSameOrigin, recordHit, refHost } from '@/lib/server/stats';

export const dynamic = 'force-dynamic';

const MAX_BODY = 2048;
const MAX_PATH = 300;

// Every answer is the same empty 204: the beacon never reads it, and a caller learns nothing.
const done = () => new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });

/** Receives `{ path, ref }` from HitBeacon and increments today's counters. Never stores an IP. */
export async function POST(request: Request): Promise<Response> {
  try {
    const { headers } = request;
    if (!isSameOrigin(headers) || isBot(headers.get('user-agent'))) return done();
    if (Number(headers.get('content-length') ?? 0) > MAX_BODY) return done();

    const text = await request.text();
    if (text.length > MAX_BODY) return done();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return done();
    }
    if (!body || typeof body !== 'object') return done();
    const { path, ref } = body as { path?: unknown; ref?: unknown };
    if (typeof path !== 'string' || !path.startsWith('/') || path.length > MAX_PATH) return done();

    const db = getDb();
    if (!db) return done();
    await recordHit(
      {
        path,
        ref: typeof ref === 'string' ? refHost(ref, headers.get('host')) : null,
        country: countryCode(headers.get('cf-ipcountry')),
        date: dayKey(),
      },
      db,
    );
  } catch (err) {
    console.error('hit: could not record the visit:', err instanceof Error ? err.message : 'unknown error');
  }
  return done();
}
