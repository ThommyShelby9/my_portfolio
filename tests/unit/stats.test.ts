import { afterEach, describe, expect, it, vi } from 'vitest';
import { countryCode, dayKey, encodeKey, isBot, isSameOrigin, recordHit, refHost } from '@/lib/server/stats';
import { POST } from '@/app/api/hit/route';

describe('encodeKey', () => {
  it('turns a path into a valid field name', () => {
    expect(encodeKey('/')).toBe('~');
    expect(encodeKey('/en/work/ubbfy')).toBe('~en~work~ubbfy');
    expect(encodeKey('/realisations/a.b')).toBe('~realisations~a_b');
  });
  it('replaces anything outside a safe set and caps the length at 120', () => {
    expect(encodeKey('/a b[c]*`d`')).toBe('~a_b_c___d_');
    expect(encodeKey('/%C3%A9')).toBe('~%C3%A9');
    expect(encodeKey(`/${'x'.repeat(300)}`)).toHaveLength(120);
  });
});

describe('isBot', () => {
  it('flags crawlers, headless browsers, scripts and missing user agents', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0)',
      'facebookexternalhit/1.1',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0 Safari/537.36',
      'Mozilla/5.0 (Linux) Chrome-Lighthouse',
      'curl/8.4.0',
      'python-requests/2.32',
      'Wget/1.21',
      '',
      null,
    ]) {
      expect(isBot(ua), String(ua)).toBe(true);
    }
  });
  it('lets real browsers through', () => {
    for (const ua of [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0',
    ]) {
      expect(isBot(ua), ua).toBe(false);
    }
  });
});

describe('refHost', () => {
  it('keeps only an external host, encoded', () => {
    expect(refHost('https://www.google.com/search?q=x', 'rostelmissimawu.com')).toBe('google_com');
    expect(refHost('https://news.ycombinator.com/item?id=1', 'rostelmissimawu.com')).toBe('news_ycombinator_com');
  });
  it('drops internal, empty, malformed and non-http referrers', () => {
    expect(refHost('https://rostelmissimawu.com/realisations', 'rostelmissimawu.com')).toBeNull();
    expect(refHost('https://www.rostelmissimawu.com/', 'rostelmissimawu.com')).toBeNull();
    expect(refHost('http://127.0.0.1:3100/en', '127.0.0.1:3100')).toBeNull();
    expect(refHost('', 'rostelmissimawu.com')).toBeNull();
    expect(refHost(undefined, 'rostelmissimawu.com')).toBeNull();
    expect(refHost('not a url', 'rostelmissimawu.com')).toBeNull();
    expect(refHost('android-app://com.google.android.gm/', 'rostelmissimawu.com')).toBeNull();
  });
});

describe('countryCode', () => {
  it('accepts a two-letter code only, never the unknown or Tor markers', () => {
    expect(countryCode('BJ')).toBe('BJ');
    expect(countryCode('bj')).toBeNull();
    expect(countryCode('XX')).toBeNull();
    expect(countryCode('T1')).toBeNull();
    expect(countryCode('BEN')).toBeNull();
    expect(countryCode(null)).toBeNull();
  });
});

describe('dayKey', () => {
  it('uses the local date in Porto-Novo (UTC+1, no daylight saving)', () => {
    expect(dayKey(new Date('2026-09-30T12:00:00Z'))).toBe('2026-09-30');
    expect(dayKey(new Date('2026-09-30T23:30:00Z'))).toBe('2026-10-01');
    expect(dayKey(new Date('2026-01-01T22:59:00Z'))).toBe('2026-01-01');
  });
});

describe('isSameOrigin', () => {
  const h = (init: Record<string, string>) => new Headers(init);
  it('trusts sec-fetch-site when present', () => {
    expect(isSameOrigin(h({ 'sec-fetch-site': 'same-origin', host: 'a.com' }))).toBe(true);
    expect(isSameOrigin(h({ 'sec-fetch-site': 'cross-site', origin: 'https://a.com', host: 'a.com' }))).toBe(false);
    expect(isSameOrigin(h({ 'sec-fetch-site': 'none', host: 'a.com' }))).toBe(false);
  });
  it('otherwise compares origin with the host', () => {
    expect(isSameOrigin(h({ origin: 'https://a.com', host: 'a.com' }))).toBe(true);
    expect(isSameOrigin(h({ origin: 'https://evil.com', host: 'a.com' }))).toBe(false);
    expect(isSameOrigin(h({ host: 'a.com' }))).toBe(false);
    expect(isSameOrigin(h({ origin: 'null', host: 'a.com' }))).toBe(false);
  });
});

describe('recordHit', () => {
  it('increments the day document with merge, nested maps and optional ref and country', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const doc = vi.fn(() => ({ set }));
    const collection = vi.fn(() => ({ doc }));
    const db = { collection } as unknown as Parameters<typeof recordHit>[1];

    await recordHit({ path: '/en/work', ref: 'google_com', country: 'BJ', date: '2026-09-30' }, db);
    expect(collection).toHaveBeenCalledWith('stats_daily');
    expect(doc).toHaveBeenCalledWith('2026-09-30');
    const [data, opts] = set.mock.calls[0];
    expect(opts).toEqual({ merge: true });
    expect(Object.keys(data).sort()).toEqual(['countries', 'paths', 'refs', 'total']);
    expect(Object.keys(data.paths)).toEqual(['~en~work']);
    expect(Object.keys(data.refs)).toEqual(['google_com']);
    expect(Object.keys(data.countries)).toEqual(['BJ']);

    await recordHit({ path: '/', ref: null, country: null, date: '2026-09-30' }, db);
    expect(Object.keys(set.mock.calls[1][0]).sort()).toEqual(['paths', 'total']);
  });
});

describe('POST /api/hit', () => {
  const browser = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
  const req = (body: string, headers: Record<string, string> = {}) =>
    new Request('http://localhost:3100/api/hit', {
      method: 'POST',
      body,
      headers: { host: 'localhost:3100', 'sec-fetch-site': 'same-origin', 'user-agent': browser, ...headers },
    });

  afterEach(() => vi.unstubAllEnvs());

  it('answers 204 with no body for bad JSON, bots, bad or long paths and cross-site calls', async () => {
    const cases = [
      req('{not json'),
      req(''),
      req('null'),
      req(JSON.stringify({ path: '/' }), { 'user-agent': 'Googlebot/2.1' }),
      req(JSON.stringify({ path: 'relative' })),
      req(JSON.stringify({ path: 42 })),
      req(JSON.stringify({ path: `/${'a'.repeat(400)}` })),
      req(JSON.stringify({ path: '/' }), { 'sec-fetch-site': 'cross-site' }),
      req('x'.repeat(10_000)),
    ];
    for (const r of cases) {
      const res = await POST(r);
      expect(res.status).toBe(204);
      expect(await res.text()).toBe('');
      expect(res.headers.get('set-cookie')).toBeNull();
    }
  });

  it('is a no-op 204 when Firestore is not configured', async () => {
    vi.stubEnv('FIRESTORE_EMULATOR_HOST', '');
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT', '');
    const res = await POST(req(JSON.stringify({ path: '/', ref: 'https://google.com/' })));
    expect(res.status).toBe(204);
  });
});
