export type RuleId = 'em-dash' | 'emoji' | 'pill' | 'purple-gradient' | 'ai-tag' | 'favicon' | 'custom-cursor';
export interface SourceFile { path: string; content: string }
export interface Violation { rule: RuleId; path: string; detail: string }

// Extended_Pictographic includes ©, ® and ™, which are legitimate typography.
const ALLOWED_PICTOGRAPHS = new Set([0x00a9, 0x00ae, 0x2122]);
const AI_TAG = /made with ai|generated (?:by|with) ai|built with (?:ai|lovable|v0|bolt|framer|webflow|wix)/i;

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function excerpt(text: string, index: number): string {
  return text.slice(Math.max(0, index - 30), index + 30).replace(/\s+/g, ' ').trim();
}

function cssOf(file: SourceFile): string {
  if (file.path.endsWith('.css')) return file.content;
  if (!file.path.endsWith('.html')) return '';
  const tags = [...file.content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
  const attrs = [...file.content.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)].map((m) => m[1]);
  return [...tags, ...attrs].join('\n');
}

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h.slice(0, 3)].map((c) => c + c).join('');
  if (h.length !== 6 && h.length !== 8) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function isPurpleHsl(h: number, s: number, l: number): boolean {
  return h >= 250 && h <= 320 && s >= 0.25 && l >= 0.15 && l <= 0.9;
}

function isPurple([r, g, b]: [number, number, number]): boolean {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return false;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = (h * 60 + 360) % 360;
  return isPurpleHsl(h, s, l);
}

/** True when a gradient argument list contains a purple stop (hex, rgb, hsl, oklch or a named purple token). */
function hasPurpleStop(args: string): boolean {
  for (const m of args.matchAll(/#[0-9a-f]{3,8}\b/gi)) {
    const rgb = hexToRgb(m[0]);
    if (rgb && isPurple(rgb)) return true;
  }
  for (const m of args.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/gi)) {
    if (isPurple([Number(m[1]), Number(m[2]), Number(m[3])])) return true;
  }
  for (const m of args.matchAll(/hsla?\(\s*(-?[\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/gi)) {
    if (isPurpleHsl(((Number(m[1]) % 360) + 360) % 360, Number(m[2]) / 100, Number(m[3]) / 100)) return true;
  }
  for (const m of args.matchAll(/oklch\(\s*[\d.]+%?\s+([\d.]+)\s+(-?[\d.]+)(?:deg)?/gi)) {
    const h = ((Number(m[2]) % 360) + 360) % 360;
    if (Number(m[1]) >= 0.08 && h >= 270 && h <= 330) return true;
  }
  return /var\(\s*--color-(?:purple|violet|fuchsia)-/i.test(args);
}

function isPillRadius(value: string): boolean {
  if (/infinity|var\(\s*--radius-full|9999/i.test(value)) return true;
  for (const m of value.matchAll(/(\d+(?:\.\d+)?)(px|rem|em)/g)) {
    const n = Number(m[1]);
    if ((m[2] === 'px' && n >= 100) || (m[2] !== 'px' && n >= 6)) return true;
  }
  return false;
}

export function checkOwnerRules(files: SourceFile[]): Violation[] {
  const violations: Violation[] = [];
  const add = (rule: RuleId, path: string, detail: string) => violations.push({ rule, path, detail });

  for (const file of files) {
    if (file.path.endsWith('.html')) {
      const text = visibleText(file.content);
      const dash = text.indexOf('—');
      if (dash !== -1) add('em-dash', file.path, excerpt(text, dash));

      for (const m of text.matchAll(/\p{Extended_Pictographic}/gu)) {
        if (!ALLOWED_PICTOGRAPHS.has(m[0].codePointAt(0)!)) {
          add('emoji', file.path, excerpt(text, m.index ?? 0));
          break;
        }
      }

      const tag = text.match(AI_TAG);
      if (tag) add('ai-tag', file.path, tag[0]);

      if (!/<link\b[^>]*\brel\s*=\s*["'](?:shortcut )?icon["']/i.test(file.content)) {
        add('favicon', file.path, 'no <link rel="icon"> in the document');
      }
    }

    const css = cssOf(file);
    if (!css) continue;

    for (const m of css.matchAll(/border(?:-[a-z]+){0,2}-radius\s*:\s*([^;}"]+)/gi)) {
      if (isPillRadius(m[1])) {
        add('pill', file.path, m[0].trim());
        break;
      }
    }

    for (const m of css.matchAll(/(?:linear|radial|conic)-gradient\(([^;{}]*)\)/gi)) {
      if (hasPurpleStop(m[1])) {
        add('purple-gradient', file.path, m[0].slice(0, 80));
        break;
      }
    }

    const cursor = css.match(/cursor\s*:\s*url\(/i);
    if (cursor) add('custom-cursor', file.path, cursor[0]);
  }
  return violations;
}
