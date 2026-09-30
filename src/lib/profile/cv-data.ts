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
  /** Full name, as in the source. */
  institution: string;
  /** Short name used in headings when the full one is long. */
  short?: string;
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

/** Newest start first (a tie puts the later end first): the order of the timeline and the CV. */
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
];

/** Newest start first, like ROLES. */
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
    id: 'asin',
    institution: 'Agence des Systèmes d’Information et du Numérique',
    short: 'ASIN',
    credential: { fr: 'Attestation', en: 'Attestation' },
    kind: 'attestation',
    field: { fr: 'Sécurité des systèmes d’information', en: 'Information systems security' },
    period: { start: '2023-12', end: '2023-12' },
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
    id: 'injeps',
    institution: 'INJEPS',
    credential: { fr: 'Licence professionnelle', en: 'Professional bachelor’s degree' },
    kind: 'degree',
    field: {
      fr: 'Sciences et techniques des activités socio-éducatives (STASE), option andragogie',
      en: 'Science and techniques of socio-educational activities (STASE), andragogy track',
    },
    period: { start: '2019-10', end: '2022-08' },
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'backend',
    label: { fr: 'Backend', en: 'Backend' },
    items: ['Java', 'Spring Boot', 'Django', 'Laravel', 'Node.js', 'NestJS', 'Express'],
  },
  {
    id: 'frontend',
    label: { fr: 'Frontend', en: 'Frontend' },
    items: ['Vue.js', 'Nuxt', 'React', 'Next.js', 'TypeScript'],
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
      'Selenium',
      'Playwright',
      { fr: 'Cybersécurité', en: 'Cybersecurity' },
    ],
  },
];

/** The export lists no language: only the owner-confirmed one is stated. */
export const LANGUAGES: Language[] = [{ code: 'fr', name: { fr: 'Français', en: 'French' }, level: { fr: 'langue maternelle', en: 'native' } }];

export const LINKS = { email: OWNER.email, linkedin: OWNER.linkedin, github: OWNER.github } as const;

/** The printed CV in each language, generated from /cv and /en/cv by `pnpm cv:pdf` (public/cv/). */
export const CV_PDF: Localized = {
  fr: '/cv/rostel-panoumassi-cv.pdf',
  en: '/cv/rostel-panoumassi-cv-en.pdf',
};

/**
 * The real portrait: 4:5 crops of the 654 px square source (full height, centred, never upscaled),
 * exported as WebP. The page shows them at their own ratio, so nothing is cropped again in CSS.
 */
export const PORTRAIT = {
  sources: [
    { src: '/about/portrait-4x5-400.webp', width: 400, height: 500 },
    { src: '/about/portrait-4x5-523.webp', width: 523, height: 654 },
  ],
  src: '/about/portrait-4x5-523.webp',
  width: 523,
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

/**
 * The kind of a role ("Mission freelance", "Stage") when it adds something: null for employment,
 * and null when the title already says it ("Stage professionnel" is not followed by "· Stage").
 */
export function roleKindLabel(role: Role, locale: Locale): string | null {
  if (role.kind === 'employment') return null;
  const label = ROLE_KIND_LABEL[role.kind][locale];
  return role.title[locale].toLowerCase().includes(label.toLowerCase()) ? null : label;
}

/** Heading of a credential: what it is and who issued it, distinct for every entry. */
export function educationHeading(e: Education, locale: Locale): string {
  return `${e.credential[locale]} · ${e.short ?? e.institution}`;
}

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
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const PRESENT: Localized = { fr: 'aujourd’hui', en: 'present' };

export function formatMonth(ym: YearMonth, locale: Locale): string {
  const [year, month] = ym.split('-');
  return `${MONTHS[locale][Number(month) - 1]} ${year}`;
}

/** A period split for markup: each bound is a <time> (`dateTime` set) except "aujourd’hui". */
export type PeriodPart = { label: string; dateTime?: YearMonth };

export function periodParts({ start, end }: Period, locale: Locale): PeriodPart[] {
  const first: PeriodPart = { label: formatMonth(start, locale), dateTime: start };
  if (end === start) return [first];
  return [first, end === null ? { label: PRESENT[locale] } : { label: formatMonth(end, locale), dateTime: end }];
}

/** "juil. 2025 – aujourd’hui", "sept. 2024 – juil. 2025", or a single month. En dash, never an em dash. */
export function formatPeriod({ start, end }: Period, locale: Locale): string {
  if (end === start) return formatMonth(start, locale);
  return `${formatMonth(start, locale)} – ${end === null ? PRESENT[locale] : formatMonth(end, locale)}`;
}

/**
 * The CV's short selection of flagship work, by case-study slug, in display order. Ubbfy shows no
 * figure: its only proof is a count from the repository, not a result the owner confirmed.
 */
export const CV_PROJECT_SLUGS = ['ubbfy', 'tadagberhplus', 'zenlife', 'ccns'] as const;

/** Proofs whose source is the owner's confirmation: the only figures a CV may state. */
const CONFIRMED = /^confirmé par Rostel\b/;

type ProjectLike = { slug: string; proofs: readonly { text: string; source: string }[] };

/** The selected projects in CV order, each with its owner-confirmed figures only. */
export function selectCvProjects<P extends ProjectLike>(projects: readonly P[]): (P & { metrics: string[] })[] {
  return CV_PROJECT_SLUGS.map((slug) => {
    const project = projects.find((p) => p.slug === slug);
    if (!project) throw new Error(`cv-data: no case study "${slug}"`);
    return { ...project, metrics: project.proofs.filter((p) => CONFIRMED.test(p.source)).map((p) => p.text) };
  });
}
