import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import type { Service } from '@/lib/content/services';
import { localizedPath } from '@/lib/i18n/localized-path';
import { pageMetadata } from '@/lib/seo/page-metadata';
import { OWNER, PERSON_ID, SITE_URL } from '@/lib/site';

const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' };
const HOME: Record<Locale, string> = { fr: 'Accueil', en: 'Home' };
const SERVICES: Record<Locale, string> = { fr: 'Services', en: 'Services' };

export const serviceUrl = (s: Pick<Service, 'slug' | 'locale'>): string =>
  new URL(localizedPath('/services/[slug]', s.locale, { slug: s.slug }), SITE_URL).toString();

/** Page metadata for a service page; the share image comes from the locale's opengraph-image. */
export function serviceMetadata(s: Service): Metadata {
  const base = pageMetadata({ locale: s.locale, href: '/services/[slug]', params: { slug: s.slug }, title: s.metaTitle, description: s.seoDescription });
  return {
    ...base,
    openGraph: { type: 'website', title: s.metaTitle, description: s.seoDescription, url: serviceUrl(s), siteName: OWNER.name, locale: OG_LOCALE[s.locale] },
    twitter: { card: 'summary_large_image', title: s.metaTitle, description: s.seoDescription },
  };
}

/**
 * schema.org for a service page, as a @graph: the Service (provided by the site's single Person),
 * its FAQ as FAQPage (the questions shown on the page, word for word) and the breadcrumb.
 */
export function serviceJsonLd(s: Service): Record<string, unknown> {
  const url = serviceUrl(s);
  const abs = (href: '/' | '/services') => new URL(localizedPath(href, s.locale), SITE_URL).toString();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: s.title,
        description: s.seoDescription,
        url,
        inLanguage: s.locale,
        provider: { '@id': PERSON_ID },
        areaServed: ['BJ', 'FR', 'Worldwide'],
      },
      ...(s.faq.length
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              mainEntity: s.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: HOME[s.locale], item: abs('/') },
          { '@type': 'ListItem', position: 2, name: SERVICES[s.locale], item: abs('/services') },
          { '@type': 'ListItem', position: 3, name: s.title, item: url },
        ],
      },
    ],
  };
}
