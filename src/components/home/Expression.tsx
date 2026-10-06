import { useLocale, useTranslations } from 'next-intl';
import { ProjectSignature } from '@/components/dna/ProjectSignature';
import { Reveal } from '@/components/motion/Reveal';
import { caseHref, coverOf } from '@/components/work/labels';
import { WorkVisual } from '@/components/work/WorkVisual';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Project } from '@/lib/content/load';
import { GENE_LABEL } from '@/lib/dna/genes';
import { SceneHead } from './SceneHead';

/** Scene 03 « Expression »: the featured projects, each with its DNA signature (spec §4.1, §3.5). */
export function Expression({ projects }: { projects: Project[] }) {
  const t = useTranslations('dna.expression');
  const w = useTranslations('work');
  const locale = useLocale() as Locale;
  return (
    <section
      id="realisations-accueil"
      data-dna-scene="expression"
      data-dna-state="3"
      aria-labelledby="expression-title"
      className="relative z-10 mx-auto max-w-[1280px] px-5 py-[16vh] md:px-10"
    >
      <Reveal className="lg:max-w-[60%]">
        <SceneHead id="expression-title" kicker={t('kicker')} title={t('title')} intro={t('intro')} />
        <ol className="mt-14 space-y-20">
          {projects.map((p, i) => {
            const cover = coverOf(p);
            return (
              <li key={p.slug} data-dna-focus={i} data-reveal>
                <article className="group relative">
                  <div className="flex items-start gap-5">
                    <ProjectSignature genes={p.genes} size={72} className="shrink-0 text-ivory" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-faint">
                        {String(i + 1).padStart(2, '0')} · {p.year} · {p.role}
                      </p>
                      <h3 className="mt-2 font-display text-[clamp(30px,3.2vw,44px)] font-extrabold uppercase leading-none tracking-[-0.025em]">
                        <Link href={caseHref(p)} className="no-underline transition-colors group-hover:text-signal">
                          {p.title}
                        </Link>
                      </h3>
                      {p.coauthors.length > 0 && (
                        <p className="mt-2 text-[14px] text-muted">
                          {w('coBuilt')} {p.coauthors.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    <span className="sr-only">{t('genes')}</span>
                    {p.genes.map((g) => (
                      <span key={g}>{GENE_LABEL[locale][g]}</span>
                    ))}
                  </p>
                  <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.65] text-ivory">{p.summary}</p>
                  {p.proofs.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {p.proofs.map((proof) => (
                        <li key={proof.text} className="flex gap-3 text-[14.5px] text-muted">
                          <span aria-hidden="true" className="mt-[0.6em] inline-block h-1.5 w-1.5 shrink-0 bg-signal" />
                          {proof.text}
                        </li>
                      ))}
                    </ul>
                  )}
                  <WorkVisual
                    image={cover}
                    name={p.title}
                    sector={p.sector}
                    sizes="(min-width: 1280px) 700px, (min-width: 1024px) 58vw, 100vw"
                    className="mt-7"
                  />
                  <Link
                    href={caseHref(p)}
                    aria-label={w('ctaFor', { name: p.title })}
                    className="mt-5 inline-flex items-center gap-2 border-b border-edge pb-1 font-mono text-[12px] uppercase tracking-[0.12em] text-ivory no-underline transition-colors hover:border-signal hover:text-signal"
                  >
                    {w('cta')}
                  </Link>
                </article>
              </li>
            );
          })}
        </ol>
        <Link
          href="/realisations"
          data-reveal
          className="mt-16 inline-flex border-b border-edge pb-1 font-mono text-[12px] uppercase tracking-[0.12em] text-ivory no-underline transition-colors hover:border-signal hover:text-signal"
        >
          {t('all')}
        </Link>
      </Reveal>
    </section>
  );
}
