# Portfolio v7 « Digital DNA », Lot 1 : fondations, scène ADN et scène 00 : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the whole site to the « Instrument » art direction (graphite, ivory, signal orange, Archivo + IBM Plex Mono), replace the Möbius sculpture with a real-time particle DNA helix (poster fallback, WebGL detection, error boundary, pause), and rebuild the home hero as scene 00 « Formation ».

**Architecture:** Tokens are renamed once with a throwaway codemod so every existing page immediately renders in the new palette (pages are redesigned in Lots 2-3). The helix geometry is pure, deterministic TypeScript in `src/lib/dna/` (unit-tested); the R3F scene in `src/components/dna/` only uploads precomputed `Float32Array` attributes to a custom `ShaderMaterial`. The stage keeps the v6 contract: poster first, 3D mounted after idle, never in the initial JS.

**Tech Stack:** Next.js 16.3.7 (App Router, standalone), React 19, next-intl 4, Tailwind CSS 4 (`@theme inline`), three 0.186 + @react-three/fiber 9, Vitest 5, Playwright 1.63 + axe.

**Spec:** `docs/superpowers/specs/2026-10-06-portfolio-v7-digital-dna-design.md` (read §2, §3, §4.1 scene 00, §5, §7, §8). Previous spec for everything kept: `docs/superpowers/specs/2026-09-29-portfolio-v6-visionary-engineer-design.md`.

## Global Constraints

- Branch `v7` (created from `v6`). Never touch `main`. Never push.
- Tokens (spec §3.2): `--color-graphite #121211` (background), `--color-graphite-2 #1A1A18` (surfaces), `--color-ivory #EDEAE4`, `--color-signal #FF5A1F` (the ONLY saturated accent), `--color-muted #A8A59E`, `--color-faint #8B8984`, `--color-line #2A2A27` (never text), `--color-edge #6B6964` (control borders, never text).
- Fonts (spec §3.3): Archivo (display: weight 800, uppercase, tracking −0.02 to −0.03em; body: 400) and IBM Plex Mono (eyebrows, scene numbers, metadata), both through `next/font/google`.
- Owner rules (spec §2): no em dash (—) in any user-visible text; FR text uses `’` and a no-break space U+00A0 before `: ; ? !` (enforced by `tests/unit/messages.test.ts`); no emoji icons; every control radius ≤ 2 px; no purple; no fake metric or status; no custom cursor or pointer follower (a few degrees of helix tilt on fine pointers is allowed); everything still under `prefers-reduced-motion: reduce`.
- Honesty rules: ContractIQ is co-built with Jérémie Zitti; explorations are proposals; never Skilluv; confirmed metrics only (CCNS +240 % organic in 6 months and Lighthouse SEO 100; TadagbeRhPlus −85 % manual entry and 3 CNSS updates with 0 regressions; ZenLife 1 200+ active users in 6 months).
- Owner facts: Rostel Panoumassi, Head of Engineering & Innovation at KPS Groupe, Cotonou (UTC+1), 6 years of experience, 3 as tech lead.
- Budget: initial JS for `/` ≤ 160 KB gzip (`tests/dist/bundle.dist.test.ts`); three, @react-three/fiber and gsap never in the initial JS.
- Client components receive their strings as props (`NextIntlClientProvider messages={null}`); never `useTranslations` in a `'use client'` file.
- Verification commands: `pnpm test`, `pnpm build`, `pnpm lint:rules` (after a build), `PW_PORT=3111 pnpm test:e2e`. If Playwright reports a missing browser executable, run `pnpm exec playwright install chromium` once.
- Ports: never kill the process on port 3000 (a foreign `next dev`); e2e uses 3111 and starts the Firestore emulator on 8085; scripts use 3140+ ; standalone checks use `PORT=… HOSTNAME=0.0.0.0 node .next/standalone/server.js` (never `HOSTNAME=127.0.0.1`).
- Never read, print, stage or commit `.env`, `.env.local`; never stage `new.md`, `image*.png`, `3002/`, `.claude/`. Stage explicit paths only.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- Next.js 16 differs from older versions: read `node_modules/next/dist/docs/` before using an API you are unsure of.

## Review Focus

1. **WebGL context lost while the page is open** (GPU reset, tab memory pressure): the poster must come back and the page must stay usable. Pinned in Task 4 (unit-free e2e: dispatch `webglcontextlost` on the canvas, expect `data-dna-state="poster"`).
2. **Weak device or Save-Data**: fewer particles, never a frozen page. Pinned in Task 3 (`particleBudget` unit tests).
3. **Reduced motion or no WebGL**: no canvas at all, the poster only, hero fully readable. Pinned in Task 4 (e2e with `reducedMotion: 'reduce'`).
4. **JavaScript disabled**: the hero (h1, lede, buttons) and the poster render; nothing stays hidden. Pinned in Task 5 (e2e with `javaScriptEnabled: false`).
5. **Phone at 360 px**: the helix never covers the h1/lede in a way that hurts reading (it sits behind with reduced opacity) and nothing overflows horizontally. Pinned in Task 5 (e2e at 360×740).

---

### Task 1: « Instrument » tokens, fonts and owner rules

**Files:**
- Modify: `src/styles/globals.css` (the `@theme inline` block, base layer, `:focus-visible`, `::selection`)
- Modify: `src/styles/fonts.ts`
- Modify: `src/app/[locale]/layout.tsx` (font variables, `viewport.themeColor`)
- Modify (codemod, see Step 4): every file under `src/` using the old token classes or hex values; `src/styles/cv.css`; `public/site.webmanifest`; `src/assets/brand/favicon.svg`; `scripts/favicons.mjs` if it hard-codes colours
- Modify: `tools/owner-rules.ts` (two new rules)
- Test: `tests/unit/tokens.test.ts` (new), `tests/unit/owner-rules.test.ts` (extend)

**Interfaces:**
- Produces: Tailwind classes `bg-graphite`, `bg-graphite-2`, `text-ivory`, `text-signal`, `border-signal`, `text-muted`, `text-faint`, `border-line`, `border-edge`, `font-display`, `font-sans`, `font-mono`; CSS variables `--color-graphite`, `--color-signal`, … ; rule ids `'single-accent'` and `'fake-status'` in `RuleId`.

- [ ] **Step 1: Write the failing token contrast test** — `tests/unit/tokens.test.ts`

```ts
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
```

- [ ] **Step 2: Run it and see it fail**

Run: `pnpm vitest run tests/unit/tokens.test.ts`
Expected: FAIL with `token --color-graphite missing` (the v6 file defines `--color-obsidian`).

- [ ] **Step 3: Replace the theme, base styles and fonts**

`src/styles/globals.css`, replace the `@theme inline { … }` block and the two base rules that name champagne/obsidian:

