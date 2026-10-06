import type { Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import { personNode } from '@/lib/seo/person';
import { PERSON_ID, SITE_URL } from '@/lib/site';

const COPY = {
  fr: {
    serviceName: 'Rostel Panoumassi · Ingénierie de produits numériques',
    serviceType: ['Ingénierie de produits numériques', 'Plateformes SaaS', 'Intégration de paiements', 'Leadership technique'],
  },
  en: {
    serviceName: 'Rostel Panoumassi · Digital product engineering',
    serviceType: ['Digital product engineering', 'SaaS platforms', 'Payment integrations', 'Technical leadership'],
  },
} as const;

/** schema.org Person (shared builder) + ProfessionalService for the home page, as a @graph. */
export function homeJsonLd(locale: Locale): Record<string, unknown> {
  const url = new URL(localizedPath('/', locale), SITE_URL).toString();
  const c = COPY[locale];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(locale),
      {
        '@type': 'ProfessionalService',
        '@id': `${url}#service`,
        name: c.serviceName,
        url,
        provider: { '@id': PERSON_ID },
        areaServed: ['BJ', 'FR', 'Worldwide'],
        serviceType: c.serviceType,
      },
    ],
  };
}
