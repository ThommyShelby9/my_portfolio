import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/site/ButtonLink';

export function Hero({ sculpture }: { sculpture?: ReactNode }) {
  const t = useTranslations('hero');
  return (
    <section className="mx-auto grid min-h-[92svh] max-w-[1280px] items-center gap-10 px-5 pt-[6vh] md:px-10 lg:grid-cols-[1.25fr_1fr] lg:pt-[10vh]">
      <div data-sculpture-slot className="order-first lg:order-last">{sculpture}</div>
      <div className="relative z-10">
        <p data-hero style={{ '--hero-i': 0 } as CSSProperties} className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">
          {t('eyebrow')}
        </p>
        <h1 data-hero style={{ '--hero-i': 1 } as CSSProperties} className="mt-5 font-serif text-[clamp(38px,4.3vw,62px)] font-medium leading-[1.04] tracking-[-0.015em]">
          {t('titleBefore')}
          <em className="italic text-champagne">{t('titleEm')}</em>
          {t('titleAfter')}
        </h1>
        <p data-hero style={{ '--hero-i': 2 } as CSSProperties} className="mb-8 mt-6 max-w-[52ch] text-[16.5px] leading-[1.7] text-muted">
          <strong className="font-medium text-ivory">{t('ledeName')}</strong>
          {t('ledeRest')}
        </p>
        <div data-hero style={{ '--hero-i': 3 } as CSSProperties} className="flex flex-wrap gap-3.5">
          <ButtonLink href="/realisations" variant="primary" arrow>{t('ctaWork')}</ButtonLink>
          <ButtonLink href="/brief" variant="ghost">{t('ctaProject')}</ButtonLink>
        </div>
        <p data-hero style={{ '--hero-i': 4 } as CSSProperties} className="mt-[10vh] flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
          <span aria-hidden="true" className="block h-[38px] w-px bg-linear-to-b from-champagne to-transparent" />
          {t('scroll')}
        </p>
      </div>
    </section>
  );
}
