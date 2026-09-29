import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Conversion } from '@/components/home/Conversion';
import { Hero } from '@/components/home/Hero';
import { Method } from '@/components/home/Method';
import { Positioning } from '@/components/home/Positioning';
import { SelectedWork } from '@/components/home/SelectedWork';
import { SculptureStage } from '@/components/sculpture/SculptureStage';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'meta' });
  return pageMetadata({ locale: locale as Locale, href: '/', title: t('title'), description: t('description') });
}

export default function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  return (
    <>
      <Hero sculpture={<SculptureStage />} />
      <Positioning />
      <SelectedWork />
      <Method />
      <Conversion />
    </>
  );
}
