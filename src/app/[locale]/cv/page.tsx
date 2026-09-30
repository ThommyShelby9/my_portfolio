import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CvDocument } from '@/components/cv/CvDocument';
import { routing, type Locale } from '@/i18n/routing';
import { getProjects } from '@/lib/content/load';
import { selectCvProjects } from '@/lib/profile/cv-data';
import { pageMetadata } from '@/lib/seo/page-metadata';
import '@/styles/cv.css';

// Prerendered at build time: the case studies under content/ are not shipped with the standalone server.
export const dynamic = 'force-static';

export async function generateMetadata({ params }: PageProps<'/[locale]/cv'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'cv' });
  return pageMetadata({ locale: locale as Locale, href: '/cv', title: t('metaTitle'), description: t('metaDescription') });
}

export default async function CvPage({ params }: PageProps<'/[locale]/cv'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const projects = selectCvProjects(await getProjects('realisation', locale)).map((p) => ({
    slug: p.slug,
    title: p.title,
    role: p.role,
    year: p.year,
    summary: p.summary,
    metrics: p.metrics,
  }));
  return <CvDocument locale={locale} projects={projects} />;
}
