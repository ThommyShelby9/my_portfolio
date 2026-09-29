import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';

const STEPS = ['discover', 'design', 'build', 'evolve'] as const;

export function Method() {
  const t = useTranslations('method');
  return (
    <section id="methode" className="mx-auto max-w-[1280px] px-5 pb-[14vh] pt-[8vh] md:px-10">
      <Reveal>
        <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
        <h2 data-reveal className="mt-3.5 max-w-[20ch] font-serif text-[clamp(34px,4vw,56px)] font-medium leading-[1.05]">{t('title')}</h2>
        <ol className="mt-14 grid border-t border-line md:grid-cols-4">
          {STEPS.map((key, i) => (
            <li key={key} data-reveal className="relative pb-5 pr-6 pt-7 before:absolute before:-top-1 before:left-0 before:size-[7px] before:bg-champagne">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mb-2.5 mt-3.5 font-serif text-[26px] font-medium">{t(key)}</h3>
              <p className="max-w-[26ch] text-sm leading-[1.65] text-muted">{t(`${key}Text`)}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
