import type { Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import { OWNER, PERSON_ID, SITE_URL } from '@/lib/site';

const KNOWS_ABOUT = ['Next.js', 'React', 'TypeScript', 'Node.js', 'Laravel', 'PostgreSQL', 'Mobile Money', 'Stripe', 'Docker', 'Three.js'];

const COPY = {
  fr: {
    jobTitle: 'Head of Engineering & Innovation',
    description: `Ingénieur logiciel : ${OWNER.yearsExperience} ans d’expérience, dont ${OWNER.yearsLead} ans comme tech lead.`,
    serviceName: 'Rostel Panoumassi · Ingénierie de produits numériques',
    serviceType: ['Ingénierie de produits numériques', 'Plateformes SaaS', 'Intégration de paiements', 'Leadership technique'],
  },
  en: {
    jobTitle: 'Head of Engineering & Innovation',
    description: `Software engineer with ${OWNER.yearsExperience} years of experience, ${OWNER.yearsLead} of them as tech lead.`,
    serviceName: 'Rostel Panoumassi · Digital product engineering',
    serviceType: ['Digital product engineering', 'SaaS platforms', 'Payment integrations', 'Technical leadership'],
  },
} as const;

/** schema.org Person + ProfessionalService for the home page, as a @graph. */
export function homeJsonLd(locale: Locale): Record<string, unknown> {
  const url = new URL(localizedPath('/', locale), SITE_URL).toString();
  const c = COPY[locale];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: OWNER.name,
        jobTitle: c.jobTitle,
        description: c.description,
        url,
        email: OWNER.email,
        worksFor: { '@type': 'Organization', name: OWNER.employer },
        address: { '@type': 'PostalAddress', addressLocality: OWNER.city, addressCountry: OWNER.country },
        sameAs: [OWNER.linkedin, OWNER.github],
        knowsAbout: KNOWS_ABOUT,
      },
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
