import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/content/load';
import { caseHref } from './labels';

type Props = { kind: Project['kind']; prev: Project | null; next: Project | null };

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"
         className={`transition-transform ${back ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
      <path d={back ? 'M12 7H2M6 3 2 7l4 4' : 'M2 7h10M8 3l4 4-4 4'} fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Previous / next case study, in the order of the index page. */
export function CaseNav({ kind, prev, next }: Props) {
  const t = useTranslations(kind === 'exploration' ? 'explorations' : 'caseStudy');
  if (!prev && !next) return null;
  const cell = 'group flex flex-col gap-4 py-10 no-underline md:py-14';
  return (
    <nav aria-label={t('nav')} className="mx-auto max-w-[1280px] px-5 md:px-10">
      <div className="grid border-t border-line md:grid-cols-2">
        {prev ? (
          <Link href={caseHref(prev)} className={`${cell} md:border-r md:border-line md:pr-10`}>
            <span className="flex items-center gap-2.5 font-mono text-xs text-faint transition-colors group-hover:text-signal">
              <Arrow back />
              {t('prev')}
            </span>
            <span className="font-display text-[clamp(32px,3.4vw,48px)] font-medium leading-[1.02] transition-colors group-hover:text-signal">{prev.title}</span>
            {prev.sector && <span className="font-mono text-xs uppercase tracking-[0.1em] text-faint">{prev.sector}</span>}
          </Link>
        ) : (
          <span className="hidden md:block" />
        )}
        {next && (
          <Link href={caseHref(next)} className={`${cell} ${prev ? 'border-t border-line' : ''} md:items-end md:border-t-0 md:pl-10 md:text-right`}>
            <span className="flex items-center gap-2.5 font-mono text-xs text-faint transition-colors group-hover:text-signal">
              {t('next')}
              <Arrow />
            </span>
            <span className="font-display text-[clamp(32px,3.4vw,48px)] font-medium leading-[1.02] transition-colors group-hover:text-signal">{next.title}</span>
            {next.sector && <span className="font-mono text-xs uppercase tracking-[0.1em] text-faint">{next.sector}</span>}
          </Link>
        )}
      </div>
    </nav>
  );
}
