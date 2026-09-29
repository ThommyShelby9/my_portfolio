import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Hero } from '@/components/home/Hero';
import type { Locale } from '@/i18n/routing';

export default function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  return <Hero />;
}
