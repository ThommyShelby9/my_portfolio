import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CasePage } from '@/components/work/CasePage';
import type { Locale } from '@/i18n/routing';
import { getAllSlugs, getProject } from '@/lib/content/load';
import { caseMetadata } from '@/lib/seo/case-study';

// Every exploration is prerendered; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs('exploration').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/explorations/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject('exploration', locale as Locale, slug);
  if (!project) notFound();
  const t = await getTranslations({ locale: locale as Locale, namespace: 'explorations' });
  return caseMetadata(project, t('caseMetaTitle', { title: project.title }));
}

export default async function ExplorationPage({ params }: PageProps<'/[locale]/explorations/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  return <CasePage kind="exploration" locale={locale as Locale} slug={slug} />;
}
