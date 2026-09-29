import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink, buttonClassName } from '@/components/site/ButtonLink';

export function Conversion() {
  const t = useTranslations('conversion');
  const sig = useTranslations('positioning');
  return (
    <section id="projet" data-sculpture-return className="relative overflow-hidden border-t border-line py-[18vh]">
      {/* Still ring for visitors without the live trajectory (no JS, reduced motion, no WebGL, mobile). */}
      <picture>
        <source media="(max-width: 1023px)" srcSet="/sculpture/mobius-mobile.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sculpture/mobius-desktop.webp"
          alt=""
          aria-hidden="true"
          data-conversion-poster
          className="pointer-events-none mx-auto mb-8 block w-[70vw] max-w-[420px] lg:absolute lg:right-[-4%] lg:top-1/2 lg:mb-0 lg:w-[min(44vw,600px)] lg:max-w-none lg:-translate-y-1/2"
        />
      </picture>
      <Reveal className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
        <h2 data-reveal className="mt-3.5 max-w-[12ch] font-serif text-[clamp(46px,6vw,88px)] font-medium leading-[1.02]">{t('title')}</h2>
        <p data-reveal className="mb-8 mt-6 max-w-[48ch] text-[16.5px] leading-[1.7] text-muted">{t('text')}</p>
        <div className="flex flex-wrap gap-3.5">
          <div data-reveal>
            <ButtonLink href="/brief" variant="primary" arrow>{t('brief')}</ButtonLink>
          </div>
          <div data-reveal>
            <a data-button href="mailto:rmissimawu@gmail.com" className={buttonClassName('ghost')}>{t('email')}</a>
          </div>
        </div>
        <p data-reveal className="mt-10 flex gap-6 text-[13.5px] text-faint">
          <a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" rel="me noopener" className="border-b border-graphite pb-1 no-underline hover:border-champagne hover:text-champagne">LinkedIn</a>
          <a href="https://github.com/ThommyShelby9" rel="me noopener" className="border-b border-graphite pb-1 no-underline hover:border-champagne hover:text-champagne">GitHub</a>
        </p>
        <p data-reveal className="mt-[10vh] font-serif text-[22px] font-medium text-muted">
          {sig('signatureA')} <em className="italic text-champagne">{sig('signatureB')}</em>
        </p>
      </Reveal>
    </section>
  );
}
