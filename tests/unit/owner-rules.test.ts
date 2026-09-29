import { describe, expect, it } from 'vitest';
import { checkOwnerRules, type RuleId } from '../../tools/owner-rules';

const page = (body: string, head = '<link rel="icon" href="/favicon.svg">') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;
const rules = (files: { path: string; content: string }[]): RuleId[] =>
  checkOwnerRules(files).map((v) => v.rule);

describe('checkOwnerRules', () => {
  it('passes a clean page and stylesheet', () => {
    expect(rules([
      { path: 'index.html', content: page('<p>Six years, © 2026 Rostel.</p>') },
      { path: 'a.css', content: '.btn{border-radius:2px}.avatar{border-radius:50%}.wall::before{background:radial-gradient(ellipse, rgba(255,228,178,.2), transparent)}' },
    ])).toEqual([]);
  });

  it('flags an em dash in visible text but not inside scripts or styles', () => {
    expect(rules([{ path: 'a.html', content: page('<p>Lead — engineer</p>') }])).toEqual(['em-dash']);
    expect(rules([{ path: 'a.html', content: page('<script>const a = "—"</script>') }])).toEqual([]);
  });

  it('flags emoji used in the page', () => {
    expect(rules([{ path: 'a.html', content: page('<span>\u{1F4C1} Projects</span>') }])).toEqual(['emoji']);
  });

  it('flags pill-shaped radii in CSS files, style tags and style attributes', () => {
    expect(rules([{ path: 'a.css', content: '.cta{border-radius:9999px}' }])).toEqual(['pill']);
    expect(rules([{ path: 'a.html', content: page('<style>.c{border-radius: 40rem}</style>') }])).toEqual(['pill']);
    expect(rules([{ path: 'a.html', content: page('<a style="border-radius:100px">x</a>') }])).toEqual(['pill']);
  });

  it('flags pill radii written as infinity, tokens, longhands', () => {
    expect(rules([{ path: 'a.css', content: '.a{border-radius:calc(infinity * 1px)}' }])).toEqual(['pill']);
    expect(rules([{ path: 'a.css', content: '.a{border-radius:var(--radius-full)}' }])).toEqual(['pill']);
    expect(rules([{ path: 'a.css', content: '.a{border-top-left-radius:9999px}' }])).toEqual(['pill']);
    expect(rules([{ path: 'a.css', content: '.a{border-radius:50%}' }])).toEqual([]);
    expect(rules([{ path: 'a.css', content: '.a{border-radius:2px}' }])).toEqual([]);
  });

  it('flags purple gradients in hex, rgb, hsl, oklch and named purple tokens', () => {
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(90deg,#7c3aed,#db2777)}' }])).toEqual(['purple-gradient']);
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(rgb(139, 92, 246), #000)}' }])).toEqual(['purple-gradient']);
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(#e3bd74,#0e0d0c)}' }])).toEqual([]);
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(hsl(270 80% 60%), #000)}' }])).toEqual(['purple-gradient']);
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(oklch(0.55 0.25 295), #000)}' }])).toEqual(['purple-gradient']);
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(var(--color-violet-500), transparent)}' }])).toEqual(['purple-gradient']);
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(oklch(0.8 0.08 85), #000)}' }])).toEqual([]);
  });

  it('flags AI or builder tags', () => {
    expect(rules([{ path: 'a.html', content: page('<footer>Made with AI</footer>') }])).toEqual(['ai-tag']);
    expect(rules([{ path: 'a.html', content: page('<footer>Built with Lovable</footer>') }])).toEqual(['ai-tag']);
  });

  it('flags an HTML page without a favicon link', () => {
    expect(rules([{ path: 'a.html', content: page('<p>ok</p>', '') }])).toEqual(['favicon']);
  });

  it('flags a custom cursor image but allows pointer and default cursors', () => {
    expect(rules([{ path: 'a.css', content: 'body{cursor:url(/c.png) 4 4, auto}' }])).toEqual(['custom-cursor']);
    expect(rules([{ path: 'a.css', content: '.btn{cursor:pointer}.x{cursor:default}' }])).toEqual([]);
  });

  it('reports the file path and an excerpt', () => {
    const [v] = checkOwnerRules([{ path: 'fr/index.html', content: page('<p>Lead — engineer</p>') }]);
    expect(v.path).toBe('fr/index.html');
    expect(v.detail).toContain('Lead');
  });
});
