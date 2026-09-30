import type { Locale } from '@/i18n/routing';
import { OWNER } from '@/lib/site';

/**
 * The owner's CV as typed data, FR and EN. Single source for the About page, the CV page and PDF,
 * and the schema.org Person node. Every role and credential comes from the LinkedIn export
 * (`git show v5-manifesto:profile.md`); nothing here may be added without a source.
 */

export type Localized<T = string> = Record<Locale, T>;

/** Calendar month, `YYYY-MM`. */
export type YearMonth = `${number}-${'01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'}`;

/** `end: null` means ongoing. A one-month period has `start === end`. */
export type Period = { start: YearMonth; end: YearMonth | null };

export type RoleKind = 'employment' | 'freelance' | 'internship';

export type Role = {
  id: string;
  organisation: string;
  title: Localized;
  kind: RoleKind;
  period: Period;
  /** Omitted when the source gives no location. */
  location?: Localized;
  /** One line of what he did, from the source. */
  summary: Localized;
};

export type CredentialKind = 'degree' | 'certification' | 'certificate' | 'attestation';

export type Education = {
  id: string;
  institution: string;
  credential: Localized;
  kind: CredentialKind;
  field: Localized;
  period: Period;
};

/** A skill name: the same in both languages, or translated. */
export type Term = string | Localized;

export type SkillGroup = { id: string; label: Localized; items: Term[] };

export type Language = { code: string; name: Localized; level: Localized };

const COTONOU: Localized = { fr: 'Cotonou, Bénin', en: 'Cotonou, Benin' };

/** Most recent first: ongoing roles, then by end month, then by start month. */
export const ROLES: Role[] = [
  {
    id: 'kps',
    organisation: OWNER.employer,
    title: { fr: 'Head of Engineering & Innovation', en: 'Head of Engineering & Innovation' },
    kind: 'employment',
    period: { start: '2025-07', end: null },
    location: COTONOU,
    summary: {
      fr: 'Orientations techniques, architecture et sécurité des plateformes du groupe ; encadrement des équipes de développement et mise en place des méthodes Agile et DevOps.',
      en: 'Technical direction, architecture and security of the group’s platforms; leading the development teams and putting Agile and DevOps practices in place.',
    },
  },
  {
    id: 'gprhme',
    organisation: 'Cabinet GPRHME',
    title: { fr: 'Développeur full-stack', en: 'Full-stack developer' },
    kind: 'employment',
    period: { start: '2024-09', end: '2025-07' },
    summary: {
      fr: 'Réalisation puis refonte de TadagbeRhPlus, plateforme de gestion des ressources humaines, et conception des plateformes connexes INTER-NAT et HIPEJUS.',
      en: 'Built and then rebuilt TadagbeRhPlus, a human resources management platform, and designed the related INTER-NAT and HIPEJUS platforms.',
    },
  },
  {
    id: 'leconsultant',
    organisation: 'LeConsultant',
    title: { fr: 'Développeur full-stack', en: 'Full-stack developer' },
    kind: 'employment',
    period: { start: '2023-08', end: '2024-12' },
    location: COTONOU,
    summary: {
      fr: 'Conception et amélioration continue de la plateforme d’annonces d’appels d’offres LeConsultant.',
      en: 'Designed and kept improving LeConsultant, a platform for publishing calls for tenders.',
    },
  },
  {
    id: 'n01zet',
    organisation: 'N01ZET',
    title: { fr: 'Automatisation des tests QA', en: 'QA test automation' },
    kind: 'freelance',
    period: { start: '2024-03', end: '2024-08' },
    location: { fr: 'Paris, France', en: 'Paris, France' },
    summary: {
      fr: 'Tests automatisés avec Selenium, Java et JUnit.',
      en: 'Automated tests with Selenium, Java and JUnit.',
    },
  },
  {
    id: 'dsmc',
    organisation: 'DSMC Bénin',
    title: { fr: 'Développeur full-stack', en: 'Full-stack developer' },
    kind: 'employment',
    period: { start: '2024-03', end: '2024-07' },
    location: COTONOU,
    summary: {
      fr: 'Conception d’un agrégateur de paiement et amélioration de la plateforme DSMC Millenium Cybersecurity, en Laravel.',
      en: 'Designed a payment aggregator and improved the DSMC Millenium Cybersecurity platform, in Laravel.',
    },
  },
  {
    id: 'jscom',
    organisation: 'JSCOM-Bénin',
    title: { fr: 'Stage professionnel', en: 'Professional internship' },
    kind: 'internship',
    period: { start: '2023-11', end: '2024-03' },
    location: COTONOU,
    summary: {
      fr: 'Plateforme de gestion de stock en Spring Boot (Java) et Vue.js.',
      en: 'A stock management platform in Spring Boot (Java) and Vue.js.',
    },
  },
];

