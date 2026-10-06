import { describe, expect, it } from 'vitest';
import { checkOwnerRules, type RuleId } from '../../tools/owner-rules';

const page = (body: string, head = '<link rel="icon" href="/favicon.svg">') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;
const rules = (files: { path: string; content: string }[]): RuleId[] =>
  checkOwnerRules(files).map((v) => v.rule);
const purple = (files: { path: string; content: string }[]): RuleId[] => rules(files).filter((r) => r === 'purple-gradient');

describe('checkOwnerRules', () => {
  it('passes a clean page and stylesheet', () => {
    expect(rules([
      { path: 'index.html', content: page('<p>Six years, © 2026 Rostel.</p>') },
      { path: 'a.css', content: '.btn{border-radius:2px}.avatar{border-radius:50%}.wall::before{background:radial-gradient(ellipse, rgba(255,90,31,.2), transparent)}' },
    ])).toEqual([]);
  });

  it('flags an em dash in visible text but not inside scripts or styles', () => {
    expect(rules([{ path: 'a.html', content: page('<p>Lead — engineer</p>') }])).toEqual(['em-dash']);
    expect(rules([{ path: 'a.html', content: page('<script>const a = "—"</script>') }])).toEqual([]);
  });

  it('flags em dash written as an HTML entity', () => {
    for (const entity of ['&mdash;', '&MDASH;', '&#8212;', '&#x2014;', '&#X2014;']) {
      expect(rules([{ path: 'a.html', content: page(`<p>Lead ${entity} engineer</p>`) }]), entity).toEqual(['em-dash']);
    }
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
    expect(purple([{ path: 'a.css', content: '.h{background:linear-gradient(90deg,#7c3aed,#db2777)}' }])).toEqual(['purple-gradient']);
    expect(purple([{ path: 'a.css', content: '.h{background:linear-gradient(rgb(139, 92, 246), #000)}' }])).toEqual(['purple-gradient']);
    expect(purple([{ path: 'a.css', content: '.h{background:linear-gradient(#e3bd74,#0e0d0c)}' }])).toEqual([]);
    expect(purple([{ path: 'a.css', content: '.h{background:linear-gradient(hsl(270 80% 60%), #000)}' }])).toEqual(['purple-gradient']);
    expect(purple([{ path: 'a.css', content: '.h{background:linear-gradient(oklch(0.55 0.25 295), #000)}' }])).toEqual(['purple-gradient']);
    expect(purple([{ path: 'a.css', content: '.h{background:linear-gradient(var(--color-violet-500), transparent)}' }])).toEqual(['purple-gradient']);
    expect(purple([{ path: 'a.css', content: '.h{background:linear-gradient(oklch(0.8 0.08 85), #000)}' }])).toEqual([]);
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

  it('requires the privacy policy and the terms in both languages when given the build paths', () => {
    const built = ['.next/server/app/fr/confidentialite.html', '.next\\server\\app\\fr\\cgu.html', 'x/en/confidentialite.html', 'x/en/cgu.html'];
    expect(checkOwnerRules([], built)).toEqual([]);
    // The public English slugs are accepted too.
    expect(checkOwnerRules([], ['fr/confidentialite.html', 'fr/cgu.html', 'en/privacy.html', 'en/terms.html'])).toEqual([]);
    const missing = checkOwnerRules([], ['fr/confidentialite.html', 'en/confidentialite.html', 'en/cgu.html', 'fr/cgu.txt']);
    expect(missing.map((v) => [v.rule, v.path])).toEqual([['required-page', 'fr/cgu.html']]);
    // An English page never stands in for the French one.
    expect(checkOwnerRules([], ['en/confidentialite.html', 'en/cgu.html']).map((v) => v.path)).toEqual(['fr/confidentialite.html', 'fr/cgu.html']);
    // Without the build paths, the rule is not checked.
    expect(checkOwnerRules([])).toEqual([]);
  });

  it('reports the file path and an excerpt', () => {
    const [v] = checkOwnerRules([{ path: 'fr/index.html', content: page('<p>Lead — engineer</p>') }]);
    expect(v.path).toBe('fr/index.html');
    expect(v.detail).toContain('Lead');
  });
});

describe('single-accent', () => {
  const css = (content: string) => checkOwnerRules([{ path: 'app.css', content }]).filter((v) => v.rule === 'single-accent');
  it('accepts the signal orange, its dark print variant and greys', () => {
    expect(css('a{color:#ff5a1f}b{color:#b23a0e}c{color:#edeae4;background:#121211;border-color:#6b6964}')).toEqual([]);
  });
  it('flags any other saturated colour (hex, rgb, hsl, oklch)', () => {
    expect(css('a{color:#3b82f6}')).toHaveLength(1);
    expect(css('a{color:rgb(34,197,94)}')).toHaveLength(1);
    expect(css('a{color:hsl(200 80% 50%)}')).toHaveLength(1);
    expect(css('a{color:oklch(0.62 0.19 260)}')).toHaveLength(1);
  });
  it('ignores near-black, near-white and transparent values', () => {
    expect(css('a{color:#0000;background:#fff;border-color:#000}')).toEqual([]);
  });
});

describe('fake-status', () => {
  const html = (body: string) =>
    checkOwnerRules([{ path: 'index.html', content: `<link rel="icon" href="/favicon.ico"><body>${body}</body>` }]).filter((v) => v.rule === 'fake-status');
  it('flags mission-control style fake statuses', () => {
    expect(html('<p>SYSTEM STATUS 100%</p>')).toHaveLength(1);
    expect(html('<button>Enter system</button>')).toHaveLength(1);
    expect(html('<p>Identity confirmed.</p>')).toHaveLength(1);
  });
  it('accepts normal copy', () => {
    expect(html('<p>Ubbfy, système de gestion en production.</p>')).toEqual([]);
  });
});
