import { useTranslations } from 'next-intl';

export function SkipLink() {
  const t = useTranslations('nav');
  return (
    <a href="#main"
       className="absolute left-5 top-[-100px] z-50 rounded-[2px] bg-ivory px-3.5 py-2.5 font-medium text-graphite no-underline focus:top-3">
      {t('skip')}
    </a>
  );
}
