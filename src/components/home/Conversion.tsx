import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink, buttonClassName } from '@/components/site/ButtonLink';

export function Conversion({ kicker }: { kicker?: string } = {}) {
  const t = useTranslations('conversion');
  const sig = useTranslations('signature');
  return (
    <section
      id="projet"
      data-dna-scene="stabilisation"
      data-dna-state="5"
      className="relative z-10 overflow-hidden border-t border-line py-[18vh]"
    >
      <Reveal className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">{kicker ?? t('kicker')}</p>
        <h2 data-reveal className="mt-4 max-w-[12ch] font-display text-[clamp(46px,7vw,104px)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em]">{t('title')}</h2>
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
          <a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" rel="me noopener" className="border-b border-edge pb-1 no-underline hover:border-signal hover:text-signal">LinkedIn</a>
          <a href="https://github.com/ThommyShelby9" rel="me noopener" className="border-b border-edge pb-1 no-underline hover:border-signal hover:text-signal">GitHub</a>
        </p>
        <p data-reveal className="mt-[10vh] font-display text-[clamp(18px,1.8vw,24px)] font-extrabold uppercase tracking-[-0.01em] text-muted">
          {sig('a')} <em className="not-italic text-signal">{sig('b')}</em>
        </p>
      </Reveal>
    </section>
  );
}