```css
@theme inline {
  --color-graphite: #121211;
  --color-graphite-2: #1a1a18;
  --color-ivory: #edeae4;
  /* The only saturated colour of the site (owner rule, checked by tools/owner-rules.ts 'single-accent'). */
  --color-signal: #ff5a1f;
  --color-muted: #a8a59e;
  --color-faint: #8b8984;
  /* Hairlines and dividers. Never text. */
  --color-line: #2a2a27;
  /* Form control boundaries: >= 3:1 on graphite and graphite-2 (WCAG 1.4.11). Never text. */
  --color-edge: #6b6964;

  --font-display: var(--font-archivo), system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-sans: var(--font-archivo), system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, Consolas, monospace;
}
```

In the `@layer base` block: `body { background: var(--color-graphite); … }`, `:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 3px; }`, `::selection { background: var(--color-signal); color: var(--color-graphite); }`.

`src/styles/fonts.ts` (whole file):

```ts
import { Archivo, IBM_Plex_Mono } from 'next/font/google';

export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '800'],
  variable: '--font-archivo',
  display: 'swap',
});

export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});
```

`src/app/[locale]/layout.tsx`: import `{ archivo, mono }`, use `className={`${archivo.variable} ${mono.variable}`}` on `<html>`, and `export const viewport = { themeColor: '#121211' };`. Find any other importer of `serif`/`sans` with `grep -rn "styles/fonts" src` and switch it to `archivo`.

- [ ] **Step 4: Run the one-off codemod (scratchpad script, not committed)**

Write `C:/Users/hp/AppData/Local/Temp/claude/o--Projets-my-portfolio/57561c2b-b7f6-47b7-b48f-425218a04b21/scratchpad/v7-codemod.mjs` and run it from the repo root with `node <that path>`:

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync('git ls-files src scripts public/site.webmanifest', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.(tsx?|css|mjs|svg|webmanifest)$/.test(f) && f !== 'src/styles/globals.css');

// Order matters: the v6 `graphite` (#55575b, decorative) must be renamed before `obsidian` becomes `graphite`.
const classRenames = [
  [/\b(bg|text|border|from|to|via|fill|stroke|outline|ring|decoration|divide|accent|caret|shadow)-graphite\b/g, '$1-edge'],
  [/\b(bg|text|border|from|to|via|fill|stroke|outline|ring|decoration|divide|accent|caret|shadow)-obsidian-2\b/g, '$1-graphite-2'],
  [/\b(bg|text|border|from|to|via|fill|stroke|outline|ring|decoration|divide|accent|caret|shadow)-obsidian\b/g, '$1-graphite'],
  [/\b(bg|text|border|from|to|via|fill|stroke|outline|ring|decoration|divide|accent|caret|shadow)-champagne\b/g, '$1-signal'],
  [/\bfont-serif\b/g, 'font-display'],
  [/--color-graphite\b/g, '--color-edge'],
  [/--color-obsidian-2\b/g, '--color-graphite-2'],
  [/--color-obsidian\b/g, '--color-graphite'],
  [/--color-champagne\b/g, '--color-signal'],
];
const hex = {
  '#101112': '#121211', '#161719': '#1a1a18', '#17181b': '#1a1a18', '#e9e5dc': '#edeae4', '#bca57b': '#ff5a1f',
  '#a7a49c': '#a8a59e', '#8a8c90': '#8b8984', '#26272a': '#2a2a27', '#65676b': '#6b6964', '#55575b': '#6b6964',
  '#5c5e63': '#6b6964', '#3e4045': '#3a3936', '#3a3b3e': '#3a3936', '#d9d6cf': '#d9d6cf',
  // CV print accent: dark signal, 6.0:1 on white.
  '#7a6541': '#b23a0e',
};
for (const f of files) {
  const before = readFileSync(f, 'utf8');
  let s = before;
  for (const [re, to] of classRenames) s = s.replace(re, to);
  s = s.replace(/#[0-9a-fA-F]{6}\b/g, (m) => hex[m.toLowerCase()] ?? m);
  if (s !== before) { writeFileSync(f, s); console.log('updated', f); }
}
```

Then check nothing old is left:

Run: `git grep -nE "obsidian|champagne|font-serif|#bca57b|#101112" -- src scripts public/site.webmanifest`
Expected: no output. Fix by hand anything listed (comments may mention the old names; reword them).

Regenerate the favicons from the updated SVG: `pnpm favicons`, then look at `public/favicon.svg` and `public/apple-touch-icon.png` with the Read tool (monogram in ivory/signal on graphite).

- [ ] **Step 5: Run the token test**

Run: `pnpm vitest run tests/unit/tokens.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Write the failing owner-rule tests** — append to `tests/unit/owner-rules.test.ts`

```ts
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
```

Run: `pnpm vitest run tests/unit/owner-rules.test.ts`
Expected: FAIL (no violations of rule `single-accent` / `fake-status` are produced yet).

- [ ] **Step 7: Implement the two rules** in `tools/owner-rules.ts`

Add `'single-accent' | 'fake-status'` to `RuleId`. Add next to `isPurple`:

```ts
/** Hue of --color-signal (#ff5a1f) in HSL degrees; its darker print variant #b23a0e shares it. */
const SIGNAL_HUE = 16;

function hsl([r, g, b]: [number, number, number]): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function isForeignAccentHsl(h: number, s: number, l: number): boolean {
  if (s < 0.35 || l < 0.12 || l > 0.92) return false;
  const distance = Math.min(Math.abs(h - SIGNAL_HUE), 360 - Math.abs(h - SIGNAL_HUE));
  return distance > 12;
}

/** First saturated colour in a stylesheet that is not the signal orange, or null. */
function foreignAccent(css: string): string | null {
  for (const m of css.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi)) {
    const rgb = hexToRgb(m[0]);
    if (rgb && isForeignAccentHsl(...hsl(rgb))) return m[0];
  }
  for (const m of css.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/gi)) {
    if (isForeignAccentHsl(...hsl([Number(m[1]), Number(m[2]), Number(m[3])]))) return m[0];
  }
  for (const m of css.matchAll(/hsla?\(\s*(-?[\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/gi)) {
    if (isForeignAccentHsl(((Number(m[1]) % 360) + 360) % 360, Number(m[2]) / 100, Number(m[3]) / 100)) return m[0];
  }
  for (const m of css.matchAll(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+(-?[\d.]+)(?:deg)?/gi)) {
    const h = ((Number(m[3]) % 360) + 360) % 360;
    // #ff5a1f is about oklch(0.68 0.21 38).
    if (Number(m[2]) >= 0.08 && (h < 25 || h > 55)) return m[0];
  }
  return null;
}

const FAKE_STATUS = /system (?:status|online|ready)|enter (?:the )?system|identity confirmed|mission (?:completed|status)/i;
```

In `checkOwnerRules`, inside the `.html` branch after the AI tag check:

```ts
      const status = text.match(FAKE_STATUS);
      if (status) add('fake-status', file.path, status[0]);
```

and after the purple-gradient loop:

```ts
    const accent = foreignAccent(css);
    if (accent) add('single-accent', file.path, accent);
```

Run: `pnpm vitest run tests/unit/owner-rules.test.ts`
Expected: PASS.

- [ ] **Step 8: Full verification**

Run: `pnpm test` → all pass. `pnpm build` → success. `pnpm lint:rules` → pass (if `single-accent` fires on the built CSS, read the offending colour: fix our code, or, if it is a Tailwind internal you cannot remove, explain in the report and narrow the rule with a comment and a unit test; do not silently weaken it). `PW_PORT=3111 pnpm test:e2e` → pass (e2e tests that asserted v6 colours or class names are updated to the new tokens).
Take screenshots of `/` and `/realisations/ubbfy` at 1440 px (Playwright, any script in the scratchpad) and look at them: graphite background, ivory text, orange accents, Archivo everywhere.

- [ ] **Step 9: Commit**

```bash
git add src/styles/globals.css src/styles/fonts.ts "src/app/[locale]/layout.tsx" tools/owner-rules.ts tests/unit/tokens.test.ts tests/unit/owner-rules.test.ts public/site.webmanifest public/favicon.ico public/favicon.svg public/apple-touch-icon.png src/assets/brand/favicon.svg
git add $(git diff --name-only -- src scripts tests)   # the codemod's files; review the list first
git commit -m "feat(v7): Instrument tokens, Archivo and single-accent owner rule

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Site chrome in the Instrument style

**Files:**
- Modify: `src/components/site/Header.tsx`, `src/components/site/MobileMenu.tsx`, `src/components/site/Footer.tsx`, `src/components/site/LocaleSwitch.tsx`, `src/components/site/ButtonLink.tsx`, `src/components/site/Monogram.tsx`
- Test: `tests/e2e/foundations.spec.ts` (extend)

**Interfaces:**
- Consumes: Task 1 tokens and `font-display` / `font-mono`.
- Produces: `ButtonLink` variants `'primary' | 'ghost'` unchanged in name (ivory rectangle / hairline rectangle), used by every later task.

- [ ] **Step 1: Write the failing e2e checks** — add to `tests/e2e/foundations.spec.ts`

```ts
test('chrome uses the Instrument style', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('header').first();
  await expect(header).toHaveCSS('height', '88px');
  const nav = header.getByRole('navigation').first();
  // Navigation labels are IBM Plex Mono, uppercase.
  const link = nav.getByRole('link').first();
  await expect(link).toHaveCSS('text-transform', 'uppercase');
  expect(await link.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Plex Mono/i);
  // The primary call to action is an ivory rectangle.
  const cta = header.getByRole('link', { name: /parler d’un projet/i });
  await expect(cta).toHaveCSS('background-color', 'rgb(237, 234, 228)');
  expect(parseFloat(await cta.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))).toBeLessThanOrEqual(2);
});