/** Most recent first, same order as ROLES. */
export const EDUCATION: Education[] = [
  {
    id: 'mindluster',
    institution: 'Mindluster',
    credential: { fr: 'Certificat', en: 'Certificate' },
    kind: 'certificate',
    field: { fr: 'Sécurité des systèmes d’information', en: 'Information systems security' },
    period: { start: '2025-01', end: '2025-02' },
  },
  {
    id: 'ecole229',
    institution: 'École 229',
    credential: { fr: 'Certification', en: 'Certification' },
    kind: 'certification',
    field: { fr: 'Développement web et mobile', en: 'Web and mobile development' },
    period: { start: '2023-03', end: '2024-03' },
  },
  {
    id: 'asin',
    institution: 'Agence des Systèmes d’Information et du Numérique (ASIN)',
    credential: { fr: 'Attestation', en: 'Attestation' },
    kind: 'attestation',
    field: { fr: 'Sécurité des systèmes d’information', en: 'Information systems security' },
    period: { start: '2023-12', end: '2023-12' },
  },
  {
    id: 'injeps',
    institution: 'INJEPS',
    credential: { fr: 'Licence professionnelle', en: 'Professional bachelor’s degree' },
    kind: 'degree',
    field: {
      fr: 'Sciences et techniques des activités socio-éducatives (STASE), option andragogie',
      en: 'Socio-educational activities (STASE), andragogy (adult education) track',
    },
    period: { start: '2019-10', end: '2022-08' },
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'backend',
    label: { fr: 'Backend', en: 'Backend' },
    items: ['Django', 'Laravel', 'Spring Boot', 'Node.js / NestJS', 'Express'],
  },
  {
    id: 'frontend',
    label: { fr: 'Frontend', en: 'Frontend' },
    items: ['Vue.js', 'Nuxt', 'Next.js / React', 'TypeScript'],
  },
  {
    id: 'mobile',
    label: { fr: 'Mobile', en: 'Mobile' },
    items: ['Flutter', 'Capacitor'],
  },
  {
    id: 'data-infra',
    label: { fr: 'Données & infra', en: 'Data & infra' },
    items: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'RabbitMQ',
      'Docker',
      'Coolify',
      { fr: 'Intégration continue (CI)', en: 'Continuous integration (CI)' },
      { fr: 'Administration Linux', en: 'Linux administration' },
    ],
  },
  {
    id: 'quality-security',
    label: { fr: 'Qualité & sécurité', en: 'Quality & security' },
    items: [
      { fr: 'Tests automatisés', en: 'Automated testing' },
      'Selenium / Java',
      'Playwright',
      { fr: 'Cybersécurité (certifications)', en: 'Cybersecurity (certifications)' },
    ],
  },
];

/** The export lists no language: only the owner-confirmed one is stated. */
export const LANGUAGES: Language[] = [{ code: 'fr', name: { fr: 'Français', en: 'French' }, level: { fr: 'langue maternelle', en: 'native' } }];

export const LINKS = { email: OWNER.email, linkedin: OWNER.linkedin, github: OWNER.github } as const;

/** The real portrait (654 px square source, never upscaled), exported as WebP by width. */
export const PORTRAIT = {
  sources: [
    { src: '/about/portrait-400.webp', width: 400 },
    { src: '/about/portrait-654.webp', width: 654 },
  ],
  src: '/about/portrait-654.webp',
  width: 654,
  height: 654,
  alt: {
    fr: `${OWNER.name}, portrait : lunettes, col roulé gris, veste bleu marine et écharpe bleu et blanc.`,
    en: `${OWNER.name}, portrait: glasses, grey turtleneck, navy jacket and a blue and white scarf.`,
  } satisfies Localized,
} as const;

export const ROLE_KIND_LABEL: Record<Exclude<RoleKind, 'employment'>, Localized> = {
  freelance: { fr: 'Mission freelance', en: 'Freelance mission' },
  internship: { fr: 'Stage', en: 'Internship' },
};

export function term(t: Term, locale: Locale): string {
  return typeof t === 'string' ? t : t[locale];
}

/** The role held today (the first ongoing one). */
export function currentRole(): Role {
  const role = ROLES.find((r) => r.period.end === null);
  if (!role) throw new Error('cv-data: no current role');
  return role;
}

const MONTHS: Localized<string[]> = {
  fr: ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const PRESENT: Localized = { fr: 'aujourd’hui', en: 'present' };

export function formatMonth(ym: YearMonth, locale: Locale): string {
  const [year, month] = ym.split('-');
  return `${MONTHS[locale][Number(month) - 1]} ${year}`;
}

/** "Juil. 2025 – aujourd’hui", "Sept. 2024 – Juil. 2025", or a single month. En dash, never an em dash. */
export function formatPeriod({ start, end }: Period, locale: Locale): string {
  if (end === start) return formatMonth(start, locale);
  return `${formatMonth(start, locale)} – ${end === null ? PRESENT[locale] : formatMonth(end, locale)}`;
}
