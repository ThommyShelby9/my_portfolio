import { hitCap } from '@/lib/server/daily-cap';
import { clientIp, trustCloudflare } from '@/lib/server/client-ip';
import { getDb } from '@/lib/server/firestore';
import { hitLimiter } from '@/lib/server/rate-limit';
import { capRef, countryCode, dayKey, isBot, isSameOrigin, knownPath, OTHER, recordHit, refHost } from '@/lib/server/stats';

export const dynamic = 'force-dynamic';

const MAX_BODY = 2048;
const MAX_PATH = 300;

// Every answer is the same empty 204: the beacon never reads it, and a caller learns nothing.
const done = () => new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });

/** The body as text, or null as soon as it grows past `max` bytes (the stream is then cancelled). */
async function readCapped(body: ReadableStream<Uint8Array> | null, max: number): Promise<string | null> {
  if (!body) return '';
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done: end, value } = await reader.read();
    if (end) break;
    size += value.byteLength;
    if (size > max) {
      reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Receives `{ path, ref }` from HitBeacon and increments today's counters. The IP only keys the
 * in-memory throttle (60 hits per minute): it is never stored.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { headers } = request;
    if (!isSameOrigin(headers) || isBot(headers.get('user-agent'))) return done();
    if (Number(headers.get('content-length') ?? 0) > MAX_BODY) return done();
    if (!hitLimiter.check(clientIp(headers)).allowed) return done();

    const text = await readCapped(request.body, MAX_BODY);
    if (text === null) return done();
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
    // Global ceiling per day: beyond it, nothing is written.
    if (!hitCap.take()) return done();
    const date = dayKey();
    const host = typeof ref === 'string' ? refHost(ref, headers.get('host')) : null;
    await recordHit(
      {
        path: knownPath(path) ?? OTHER,
        ref: host && capRef(host, date),
        // Cloudflare sets cf-ipcountry; like cf-connecting-ip it is ignored when TRUST_CF_CONNECTING_IP=0.
        country: trustCloudflare() ? countryCode(headers.get('cf-ipcountry')) : null,
        date,
      },
      db,
    );
  } catch (err) {
    console.error('hit: could not record the visit:', err instanceof Error ? err.message : 'unknown error');
  }
  return done();
}