test('language switch name contains its visible text (WCAG 2.5.3)', async ({ page }) => {
  await page.goto('/');
  const sw = page.locator('header').getByRole('link', { name: /^EN\b/ });
  await expect(sw).toBeVisible();
});
```

Run: `PW_PORT=3111 pnpm exec playwright test tests/e2e/foundations.spec.ts`
Expected: FAIL on the font family / uppercase and on the language switch name.

- [ ] **Step 2: Restyle the chrome**

Design rules (apply them, keep the existing structure, links, `aria-*`, the `<details>` no-JS mobile menu and the 88 px header):
- Header row: `h-[var(--header-h)]`, graphite background with a 1 px `border-line` bottom border once scrolled is not needed; keep it static.
- Monogram « RP » in Archivo 800 uppercase, followed by a 24 px signal-coloured hairline (`h-px w-6 bg-signal`).
- Navigation links: `font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted hover:text-ivory`; current page: `text-ivory` plus a 1 px `bg-signal` underline (`aria-current="page"` stays).
- `ButtonLink` primary: `bg-ivory text-graphite rounded-[2px] px-5 py-3 text-[13.5px] font-semibold uppercase tracking-[0.06em] hover:bg-signal hover:text-graphite`; ghost: `border border-edge text-ivory hover:border-signal hover:text-signal`, same size; the arrow stays an inline SVG.
- `LocaleSwitch`: visible text `EN` / `FR`; remove any `aria-label` that does not start with the visible text; use `aria-label="EN, read this site in English"` / `aria-label="FR, lire ce site en français"` (strings passed as props from the server `Header`), plus `hrefLang` and `lang` on the link.
- Footer: two rows; row 1 = name · Cotonou · email · LinkedIn · GitHub in `font-mono text-[11.5px] uppercase tracking-[0.12em] text-faint`, links `hover:text-ivory`; row 2 = Confidentialité · CGU · « Conçu et développé à la main », same style; `border-t border-line`.

- [ ] **Step 3: Run the e2e file**

Run: `PW_PORT=3111 pnpm exec playwright test tests/e2e/foundations.spec.ts`
Expected: PASS. Then run the whole e2e suite once (`PW_PORT=3111 pnpm test:e2e`) and fix any selector that relied on the old aria-label.

- [ ] **Step 4: Visual check**

Screenshots of `/` at 1440×900 and 360×740 (header open and closed on mobile) into `.superpowers/sdd/2026-10-06-v7-lot1-foundations-dna/shots/`; look at them: monogram + orange hairline, mono uppercase nav, ivory CTA, no wrapping at 360 px.

- [ ] **Step 5: Commit**

```bash
git add src/components/site/Header.tsx src/components/site/MobileMenu.tsx src/components/site/Footer.tsx src/components/site/LocaleSwitch.tsx src/components/site/ButtonLink.tsx src/components/site/Monogram.tsx tests/e2e/foundations.spec.ts
git commit -m "feat(v7): Instrument site chrome and accessible language switch

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Pure DNA geometry (`src/lib/dna`)

**Files:**
- Create: `src/lib/dna/rng.ts`, `src/lib/dna/genes.ts`, `src/lib/dna/helix.ts`, `src/lib/dna/layout.ts`, `src/lib/dna/budget.ts`
- Test: `tests/unit/dna-geometry.test.ts`

**Interfaces:**
- Produces:
  - `mulberry32(seed: number): () => number` (values in [0, 1))
  - `GENES` (`readonly ['engineering','product','architecture','innovation','devops','leadership']`), `type Gene`, `PAIRS` (`readonly [['engineering','product'],['architecture','innovation'],['devops','leadership']]`)
  - `type Vec3 = readonly [number, number, number]`; `interface HelixShape { length: number; radius: number; turns: number }`; `HELIX: HelixShape`; `helixPoint(u: number, strand: 0 | 1, shape?: HelixShape): Vec3`
  - `enum`-like `ROLE = { strandA: 0, strandB: 1, rung: 2, dust: 3 } as const`
  - `interface ParticleLayout { count: number; helix: Float32Array; cloud: Float32Array; role: Float32Array; pair: Float32Array; seed: Float32Array }`; `buildLayout(opts: { count: number; seed?: number; rungs?: number; shape?: HelixShape }): ParticleLayout`
  - `particleBudget(env: { width: number; cores: number; saveData: boolean; deviceMemory?: number }): number`
