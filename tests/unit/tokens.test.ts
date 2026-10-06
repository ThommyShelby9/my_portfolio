import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/globals.css', 'utf8');
const token = (name: string): string => {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --color-${name} missing`);
  return m[1];
};
const lum = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe('Instrument tokens', () => {
  it('declares the spec values', () => {
    expect(token('graphite').toLowerCase()).toBe('#121211');
    expect(token('graphite-2').toLowerCase()).toBe('#1a1a18');
    expect(token('ivory').toLowerCase()).toBe('#edeae4');
    expect(token('signal').toLowerCase()).toBe('#ff5a1f');
    expect(token('muted').toLowerCase()).toBe('#a8a59e');
    expect(token('faint').toLowerCase()).toBe('#8b8984');
    expect(token('line').toLowerCase()).toBe('#2a2a27');
    expect(token('edge').toLowerCase()).toBe('#6b6964');
  });
  it.each(['graphite', 'graphite-2'])('text tokens reach WCAG AA on %s', (bg) => {
    expect(ratio(token('ivory'), token(bg))).toBeGreaterThanOrEqual(7);
    for (const t of ['signal', 'muted', 'faint']) expect(ratio(token(t), token(bg))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(token('edge'), token(bg))).toBeGreaterThanOrEqual(3);
  });
  it('keeps no v6 token', () => {
    expect(css).not.toMatch(/--color-(obsidian|champagne)/);
  });
});
