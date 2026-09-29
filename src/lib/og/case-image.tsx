import 'server-only';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getProject, type ProjectKind } from '@/lib/content/load';
import { ogCard, titleSizeFor } from './card';

/** Share image of a case study: monogram, sector, title and its cover capture when it has one. */
export async function caseOgImage(kind: ProjectKind, locale: string, slug: string) {
  if (!hasLocale(routing.locales, locale)) notFound();
  const project = await getProject(kind, locale, slug);
  if (!project) notFound();
  const t = await getTranslations({ locale, namespace: 'caseStudy' });
  const cover = project.images[0];
  return ogCard({
    eyebrow: project.sector,
    title: [{ text: project.title }],
    titleSize: titleSizeFor(project.title, Boolean(cover)),
    footer: `Rostel Panoumassi · ${kind === 'exploration' ? 'Exploration' : t('caseStudy')}`,
    capture: cover?.src,
  });
}
