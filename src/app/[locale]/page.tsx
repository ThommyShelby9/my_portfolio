import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import type { Locale } from '@/i18n/routing';

export default function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations('hero');
  return (
    <h1>
      {t('titleBefore')}
      <em>{t('titleEm')}</em>
      {t('titleAfter')}
    </h1>
  );
}
