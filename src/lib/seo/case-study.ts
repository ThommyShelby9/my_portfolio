import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { Project, ProjectKind } from '@/lib/content/load';
import { localizedPath } from '@/lib/i18n/localized-path';
import { pageMetadata } from '@/lib/seo/page-metadata';
import { OWNER, PERSON_ID, SITE_URL } from '@/lib/site';

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

const CONTRIBUTION_ROLE = /^(contribution|engineering contribution)/i;

/** A contribution to someone else's product is `contributor`; a lead, solo or architecture role is `creator`. */
export function ownerRelation(role: string): 'creator' | 'contributor' {
  return CONTRIBUTION_ROLE.test(role.trim()) ? 'contributor' : 'creator';
}

/**
 * schema.org CreativeWork for the case study page itself (not for the product). Rostel authors the
 * write-up; the product is `about`, carrying the product roles (Rostel and co-authors) and its year.
 * An exploration is a proposal for someone else's site: `about` is that brand, without any Rostel role.
 */
export function caseJsonLd(p: Project, title: string): Record<string, unknown> {
  const cover = p.images[0];
  const self = { '@type': 'Person', '@id': PERSON_ID, name: OWNER.name };
  const coauthors = p.coauthors.map((name) => ({ '@type': 'Person', name }));
  const roles =
    p.kind === 'exploration'
      ? {}
      : ownerRelation(p.role) === 'creator'
        ? { creator: [self, ...coauthors] }
        : { contributor: [self, ...coauthors] };
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    about: {
      '@type': 'CreativeWork',
      name: p.title,
      ...(p.liveUrl ? { url: p.liveUrl } : {}),
      dateCreated: String(p.year),
      ...roles,
    },
    description: p.summary,
    url: caseUrl(p),
    inLanguage: p.locale,
    author: self,
    ...(cover ? { image: new URL(cover.src, SITE_URL).toString() } : {}),
    keywords: p.stack.join(', '),
  };
}