- Lot 2 adds `layers`, `signatures` and `clusters` arrays to the same layout; keep `buildLayout` easy to extend (one helper per state).

- [ ] **Step 1: Write the failing tests** — `tests/unit/dna-geometry.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { particleBudget } from '@/lib/dna/budget';
import { GENES, PAIRS } from '@/lib/dna/genes';
import { HELIX, helixPoint } from '@/lib/dna/helix';
import { buildLayout, ROLE } from '@/lib/dna/layout';
import { mulberry32 } from '@/lib/dna/rng';

describe('mulberry32', () => {
  it('is deterministic and stays in [0, 1)', () => {
    const a = mulberry32(42), b = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
  it('differs with the seed', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe('genes', () => {
  it('has six genes in three pairs, each gene used once', () => {
    expect(GENES).toHaveLength(6);
    expect(PAIRS.flat().sort()).toEqual([...GENES].sort());
  });
});

describe('helixPoint', () => {
  it('stays on the cylinder and spans the axis', () => {
    for (const u of [0, 0.25, 0.5, 1]) for (const s of [0, 1] as const) {
      const [x, y, z] = helixPoint(u, s);
      expect(Math.hypot(x, z)).toBeCloseTo(HELIX.radius, 6);
      expect(y).toBeCloseTo((u - 0.5) * HELIX.length, 6);
    }
  });
  it('puts the two strands opposite each other', () => {
    const [ax, , az] = helixPoint(0.3, 0);
    const [bx, , bz] = helixPoint(0.3, 1);
    expect(ax).toBeCloseTo(-bx, 6);
    expect(az).toBeCloseTo(-bz, 6);
  });
});

describe('buildLayout', () => {
  const layout = buildLayout({ count: 5000, seed: 7 });
  it('sizes every attribute', () => {
    expect(layout.count).toBe(5000);
    expect(layout.helix).toHaveLength(15000);
    expect(layout.cloud).toHaveLength(15000);
    expect(layout.role).toHaveLength(5000);
    expect(layout.pair).toHaveLength(5000);
    expect(layout.seed).toHaveLength(5000);
  });
  it('is deterministic for a seed and changes with it', () => {
    expect(buildLayout({ count: 500, seed: 7 }).helix).toEqual(buildLayout({ count: 500, seed: 7 }).helix);
    expect(buildLayout({ count: 500, seed: 8 }).helix).not.toEqual(buildLayout({ count: 500, seed: 7 }).helix);
  });
  it('splits roles roughly 70 % strands, 18 % rungs, 12 % dust', () => {
    const counts = [0, 0, 0, 0];
    layout.role.forEach((r) => counts[r]++);
    expect((counts[ROLE.strandA] + counts[ROLE.strandB]) / 5000).toBeCloseTo(0.7, 1);
    expect(counts[ROLE.rung] / 5000).toBeCloseTo(0.18, 1);
    expect(counts[ROLE.dust] / 5000).toBeCloseTo(0.12, 1);
  });
  it('keeps strand and rung particles near the helix, inside its length', () => {
    for (let i = 0; i < layout.count; i++) {
      if (layout.role[i] === ROLE.dust) continue;
      const [x, y, z] = [layout.helix[i * 3], layout.helix[i * 3 + 1], layout.helix[i * 3 + 2]];
      expect(Math.hypot(x, z)).toBeLessThanOrEqual(HELIX.radius + 0.25);
      expect(Math.abs(y)).toBeLessThanOrEqual(HELIX.length / 2 + 0.25);
    }
  });
  it('assigns pairs by helix third, and -1 to dust', () => {
    for (let i = 0; i < layout.count; i++) {
      const p = layout.pair[i];
      if (layout.role[i] === ROLE.dust) expect(p).toBe(-1);
      else expect([0, 1, 2]).toContain(p);
    }
  });
  it('spreads the cloud wider than the helix', () => {
    let maxX = 0;
    for (let i = 0; i < layout.count; i++) maxX = Math.max(maxX, Math.abs(layout.cloud[i * 3]));
    expect(maxX).toBeGreaterThan(HELIX.radius * 2);
  });
  it('rejects a non-positive count', () => {
    expect(() => buildLayout({ count: 0 })).toThrow();
  });
});

describe('particleBudget', () => {
  it('gives desktops 20 000 particles', () => {
    expect(particleBudget({ width: 1440, cores: 8, saveData: false, deviceMemory: 8 })).toBe(20000);
  });
  it('gives phones 6 000', () => {
    expect(particleBudget({ width: 390, cores: 8, saveData: false })).toBe(6000);
  });
  it('drops to 4 000 on weak devices or Save-Data', () => {
    expect(particleBudget({ width: 1440, cores: 2, saveData: false })).toBe(4000);
    expect(particleBudget({ width: 1440, cores: 8, saveData: true })).toBe(4000);
    expect(particleBudget({ width: 1440, cores: 8, saveData: false, deviceMemory: 2 })).toBe(4000);
  });
});
```

Run: `pnpm vitest run tests/unit/dna-geometry.test.ts`
Expected: FAIL (modules do not exist).

- [ ] **Step 2: Implement the modules**

`src/lib/dna/rng.ts`:

```ts
/** Small seeded PRNG (mulberry32): the helix must look identical on every load and in the poster. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

`src/lib/dna/genes.ts`:

```ts
/** The six genes of the Digital DNA (spec §4.1, §5.4). Labels and proofs arrive in Lot 2. */
export const GENES = ['engineering', 'product', 'architecture', 'innovation', 'devops', 'leadership'] as const;
export type Gene = (typeof GENES)[number];

/** Base pairs, in scene order: pair 0 is the top third of the helix, pair 2 the bottom third. */
export const PAIRS = [
  ['engineering', 'product'],
  ['architecture', 'innovation'],
  ['devops', 'leadership'],
] as const satisfies readonly (readonly [Gene, Gene])[];
```

`src/lib/dna/helix.ts`:

```ts
export type Vec3 = readonly [number, number, number];
export interface HelixShape { length: number; radius: number; turns: number }

/** Scene units; the camera in DnaCanvas is set for this size. */
export const HELIX: HelixShape = { length: 9, radius: 1.15, turns: 3.2 };

/** Point of strand 0 or 1 at `u` in [0, 1] along the vertical axis (y from -length/2 to +length/2). */
export function helixPoint(u: number, strand: 0 | 1, shape: HelixShape = HELIX): Vec3 {
  const a = u * shape.turns * Math.PI * 2 + strand * Math.PI;
  return [Math.cos(a) * shape.radius, (u - 0.5) * shape.length, Math.sin(a) * shape.radius];
}
```

`src/lib/dna/layout.ts`:

```ts
import { HELIX, helixPoint, type HelixShape } from './helix';
import { mulberry32 } from './rng';

