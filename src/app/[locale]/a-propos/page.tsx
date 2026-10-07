import type { Metadata } from 'next';
import { DnaScene } from '@/components/dna/DnaScene';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AboutHero } from '@/components/about/AboutHero';
import { Career } from '@/components/about/Career';
import { Education } from '@/components/about/Education';
import { HowIWork } from '@/components/about/HowIWork';
import { Skills } from '@/components/about/Skills';
import { Conversion } from '@/components/home/Conversion';
import { JsonLd } from '@/components/seo/JsonLd';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo/page-metadata';
import { aboutJsonLd } from '@/lib/seo/person';

export async function generateMetadata({ params }: PageProps<'/[locale]/a-propos'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'about' });
  return pageMetadata({ locale: locale as Locale, href: '/a-propos', title: t('metaTitle'), description: t('metaDescription') });
}

export default async function AboutPage({ params }: PageProps<'/[locale]/a-propos'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });
  return (
    <>
      {/* The layers of the construction sequence, the way he works. */}
      <DnaScene mode="page" state={2} />
      <JsonLd data={aboutJsonLd(locale, t('metaTitle'))} />
      <AboutHero locale={locale} />
      <Career locale={locale} />
      <HowIWork locale={locale} />
      <Skills locale={locale} />
      <Education locale={locale} />
      <Conversion />
    </>
  );
}
