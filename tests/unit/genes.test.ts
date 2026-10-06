import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { BUILD_STEPS, GENE_LABEL, GENES, PAIR_COPY } from '@/lib/dna/genes';

const ROOT = path.resolve(__dirname, '../../content');

describe('project genes', () => {
  for (const kind of ['realisations', 'explorations']) {
    it(`${kind}: every project has the same genes in FR and EN`, () => {
      for (const file of readdirSync(path.join(ROOT, kind, 'fr'))) {
        const fr = matter(readFileSync(path.join(ROOT, kind, 'fr', file), 'utf8')).data.genes;
        const en = matter(readFileSync(path.join(ROOT, kind, 'en', file), 'utf8')).data.genes;
        expect(en, file).toEqual(fr);
      }
    });
  }
});

describe('gene copy', () => {
  const texts = (['fr', 'en'] as const).flatMap((l) => [
    ...Object.values(GENE_LABEL[l]),
    ...PAIR_COPY[l].flatMap((p) => [p.statement, ...p.proofs]),
    ...BUILD_STEPS[l].flatMap((s) => [s.name, s.text]),
  ]);

  it('labels every gene in both locales', () => {
    for (const l of ['fr', 'en'] as const) expect(Object.keys(GENE_LABEL[l]).sort()).toEqual([...GENES].sort());
  });

  it('has three pairs with proofs and five construction steps per locale', () => {
    for (const l of ['fr', 'en'] as const) {
      expect(PAIR_COPY[l]).toHaveLength(3);
      for (const p of PAIR_COPY[l]) expect(p.proofs.length).toBeGreaterThanOrEqual(2);
      expect(BUILD_STEPS[l]).toHaveLength(5);
    }
  });

  it('never uses an em dash', () => {
    for (const t of texts) expect(t).not.toContain('—');
  });

  it('follows French typography (curly apostrophe, no-break space before : ; ? !)', () => {
    const fr = [...PAIR_COPY.fr.flatMap((p) => [p.statement, ...p.proofs]), ...BUILD_STEPS.fr.flatMap((s) => [s.name, s.text])];
    for (const t of fr) {
      expect(t, t).not.toMatch(/'/);
      expect(t, t).not.toMatch(/ [:;?!]/);
    }
  });

  it('keeps the confirmed metrics only', () => {
    const all = texts.join(' ');
    for (const m of all.match(/[−+-]?\d[\d  ]*\s?%|\d+ mises à jour|\d+ regulatory/g) ?? []) {
      expect(['−85 %', '85 %', '3 mises à jour', '3 regulatory']).toContain(m.trim());
    }
  });
});
