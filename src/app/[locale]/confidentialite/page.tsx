import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LegalPage } from '@/components/legal/LegalPage';
import { routing, type Locale } from '@/i18n/routing';
import { getLegal } from '@/lib/content/legal';
import { pageMetadata } from '@/lib/seo/page-metadata';

// Prerendered at build time: the Markdown under content/ is not shipped with the standalone server.
export const dynamic = 'force-static';

export async function generateMetadata({ params }: PageProps<'/[locale]/confidentialite'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'legal.privacy' });
  return pageMetadata({ locale: locale as Locale, href: '/confidentialite', title: t('metaTitle'), description: t('metaDescription') });
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/confidentialite'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });
  return <LegalPage locale={locale} title={t('title')} doc={getLegal('confidentialite', locale)} />;
}