export const ROLE = { strandA: 0, strandB: 1, rung: 2, dust: 3 } as const;

export interface ParticleLayout {
  count: number;
  /** State « helix »: xyz per particle. */
  helix: Float32Array;
  /** State « cloud » (scene 00 start): xyz per particle. */
  cloud: Float32Array;
  /** ROLE value per particle. */
  role: Float32Array;
  /** Base pair index 0..2 (helix third), -1 for dust. */
  pair: Float32Array;
  /** Per-particle random in [0, 1), used by the shader for staggering and breathing. */
  seed: Float32Array;
}

interface LayoutOptions { count: number; seed?: number; rungs?: number; shape?: HelixShape }

const STRAND_SHARE = 0.7;
const RUNG_SHARE = 0.18;

/** Precomputes every particle position for each helix state. Pure and deterministic for a seed. */
export function buildLayout({ count, seed = 7, rungs = 24, shape = HELIX }: LayoutOptions): ParticleLayout {
  if (!Number.isInteger(count) || count <= 0) throw new Error(`buildLayout: count must be a positive integer, got ${count}`);
  const rnd = mulberry32(seed);
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5; // cheap bell curve in [-1, 1]
  const helix = new Float32Array(count * 3);
  const cloud = new Float32Array(count * 3);
  const role = new Float32Array(count);
  const pair = new Float32Array(count);
  const seeds = new Float32Array(count);
  const strands = Math.round(count * STRAND_SHARE);
  const rungEnd = strands + Math.round(count * RUNG_SHARE);
  const third = (u: number) => Math.min(2, Math.floor(u * 3));

  for (let i = 0; i < count; i++) {
    seeds[i] = rnd();
    const o = i * 3;
    // Cloud: a wide, shallow box the helix condenses from.
    cloud[o] = (rnd() - 0.5) * 9;
    cloud[o + 1] = (rnd() - 0.5) * 10;
    cloud[o + 2] = (rnd() - 0.5) * 4.5 - 0.75;

    if (i < strands) {
      const strand = (i % 2) as 0 | 1;
      const u = rnd();
      const [x, y, z] = helixPoint(u, strand, shape);
      helix[o] = x + gauss() * 0.06;
      helix[o + 1] = y + gauss() * 0.06;
      helix[o + 2] = z + gauss() * 0.06;
      role[i] = strand === 0 ? ROLE.strandA : ROLE.strandB;
      pair[i] = third(u);
    } else if (i < rungEnd) {
      const r = Math.floor(rnd() * rungs);
      const u = (r + 0.5) / rungs;
      const [ax, ay, az] = helixPoint(u, 0, shape);
      const [bx, by, bz] = helixPoint(u, 1, shape);
      const t = rnd();
      helix[o] = ax + (bx - ax) * t + gauss() * 0.02;
      helix[o + 1] = ay + (by - ay) * t + gauss() * 0.02;
      helix[o + 2] = az + (bz - az) * t + gauss() * 0.02;
      role[i] = ROLE.rung;
      pair[i] = third(u);
    } else {
      // Dust drifts around the helix in every state.
      helix[o] = cloud[o];
      helix[o + 1] = cloud[o + 1];
      helix[o + 2] = cloud[o + 2];
      role[i] = ROLE.dust;
      pair[i] = -1;
    }
  }
  return { count, helix, cloud, role, pair, seed: seeds };
}
```

`src/lib/dna/budget.ts`:

```ts
interface DeviceHints { width: number; cores: number; saveData: boolean; deviceMemory?: number }

/** Particle count for this device (spec §5.3): never let the helix freeze a weak phone. */
export function particleBudget({ width, cores, saveData, deviceMemory }: DeviceHints): number {
  if (saveData || cores <= 2 || (deviceMemory !== undefined && deviceMemory <= 2)) return 4000;
  return width < 1024 ? 6000 : 20000;
}
```

- [ ] **Step 3: Run the tests**

Run: `pnpm vitest run tests/unit/dna-geometry.test.ts`
Expected: PASS (all). If the role-share test fails at one decimal, check the rounding of `strands` / `rungEnd`, not the test.

- [ ] **Step 4: Commit**

```bash
git add src/lib/dna tests/unit/dna-geometry.test.ts
git commit -m "feat(v7): deterministic DNA helix geometry and particle budget

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: The DNA scene (replaces the Möbius sculpture)

**Files:**
- Create: `src/components/dna/shaders.ts`, `src/components/dna/DnaCanvas.tsx`, `src/components/dna/DnaBoundary.tsx`, `src/components/dna/DnaStage.tsx`
- Create: `scripts/dna-poster.mjs` (from `scripts/sculpture-poster.mjs`), `public/dna/helix-desktop.webp`, `public/dna/helix-mobile.webp`
- Modify: `package.json` (script `dna:poster` replaces `sculpture:poster`), `src/styles/globals.css` (remove the sculpture/poster rules, add the DNA poster rule), `src/app/[locale]/page.tsx` (use `DnaStage`)
- Delete: `src/components/sculpture/*`, `public/sculpture/*`, `scripts/sculpture-poster.mjs`, `tests/unit/mobius.test.ts`, `tests/e2e/sculpture.spec.ts`
- Test: `tests/e2e/dna.spec.ts` (new), `tests/dist/bundle.dist.test.ts` (sentinel update)

**Interfaces:**
- Consumes: `buildLayout`, `ROLE`, `particleBudget`, `HELIX` from Task 3.
- Produces: `<DnaStage />` (client component, no props in Lot 1) rendering `<div data-dna-stage data-dna-state="poster"|"3d" data-dna-ready="true"|"false" data-dna-running="true"|"false" aria-hidden="true">`. Lot 2 adds a `scene` prop and the scroll trajectory.
- Shader uniforms: `uTime` (s), `uIntro` (0 cloud → 1 helix), `uFocus` (-1 none, 0..2 pair), `uPixelRatio`, `uSize`, `uIvory` (vec3), `uSignal` (vec3).

- [ ] **Step 1: Write the failing e2e** — `tests/e2e/dna.spec.ts`

