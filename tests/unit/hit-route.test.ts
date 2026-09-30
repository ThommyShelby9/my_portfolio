import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The route with a fake database: recordHit is observed, everything else is the real code.
const { recordHit } = vi.hoisted(() => ({ recordHit: vi.fn() }));
vi.mock('@/lib/server/firestore', () => ({ getDb: () => ({ fake: 'db' }) }));
vi.mock('@/lib/server/stats', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/server/stats')>()),
  recordHit,
}));

const { POST } = await import('@/app/api/hit/route');

const browser = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
let ipSeq = 0;
const nextIp = () => `10.1.${Math.floor(++ipSeq / 250)}.${ipSeq % 250}`;
const headers = (extra: Record<string, string> = {}) => ({
  host: 'localhost:3100',
  'sec-fetch-site': 'same-origin',
  'user-agent': browser,
  'x-real-ip': nextIp(),
  ...extra,
});
const hit = (body: unknown, extra: Record<string, string> = {}) =>
  POST(new Request('http://localhost:3100/api/hit', { method: 'POST', body: JSON.stringify(body), headers: headers(extra) }));

beforeEach(() => {
  recordHit.mockReset();
  recordHit.mockResolvedValue(undefined);
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-30T12:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('POST /api/hit', () => {
  it('records the normalised path, the ref host, the country and the Porto-Novo date', async () => {
    const res = await hit({ path: '/en/work/', ref: 'https://www.google.com/search?q=rostel' }, { 'cf-ipcountry': 'BJ' });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(recordHit).toHaveBeenCalledTimes(1);
    expect(recordHit).toHaveBeenCalledWith({ path: '/en/work', ref: 'google_com', country: 'BJ', date: '2026-09-30' }, { fake: 'db' });
  });

  it('counts an unknown path under other', async () => {
    await hit({ path: '/wp-login.php', ref: '' });
    await hit({ path: '/realisations/not-a-project' });
    expect(recordHit.mock.calls.map(([h]) => h.path)).toEqual(['other', 'other']);
    expect(recordHit.mock.calls.map(([h]) => h.ref)).toEqual([null, null]);
  });

  it('refuses a declared content-length over 2 KB before reading the body', async () => {
    const res = await hit({ path: '/' }, { 'content-length': '4096' });
    expect(res.status).toBe(204);
    expect(recordHit).not.toHaveBeenCalled();
  });

  it('stops reading a streamed body past 2 KB and cancels the stream', async () => {
    let cancelled = false;
    let pulled = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled++;
        // `{"path":"/","x":"aaaa…` without an end, 512 bytes at a time.
        controller.enqueue(new TextEncoder().encode(pulled === 1 ? '{"path":"/","x":"' : 'a'.repeat(512)));
      },
      cancel() {
        cancelled = true;
      },
    });
    const request = new Request('http://localhost:3100/api/hit', { method: 'POST', body, headers: headers(), duplex: 'half' } as RequestInit);
    const res = await POST(request);
    expect(res.status).toBe(204);
    expect(recordHit).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(cancelled).toBe(true));
    expect(pulled).toBeLessThan(10);
  });

  it('still answers 204 when Firestore fails, and logs the message only', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    recordHit.mockRejectedValueOnce(new Error('UNAVAILABLE'));
    const res = await hit({ path: '/' });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
    expect(error).toHaveBeenCalledWith('hit: could not record the visit:', 'UNAVAILABLE');
  });

  it('counts at most 60 hits per minute from one IP, silently', async () => {
    const ip = '10.9.9.9';
    for (let i = 0; i < 60; i++) expect((await hit({ path: '/' }, { 'x-real-ip': ip })).status).toBe(204);
    expect(recordHit).toHaveBeenCalledTimes(60);
    const res = await hit({ path: '/' }, { 'x-real-ip': ip });
    expect(res.status).toBe(204);
    expect(recordHit).toHaveBeenCalledTimes(60);
    // Another visitor is not affected, and the IP is never passed on.
    await hit({ path: '/' }, { 'x-real-ip': '10.9.9.10' });
    expect(recordHit).toHaveBeenCalledTimes(61);
    expect(JSON.stringify(recordHit.mock.calls)).not.toContain('10.9.9');
  });

  it('keeps 200 referrer hosts a day and counts the next ones under other', async () => {
    vi.setSystemTime(new Date('2026-10-02T12:00:00Z'));
    for (let i = 0; i < 200; i++) await hit({ path: '/', ref: `https://site${i}.example/` });
    await hit({ path: '/', ref: 'https://one-too-many.example/' });
    await hit({ path: '/', ref: 'https://site3.example/page' });
    const refs = recordHit.mock.calls.map(([h]) => h.ref);
    expect(new Set(refs.slice(0, 200)).size).toBe(200);
    expect(refs.slice(200)).toEqual(['other', 'site3_example']);
    // A new day starts a new list.
    vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    await hit({ path: '/', ref: 'https://one-too-many.example/' });
    expect(recordHit.mock.calls.at(-1)![0].ref).toBe('one-too-many_example');
  });

  it('sanitises a referrer that would be a reserved Firestore name', async () => {
    await hit({ path: '/', ref: 'https://__x__/' });
    expect(recordHit.mock.calls[0][0].ref).toBe('_x_');
    await hit({ path: '/', ref: 'https://__x__.com/' });
    expect(recordHit.mock.calls.at(-1)![0].ref).toBe('_x___com');
  });
});
