import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/site/ButtonLink';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-[1280px] flex-col justify-center px-5 py-[12vh] md:px-10">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
      <h1 className="mt-5 max-w-[24ch] font-serif text-[clamp(44px,6vw,88px)] font-medium leading-[1.02] tracking-[-0.015em]">{t('title')}</h1>
      <p className="mt-6 max-w-[48ch] text-[16.5px] leading-[1.7] text-muted">{t('text')}</p>
      <div className="mt-9 flex flex-wrap gap-3.5">
        <ButtonLink href="/realisations" variant="primary" arrow>{t('work')}</ButtonLink>
        <ButtonLink href="/" variant="ghost">{t('back')}</ButtonLink>
      </div>
    </section>
  );
}
