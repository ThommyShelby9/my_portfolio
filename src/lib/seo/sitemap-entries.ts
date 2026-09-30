import type { MetadataRoute } from 'next';
import { routing, type Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import { SITE_URL } from '@/lib/site';

type Href = keyof typeof routing.pathnames;

/** Static pages in the sitemap. */
export const STATIC_HREFS: Href[] = ['/', '/realisations', '/explorations', '/a-propos', '/brief', '/contact', '/confidentialite', '/cgu'];

/**
 * Routes of `routing.pathnames` kept out of the sitemap: noindex pages (the thank-you pages) and pages
 * of a later lot (Lot 5 moves the indexable ones into STATIC_HREFS). Typed as routing keys, so a stale
 * entry does not compile, and tests/unit/sitemap-entries.test.ts fails on any route in neither list.
 */
export const NOINDEX_OR_LATER: Href[] = ['/cv', '/brief/merci', '/contact/merci'];

type Input = { realisations: string[]; explorations: string[]; lastModified?: Date };

const abs = (href: Href, locale: Locale, params?: Record<string, string>) =>
  new URL(localizedPath(href, locale, params), SITE_URL).toString().replace(/\/$/, ''); // Next renders the root canonical without its slash

/** One entry per localized URL, each carrying the fr/en alternates of the same page. */
export function buildSitemapEntries({ realisations, explorations, lastModified }: Input): MetadataRoute.Sitemap {
  const pages: { href: Href; params?: Record<string, string> }[] = [
    ...STATIC_HREFS.map((href) => ({ href })),
    ...realisations.map((slug) => ({ href: '/realisations/[slug]' as Href, params: { slug } })),
    ...explorations.map((slug) => ({ href: '/explorations/[slug]' as Href, params: { slug } })),
  ];
  return pages.flatMap(({ href, params }) => {
    const languages = { fr: abs(href, 'fr', params), en: abs(href, 'en', params) };
    return routing.locales.map((locale) => ({
      url: languages[locale],
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages },
    }));
  });
}
