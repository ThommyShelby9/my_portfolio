import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import { ExplorationBadge } from '@/components/work/ExplorationBadge';
import { caseHref } from '@/components/work/labels';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/content/load';
import { SceneHead } from './SceneHead';

/** Scene 04 « Laboratoire »: the explorations, always labelled as proposals (spec §4.1, owner rule 11). */
export function Lab({ projects }: { projects: Project[] }) {
  const t = useTranslations('dna.lab');
  return (
    <section
      id="laboratoire"
      data-dna-scene="lab"
      data-dna-state="4"
      aria-labelledby="lab-title"
      className="relative z-10 mx-auto max-w-[1280px] px-5 py-[16vh] md:px-10"
    >
      <Reveal className="lg:max-w-[56%]">
        <SceneHead id="lab-title" kicker={t('kicker')} title={t('title')} intro={t('intro')} />
        <ol className="mt-14 border-t border-line">
          {projects.map((p, i) => (
            <li key={p.slug} data-dna-focus={i} data-reveal className="group relative border-b border-line py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h3 className="font-display text-[clamp(24px,2.4vw,32px)] font-extrabold uppercase leading-none tracking-[-0.02em]">
                  <Link
                    href={caseHref(p)}
                    className="no-underline transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-signal"
                  >
                    {p.title}
                  </Link>
                </h3>
                <span className="font-mono text-[11.5px] text-faint">{p.year}</span>
              </div>
              <ExplorationBadge proposal={p.proposal} className="mt-4" />
              <p className="mt-4 max-w-[56ch] text-[15.5px] leading-[1.65] text-muted">{p.summary}</p>
            </li>
          ))}
        </ol>
        <Link
          href="/explorations"
          data-reveal
          className="mt-12 inline-flex border-b border-edge pb-1 font-mono text-[12px] uppercase tracking-[0.12em] text-ivory no-underline transition-colors hover:border-signal hover:text-signal"
        >
          {t('all')}
        </Link>
      </Reveal>
    </section>
  );
}
