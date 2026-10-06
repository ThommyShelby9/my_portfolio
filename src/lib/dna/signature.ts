import { GENES, type Gene } from './genes';

/**
 * Radius multiplier of a project's DNA signature at angle `theta` (spec §3.5): a closed rose curve
 * with one harmonic per gene, normalised to stay within [0.68, 1.32]. The same function draws the
 * particles of scene 03 and the SVG on cards, case headers and share images.
 */
export function signatureRadius(genes: readonly Gene[], theta: number): number {
  if (genes.length === 0) return 1;
  let sum = 0;
  for (const g of genes) {
    const i = GENES.indexOf(g);
    sum += Math.cos((i + 2) * theta + i * 0.7);
  }
  return 1 + (0.32 * sum) / genes.length;
}

/** Closed SVG path of the signature in a `size` × `size` box (centre at size / 2). */
export function signaturePath(genes: readonly Gene[], size = 100, steps = 240): string {
  const c = size / 2;
  const base = size * 0.34;
  const parts: string[] = [];
  for (let k = 0; k < steps; k++) {
    const t = (k / steps) * Math.PI * 2;
    const r = base * signatureRadius(genes, t);
    parts.push(`${k === 0 ? 'M' : 'L'}${(c + Math.cos(t) * r).toFixed(2)} ${(c + Math.sin(t) * r).toFixed(2)}`);
  }
  return `${parts.join(' ')} Z`;
}
