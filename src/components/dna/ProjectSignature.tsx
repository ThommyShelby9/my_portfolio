import type { Gene } from '@/lib/dna/genes';
import { signaturePath } from '@/lib/dna/signature';

type Props = { genes: readonly Gene[]; size?: number; className?: string };

/** A project's DNA signature as a static SVG (spec §3.5): the same curve as its ring in scene 03. */
export function ProjectSignature({ genes, size = 96, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      data-signature={genes.join(' ')}
      className={className}
    >
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.6" />
      <path d={signaturePath(genes, 100)} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="1.6" className="fill-signal" />
    </svg>
  );
}