```ts
import { expect, test } from '@playwright/test';

test.describe('DNA stage', () => {
  test('shows the poster first, then the live helix when WebGL is available', async ({ page }) => {
    await page.goto('/');
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('aria-hidden', 'true');
    await expect(stage.locator('img[data-dna-poster]')).toBeAttached();
    const webgl = await page.evaluate(() => Boolean(document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl')));
    test.skip(!webgl, 'no WebGL in this browser');
    await expect(stage).toHaveAttribute('data-dna-state', '3d', { timeout: 10000 });
    await expect(stage).toHaveAttribute('data-dna-ready', 'true', { timeout: 10000 });
    await expect(stage.locator('canvas')).toBeVisible();
  });

  test('falls back to the poster when the WebGL context is lost', async ({ page }) => {
    await page.goto('/');
    const stage = page.locator('[data-dna-stage]');
    const ready = await stage.getAttribute('data-dna-ready', { timeout: 10000 }).catch(() => null);
    test.skip(ready === null, 'no live helix here');
    await expect(stage).toHaveAttribute('data-dna-ready', 'true', { timeout: 10000 });
    await stage.locator('canvas').evaluate((c) => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    await expect(stage).toHaveAttribute('data-dna-state', 'poster');
    await expect(stage.locator('img[data-dna-poster]')).toBeVisible();
  });

  test('never mounts a canvas under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(2500);
    const stage = page.locator('[data-dna-stage]');
    await expect(stage).toHaveAttribute('data-dna-state', 'poster');
    await expect(stage.locator('canvas')).toHaveCount(0);
    await expect(stage.locator('img[data-dna-poster]')).toBeVisible();
    await context.close();
  });

  test('pauses rendering when the tab is hidden', async ({ page }) => {
    await page.goto('/');
    const stage = page.locator('[data-dna-stage]');
    const ready = await stage.getAttribute('data-dna-ready', { timeout: 10000 }).catch(() => null);
    test.skip(ready === null, 'no live helix here');
    await expect(stage).toHaveAttribute('data-dna-running', 'true', { timeout: 10000 });
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(stage).toHaveAttribute('data-dna-running', 'false');
  });
});
```

Run: `PW_PORT=3111 pnpm exec playwright test tests/e2e/dna.spec.ts`
Expected: FAIL (`[data-dna-stage]` not found).

- [ ] **Step 2: Shaders** — `src/components/dna/shaders.ts`

```ts
/** Particle helix. Positions for each state are attributes; uIntro morphs the cloud into the helix. */
export const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform float uFocus;
uniform float uPixelRatio;
uniform float uSize;
attribute vec3 aCloud;
attribute float aRole;
attribute float aPair;
attribute float aSeed;
varying float vAlpha;
varying float vHot;

void main() {
  // Staggered condensation: each particle arrives at its own moment.
  float k = clamp(uIntro * 1.25 - aSeed * 0.25, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  vec3 p = mix(aCloud, position, k);
  // Breathing: a few hundredths of a unit, never a visible wobble.
  p += 0.03 * vec3(sin(uTime * 0.7 + aSeed * 40.0), cos(uTime * 0.5 + aSeed * 31.0), sin(uTime * 0.6 + aSeed * 17.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dust = step(2.5, aRole);
  gl_PointSize = uSize * uPixelRatio * mix(1.0, 0.6, dust) / max(0.35, -mv.z * 0.12);
  vHot = (uFocus > -0.5 && abs(aPair - uFocus) < 0.5) ? 1.0 : 0.0;
  float depth = clamp(-mv.z / 16.0, 0.0, 1.0);
  vAlpha = mix(0.85, 0.22, dust) * (1.0 - depth * 0.5);
}
`;

export const FRAGMENT = /* glsl */ `
uniform vec3 uIvory;
uniform vec3 uSignal;
varying float vAlpha;
varying float vHot;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d) * vAlpha;
  gl_FragColor = vec4(mix(uIvory, uSignal, vHot), a);
}
`;
```

- [ ] **Step 3: Canvas** — `src/components/dna/DnaCanvas.tsx`

```tsx
'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { buildLayout } from '@/lib/dna/layout';
import { FRAGMENT, VERTEX } from './shaders';

interface Props {
  count: number;
  frozen: boolean;
  running: boolean;
  tilt: RefObject<{ x: number; y: number }>;
  dpr: number;
  onReady: () => void;
  onLost: () => void;
}

const INTRO_SECONDS = 2.4;
const IVORY = new THREE.Color('#edeae4');
const SIGNAL = new THREE.Color('#ff5a1f');

