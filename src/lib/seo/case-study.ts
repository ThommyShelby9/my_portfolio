import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { Project, ProjectKind } from '@/lib/content/load';
import { localizedPath } from '@/lib/i18n/localized-path';
import { pageMetadata } from '@/lib/seo/page-metadata';
import { OWNER, SITE_URL } from '@/lib/site';

export const CASE_HREF = { realisation: '/realisations/[slug]', exploration: '/explorations/[slug]' } as const satisfies Record<
  ProjectKind,
  string
>;

const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' };

export function caseUrl(p: Pick<Project, 'kind' | 'slug' | 'locale'>): string {
  return new URL(localizedPath(CASE_HREF[p.kind], p.locale, { slug: p.slug }), SITE_URL).toString();
}

/** Page metadata for a case study; the share image comes from the colocated opengraph-image. */
export function caseMetadata(p: Project, title: string): Metadata {
  const base = pageMetadata({ locale: p.locale, href: CASE_HREF[p.kind], params: { slug: p.slug }, title, description: p.seoDescription });
  return {
    ...base,
    openGraph: {
      type: 'article',
      title,
      description: p.seoDescription,
      url: caseUrl(p),
      siteName: OWNER.name,
      locale: OG_LOCALE[p.locale],
    },
    twitter: { card: 'summary_large_image', title, description: p.seoDescription },
  };
}

/** schema.org CreativeWork for a case study, crediting co-authors as contributors. */
export function caseJsonLd(p: Project): Record<string, unknown> {
  const cover = p.images[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.summary,
    dateCreated: String(p.year),
    url: caseUrl(p),
    inLanguage: p.locale,
    author: { '@type': 'Person', name: OWNER.name, url: SITE_URL },
    ...(p.coauthors.length > 0 ? { contributor: p.coauthors.map((name) => ({ '@type': 'Person', name })) } : {}),
    ...(cover ? { image: new URL(cover.src, SITE_URL).toString() } : {}),
    keywords: p.stack.join(', '),
  };
}
