import 'server-only';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { routing } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import slugs from './known-slugs.json';

/**
 * Cookieless visit counter. One document per day, `stats_daily/{YYYY-MM-DD}`:
 * `{ total, paths: { <key>: n }, refs: { <host>: n }, countries: { <CC>: n } }`.
 * No IP, no user agent, no identifier is ever stored. Keys are bounded: unknown pages and
 * referrers beyond the daily cap are counted under `other`.
 */

/** The shared key for pages outside the allow-list and for referrers beyond the daily cap. */
export const OTHER = 'other';

const MAX_KEY = 120;

/**
 * A path (or host) as a Firestore map key that is also usable in a dotted field path:
 * `/` becomes `~`, `.` becomes `_`, anything else outside `[A-Za-z0-9_~%-]` becomes `_`,
 * capped at 120 characters. Firestore reserves `__.*__` names, so a leading or trailing run
 * of underscores is shortened to one.
 */
export function encodeKey(value: string): string {
  return value
    .replace(/\//g, '~')
    .replace(/\./g, '_')
    .replace(/[^A-Za-z0-9_~%-]/g, '_')
    .slice(0, MAX_KEY)
    .replace(/^_{2,}/, '_')
    .replace(/_{2,}$/, '_');
}

type Href = keyof typeof routing.pathnames;

// Every public page in both locales: the static routes, then each case study and exploration.
// The slugs come from known-slugs.json, written from content/ at build time (scripts/known-slugs.mjs),
// so nothing reads content/ at request time.
const KNOWN_PATHS: ReadonlySet<string> = new Set(
  routing.locales.flatMap((locale) => [
    ...(Object.keys(routing.pathnames) as Href[]).filter((href) => !href.includes('[')).map((href) => localizedPath(href, locale)),
    ...slugs.realisations.map((slug) => localizedPath('/realisations/[slug]', locale, { slug })),
    ...slugs.explorations.map((slug) => localizedPath('/explorations/[slug]', locale, { slug })),
  ]),
);

/** Every page path the counter keeps under its own key. */
export const knownPaths = (): string[] => [...KNOWN_PATHS];

/** The page path when it is a known page of the site (a trailing slash is ignored), else null. */
export function knownPath(path: string): string | null {
  const p = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return KNOWN_PATHS.has(p) ? p : null;
}

/**
 * Bounds the referrer keys of a day: the first `max` distinct hosts of a day keep their own key,
 * later ones are counted under `other`. In memory only, reset each day (and on restart).
 */
export function createRefCap(max = 200): (host: string, date: string) => string {
  let day = '';
  const hosts = new Set<string>();
  return (host, date) => {
    if (date !== day) {
      day = date;
      hosts.clear();
    }
    if (hosts.has(host)) return host;
    if (hosts.size >= max) return OTHER;
    hosts.add(host);
    return host;
  };
}

export const capRef = createRefCap();

// Crawlers, link unfurlers, monitoring, headless browsers and plain HTTP clients.
const BOT =
  /bot\b|bot[/;_-]|crawl|spider|slurp|archiver|facebookexternalhit|embedly|preview|headless|lighthouse|pagespeed|pingdom|uptime|monitor|phantom|puppeteer|playwright|selenium|webdriver|curl|wget|python|httpclient|http-client|axios|node-fetch|undici|go-http|java\/|okhttp|libwww|scrapy/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || !userAgent.trim()) return true;
  return BOT.test(userAgent);
}

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, '');

/** The referring host when it is another site, encoded as a map key; null for internal, empty or odd referrers. */
export function refHost(ref: string | null | undefined, siteHost: string | null | undefined): string | null {
  if (!ref) return null;
  let url: URL;
  try {
    url = new URL(ref);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = bareHost(url.host);
  if (!host || (siteHost && host === bareHost(siteHost))) return null;
  return encodeKey(host);
}

/** `cf-ipcountry` as sent by the network, only when it is a real ISO code (not XX unknown or T1 Tor). */
export function countryCode(value: string | null | undefined): string | null {
  if (!value || !/^[A-Z]{2}$/.test(value) || value === 'XX' || value === 'T1') return null;
  return value;
}

// Rostel works from Cotonou: a "day" is the local day there (Africa/Porto-Novo, UTC+1 all year).
const DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Porto-Novo', year: 'numeric', month: '2-digit', day: '2-digit' });

export function dayKey(now: Date = new Date()): string {
  return DAY.format(now);
}

/** `sec-fetch-site: same-origin` when the browser sends it, else `origin` must match the host. */
export function isSameOrigin(headers: Headers): boolean {
  const site = headers.get('sec-fetch-site');
  if (site) return site === 'same-origin';
  const origin = headers.get('origin');
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const hosts = [headers.get('host'), headers.get('x-forwarded-host')].filter(Boolean);
  return hosts.includes(originHost);
}

/** `path` is a known page path or `other`; `ref` an encoded host (or `other`) from `refHost` and `capRef`. */
export type Hit = { path: string; ref: string | null; country: string | null; date: string };

/**
 * Increments the day document. `set` with `merge: true` deep-merges nested objects, and `set`
 * treats dots in keys literally, so counters are written as nested maps, never dotted strings.
 */
export async function recordHit({ path, ref, country, date }: Hit, db: Firestore): Promise<void> {
  const one = FieldValue.increment(1);
  const data: Record<string, unknown> = { total: one, paths: { [encodeKey(path)]: one } };
  if (ref) data.refs = { [ref]: one };
  if (country) data.countries = { [country]: one };
  await db.collection('stats_daily').doc(date).set(data, { merge: true });
}
