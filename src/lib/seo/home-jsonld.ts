import type { Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import { personNode } from '@/lib/seo/person';
import { PERSON_ID, SITE_URL } from '@/lib/site';

const COPY = {
  fr: {
    serviceName: 'Rostel Panoumassi · Développeur full-stack freelance et tech lead',
    serviceType: ['Développement de plateformes SaaS', 'Intégration de l’IA', 'Logiciels de paie et RH', 'Intégration Mobile Money', 'Applications mobiles', 'Leadership technique'],
  },
  en: {
    serviceName: 'Rostel Panoumassi · Freelance full-stack developer and tech lead',
    serviceType: ['SaaS platform development', 'AI integration', 'Payroll and HR software', 'Mobile Money integration', 'Mobile apps', 'Technical leadership'],
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
