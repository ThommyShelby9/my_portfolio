import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/i18n/routing';
import { GENE_LABEL, PAIR_COPY, PAIRS } from '@/lib/dna/genes';
import { SceneHead } from './SceneHead';

/** Scene 01 « Séquençage »: the three gene pairs, each with a statement and its proofs (spec §4.1). */
export function Sequencing() {
  const t = useTranslations('dna.sequencing');
  const locale = useLocale() as Locale;
  const label = GENE_LABEL[locale];
  return (
    <section
      id="adn"
      data-dna-scene="sequencing"
      data-dna-state="1"
      aria-labelledby="adn-title"
      className="relative z-10 mx-auto max-w-[1280px] px-5 py-[16vh] md:px-10"
    >
      <Reveal className="lg:max-w-[56%]">
        <SceneHead id="adn-title" kicker={t('kicker')} title={t('title')} intro={t('intro')} />
        <ol className="mt-14 border-t border-line">
          {PAIRS.map(([a, b], i) => {
            const copy = PAIR_COPY[locale][i];
            return (
              <li key={a} data-dna-focus={i} data-reveal className="border-b border-line py-9">
                <p className="flex flex-wrap items-center gap-3 font-mono text-[12px] font-medium uppercase tracking-[0.16em]">
                  <span className="text-faint">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-ivory">{label[a]}</span>
                  <span aria-hidden="true" className="inline-block h-px w-8 bg-signal" />
                  <span className="text-ivory">{label[b]}</span>
                </p>
                <p className="mt-4 max-w-[48ch] text-[19px] leading-[1.55] text-ivory">{copy.statement}</p>
                <details className="group mt-5">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-2.5 rounded-[2px] border border-edge px-4 py-2.5 font-mono text-[11.5px] uppercase tracking-[0.14em] text-ivory transition-colors hover:border-signal hover:text-signal [&::-webkit-details-marker]:hidden">
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false" className="transition-transform group-open:rotate-45">
                      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    {t('sequence')}
                  </summary>
                  <ul aria-label={t('proofs')} className="mt-5 space-y-3">
                    {copy.proofs.map((proof) => (
                      <li key={proof} className="flex gap-3 text-[15px] leading-[1.6] text-muted">
                        <span aria-hidden="true" className="mt-[0.7em] inline-block h-1.5 w-1.5 shrink-0 bg-signal" />
                        {proof}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </section>
  );
}
