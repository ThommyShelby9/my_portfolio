import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/content/load';
import { ExplorationBadge } from './ExplorationBadge';
import { NO_IMAGE_KEY, STATUS_KEY, caseHref, coverOf } from './labels';
import { WorkVisual } from './WorkVisual';

type Props = { project: Project; index: number; headingLevel?: 2 | 3 };

/**
 * Grid card for /realisations and /explorations. The whole card is clickable through the
 * title link (stretched with ::after), so the accessible name stays the project name.
 */
export function WorkCard({ project: p, index, headingLevel = 3 }: Props) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const t = useTranslations('caseStudy');
  const w = useTranslations('work');
  const cover = coverOf(p);
  return (
    <article data-reveal data-work-card className="group relative flex flex-col">
      <WorkVisual
        image={cover}
        name={p.title}
        sector={p.sector}
        note={t(NO_IMAGE_KEY[p.status])}
        sizes="(min-width: 1280px) 590px, (min-width: 768px) 48vw, 100vw"
      />
      <div className="mt-6 flex items-baseline justify-between gap-4 font-mono text-xs text-faint">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>
          {p.year} · {t(STATUS_KEY[p.status])}
        </span>
      </div>
      {p.kind === 'exploration' && <ExplorationBadge proposal={p.proposal} className="mt-5 self-start" />}
      <Heading className="mt-4 font-serif text-[clamp(30px,2.6vw,38px)] font-medium leading-[1.05]">
        <Link
          href={caseHref(p)}
          className="no-underline transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:text-champagne"
        >
          {p.title}
        </Link>
      </Heading>
      {p.sector && <p className="mt-2.5 font-mono text-xs font-medium uppercase tracking-[0.1em] text-champagne">{p.sector}</p>}
      <p className="mt-4 text-[13px] text-faint">
        <strong className="font-medium text-ivory">{p.role}</strong>
      </p>
      <p className="mt-3 max-w-[54ch] text-[15px] leading-[1.7] text-muted">{p.summary}</p>
      {p.coauthors.length > 0 && (
        <p className="mt-3 text-[13px] text-muted">
          {w('coBuilt')} <strong className="font-medium text-ivory">{p.coauthors.join(', ')}</strong>
        </p>
      )}
      <p className="mt-4 font-mono text-xs leading-[1.7] text-faint">{p.stack.slice(0, 4).join(' · ')}</p>
    </article>
  );
}
