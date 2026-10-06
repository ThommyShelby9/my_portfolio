import { useTranslations } from 'next-intl';
import type { Proposal } from '@/lib/content/schema';

/** States plainly that an exploration is a redesign proposal, not client work. */
export function ExplorationBadge({ proposal = 'unsolicited', className = '' }: { proposal?: Proposal; className?: string }) {
  const t = useTranslations('explorations');
  return (
    <p
      data-exploration-badge
      className={`inline-flex items-center gap-2.5 border border-[#3a3936] px-3 py-2 font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-ivory ${className}`}
    >
      <span aria-hidden="true" className="inline-block size-[6px] shrink-0 bg-signal" />
      {proposal === 'pitched' ? t('badgePitched') : t('badgeUnsolicited')}
    </p>
  );
}
