import type { Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import { EDUCATION, LANGUAGES, PORTRAIT, SKILL_GROUPS, currentRole, term } from '@/lib/profile/cv-data';
import { OWNER, PERSON_ID, SITE_URL } from '@/lib/site';

const DESCRIPTION: Record<Locale, string> = {
  fr: `Ingénieur logiciel : ${OWNER.yearsExperience} ans d’expérience, dont ${OWNER.yearsLead} ans comme tech lead.`,
  en: `Software engineer with ${OWNER.yearsExperience} years of experience, ${OWNER.yearsLead} of them as tech lead.`,
};

/** Credentials earned through a programme (not a short course): the schools he is an alumnus of. */
const ALUMNI_KINDS = new Set(['degree', 'certification']);

/**
 * The single schema.org Person of the site (`@id` PERSON_ID), built from cv-data. Every page that
 * describes the owner (home, about) emits this same node, so search engines see one identity.
 */
export function personNode(locale: Locale): Record<string, unknown> {
  const role = currentRole();
  const alumni = [...new Set(EDUCATION.filter((e) => ALUMNI_KINDS.has(e.kind)).map((e) => e.institution))];
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: OWNER.name,
    jobTitle: role.title[locale],
    description: DESCRIPTION[locale],
    url: new URL(localizedPath('/', locale), SITE_URL).toString(),
    image: new URL(PORTRAIT.src, SITE_URL).toString(),
    email: OWNER.email,
    worksFor: { '@type': 'Organization', name: role.organisation },
    address: { '@type': 'PostalAddress', addressLocality: OWNER.city, addressCountry: OWNER.country },
    alumniOf: alumni.map((name) => ({ '@type': 'EducationalOrganization', name })),
    hasCredential: EDUCATION.map((e) => ({
      '@type': 'EducationalOccupationalCredential',
      name: `${e.credential[locale]} · ${e.field[locale]}`,
      credentialCategory: e.kind,
      recognizedBy: { '@type': 'Organization', name: e.institution },
    })),
    knowsAbout: [...new Set(SKILL_GROUPS.flatMap((g) => g.items.map((t) => term(t, locale))))],
    knowsLanguage: LANGUAGES.map((l) => l.code),
    sameAs: [OWNER.linkedin, OWNER.github],
  };
}

/** schema.org ProfilePage for /a-propos: the page is about the shared Person node. */
export function aboutJsonLd(locale: Locale, name: string): Record<string, unknown> {
  const url = new URL(localizedPath('/a-propos', locale), SITE_URL).toString();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name,
        inLanguage: locale,
        mainEntity: { '@id': PERSON_ID },
      },
      personNode(locale),
    ],
  };
}
