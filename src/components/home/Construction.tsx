import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/i18n/routing';
import { BUILD_STEPS } from '@/lib/dna/genes';
import { SceneHead } from './SceneHead';

/** Scene 02 « Construction »: the Architect sequence, one layer of the helix per step (spec §4.1). */
export function Construction() {
  const t = useTranslations('dna.construction');
  const locale = useLocale() as Locale;
  return (
    <section
      id="methode"
      data-dna-scene="construction"
      data-dna-state="2"
      aria-labelledby="methode-title"
      className="relative z-10 mx-auto max-w-[1280px] px-5 py-[16vh] md:px-10"
    >
      <Reveal className="lg:max-w-[56%]">
        <SceneHead id="methode-title" kicker={t('kicker')} title={t('title')} intro={t('intro')} />
        <ol className="mt-14">
          {BUILD_STEPS[locale].map((step, i) => (
            <li key={step.name} data-dna-focus={i} data-reveal className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-t border-line py-7">
              <span className="pt-1 font-mono text-[12px] font-medium tracking-[0.14em] text-signal">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-display text-[clamp(22px,2.2vw,30px)] font-extrabold uppercase leading-none tracking-[-0.02em]">{step.name}</h3>
                <p className="mt-3 max-w-[52ch] text-[15.5px] leading-[1.65] text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
