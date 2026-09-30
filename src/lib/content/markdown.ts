import { Marked, type Tokens } from 'marked';

export type Heading = { id: string; text: string };

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type InlineParser = { parser: { parseInline: (t: Tokens.Generic[]) => string } };

type InlineToken = { type: string; text?: string; tokens?: InlineToken[] };

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };

/** The visible text of inline tokens, without markdown syntax (emphasis, code, links): for tables of contents. */
function plainText(tokens: InlineToken[]): string {
  const walk = (list: InlineToken[]): string =>
    list.map((t) => (t.tokens ? walk(t.tokens) : t.type === 'br' ? ' ' : (t.text ?? ''))).join('');
  return walk(tokens)
    .replace(/&(amp|lt|gt|quot|#39);/g, (_, name: string) => ENTITIES[name])
    .replace(/\s+/g, ' ')
    .trim();
}

export function renderMarkdown(md: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();
  const marked = new Marked({ gfm: true, async: false });
  marked.use({
    renderer: {
      // Raw HTML is never allowed: it is rendered as visible escaped text.
      html(token: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(token.text);
      },
      heading(this: InlineParser, token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        if (token.depth !== 2) return `<h${token.depth}>${inner}</h${token.depth}>\n`;
        const text = plainText(token.tokens as InlineToken[]);
        const base = slugify(text) || 'section';
        let id = base;
        for (let i = 2; used.has(id); i++) id = `${base}-${i}`;
        used.add(id);
        headings.push({ id, text });
        return `<h2 id="${id}">${inner}</h2>\n`;
      },
      // Gallery images come from the frontmatter only, so a body image is a content mistake.
      image(token: Tokens.Image): string {
        throw new Error(`Markdown images are not allowed (${token.href}): declare gallery images in the frontmatter.`);
      },
      link(this: InlineParser, token: Tokens.Link) {
        const inner = this.parser.parseInline(token.tokens);
        const href = token.href;
        if (!/^(https?:|\/|#|mailto:)/i.test(href)) return inner;
        // `//host` is protocol-relative, hence external: only a single leading slash (not followed by / or \) is internal.
        const external = !/^(\/(?![\/\\])|#|mailto:)/i.test(href);
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        return `<a href="${escapeHtml(href)}"${title}${external ? ' rel="noopener"' : ''}>${inner}</a>`;
      },
    },
  });
  const html = marked.parse(md) as string;
  return { html, headings };
}