function Helix({ count, frozen, tilt, onReady }: Pick<Props, 'count' | 'frozen' | 'tilt' | 'onReady'>) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: 0, y: 0 });
  const frames = useRef(0);
  const start = useRef<number | null>(null);
  const gl = useThree((s) => s.gl);

  const geometry = useMemo(() => {
    const layout = buildLayout({ count });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(layout.helix, 3));
    g.setAttribute('aCloud', new THREE.BufferAttribute(layout.cloud, 3));
    g.setAttribute('aRole', new THREE.BufferAttribute(layout.role, 1));
    g.setAttribute('aPair', new THREE.BufferAttribute(layout.pair, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(layout.seed, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: frozen ? 1 : 0 },
          uFocus: { value: -1 },
          uPixelRatio: { value: gl.getPixelRatio() },
          uSize: { value: 2.2 },
          uIvory: { value: IVORY },
          uSignal: { value: SIGNAL },
        },
      }),
    [frozen, gl],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    if (!frozen) {
      if (start.current === null) start.current = state.clock.elapsedTime;
      u.uTime.value += delta;
      u.uIntro.value = Math.min(1, (state.clock.elapsedTime - start.current) / INTRO_SECONDS);
    }
    const g = group.current;
    if (g) {
      // Slow spin plus a few degrees of tilt towards the pointer (fine pointers only, see DnaStage).
      current.current.x += (tilt.current.x - current.current.x) * 0.05;
      current.current.y += (tilt.current.y - current.current.y) * 0.05;
      g.rotation.y = (frozen ? 0.6 : u.uTime.value * 0.12) + current.current.y;
      g.rotation.x = current.current.x;
    }
    if (++frames.current === 2) onReady();
  });

  return (
    <group ref={group} rotation={[0, 0, -0.32]}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

export default function DnaCanvas({ count, frozen, running, tilt, dpr, onReady, onLost }: Props) {
  return (
    <Canvas
      dpr={[1, dpr]}
      frameloop={running || frozen ? 'always' : 'never'}
      camera={{ fov: 35, position: [0, 0, 13] }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: frozen }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost(); }, { once: true });
      }}
    >
      <Helix count={count} frozen={frozen} tilt={tilt} onReady={onReady} />
    </Canvas>
  );
}
```

`src/components/dna/DnaBoundary.tsx`: copy `src/components/sculpture/SculptureBoundary.tsx` verbatim, renaming the class/export to `DnaBoundary` (it calls `onError` from `componentDidCatch` and renders `null` after an error).

- [ ] **Step 4: Stage** — `src/components/dna/DnaStage.tsx`

Port `src/components/sculpture/SculptureStage.tsx` (read it first) with these exact differences:
- imports: `DnaBoundary` from `./DnaBoundary`, `DnaCanvas` via `dynamic(() => import('./DnaCanvas'), { ssr: false, loading: () => null })`, `particleBudget` from `@/lib/dna/budget`; no `Trajectory`, no `DESKTOP_RIBBON`/`MOBILE_RIBBON`, no `progress` ref, no `faded` state (Lot 2 adds the trajectory).
- poster query: `process.env.NEXT_PUBLIC_DNA_POSTER === '1' && new URLSearchParams(location.search).get('dna') === 'poster'`; in poster mode set `document.documentElement.dataset.poster = '1'` exactly like v6.
- particle count computed once on mount:

```ts
const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
setCount(particleBudget({
  width: innerWidth,
  cores: nav.hardwareConcurrency || 4,
  saveData: Boolean(nav.connection?.saveData),
  deviceMemory: nav.deviceMemory,
}));
```

- root element attributes: `data-dna-stage`, `data-dna-state={mode}`, `data-dna-ready={String(ready)}`, `data-dna-running={String(running)}`, `aria-hidden="true"`.
- root classes (Lot 1 placement inside the hero): `pointer-events-none absolute inset-0 -z-0 opacity-40 lg:left-auto lg:w-[52vw] lg:opacity-100` (behind the text on phones, right half on desktop).
- poster: `<picture><source media="(max-width: 1023px)" srcSet="/dna/helix-mobile.webp" /><img src="/dna/helix-desktop.webp" alt="" data-dna-poster … /></picture>`, hidden (`invisible opacity-0`) once `ready`.
- canvas: `<DnaBoundary onError={fallback}><DnaCanvas count={count} frozen={posterMode} running={running || posterMode} tilt={tilt} dpr={mobile ? 1.5 : 2} onReady={onReady} onLost={fallback} /></DnaBoundary>`, rendered only when `mode === '3d' && count > 0`.
- keep from v6: WebGL detection, reduced-motion check, `requestIdleCallback` start, IntersectionObserver + `visibilitychange` pause, fine-pointer tilt (amplitude 0.12 rad instead of 0.4).

`src/styles/globals.css`: delete the three blocks about `[data-sculpture-stage]`, `html[data-poster='1'] …` that name `data-sculpture-slot`, and `[data-conversion-poster]`; add:

```css
/* Poster capture mode (?dna=poster, poster builds only): everything but the DNA stage is hidden. */
html[data-poster='1'], html[data-poster='1'] body { background: transparent; }
html[data-poster='1'] body *:not([data-dna-stage]):not([data-dna-stage] *):not(:has([data-dna-stage])) { visibility: hidden; }
html[data-poster='1'] .page-enter { animation: none; }
```

`src/app/[locale]/page.tsx`: replace `SculptureStage` with `DnaStage` (Task 5 moves it inside the new hero; for now pass it as the `sculpture` prop of the existing `Hero`).

Delete the sculpture files listed above (`git rm`). Fix any remaining importer (`grep -rn "sculpture" src tests scripts`), including `src/components/home/Conversion.tsx` if it renders the Möbius poster (remove that element).

- [ ] **Step 5: Poster script and images**

`git mv scripts/sculpture-poster.mjs scripts/dna-poster.mjs`, then in it: env `NEXT_PUBLIC_DNA_POSTER`, URL `/?dna=poster`, selector `[data-dna-stage] canvas`, output dir `public/dna`, files `helix-${t.name}.webp`, server name `'dna-poster'`, ports from 3160, and the settle wait 2500 ms (the intro is skipped in frozen mode, so 1500 ms is enough; keep 2500 for safety). `package.json`: replace the `sculpture:poster` script by `"dna:poster": "node scripts/dna-poster.mjs"`.

Run: `pnpm dna:poster` then `pnpm build` (the poster build must not stay in `.next`).
Expected: `public/dna/helix-desktop.webp` and `public/dna/helix-mobile.webp` written. Open both with the Read tool: an ivory particle helix, tilted, on transparency, no orange (no pair in focus).
If the headless browser has no WebGL, rerun with `POSTER_CHANNEL=msedge` or `POSTER_ARGS="--use-angle=swiftshader --enable-unsafe-swiftshader"`.

- [ ] **Step 6: Bundle guard**

`tests/dist/bundle.dist.test.ts` checks that the 3D code is not in the initial JS through a sentinel string from the sculpture; replace it with a string unique to `src/components/dna/shaders.ts` (e.g. `uIntro`) and keep the test walking every prerendered page.

Run: `pnpm build && pnpm lint:rules`
Expected: PASS; initial JS for `/` ≤ 160 KB gzip (report the figure).

- [ ] **Step 7: Run the DNA e2e and the whole suite**

Run: `PW_PORT=3111 pnpm exec playwright test tests/e2e/dna.spec.ts` → PASS (skips only where the browser has no WebGL; say so in the report).
Run: `pnpm test` and `PW_PORT=3111 pnpm test:e2e` → PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/dna scripts/dna-poster.mjs public/dna package.json src/styles/globals.css "src/app/[locale]/page.tsx" tests/e2e/dna.spec.ts tests/dist/bundle.dist.test.ts
git add -u src/components/sculpture public/sculpture scripts/sculpture-poster.mjs tests/unit/mobius.test.ts tests/e2e/sculpture.spec.ts src/components/home
git commit -m "feat(v7): real-time particle DNA helix replaces the Möbius sculpture

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Home scene 00 « Formation »

**Files:**
- Modify: `src/components/home/Hero.tsx` (rewrite), `src/app/[locale]/page.tsx`
- Modify: `messages/fr.json`, `messages/en.json` (`hero` namespace)
- Test: `tests/e2e/home.spec.ts` (update the hero assertions, add the cases below)

**Interfaces:**
- Consumes: `<DnaStage />` (Task 4), `ButtonLink` (Task 2), `CV_PDF` from `@/lib/profile/cv-data`.
- Produces: `<section data-dna-scene="formation">` (Lot 2 adds the other five scenes with the same attribute).

- [ ] **Step 1: Messages** — replace the `hero` object in both files (FR uses `’` and U+00A0 before `:`; write the real character, not an escape):

`messages/fr.json`:

```json
"hero": {
  "eyebrow": "Rostel Panoumassi · Ingénierie de produits numériques · Cotonou",
  "title": "L’ingénierie est dans l’ADN.",
  "lede": "Je conçois et je livre des produits numériques, de l’architecture à la production : plateformes SaaS, de paiement et de gestion. Head of Engineering & Innovation chez KPS Groupe, six ans d’expérience, dont trois comme tech lead.",
  "ctaProject": "Parler d’un projet",
  "ctaWork": "Voir les réalisations",
  "ctaCv": "CV (PDF)",
  "scroll": "Défiler pour séquencer"
}
```

`messages/en.json`:

```json
"hero": {
  "eyebrow": "Rostel Panoumassi · Digital product engineering · Cotonou",
  "title": "Engineering is in the DNA.",
  "lede": "I design and ship digital products, from architecture to production: SaaS, payment and management platforms. Head of Engineering & Innovation at KPS Groupe, six years of experience, three as tech lead.",
  "ctaProject": "Talk about a project",
  "ctaWork": "See the work",
  "ctaCv": "CV (PDF)",
  "scroll": "Scroll to sequence"
}
```

Keep the existing `ctaCv` wording if the current files already define a different one and other tests depend on it. Remove the now unused keys (`titleBefore`, `titleEm`, `titleAfter`, `ledeName`, `ledeRest`) only after `grep -rn "hero\." src tests` shows no other reader.

- [ ] **Step 2: Write the failing e2e** — in `tests/e2e/home.spec.ts`, replace the old hero test(s) with:

```ts
test.describe('scene 00 Formation', () => {
  test('states what and for whom in the first screen (FR)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const scene = page.locator('[data-dna-scene="formation"]');
    await expect(scene.getByRole('heading', { level: 1 })).toHaveText('L’ingénierie est dans l’ADN.');
    const lede = scene.getByText(/Je conçois et je livre des produits numériques/);
    await expect(lede).toBeInViewport();
    await expect(scene.getByRole('link', { name: 'Parler d’un projet' })).toHaveAttribute('href', '/brief');
    await expect(scene.getByRole('link', { name: 'Voir les réalisations' })).toHaveAttribute('href', '/realisations');
    await expect(scene.locator('[data-dna-stage]')).toBeAttached();
  });

  test('English hero', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Engineering is in the DNA.');
    await expect(page.getByRole('link', { name: 'Talk about a project' })).toHaveAttribute('href', '/en/brief');
  });

  test('works without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/Je conçois et je livre/)).toBeVisible();
    await expect(page.locator('img[data-dna-poster]')).toBeVisible();
    await context.close();
  });

  test('reads well at 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    // The stage sits behind the text, faded.
    const opacity = await page.locator('[data-dna-stage]').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBeLessThanOrEqual(0.5);
  });
});
```

Run: `PW_PORT=3111 pnpm exec playwright test tests/e2e/home.spec.ts`
Expected: FAIL (old hero).

- [ ] **Step 3: Rewrite the hero** — `src/components/home/Hero.tsx`

```tsx
import type { CSSProperties } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DnaStage } from '@/components/dna/DnaStage';
import { ButtonLink } from '@/components/site/ButtonLink';
import type { Locale } from '@/i18n/routing';
import { CV_PDF } from '@/lib/profile/cv-data';

