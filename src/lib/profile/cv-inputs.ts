import { createHash } from 'node:crypto';
import type { Locale } from '@/i18n/routing';
import { CV_PDF, EDUCATION, LINKS, ROLES, SKILL_GROUPS, selectCvProjects } from '@/lib/profile/cv-data';
import { OWNER } from '@/lib/site';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

/** A selected project as the CV prints it. */
export type CvProject = { slug: string; title: string; role: string; year: number; summary: string; metrics: string[] };

type ProjectSource = Parameters<typeof selectCvProjects>[0][number] & Omit<CvProject, 'metrics'>;

/** The CV's projects, in CV order, reduced to what the document prints. */
export function cvProjects(projects: readonly ProjectSource[]): CvProject[] {
  return selectCvProjects(projects).map((p) => ({
    slug: p.slug,
    title: p.title,
    role: p.role,
    year: p.year,
    summary: p.summary,
    metrics: p.metrics,
  }));
}

const MESSAGES = { fr, en } as const;

/**
 * Everything the CV prints for one language, as plain data: the cv-data exports, the selected
 * projects and the messages the document reads. The /cv page stamps its hash on the document,
 * scripts/cv-pdf.mjs stores it next to the PDFs, and a unit test recomputes it: when they differ,
 * the committed PDFs are stale (run pnpm cv:pdf).
 */
export function cvInputs(locale: Locale, projects: readonly CvProject[]): Record<string, unknown> {
  const m = MESSAGES[locale];
  return {
    locale,
    owner: OWNER,
    links: LINKS,
    pdf: CV_PDF[locale],
    roles: ROLES,
    education: EDUCATION,
    skills: SKILL_GROUPS,
    projects,
    messages: { cv: m.cv, about: { title: m.about.title, lede: m.about.lede, careerNote: m.about.career.note } },
  };
}

export function cvInputsHash(locale: Locale, projects: readonly CvProject[]): string {
  return createHash('sha256').update(JSON.stringify(cvInputs(locale, projects))).digest('hex');
}
