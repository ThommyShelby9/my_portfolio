import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/content/load';
import { ExplorationBadge } from './ExplorationBadge';
import { STATUS_KEY } from './labels';

const hero = (i: number) => ({ '--hero-i': i }) as CSSProperties;

function Item({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-full' : ''}>
      <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{label}</dt>
      <dd className="mt-2.5 text-[14.5px] leading-[1.6] text-ivory">{children}</dd>
    </div>
  );
}

/** Case-study opening: back link, sector, title, summary and the project facts. */
export function CaseHeader({ project: p }: { project: Project }) {
  const t = useTranslations('caseStudy');
  const w = useTranslations('work');
  const x = useTranslations('explorations');
  const isExploration = p.kind === 'exploration';
  return (
    <header className="mx-auto max-w-[1280px] px-5 pt-[6vh] md:px-10 lg:pt-[8vh]">
      <Link
        href={isExploration ? '/explorations' : '/realisations'}
        className="group inline-flex items-center gap-2.5 font-mono text-xs text-faint no-underline transition-colors hover:text-signal"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false" className="transition-transform group-hover:-translate-x-0.5">
          <path d="M12 7H2M6 3 2 7l4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        {isExploration ? x('back') : t('back')}
      </Link>
      <div className="mt-[7vh] lg:mt-[9vh]">
        {isExploration && (
          <div data-hero style={hero(0)} className="mb-7">
            <ExplorationBadge proposal={p.proposal} />
          </div>
        )}
        {p.sector && (
          <p data-hero style={hero(0)} className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">
            {p.sector}
          </p>
        )}
        <h1 data-hero style={hero(1)} className="mt-5 max-w-[16ch] font-display text-[clamp(52px,8vw,120px)] font-medium leading-[0.95] tracking-[-0.02em]">
          {p.title}
        </h1>
        <p data-hero style={hero(2)} className="mt-8 max-w-[58ch] text-[17.5px] leading-[1.7] text-muted">
          {p.summary}
        </p>
      </div>
      <dl data-hero style={hero(3)} className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-9 lg:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        <Item label={t('role')}>{p.role}</Item>
        {p.team && <Item label={t('team')}>{p.team}</Item>}
        {p.coauthors.length > 0 && <Item label={w('coBuilt')}>{p.coauthors.join(', ')}</Item>}
        {p.client && <Item label={t('client')}>{p.client}</Item>}
        <Item label={t('year')}>
          {p.year}
          {p.duration && <span className="text-muted"> · {p.duration}</span>}
        </Item>
        <Item label={t('status')}>
          {t(STATUS_KEY[p.status])}
          {p.liveUrl && (
            <>
              {' · '}
              <a
                href={p.liveUrl}
                rel="noopener"
                className="whitespace-nowrap border-b border-edge pb-0.5 no-underline transition-colors hover:border-signal hover:text-signal"
              >
                {t('visit')}
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false" className="ml-1.5 inline-block align-[1px]">
                  <path d="M2.5 7.5 7.5 2.5M3.5 2.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </a>
            </>
          )}
        </Item>
        <Item label={t('stack')} wide>
          <span className="font-mono text-[13px] leading-[1.9] text-muted">{p.stack.join(' · ')}</span>
        </Item>
      </dl>
    </header>
  );
}
