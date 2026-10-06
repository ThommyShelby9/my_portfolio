import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@/lib/content/markdown';
import { isResultSection, splitProof, splitSections } from '@/lib/content/present';

describe('splitSections', () => {
  it('splits rendered markdown at h2 and keeps the intro', () => {
    const { html } = renderMarkdown('Intro *texte*.\n\n## Les enjeux\n\nUn.\n\n## Résultat\n\n- a\n- b\n');
    const { intro, sections } = splitSections(html);
    expect(intro).toBe('<p>Intro <em>texte</em>.</p>');
    expect(sections.map((s) => s.id)).toEqual(['les-enjeux', 'resultat']);
    expect(sections[0]).toMatchObject({ headingHtml: 'Les enjeux', html: '<p>Un.</p>' });
    expect(sections[1].html).toContain('<li>a</li>');
    expect(sections[1].html).not.toContain('<h2');
  });

  it('returns everything as intro when there is no h2', () => {
    expect(splitSections('<p>x</p>\n')).toEqual({ intro: '<p>x</p>', sections: [] });
  });

  it('recognises the closing section in both locales', () => {
    expect(isResultSection('resultat')).toBe(true);
    expect(isResultSection('outcome')).toBe(true);
    expect(isResultSection('les-enjeux')).toBe(false);
  });
});

describe('splitProof', () => {
  it('lifts a leading figure out of the sentence', () => {
    expect(splitProof('+240 % de trafic organique en six mois')).toEqual({ figure: '+240 %', caption: 'de trafic organique en six mois' });
    expect(splitProof('−85% manual data entry')).toEqual({ figure: '−85%', caption: 'manual data entry' });
    expect(splitProof('1 200+ utilisateurs actifs en six mois')).toEqual({ figure: '1 200+', caption: 'utilisateurs actifs en six mois' });
    expect(splitProof('1,200+ active users')).toEqual({ figure: '1,200+', caption: 'active users' });
  });

  it('keeps the whole sentence when the figure is not first', () => {
    expect(splitProof('Score SEO Lighthouse de 100')).toEqual({ figure: '100', caption: 'Score SEO Lighthouse de 100' });
  });

  it('has no figure when the sentence has no number', () => {
    expect(splitProof('Aucune régression')).toEqual({ figure: null, caption: 'Aucune régression' });
  });
});
