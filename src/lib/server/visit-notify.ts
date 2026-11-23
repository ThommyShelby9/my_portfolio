import 'server-only';
import { countryCode } from '@/lib/server/stats';
import { trustCloudflare } from '@/lib/server/client-ip';

/**
 * Forwards each page view to Rostel's WhatsApp assistant, which groups the views of one visit and
 * sends him a single message (VISIT_WEBHOOK_URL with the shared VISIT_WEBHOOK_SECRET). No IP and no
 * raw user agent leave the server: only the page, the source, the Cloudflare country and city, and a
 * coarse device / system / browser triple. Without both variables, nothing is sent.
 */

export type Visit = {
  sid: string;
  path: string;
  visits: number;
  src: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  lang: string | null;
  device: 'mobile' | 'tablet' | 'desktop';
  os: string | null;
  browser: string | null;
  screen: string | null;
};

const SID = /^[\w-]{8,64}$/;
const SCREEN = /^\d{2,5}x\d{2,5}$/;
const LANG = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

/** The coarse device, system and browser of a user agent; never the user agent itself. */
export function describeAgent(ua: string): Pick<Visit, 'device' | 'os' | 'browser'> {
  const tablet = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua);
  const mobile = !tablet && /Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua);
  const os = /Windows Phone/i.test(ua)
    ? 'Windows Phone'
    : /Windows NT/i.test(ua)
      ? 'Windows'
      : /iPhone|iPad|iPod/i.test(ua)
        ? 'iOS'
        : /Android/i.test(ua)
          ? 'Android'
          : /CrOS/i.test(ua)
            ? 'ChromeOS'
            : /Mac OS X|Macintosh/i.test(ua)
              ? 'macOS'
              : /Linux/i.test(ua)
                ? 'Linux'
                : null;
  const browser = /Edg(e|A|iOS)?\//i.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/i.test(ua)
      ? 'Opera'
      : /SamsungBrowser/i.test(ua)
        ? 'Samsung Internet'
        : /Firefox|FxiOS/i.test(ua)
          ? 'Firefox'
          : /Chrome|CriOS/i.test(ua)
            ? 'Chrome'
            : /Safari/i.test(ua)
              ? 'Safari'
              : null;
  return { device: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop', os, browser };
}

/** Cloudflare location headers arrive as UTF-8 bytes read as Latin-1: decode them back when it is clean. */
export function headerText(value: string | null, max = 60): string | null {
  if (!value) return null;
  const utf8 = Buffer.from(value, 'latin1').toString('utf8');
  const text = (utf8.includes('\uFFFD') ? value : utf8).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  return text || null;
}

/** The referring host, bare, when the visit comes from another site; null otherwise. */
export function sourceHost(ref: unknown, siteHost: string | null): string | null {
  if (typeof ref !== 'string' || !ref) return null;
  try {
    const url = new URL(ref);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const site = (siteHost ?? '').toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '');
    return host && host !== site ? host.slice(0, 80) : null;
  } catch {
    return null;
  }
}

/**
 * The visit to forward for a page view, or null when there is nothing to send: the owner's own
 * browsers (`me`), a beacon without a visit id (old page in cache), or a malformed field.
 */
export function visitFromHit(body: Record<string, unknown>, path: string, headers: Headers): Visit | null {
  if (body.me === true || typeof body.sid !== 'string' || !SID.test(body.sid)) return null;
  const n = Number(body.n);
  const cf = trustCloudflare();
  const utm = typeof body.src === 'string' && /^[\w.-]{1,40}$/.test(body.src) ? body.src : null;
  return {
    sid: body.sid,
    path,
    visits: Number.isInteger(n) && n > 0 && n < 100_000 ? n : 1,
    src: utm ?? sourceHost(body.ref, headers.get('host')),
    country: cf ? countryCode(headers.get('cf-ipcountry')) : null,
    city: cf ? headerText(headers.get('cf-ipcity')) : null,
    region: cf ? headerText(headers.get('cf-region')) : null,
    lang: typeof body.lang === 'string' && LANG.test(body.lang) && body.lang.length <= 20 ? body.lang : null,
    ...describeAgent(headers.get('user-agent') ?? ''),
    screen: typeof body.scr === 'string' && SCREEN.test(body.scr) ? body.scr : null,
  };
}

/** Sends the visit to the assistant. Never throws, gives up after 3 seconds. */
export async function notifyVisit(visit: Visit, env: NodeJS.ProcessEnv = process.env, send: typeof fetch = fetch): Promise<void> {
  const url = env.VISIT_WEBHOOK_URL;
  const secret = env.VISIT_WEBHOOK_SECRET;
  if (!url || !secret) return;
  try {
    const res = await send(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
      body: JSON.stringify(visit),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) console.error(`visit: the assistant answered ${res.status}`);
  } catch (err) {
    console.error('visit: could not reach the assistant:', err instanceof Error ? err.message : 'unknown error');
  }
}
