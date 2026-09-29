import { extractNumbers } from './metrics';

export type BodySection = { id: string; headingHtml: string; html: string };

/** Heading ids of the closing section, where the proofs band belongs (FR, EN). */
const RESULT_IDS = new Set(['resultat', 'outcome']);

export const isResultSection = (id: string) => RESULT_IDS.has(id);

/**
 * Splits rendered case-study HTML at its h2 headings (as emitted by renderMarkdown:
 * `<h2 id="...">...</h2>`), so each section can be laid out and numbered on its own.
 * `intro` is whatever comes before the first h2.
 */
export function splitSections(html: string): { intro: string; sections: BodySection[] } {
  const re = /<h2 id="([^"]+)">([\s\S]*?)<\/h2>\n?/g;
  const matches = [...html.matchAll(re)];
  if (matches.length === 0) return { intro: html.trim(), sections: [] };
  const intro = html.slice(0, matches[0].index).trim();
  const sections = matches.map((m, i) => {
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : html.length;
    return { id: m[1], headingHtml: m[2], html: html.slice(start, end).trim() };
  });
  return { intro, sections };
}

/**
 * Splits a proof sentence into its headline figure and the words around it:
 * "+240 % de trafic organique" -> { figure: "+240 %", caption: "de trafic organique" }.
 * When the figure is not at the start, the caption keeps the whole sentence.
 */
export function splitProof(text: string): { figure: string | null; caption: string } {
  const first = extractNumbers(text)[0];
  if (!first) return { figure: null, caption: text };
  const t = text.trim();
  if (t.startsWith(first.raw)) return { figure: first.raw, caption: t.slice(first.raw.length).trim() };
  return { figure: first.raw, caption: t };
}
