import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ThankYou } from '@/components/forms/ThankYou';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/brief/merci'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'brief.thanks' });
  return {
    ...pageMetadata({ locale: locale as Locale, href: '/brief/merci', title: t('metaTitle'), description: t('metaDescription') }),
    robots: { index: false },
  };
}

export default async function BriefThanksPage({ params }: PageProps<'/[locale]/brief/merci'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'brief.thanks' });
  return <ThankYou kicker={t('kicker')} title={t('title')} text={t('text')} home={t('home')} work={t('work')} />;
}