/** Scene 00 « Formation »: the helix condenses behind a concrete statement (spec §4.1). */
export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale() as Locale;
  return (
    <section
      data-dna-scene="formation"
      className="relative isolate overflow-hidden"
    >
      <DnaStage />
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-var(--header-h))] max-w-[1280px] flex-col justify-center px-5 py-16 md:px-10">
        <p data-hero style={{ '--hero-i': 0 } as CSSProperties} className="font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-signal">
          {t('eyebrow')}
        </p>
        <h1
          data-hero
          style={{ '--hero-i': 1 } as CSSProperties}
          className="mt-6 max-w-[11ch] font-display text-[clamp(44px,7.2vw,112px)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em]"
        >
          {t('title')}
        </h1>
        <p data-hero style={{ '--hero-i': 2 } as CSSProperties} className="mt-8 max-w-[56ch] text-[17px] leading-[1.65] text-muted">
          {t('lede')}
        </p>
        <div data-hero style={{ '--hero-i': 3 } as CSSProperties} className="mt-10 flex flex-wrap items-center gap-3.5">
          <ButtonLink href="/brief" variant="primary" arrow>{t('ctaProject')}</ButtonLink>
          <ButtonLink href="/realisations" variant="ghost">{t('ctaWork')}</ButtonLink>
          {/* A static file in the page language: a plain <a>, not the localized Link. */}
          <a
            href={CV_PDF[locale]}
            download
            type="application/pdf"
            data-cv-link
            className="ml-1.5 border-b border-edge pb-0.5 font-mono text-[12px] uppercase tracking-[0.12em] text-ivory no-underline transition-colors hover:border-signal hover:text-signal"
          >
            {t('ctaCv')}
          </a>
        </div>
        <p data-hero style={{ '--hero-i': 4 } as CSSProperties} className="mt-[9vh] flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
          <span aria-hidden="true" className="block h-px w-10 bg-signal" />
          {t('scroll')}
        </p>
      </div>
    </section>
  );
}
```

`src/app/[locale]/page.tsx`: render `<Hero />` (no prop); remove the `DnaStage` import there. The v6 sections below (`Positioning`, `SelectedWork`, `Method`, `Conversion`) stay until Lot 2 replaces them.

- [ ] **Step 4: Run the tests**

Run: `PW_PORT=3111 pnpm exec playwright test tests/e2e/home.spec.ts tests/e2e/dna.spec.ts` → PASS.
Run: `pnpm test` (messages parity, typography) → PASS.

- [ ] **Step 5: Visual and performance check**

`pnpm build`, start the standalone server on 3140 (`PORT=3140 HOSTNAME=0.0.0.0 node .next/standalone/server.js`, in the background), screenshot `/` and `/en` at 1440×900 and 360×740 into `.superpowers/sdd/2026-10-06-v7-lot1-foundations-dna/shots/`, after 3 s (helix formed). Look at them: h1 in Archivo 800 capitals, orange eyebrow, helix on the right on desktop and faded behind the text on mobile, nothing overlapping illegibly. Then stop the server.
Run: `pnpm lint:rules` → PASS (budget figure in the report).

- [ ] **Step 6: Commit**

```bash
git add src/components/home/Hero.tsx "src/app/[locale]/page.tsx" messages/fr.json messages/en.json tests/e2e/home.spec.ts
git commit -m "feat(v7): home scene 00 Formation with a concrete hero

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

## Lot 1 done when

All suites pass (`pnpm test`, `pnpm build`, `pnpm lint:rules`, `PW_PORT=3111 pnpm test:e2e`); every page renders in the Instrument palette; the home opens on scene 00 with the live helix (poster fallback without WebGL, under reduced motion and without JS); no file under `src/components/sculpture` or `public/sculpture` remains; initial JS for `/` ≤ 160 KB gzip.

## Roadmap (Lots 2-4, planned after Lot 1)

- **Lot 2 · Accueil** : gene data (`src/lib/dna/genes.ts` gains FR/EN labels, pair statements and proofs from verified facts), `genes` field in the content schema (2-4 per project, FR/EN parity, owner validation list), new layout states (`layers`, `signatures`, `clusters`, `calm`) in `buildLayout`, generic state morphing in the shader (`uFrom`, `uTo`, `uMix`), `DnaTrajectory` (GSAP ScrollTrigger, chunk 3D) mapping `data-dna-scene` sections to states, fixed full-page stage on the home, scenes 01-05, signature SVG component (`ProjectSignature`) shared with Lot 3, removal of the v6 home sections.
- **Lot 3 · Autres pages** : static SVG helix ornament; realisations, case study (signature header), Lab (explorations), about, CV screen and print accent, brief, contact, terminal, legal, 404, OG images (Archivo/Plex Mono assets + signature), removal of Cormorant/Manrope assets.
- **Lot 4 · Finitions et mise en production** : performance (LCP e2e), accessibility, e2e stabilisation (full suite green twice in a row), v6 carries (terminal polish, SMTP aliases, CV stale-PDF guard), final review, merge `v7` → `main`, Coolify deployment (variables, push over HTTPS, deploy API, live checks), owner steps list.
