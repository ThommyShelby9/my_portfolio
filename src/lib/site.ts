// Normalised once: no trailing slash, so `${SITE_URL}/path` and `new URL(path, SITE_URL)` both behave.
export const SITE_URL: string = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rostelmissimawu.com').replace(/\/+$/, '');

/** Single schema.org identity of the owner, shared by every JSON-LD block on both locales. */
export const PERSON_ID = `${SITE_URL}/#person`;

export const OWNER = {
  name: 'Rostel Panoumassi',
  email: 'rmissimawu@gmail.com',
  linkedin: 'https://www.linkedin.com/in/rostelpanoumassi-6b6608335',
  github: 'https://github.com/ThommyShelby9',
  city: 'Cotonou',
  country: 'BJ',
  employer: 'KPS Groupe',
  yearsExperience: 6,
  yearsLead: 3,
} as const;
