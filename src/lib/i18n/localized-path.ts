import { routing, type Locale } from '@/i18n/routing';

type Href = keyof typeof routing.pathnames;

/** Public URL path of an internal route for a locale (fr unprefixed, en under /en). */
export function localizedPath(href: Href, locale: Locale, params?: Record<string, string>): string {
  const entry = routing.pathnames[href] as string | Record<Locale, string>;
  const template = typeof entry === 'string' ? entry : entry[locale];
  const path = template.replace(/\[(\w+)\]/g, (_, name: string) => {
    const value = params?.[name];
    if (!value) throw new Error(`localizedPath: missing value for [${name}] in ${href}`);
    return encodeURIComponent(value);
  });
  if (locale === routing.defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}
