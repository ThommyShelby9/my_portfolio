# Portfolio v6, Lot 1 (Foundations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Nuxt codebase on branch `v6` with an Astro 7 skeleton that already carries the "Collection · Nocturne" design system, bilingual routing, the home hero, the favicon set, the content schemas with the no-fake-metrics guard, an automated owner-rules checker, a health endpoint, e2e + accessibility tests and a Coolify-ready Dockerfile.

**Architecture:** Astro 7 with the Node adapter (standalone). Pages are prerendered to static HTML; only `src/pages/api/*` routes run on demand (`export const prerender = false`). No client UI framework. Pure logic (i18n, schemas, metric guard, owner rules) lives in plain TypeScript modules tested with Vitest; pages are tested end to end with Playwright + axe against the real built server.

**Tech Stack:** Astro 7.3, @astrojs/node 11, @astrojs/mdx 8, @astrojs/sitemap 3, TypeScript 6 (NOT 7: `@astrojs/check` peers on `^5 || ^6`), Zod via `astro/zod`, Fontsource, sharp, Vitest 5, Playwright 1.63, @axe-core/playwright 4.13, pnpm 10, Node 22.

**Spec:** `docs/superpowers/specs/2026-09-28-portfolio-v6-collection-nocturne-design.md`

## Roadmap (this plan = Lot 1)

| Lot | Scope | Plan |
|---|---|---|
| **1 Foundations** | Scaffold, tokens, fonts, layout, i18n, home hero, favicons, content schemas + metric guard, owner-rules checker, health, e2e/axe, Dockerfile | this file |
| 2 Collection | Migrate the 12 works (EN+FR MDX), screenshots (`pnpm capture` + interior shots), Wall / Cartel / Room I / Catalogue toggle / spotlight, `/work`, `/work/[slug]`, home Room I + catalogue + curator block, OG images, JSON-LD | written after Lot 1 ships |
| 3 Server | Firestore (`submissions`, `stats_daily`), mailer, rate limiter, `/contact`, `/brief` + confirmation, `/api/hit` beacon, `/privacy`, `/terms` | written after Lot 2 |
| 4 Finish & ship | `/about`, `/cv` + PDF script, `/terminal`, 404, required-pages owner rule, Lighthouse budget, full e2e sweep, README, Coolify cut-over | written after Lot 3 |

## Global Constraints

- Owner rules (spec §2), all enforced: no "vibecoded" look; never a purple gradient; no pill buttons (border-radius max 2px on buttons); no fake reviews, metrics or client counters; no vague hero; no emoji as icons (SVG only); **no em dash (U+2014) in any site copy, EN or FR**; no exaggerated scroll animation; no cursor animation of any kind; never AI-generated photos; favicon required; no "made with AI" tag; privacy + terms pages required (Lot 3).
- Owner facts: **6 years of experience, 3 as tech lead**; Head of Engineering and Innovation, KPS Groupe, Cotonou, UTC+1.
- Dark theme only. Tokens exactly as spec §3.2, with `--faint: #8a8276`.
- Fonts self-hosted via Fontsource: Cormorant Garamond (500, 600, italics), Schibsted Grotesk (400, 500, 600), IBM Plex Mono (400, 500). No request to Google Fonts.
- Locales: `en` (default, unprefixed) and `fr` (prefixed `/fr`).
- Motion: nothing in Lot 1 animates. `prefers-reduced-motion` handling lives in `global.css` from day one.
- Package manager: pnpm. Node `>=22.12.0`. TypeScript `^6`.
- Site URL: `https://rostelmissimawu.com` (overridable with `PUBLIC_SITE_URL`).
- Every commit message ends with the line `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. Switching language on a nested path with a trailing slash or query string (`/fr/work/ubbfy/?view=catalogue`) must land on the same page in the other language, not on the home page. Pinned in Task 2 (`stripLocale` / `localizePath` cases).
2. A 360 px wide phone: the header (brand, nav, language link) must not overflow horizontally. Pinned in Task 7 (e2e at 360×740).
3. JavaScript disabled: the home page must be fully readable. Pinned in Task 7 (e2e with `javaScriptEnabled: false`).
4. Keyboard users on a near-black background must see where focus is. Pinned in Task 7 (e2e: focused link has a non-`none` outline) and Task 4 (`:focus-visible` rule).
5. The metric guard must not cry wolf on versions and years ("Laravel 12", "PHP 8.2", "since 2023") yet must catch "1,200+", "+240%", "−85%" (Unicode minus) and "1 200+" (French thousands separator). Pinned in Task 5.

---

## File Structure (end of Lot 1)

```
.dockerignore
.gitignore
Dockerfile
astro.config.mjs
package.json
playwright.config.ts
tsconfig.json
vitest.config.ts               # unit tests (tests/unit)
vitest.dist.config.ts          # owner-rules check on the built site (tests/dist)
public/
  favicon.ico  favicon.svg  apple-touch-icon.png  icon-192.png  icon-512.png  icon-maskable-512.png  site.webmanifest
scripts/
  favicons.mjs                 # generates public/ icons from src/assets/brand/favicon.svg
src/
  assets/brand/favicon.svg     # the inventory-tag mark (source of truth)
  components/Header.astro  Footer.astro  Mark.astro  WallLabel.astro
  content/schemas.ts           # Zod schemas: works, proofs, screenshots
  content/metrics.ts           # number extraction + unsourced-metric finder
  content.config.ts            # registers the `works` collection
  data/profile.ts              # owner facts shared by pages (and later CV, JSON-LD)
  i18n/en.ts  fr.ts  index.ts  # dictionaries + locale helpers
  layouts/Base.astro
  lib/ico.ts                   # PNG -> ICO container (used by scripts/favicons.mjs via a JS twin, see Task 3)
  pages/index.astro  fr/index.astro  api/health.ts
  styles/tokens.css  global.css
  views/Home.astro             # shared EN/FR home body
tests/
  unit/i18n.test.ts  metrics.test.ts  schemas.test.ts  owner-rules.test.ts  ico.test.ts
  dist/owner-rules.dist.test.ts
  e2e/foundations.spec.ts
tools/
  owner-rules.ts               # checkOwnerRules(): pure rule engine
```

---

### Task 1: Clear the Nuxt tree and scaffold Astro 7

**Files:**
- Delete: every tracked file except `docs/**` and `.gitignore`
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro` (temporary), `src/env.d.ts` is NOT needed (Astro 7 generates `.astro/types.d.ts`)
- Modify: `.gitignore`

**Interfaces:**
- Produces: a buildable Astro project; `pnpm build` writes prerendered pages to `dist/client/` and the server to `dist/server/entry.mjs`.

- [ ] **Step 1: Confirm branch and clean state**

Run: `git branch --show-current && git status --short`
Expected: `v6` and no output from status.

- [ ] **Step 2: Remove the Nuxt codebase (history stays in git)**

```bash
git ls-files | grep -v -E '^(docs/|\.gitignore$)' | xargs -d '\n' git rm -q --
rm -rf node_modules .nuxt .output .data test-results playwright-report dist
git status --short | head -5
```
Expected: a list of `D ` lines; `docs/` untouched. `.superpowers/` (ignored) is left in place on purpose.

- [ ] **Step 3: Replace `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
test-results/
playwright-report/
coverage/
.superpowers/
.DS_Store
```

- [ ] **Step 4: Write `package.json`**

```json
{
  "name": "rostel-portfolio-v6",
  "private": true,
  "version": "6.0.0",
  "type": "module",
  "packageManager": "pnpm@10.28.0",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "node ./dist/server/entry.mjs",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint:rules": "vitest run --config vitest.dist.config.ts",
    "favicons": "node scripts/favicons.mjs"
  }
}
```

- [ ] **Step 5: Install dependencies**

```bash
pnpm add astro@^7.3.5 @astrojs/node@^11.1.6 @astrojs/mdx@^8.0.2 @astrojs/sitemap@^3.7.4 sharp@^0.35.5 @fontsource/cormorant-garamond@^5.3.0 @fontsource/schibsted-grotesk@^5.3.0 @fontsource/ibm-plex-mono@^5.3.0
pnpm add -D @astrojs/check@^0.9.10 typescript@^6 vitest@^5.0.2 @playwright/test@^1.63.0 @axe-core/playwright@^4.13.0
```
Expected: both commands finish without peer-dependency errors. pnpm 10 blocks dependency build scripts by default: run `pnpm approve-builds` and approve `sharp` and `esbuild`. This records the approval in `package.json` or `pnpm-workspace.yaml`; commit whichever file it changes, otherwise the Docker build (Task 7) installs sharp without its native binary.

- [ ] **Step 6: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://rostelmissimawu.com',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    mdx(),
    sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr' } } }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: { prefixDefaultLocale: false },
  },
});
```

- [ ] **Step 7: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 8: Temporary home page so the build has something to render**

`src/pages/index.astro`:
```astro
---
---
<html lang="en"><head><meta charset="utf-8" /><title>Rostel Panoumassi</title></head><body><p>v6 scaffold</p></body></html>
```

- [ ] **Step 9: Build**

Run: `pnpm build`
Expected: `astro check` reports 0 errors, build completes, and both files exist:
```bash
ls dist/client/index.html dist/server/entry.mjs
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore(v6): replace the Nuxt codebase with an Astro 7 scaffold

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: i18n core (dictionaries + locale path helpers)

**Files:**
- Create: `src/i18n/en.ts`, `src/i18n/fr.ts`, `src/i18n/index.ts`, `vitest.config.ts`
- Test: `tests/unit/i18n.test.ts`

**Interfaces:**
- Produces (from `src/i18n/index.ts`):
  - `locales: readonly ['en', 'fr']`, `type Locale = 'en' | 'fr'`, `defaultLocale: Locale`
  - `type Key = keyof typeof en`
  - `isLocale(value: unknown): value is Locale`
  - `toLocale(value: string | undefined): Locale`
  - `t(locale: Locale, key: Key, vars?: Record<string, string | number>): string` (replaces `{name}` placeholders)
  - `stripLocale(path: string): string` (drops query/hash and a leading `/en` or `/fr` segment; always returns a path starting with `/`)
  - `localizePath(path: string, locale: Locale): string`
  - `otherLocale(locale: Locale): Locale`
  - `dictionaries: Record<Locale, Record<Key, string>>`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Write the failing test `tests/unit/i18n.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import {
  dictionaries, isLocale, localizePath, otherLocale, stripLocale, t, toLocale,
} from '../../src/i18n';

describe('dictionaries', () => {
  it('have exactly the same keys in EN and FR', () => {
    expect(Object.keys(dictionaries.fr).sort()).toEqual(Object.keys(dictionaries.en).sort());
  });

  it('have no empty value', () => {
    for (const dict of Object.values(dictionaries)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim(), key).not.toBe('');
      }
    }
  });

  it('never contain an em dash (owner rule)', () => {
    for (const dict of Object.values(dictionaries)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.includes('—'), key).toBe(false);
      }
    }
  });
});

describe('t', () => {
  it('returns the localized string', () => {
    expect(t('en', 'nav.collection')).toBe('Collection');
    expect(t('fr', 'nav.collection')).toBe('Collection');
    expect(t('fr', 'nav.curator')).toBe('Conservateur');
  });

  it('fills placeholders and leaves unknown ones intact', () => {
    expect(t('en', 'label.experienceValue', { years: 6, lead: 3 })).toBe('6 years, 3 as tech lead');
    expect(t('en', 'label.experienceValue', { years: 6 })).toBe('6 years, {lead} as tech lead');
  });
});

describe('locale helpers', () => {
  it('recognises locales', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(toLocale('de')).toBe('en');
    expect(toLocale(undefined)).toBe('en');
    expect(otherLocale('en')).toBe('fr');
    expect(otherLocale('fr')).toBe('en');
  });

  it.each([
    ['/', '/'],
    ['/fr', '/'],
    ['/fr/', '/'],
    ['/fr/work', '/work'],
    ['/fr/work/ubbfy/', '/work/ubbfy/'],
    ['/fr/work/ubbfy/?view=catalogue', '/work/ubbfy/'],
    ['/work#top', '/work'],
    ['/en/about', '/about'],
    ['/french-fries', '/french-fries'],
  ])('stripLocale(%s) = %s', (input, expected) => {
    expect(stripLocale(input)).toBe(expected);
  });

  it.each([
    ['/', 'fr', '/fr'],
    ['/', 'en', '/'],
    ['/work', 'fr', '/fr/work'],
    ['/fr/work/ubbfy/?view=catalogue', 'en', '/work/ubbfy/'],
    ['/work/ubbfy/', 'fr', '/fr/work/ubbfy/'],
    ['/fr/about', 'fr', '/fr/about'],
  ] as const)('localizePath(%s, %s) = %s', (path, locale, expected) => {
    expect(localizePath(path, locale)).toBe(expected);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `../../src/i18n`.

- [ ] **Step 4: Write `src/i18n/en.ts`**

```ts
export const en = {
  'meta.title': 'Rostel Panoumassi, Senior and Lead Engineer',
  'meta.description':
    'Six years shipping backends for HR, payments and ERP platforms, the last three as tech lead. Head of Engineering at KPS Groupe, Cotonou. Open to Senior and Lead roles, remote.',
  'nav.label': 'Main',
  'nav.skip': 'Skip to content',
  'nav.collection': 'Collection',
  'nav.curator': 'Curator',
  'nav.cv': 'CV',
  'nav.contact': 'Contact',
  'status.open': 'Open to Senior and Lead roles',
  'lang.switchLabel': 'Lire ce site en français',
  'home.eyebrow': 'Nocturne · a collection of software in production',
  'home.h1.before': 'I build the backends behind ',
  'home.h1.em': 'HR, payments and ERP',
  'home.h1.after': ' platforms, and lead the team that ships them.',
  'home.lede.strong': 'Head of Engineering and Innovation at KPS Groupe',
  'home.lede.rest':
    ', Cotonou. Six years shipping software, the last three as tech lead. Django, Laravel, Node and Spring Boot on the back, Vue on the front. Open to Senior and Lead roles, remote from UTC+1.',
  'home.cta.enter': 'Enter the collection',
  'home.cta.cv': 'Download CV (PDF)',
  'label.title': 'Wall label',
  'label.aria': 'Key facts',
  'label.experience': 'Experience',
  'label.experienceValue': '{years} years, {lead} as tech lead',
  'label.post': 'Current post',
  'label.postValue': 'Head of Engineering, {employer}',
  'label.materials': 'Materials',
  'label.based': 'Based in',
  'label.basedValue': '{city}, {country} ({tz})',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.built': 'Built by hand with Astro',
} as const;

export type Dict = Record<keyof typeof en, string>;
```

- [ ] **Step 5: Write `src/i18n/fr.ts`**

```ts
import type { Dict } from './en';

export const fr: Dict = {
  'meta.title': 'Rostel Panoumassi, ingénieur Senior et Lead',
  'meta.description':
    "Six ans à construire les backends de plateformes RH, paiement et ERP, dont les trois derniers comme tech lead. Head of Engineering chez KPS Groupe, à Cotonou. Ouvert aux postes Senior et Lead, en remote.",
  'nav.label': 'Principale',
  'nav.skip': 'Aller au contenu',
  'nav.collection': 'Collection',
  'nav.curator': 'Conservateur',
  'nav.cv': 'CV',
  'nav.contact': 'Contact',
  'status.open': 'Ouvert aux postes Senior et Lead',
  'lang.switchLabel': 'Read this site in English',
  'home.eyebrow': 'Nocturne · une collection de logiciels en production',
  'home.h1.before': 'Je construis les backends de plateformes ',
  'home.h1.em': 'RH, paiement et ERP',
  'home.h1.after': ", et je dirige l'équipe qui les livre.",
  'home.lede.strong': 'Head of Engineering & Innovation chez KPS Groupe',
  'home.lede.rest':
    ', à Cotonou. Six ans à livrer du logiciel, dont les trois derniers comme tech lead. Django, Laravel, Node et Spring Boot côté serveur, Vue côté interface. Ouvert aux postes Senior et Lead, en remote depuis UTC+1.',
  'home.cta.enter': 'Entrer dans la collection',
  'home.cta.cv': 'Télécharger le CV (PDF)',
  'label.title': 'Cartel',
  'label.aria': 'Faits clés',
  'label.experience': 'Expérience',
  'label.experienceValue': '{years} ans, dont {lead} comme tech lead',
  'label.post': 'Poste actuel',
  'label.postValue': 'Head of Engineering, {employer}',
  'label.materials': 'Matériaux',
  'label.based': 'Basé à',
  'label.basedValue': '{city}, {country} ({tz})',
  'footer.privacy': 'Confidentialité',
  'footer.terms': 'CGU',
  'footer.built': 'Construit à la main avec Astro',
};
```

- [ ] **Step 6: Write `src/i18n/index.ts`**

```ts
import { en, type Dict } from './en';
import { fr } from './fr';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export type Key = keyof typeof en;

export const dictionaries: Record<Locale, Dict> = { en, fr };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function toLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function t(locale: Locale, key: Key, vars?: Record<string, string | number>): string {
  const template = dictionaries[locale][key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function stripLocale(path: string): string {
  const clean = path.split(/[?#]/)[0] || '/';
  const prefix = clean.match(/^\/(?:en|fr)(?=\/|$)/);
  const rest = prefix ? clean.slice(prefix[0].length) : clean;
  return rest === '' ? '/' : rest;
}

export function localizePath(path: string, locale: Locale): string {
  const base = stripLocale(path);
  if (locale === defaultLocale) return base;
  return base === '/' ? `/${locale}` : `/${locale}${base}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'fr' : 'en';
}
```

- [ ] **Step 7: Run the tests**

Run: `pnpm test`
Expected: PASS (all i18n tests).

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts src/i18n tests/unit/i18n.test.ts
git commit -m "feat(v6): bilingual dictionaries and locale path helpers

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Favicon set (inventory-tag mark)

**Files:**
- Create: `src/assets/brand/favicon.svg`, `src/lib/ico.ts`, `scripts/favicons.mjs`, `public/site.webmanifest`
- Generated (committed): `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`
- Test: `tests/unit/ico.test.ts`

**Interfaces:**
- Produces: `pngsToIco(images: { size: number; png: Uint8Array }[]): Uint8Array` in `src/lib/ico.ts`. The script `scripts/favicons.mjs` is plain JS (run by Node without a TS loader), so it contains its own copy of the same 20-line function; the unit test pins the TS version and the script's output is checked by Step 7.

- [ ] **Step 1: Write the failing test `tests/unit/ico.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { pngsToIco } from '../../src/lib/ico';

const fakePng = (n: number) => Uint8Array.from({ length: n }, (_, i) => i % 256);

describe('pngsToIco', () => {
  it('writes a valid ICONDIR header and one entry per image', () => {
    const a = fakePng(10);
    const b = fakePng(20);
    const ico = pngsToIco([{ size: 16, png: a }, { size: 32, png: b }]);
    const view = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
    expect(view.getUint16(0, true)).toBe(0); // reserved
    expect(view.getUint16(2, true)).toBe(1); // type = icon
    expect(view.getUint16(4, true)).toBe(2); // count
    // entry 1
    expect(ico[6]).toBe(16);
    expect(ico[7]).toBe(16);
    expect(view.getUint32(6 + 8, true)).toBe(10); // byte size
    expect(view.getUint32(6 + 12, true)).toBe(6 + 16 * 2); // offset
    // entry 2
    expect(ico[22]).toBe(32);
    expect(view.getUint32(22 + 12, true)).toBe(6 + 32 + 10);
    expect(ico.byteLength).toBe(6 + 32 + 10 + 20);
  });

  it('encodes 256 px as 0 per the ICO format', () => {
    const ico = pngsToIco([{ size: 256, png: fakePng(4) }]);
    expect(ico[6]).toBe(0);
    expect(ico[7]).toBe(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test tests/unit/ico.test.ts`
Expected: FAIL, cannot resolve `../../src/lib/ico`.

- [ ] **Step 3: Write `src/lib/ico.ts`**

```ts
export function pngsToIco(images: { size: number; png: Uint8Array }[]): Uint8Array {
  const headerSize = 6 + 16 * images.length;
  const total = headerSize + images.reduce((sum, i) => sum + i.png.byteLength, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach((img, index) => {
    const entry = 6 + 16 * index;
    out[entry] = img.size >= 256 ? 0 : img.size;
    out[entry + 1] = img.size >= 256 ? 0 : img.size;
    out[entry + 2] = 0; // palette
    out[entry + 3] = 0; // reserved
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, img.png.byteLength, true);
    view.setUint32(entry + 12, offset, true);
    out.set(img.png, offset);
    offset += img.png.byteLength;
  });
  return out;
}
```

- [ ] **Step 4: Run the test**

Run: `pnpm test tests/unit/ico.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the mark `src/assets/brand/favicon.svg`**

The inventory tag: a gold outlined label with an eyelet and "RP" in ivory, on the wall colour. Text is converted to paths-free `<text>` because sharp renders SVG text with the system serif; the letters are simple enough at 16 px.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="6" fill="#0e0d0c"/>
  <rect x="9" y="15" width="46" height="34" fill="none" stroke="#e3bd74" stroke-width="3"/>
  <circle cx="18" cy="24" r="3.2" fill="#e3bd74"/>
  <text x="36" y="42" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="19" font-weight="700" fill="#ece6da">RP</text>
</svg>
```

- [ ] **Step 6: Write `scripts/favicons.mjs` and `public/site.webmanifest`**

```js
// Generates the favicon set in public/ from src/assets/brand/favicon.svg.
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'src/assets/brand/favicon.svg';
const svg = await readFile(SRC);

const png = (size, { pad = 0 } = {}) =>
  sharp(svg, { density: 384 })
    .resize(size - pad * 2, size - pad * 2)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#0e0d0c' })
    .png()
    .toBuffer();

function pngsToIco(images) {
  const headerSize = 6 + 16 * images.length;
  const total = headerSize + images.reduce((sum, i) => sum + i.png.byteLength, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach((img, index) => {
    const entry = 6 + 16 * index;
    out[entry] = img.size >= 256 ? 0 : img.size;
    out[entry + 1] = img.size >= 256 ? 0 : img.size;
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, img.png.byteLength, true);
    view.setUint32(entry + 12, offset, true);
    out.set(img.png, offset);
    offset += img.png.byteLength;
  });
  return out;
}

await copyFile(SRC, 'public/favicon.svg');
const ico = pngsToIco(
  await Promise.all([16, 32, 48].map(async (size) => ({ size, png: new Uint8Array(await png(size)) }))),
);
await writeFile('public/favicon.ico', ico);
await writeFile('public/apple-touch-icon.png', await png(180));
await writeFile('public/icon-192.png', await png(192));
await writeFile('public/icon-512.png', await png(512));
await writeFile('public/icon-maskable-512.png', await png(512, { pad: 64 }));
console.log('favicons written to public/');
```

`public/site.webmanifest`:
```json
{
  "name": "Rostel Panoumassi",
  "short_name": "Rostel P.",
  "start_url": "/",
  "display": "browser",
  "background_color": "#0e0d0c",
  "theme_color": "#0e0d0c",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 7: Generate and check the files**

Run: `pnpm favicons && node -e "const s=require('sharp');['apple-touch-icon','icon-192','icon-512','icon-maskable-512'].forEach(f=>s('public/'+f+'.png').metadata().then(m=>console.log(f,m.width,m.height)))" && ls -la public/favicon.ico public/favicon.svg`
Expected: `apple-touch-icon 180 180`, `icon-192 192 192`, `icon-512 512 512`, `icon-maskable-512 512 512`; `favicon.ico` exists and is larger than 1 KB. Open `public/icon-512.png` and check visually that the tag and "RP" are legible.

- [ ] **Step 8: Commit**

```bash
git add src/assets/brand src/lib/ico.ts scripts/favicons.mjs public tests/unit/ico.test.ts
git commit -m "feat(v6): inventory-tag favicon set and web manifest

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Design system, base layout, header/footer and the home hero

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/data/profile.ts`, `src/layouts/Base.astro`, `src/components/Mark.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/WallLabel.astro`, `src/views/Home.astro`, `src/pages/fr/index.astro`
- Modify: `src/pages/index.astro` (replace the Task 1 placeholder)

**Interfaces:**
- Consumes: `t`, `localizePath`, `otherLocale`, `type Locale` from `src/i18n` (Task 2); favicon files (Task 3).
- Produces:
  - `profile` from `src/data/profile.ts` with fields `name`, `employer`, `city`, `country`, `timezone`, `yearsExperience`, `yearsLead`, `materials: readonly string[]`, `email`, `links.linkedin`, `links.github`.
  - `<Base locale title? description?>` layout with a default slot, wrapping every page in Lots 2 to 4.
  - CSS classes available to later lots: `.wrap`, `.eyebrow`, `.btn`, `.link`, `.skip`, `.visually-hidden`.

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  --wall: #0e0d0c;
  --wall-2: #141210;
  --wall-3: #1b1916;
  --ivory: #ece6da;
  --muted: #a39b8e;
  --faint: #8a8276;
  --gold: #e3bd74;
  --live: #8fc79a;
  --line: #2c2823;

  --serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --sans: 'Schibsted Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono: 'IBM Plex Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace;

  --gutter: 32px;
  --max: 1180px;
  --radius: 2px;
  color-scheme: dark;
}

@media (max-width: 760px) {
  :root { --gutter: 20px; }
}
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--wall);
  color: var(--ivory);
  font: 400 16px/1.6 var(--sans);
  -webkit-font-smoothing: antialiased;
  overflow-wrap: anywhere;
}
img, svg { display: block; max-width: 100%; }
a { color: inherit; }
:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }

.wrap { max-width: var(--max); margin: 0 auto; padding: 0 var(--gutter); }

.skip {
  position: absolute; left: var(--gutter); top: -100px;
  background: var(--ivory); color: var(--wall);
  padding: 10px 14px; border-radius: var(--radius); z-index: 10;
  text-decoration: none; font-weight: 500;
}
.skip:focus { top: 12px; }

.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

.eyebrow {
  font: 500 12px/1.4 var(--mono);
  letter-spacing: .08em; text-transform: uppercase; color: var(--gold);
}

.btn {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--ivory); color: var(--wall);
  font: 500 14px/1 var(--sans); text-decoration: none;
  padding: 14px 20px; border: 0; border-radius: var(--radius); cursor: pointer;
}
.btn:hover { background: var(--gold); }

.link {
  font-size: 14px; color: var(--ivory); text-decoration: none;
  border-bottom: 1px solid var(--faint); padding-bottom: 3px;
}
.link:hover { border-color: var(--gold); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 3: Write `src/data/profile.ts`**

```ts
export const profile = {
  name: 'Rostel Panoumassi',
  employer: 'KPS Groupe',
  city: 'Cotonou',
  country: 'Bénin',
  timezone: 'UTC+1',
  yearsExperience: 6,
  yearsLead: 3,
  materials: ['Django', 'Laravel', 'Node', 'Spring Boot', 'Vue', 'Flutter'],
  email: 'rmissimawu@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/rostelpanoumassi-6b6608335',
    github: 'https://github.com/ThommyShelby9',
  },
} as const;
```

- [ ] **Step 4: Write `src/components/Mark.astro`**

```astro
---
interface Props { size?: number }
const { size = 30 } = Astro.props;
---
<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <rect x="3" y="7" width="26" height="18" fill="none" stroke="var(--gold)" stroke-width="1.4" />
  <circle cx="8" cy="12" r="1.6" fill="var(--gold)" />
  <text x="17.5" y="21" text-anchor="middle" font-family="var(--serif)" font-weight="600" font-size="10" fill="var(--ivory)">RP</text>
</svg>
```

- [ ] **Step 5: Write `src/components/Header.astro`**

```astro
---
import Mark from './Mark.astro';
import { type Locale, localizePath, otherLocale, t } from '../i18n';

interface Props { locale: Locale }
const { locale } = Astro.props;
const alt = otherLocale(locale);
const nav = [
  ['/work', 'nav.collection'],
  ['/about', 'nav.curator'],
  ['/cv', 'nav.cv'],
  ['/contact', 'nav.contact'],
] as const;
---
<header class="site-header">
  <div class="wrap row">
    <a class="brand" href={localizePath('/', locale)}>
      <Mark />
      <span>Rostel Panoumassi</span>
    </a>
    <nav aria-label={t(locale, 'nav.label')}>
      <ul>
        {nav.map(([href, key]) => (
          <li><a href={localizePath(href, locale)}>{t(locale, key)}</a></li>
        ))}
      </ul>
    </nav>
    <div class="aside">
      <span class="avail"><span class="dot" aria-hidden="true"></span>{t(locale, 'status.open')}</span>
      <a class="lang" href={localizePath(Astro.url.pathname, alt)} hreflang={alt} lang={alt}
         aria-label={t(locale, 'lang.switchLabel')}>{alt.toUpperCase()}</a>
    </div>
  </div>
</header>

<style>
  .site-header { border-bottom: 1px solid var(--line); }
  .row { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 36px; min-height: 68px; }
  .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .brand span { font: 600 19px var(--serif); letter-spacing: .01em; }
  nav ul { display: flex; flex-wrap: wrap; gap: 8px 28px; list-style: none; margin: 0; padding: 0; }
  nav a { font-size: 14px; color: var(--muted); text-decoration: none; }
  nav a:hover { color: var(--ivory); }
  .aside { margin-left: auto; display: flex; align-items: center; gap: 22px; font-size: 13px; color: var(--muted); }
  .avail { display: flex; align-items: center; gap: 8px; }
  .dot { width: 6px; height: 6px; background: var(--live); display: inline-block; }
  .lang { color: var(--ivory); text-decoration: none; font: 500 13px var(--mono); padding: 4px 0; }
  .lang:hover { color: var(--gold); }
  @media (max-width: 760px) {
    .row { padding-block: 14px; gap: 10px 20px; }
    nav { order: 3; width: 100%; }
    nav ul { gap: 6px 20px; }
    .avail { display: none; }
  }
</style>
```

- [ ] **Step 6: Write `src/components/Footer.astro`**

```astro
---
import { type Locale, localizePath, t } from '../i18n';
import { profile } from '../data/profile';

interface Props { locale: Locale }
const { locale } = Astro.props;
---
<footer class="site-footer">
  <div class="wrap row">
    <span>{profile.name}, {profile.city}</span>
    <a href={`mailto:${profile.email}`}>{profile.email}</a>
    <a href={profile.links.linkedin} rel="me noopener">LinkedIn</a>
    <a href={profile.links.github} rel="me noopener">GitHub</a>
    <span class="end">
      <a href={localizePath('/privacy', locale)}>{t(locale, 'footer.privacy')}</a>
      <a href={localizePath('/terms', locale)}>{t(locale, 'footer.terms')}</a>
      <span>{t(locale, 'footer.built')}</span>
    </span>
  </div>
</footer>

<style>
  .site-footer { border-top: 1px solid var(--line); padding: 34px 0 48px; font-size: 13px; color: var(--muted); }
  .row { display: flex; flex-wrap: wrap; gap: 12px 28px; }
  .end { margin-left: auto; display: flex; flex-wrap: wrap; gap: 12px 22px; }
  a { text-decoration: none; }
  a:hover { color: var(--ivory); }
  @media (max-width: 760px) { .end { margin-left: 0; } }
</style>
```

- [ ] **Step 7: Write `src/layouts/Base.astro`**

```astro
---
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/schibsted-grotesk/400.css';
import '@fontsource/schibsted-grotesk/500.css';
import '@fontsource/schibsted-grotesk/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../styles/tokens.css';
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { type Locale, localizePath, otherLocale, t } from '../i18n';

interface Props { locale: Locale; title?: string; description?: string }
const { locale, title = t(locale, 'meta.title'), description = t(locale, 'meta.description') } = Astro.props;
const path = Astro.url.pathname;
const alt = otherLocale(locale);
const canonical = new URL(localizePath(path, locale), Astro.site);
const altHref = new URL(localizePath(path, alt), Astro.site);
const xDefault = new URL(localizePath(path, 'en'), Astro.site);
---
<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang={locale} href={canonical} />
    <link rel="alternate" hreflang={alt} href={altHref} />
    <link rel="alternate" hreflang="x-default" href={xDefault} />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#0e0d0c" />
  </head>
  <body>
    <a class="skip" href="#main">{t(locale, 'nav.skip')}</a>
    <Header locale={locale} />
    <main id="main" tabindex="-1"><slot /></main>
    <Footer locale={locale} />
  </body>
</html>
```

- [ ] **Step 8: Write `src/components/WallLabel.astro`**

```astro
---
import { type Locale, t } from '../i18n';
import { profile } from '../data/profile';

interface Props { locale: Locale }
const { locale } = Astro.props;
const rows = [
  [t(locale, 'label.experience'), t(locale, 'label.experienceValue', { years: profile.yearsExperience, lead: profile.yearsLead })],
  [t(locale, 'label.post'), t(locale, 'label.postValue', { employer: profile.employer })],
  [t(locale, 'label.materials'), profile.materials.join(', ')],
  [t(locale, 'label.based'), t(locale, 'label.basedValue', { city: profile.city, country: profile.country, tz: profile.timezone })],
];
---
<aside class="panel" aria-label={t(locale, 'label.aria')}>
  <div class="title">{t(locale, 'label.title')}</div>
  <dl>
    {rows.map(([term, value]) => (<><dt>{term}</dt><dd>{value}</dd></>))}
  </dl>
</aside>

<style>
  .panel { border: 1px solid var(--line); padding: 22px 24px; font-size: 13px; line-height: 1.7; }
  .title { font: 500 11px var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--faint); margin-bottom: 10px; }
  dl { margin: 0; display: grid; grid-template-columns: 110px 1fr; row-gap: 6px; column-gap: 12px; }
  dt { color: var(--faint); }
  dd { margin: 0; color: var(--ivory); }
</style>
```

- [ ] **Step 9: Write `src/views/Home.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import WallLabel from '../components/WallLabel.astro';
import { type Locale, localizePath, t } from '../i18n';

interface Props { locale: Locale }
const { locale } = Astro.props;
---
<Base locale={locale}>
  <section class="wrap hero">
    <div>
      <p class="eyebrow">{t(locale, 'home.eyebrow')}</p>
      <h1>{t(locale, 'home.h1.before')}<em>{t(locale, 'home.h1.em')}</em>{t(locale, 'home.h1.after')}</h1>
      <p class="lede"><strong>{t(locale, 'home.lede.strong')}</strong>{t(locale, 'home.lede.rest')}</p>
      <div class="ctas">
        <a class="btn" href={localizePath('/work', locale)}>
          {t(locale, 'home.cta.enter')}
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4" />
          </svg>
        </a>
        <a class="link" href="/cv/rostel-panoumassi-cv.pdf">{t(locale, 'home.cta.cv')}</a>
      </div>
    </div>
    <WallLabel locale={locale} />
  </section>
</Base>

<style>
  .hero { padding: 96px 0 88px; display: grid; grid-template-columns: 1.55fr 1fr; gap: 64px; align-items: end; }
  .eyebrow { margin: 0 0 26px; }
  h1 { font: 500 clamp(40px, 5.2vw, 62px)/1.04 var(--serif); letter-spacing: -.01em; margin: 0; }
  h1 em { font-style: italic; color: var(--gold); }
  .lede { font-size: 17px; line-height: 1.6; color: var(--muted); max-width: 54ch; margin: 26px 0 34px; }
  .lede strong { color: var(--ivory); font-weight: 500; }
  .ctas { display: flex; flex-wrap: wrap; align-items: center; gap: 20px 28px; }
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 56px 0 64px; }
  }
</style>
```

Note: the PDF at `/cv/rostel-panoumassi-cv.pdf` is produced in Lot 4. Until then the link 404s; the Lot 1 e2e test does not follow it.

- [ ] **Step 10: Route files**

`src/pages/index.astro` (replace the placeholder):
```astro
---
import Home from '../views/Home.astro';
---
<Home locale="en" />
```

`src/pages/fr/index.astro`:
```astro
---
import Home from '../../views/Home.astro';
---
<Home locale="fr" />
```

- [ ] **Step 11: Build and inspect**

Run: `pnpm build && grep -o '<h1>.*</h1>' dist/client/index.html && grep -o '<html lang="fr"' dist/client/fr/index.html`
Expected: the EN `<h1>` with `<em>HR, payments and ERP</em>`, and `<html lang="fr"`.

Then run `pnpm dev`, open `http://localhost:4321/` and `/fr` at desktop width and at 360 px wide, and compare with the validated mockup `.superpowers/brainstorm/2023-1790585654/content/nocturne-home-v2.html` (header, hero, wall label). Stop the dev server.

- [ ] **Step 12: Commit**

```bash
git add src tests
git commit -m "feat(v6): Nocturne design tokens, base layout, header/footer and bilingual home hero

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Content schemas and the no-fake-metrics guard

**Files:**
- Create: `src/content/schemas.ts`, `src/content/metrics.ts`, `src/content.config.ts`, `src/content/works/.gitkeep`
- Test: `tests/unit/schemas.test.ts`, `tests/unit/metrics.test.ts`

**Interfaces:**
- Produces:
  - `proofSchema` (`{ text: string; source: string }`, both non-empty)
  - `makeWorkSchema<T extends z.ZodType>(imageSchema: T)`: the full work frontmatter schema (spec §6.1). In `content.config.ts` it is called with Astro's `image()`; in tests with `z.string()`.
  - `type WorkStatus = 'live' | 'archived' | 'private'`
  - `extractNumbers(text: string): { raw: string; key: string; isMetric: boolean }[]`
  - `findUnsourcedMetrics(text: string, proofs: readonly { text: string }[]): string[]` (returns the `raw` of each metric in `text` whose `key` does not appear among the numbers of any proof). Lot 2 runs it over every work's `summary` and MDX body.

- [ ] **Step 1: Write the failing test `tests/unit/metrics.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { extractNumbers, findUnsourcedMetrics } from '../../src/content/metrics';

const metrics = (text: string) => extractNumbers(text).filter((n) => n.isMetric).map((n) => n.raw);

describe('extractNumbers', () => {
  it('does not treat versions, small counts or years as metrics', () => {
    expect(metrics('Built on Laravel 12, PHP 8.2 and Node 22 since 2023, with 3 modules.')).toEqual([]);
  });

  it('treats percentages, signed values, plus-suffixed and large values as metrics', () => {
    expect(metrics('+240% organic traffic')).toEqual(['+240%']);
    expect(metrics('−85% manual entry')).toEqual(['−85%']);
    expect(metrics('cut by 85% in six months')).toEqual(['85%']);
    expect(metrics('1,200+ active users')).toEqual(['1,200+']);
    expect(metrics('1 200+ utilisateurs actifs')).toEqual(['1 200+']);
    expect(metrics('23,625 TypeScript lines')).toEqual(['23,625']);
    expect(metrics('Lighthouse SEO score of 100')).toEqual(['100']);
  });

  it('normalises equivalent spellings to the same key', () => {
    const keys = (s: string) => extractNumbers(s).map((n) => n.key);
    expect(keys('1,200+')).toEqual(keys('1 200+'));
    expect(keys('+240%')).toEqual(keys('240%'));
    expect(keys('−85%')).toEqual(keys('-85%'));
  });
});

describe('findUnsourcedMetrics', () => {
  const proofs = [
    { text: '+240% organic traffic in 6 months' },
    { text: '1,200+ active users' },
  ];

  it('accepts metrics that appear in a proof, whatever the spelling', () => {
    expect(findUnsourcedMetrics('Traffic grew 240% and we reached 1 200+ users.', proofs)).toEqual([]);
  });

  it('reports metrics that no proof backs', () => {
    expect(findUnsourcedMetrics('We cut costs by 40% for 5,000 users.', proofs)).toEqual(['40%', '5,000']);
  });

  it('reports each unsourced metric once', () => {
    expect(findUnsourcedMetrics('40% here, 40% there', [])).toEqual(['40%']);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test tests/unit/metrics.test.ts`
Expected: FAIL, cannot resolve `../../src/content/metrics`.

- [ ] **Step 3: Write `src/content/metrics.ts`**

```ts
export interface ExtractedNumber { raw: string; key: string; isMetric: boolean }

// A number, optionally signed (+, -, U+2212), with optional thousands groups
// separated by comma, space, no-break space or narrow no-break space,
// an optional decimal part, an optional % and an optional trailing +.
const NUMBER =
  /(?<![\p{L}\p{N}.,])([+\-−])?(\d{1,3}(?:[,   ]\d{3})+|\d+)(?:\.(\d+))?(\s?%)?(\+)?/gu;

export function extractNumbers(text: string): ExtractedNumber[] {
  const found: ExtractedNumber[] = [];
  for (const m of text.matchAll(NUMBER)) {
    const [raw, sign, intPart, decimals, percent, plus] = m;
    const digits = intPart.replace(/[,   ]/g, '');
    const value = Number(decimals ? `${digits}.${decimals}` : digits);
    const grouped = digits !== intPart;
    const isYear = !grouped && !decimals && !percent && !plus && !sign && value >= 1900 && value <= 2100;
    const isMetric = Boolean(percent || sign || plus) || (value >= 100 && !isYear);
    const key = `${decimals ? `${digits}.${decimals}` : digits}${percent ? '%' : ''}`;
    found.push({ raw: raw.trim(), key, isMetric });
  }
  return found;
}

export function findUnsourcedMetrics(text: string, proofs: readonly { text: string }[]): string[] {
  const sourced = new Set(proofs.flatMap((p) => extractNumbers(p.text).map((n) => n.key)));
  const reported = new Set<string>();
  const result: string[] = [];
  for (const n of extractNumbers(text)) {
    if (!n.isMetric || sourced.has(n.key) || reported.has(n.key)) continue;
    reported.add(n.key);
    result.push(n.raw);
  }
  return result;
}
```

Note on the `version 8.2` case: `8.2` matches with `value = 8.2 < 100`, no sign, no percent, so it is not a metric. `2023` is a year. `12` and `22` are below 100.

- [ ] **Step 4: Run the metrics tests**

Run: `pnpm test tests/unit/metrics.test.ts`
Expected: PASS. If `1 200+` is split into `1` and `200+`, check that the space inside the thousands group is included in the character class `[,   ]`.

- [ ] **Step 5: Write the failing test `tests/unit/schemas.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { makeWorkSchema, proofSchema } from '../../src/content/schemas';

const workSchema = makeWorkSchema(z.string());

const valid = {
  inventory: 'RP-2026-01',
  title: 'Ubbfy',
  summary: 'ERP suite with geolocated time clock.',
  year: 2026,
  role: 'Lead engineer, architecture and rebuild',
  materials: ['Django 5', 'Vue 3'],
  status: 'live',
  liveUrl: 'https://app.ubbfy.com',
  room: 1,
  screenshots: [{ src: './ubbfy.png', alt: 'Ubbfy landing page', kind: 'public' }],
  proofs: [{ text: '20 Django apps behind one API', source: 'counted in the ubbfy repo' }],
  seoDescription: 'Ubbfy, an ERP suite rebuilt on Django 5 and Vue 3.',
};

describe('proofSchema', () => {
  it('rejects a proof without a source (no fake metrics)', () => {
    expect(proofSchema.safeParse({ text: '+240% traffic' }).success).toBe(false);
    expect(proofSchema.safeParse({ text: '+240% traffic', source: '' }).success).toBe(false);
  });
});

describe('makeWorkSchema', () => {
  it('accepts a complete work', () => {
    expect(workSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults proofs to an empty list', () => {
    const { proofs, ...rest } = valid;
    const parsed = workSchema.parse(rest);
    expect(parsed.proofs).toEqual([]);
  });

  it('requires liveUrl when status is live', () => {
    const { liveUrl, ...rest } = valid;
    const result = workSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('allows an archived work without liveUrl and outside Room I', () => {
    const { liveUrl, ...rest } = valid;
    expect(workSchema.safeParse({ ...rest, status: 'archived', room: null }).success).toBe(true);
  });

  it.each([
    ['inventory format', { inventory: 'RP-26-1' }],
    ['empty materials', { materials: [] }],
    ['no screenshot', { screenshots: [] }],
    ['screenshot without alt', { screenshots: [{ src: './a.png', alt: '', kind: 'public' }] }],
    ['unknown status', { status: 'draft' }],
    ['room out of range', { room: 5 }],
    ['seoDescription too long', { seoDescription: 'x'.repeat(171) }],
  ])('rejects %s', (_label, patch) => {
    expect(workSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm test tests/unit/schemas.test.ts`
Expected: FAIL, cannot resolve `../../src/content/schemas`.

- [ ] **Step 7: Write `src/content/schemas.ts`**

```ts
import { z } from 'astro/zod';

export const proofSchema = z.object({
  text: z.string().trim().min(1),
  source: z.string().trim().min(1),
});

export const workStatus = z.enum(['live', 'archived', 'private']);
export type WorkStatus = z.infer<typeof workStatus>;

export function makeWorkSchema<T extends z.ZodType>(imageSchema: T) {
  return z
    .object({
      inventory: z.string().regex(/^RP-\d{4}-\d{2}$/),
      title: z.string().trim().min(1),
      summary: z.string().trim().min(1),
      year: z.number().int().min(2015).max(2100),
      role: z.string().trim().min(1),
      team: z.string().trim().min(1).optional(),
      duration: z.string().trim().min(1).optional(),
      materials: z.array(z.string().trim().min(1)).min(1),
      status: workStatus,
      liveUrl: z.url().optional(),
      githubUrl: z.url().optional(),
      room: z.number().int().min(1).max(4).nullable(),
      screenshots: z
        .array(
          z.object({
            src: imageSchema,
            alt: z.string().trim().min(1),
            kind: z.enum(['public', 'interior']),
          }),
        )
        .min(1),
      proofs: z.array(proofSchema).default([]),
      seoDescription: z.string().trim().min(1).max(170),
    })
    .superRefine((work, ctx) => {
      if (work.status === 'live' && !work.liveUrl) {
        ctx.addIssue({ code: 'custom', path: ['liveUrl'], message: 'liveUrl is required when status is live' });
      }
    });
}
```

- [ ] **Step 8: Run the schema tests**

Run: `pnpm test tests/unit/schemas.test.ts`
Expected: PASS.

- [ ] **Step 9: Register the collection in `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { makeWorkSchema } from './content/schemas';

const works = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/works' }),
  schema: ({ image }) => makeWorkSchema(image()),
});

export const collections = { works };
```

Create the empty folder marker: `src/content/works/.gitkeep` (empty file). Entries arrive in Lot 2 as `src/content/works/en/<slug>.mdx` and `src/content/works/fr/<slug>.mdx`; their ids will be `en/<slug>` and `fr/<slug>`.

- [ ] **Step 10: Build (the empty collection must not break anything)**

Run: `pnpm build`
Expected: success. A warning that the `works` collection is empty is acceptable.

- [ ] **Step 11: Commit**

```bash
git add src/content src/content.config.ts tests/unit/metrics.test.ts tests/unit/schemas.test.ts
git commit -m "feat(v6): work content schema with mandatory proof sources and unsourced-metric finder

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Owner-rules checker (unit rules + check of the built site)

**Files:**
- Create: `tools/owner-rules.ts`, `vitest.dist.config.ts`, `tests/dist/owner-rules.dist.test.ts`
- Test: `tests/unit/owner-rules.test.ts`

**Interfaces:**
- Produces (from `tools/owner-rules.ts`):
  - `type RuleId = 'em-dash' | 'emoji' | 'pill' | 'purple-gradient' | 'ai-tag' | 'favicon'`
  - `interface SourceFile { path: string; content: string }`
  - `interface Violation { rule: RuleId; path: string; detail: string }`
  - `checkOwnerRules(files: SourceFile[]): Violation[]`
  - Lot 4 adds a `'required-page'` rule for `/privacy` and `/terms`.

- [ ] **Step 1: Write the failing test `tests/unit/owner-rules.test.ts`**

```ts
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

  it('flags purple gradients in any colour notation', () => {
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(90deg,#7c3aed,#db2777)}' }])).toEqual(['purple-gradient']);
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(rgb(139, 92, 246), #000)}' }])).toEqual(['purple-gradient']);
    expect(rules([{ path: 'a.css', content: '.h{background:linear-gradient(#e3bd74,#0e0d0c)}' }])).toEqual([]);
  });

  it('flags AI or builder tags', () => {
    expect(rules([{ path: 'a.html', content: page('<footer>Made with AI</footer>') }])).toEqual(['ai-tag']);
    expect(rules([{ path: 'a.html', content: page('<footer>Built with Lovable</footer>') }])).toEqual(['ai-tag']);
  });

  it('flags an HTML page without a favicon link', () => {
    expect(rules([{ path: 'a.html', content: page('<p>ok</p>', '') }])).toEqual(['favicon']);
  });

  it('reports the file path and an excerpt', () => {
    const [v] = checkOwnerRules([{ path: 'fr/index.html', content: page('<p>Lead — engineer</p>') }]);
    expect(v.path).toBe('fr/index.html');
    expect(v.detail).toContain('Lead');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test tests/unit/owner-rules.test.ts`
Expected: FAIL, cannot resolve `../../tools/owner-rules`.

- [ ] **Step 3: Write `tools/owner-rules.ts`**

```ts
export type RuleId = 'em-dash' | 'emoji' | 'pill' | 'purple-gradient' | 'ai-tag' | 'favicon';
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
  return h >= 250 && h <= 320 && s >= 0.25 && l >= 0.15 && l <= 0.9;
}

function colorsIn(css: string): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (const m of css.matchAll(/#[0-9a-f]{3,8}\b/gi)) {
    const rgb = hexToRgb(m[0]);
    if (rgb) out.push(rgb);
  }
  for (const m of css.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/gi)) {
    out.push([Number(m[1]), Number(m[2]), Number(m[3])]);
  }
  return out;
}

function isPillRadius(value: string): boolean {
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

    for (const m of css.matchAll(/border-radius\s*:\s*([^;}"]+)/gi)) {
      if (isPillRadius(m[1])) {
        add('pill', file.path, m[0].trim());
        break;
      }
    }

    for (const m of css.matchAll(/(?:linear|radial|conic)-gradient\(([^;{}]*)\)/gi)) {
      if (colorsIn(m[1]).some(isPurple)) {
        add('purple-gradient', file.path, m[0].slice(0, 80));
        break;
      }
    }
  }
  return violations;
}
```

- [ ] **Step 4: Run the unit tests**

Run: `pnpm test tests/unit/owner-rules.test.ts`
Expected: PASS.

- [ ] **Step 5: Write `vitest.dist.config.ts` and `tests/dist/owner-rules.dist.test.ts`**

`vitest.dist.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/dist/**/*.test.ts'], environment: 'node' },
});
```

`tests/dist/owner-rules.dist.test.ts`:
```ts
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, it } from 'vitest';
import { checkOwnerRules } from '../../tools/owner-rules';

const ROOT = 'dist/client';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

it('the built site complies with the owner rules', () => {
  expect(existsSync(ROOT), 'run `pnpm build` first').toBe(true);
  const files = walk(ROOT)
    .filter((p) => /\.(html|css)$/.test(p))
    .map((p) => ({ path: relative(ROOT, p), content: readFileSync(p, 'utf8') }));
  expect(files.some((f) => f.path.endsWith('.html'))).toBe(true);
  expect(checkOwnerRules(files)).toEqual([]);
});
```

- [ ] **Step 6: Run the check on the real build**

Run: `pnpm build && pnpm lint:rules`
Expected: PASS. If it fails, the report names the file and an excerpt: fix the source (copy, CSS), never the rule.

- [ ] **Step 7: Commit**

```bash
git add tools tests/unit/owner-rules.test.ts tests/dist vitest.dist.config.ts
git commit -m "test(v6): automated owner-rules checker (em dash, emoji, pills, purple gradients, AI tags, favicon)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Health endpoint, end-to-end + accessibility tests, Dockerfile

**Files:**
- Create: `src/pages/api/health.ts`, `playwright.config.ts`, `tests/e2e/foundations.spec.ts`, `Dockerfile`, `.dockerignore`

**Interfaces:**
- Consumes: everything above.
- Produces: `GET /api/health` returning `200 {"ok":true}` (Coolify healthcheck); a Playwright setup that later lots extend with more `tests/e2e/*.spec.ts` files.

- [ ] **Step 1: Write `src/pages/api/health.ts`**

```ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
```

- [ ] **Step 2: Install the Playwright browser**

Run: `pnpm exec playwright install chromium`
Expected: Chromium downloaded (the machine had none; the previous project used system Edge).

- [ ] **Step 3: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    command: 'pnpm build && node ./dist/server/entry.mjs',
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { HOST: '127.0.0.1', PORT: String(PORT) },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
```

- [ ] **Step 4: Write the e2e spec `tests/e2e/foundations.spec.ts`**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('foundations', () => {
  test('English home states who, what and where', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HR, payments and ERP');
    await expect(page.getByText('6 years, 3 as tech lead')).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', /\/fr$/);
    expect(errors).toEqual([]);
  });

  test('language link switches to French and back', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[hreflang="fr"]').first().click();
    // The Node server may redirect /fr to /fr/ when serving the prerendered directory.
    await expect(page).toHaveURL(/\/fr\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('RH, paiement et ERP');
    await page.locator('a[hreflang="en"]').first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('favicons are served', async ({ request }) => {
    for (const path of ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/site.webmanifest']) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
  });

  test('health endpoint answers', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test('no horizontal overflow on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ['/', '/fr']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('keyboard: skip link comes first and focus is visible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('a.skip');
    await expect(skip).toBeFocused();
    const outline = await skip.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });

  for (const path of ['/', '/fr']) {
    test(`no accessibility violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('home is fully readable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Enter the collection' })).toBeVisible();
  });
});
```

- [ ] **Step 5: Run the e2e suite**

Run: `pnpm test:e2e`
Expected: all tests PASS on both `desktop` and `mobile` projects. If axe reports `color-contrast`, fix the colour in `tokens.css` or the component (never disable the rule).

- [ ] **Step 6: Write `Dockerfile` and `.dockerignore`**

`Dockerfile`:
```dockerfile
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ARG PUBLIC_SITE_URL=https://rostelmissimawu.com
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
RUN pnpm build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:4321/api/health || exit 1
CMD ["node", "./dist/server/entry.mjs"]
```

`.dockerignore`:
```
node_modules
dist
.astro
.git
.superpowers
docs
tests
test-results
playwright-report
coverage
.env
.env.*
```

Docker is not installed on the development machine: the image is validated on the first Coolify deployment of the `v6` branch (Lot 4 cut-over). Do not claim it was built locally.

- [ ] **Step 7: Full verification**

Run: `pnpm test && pnpm build && pnpm lint:rules && pnpm test:e2e`
Expected: every command exits 0.

- [ ] **Step 8: Commit**

```bash
git add src/pages/api playwright.config.ts tests/e2e Dockerfile .dockerignore
git commit -m "feat(v6): health endpoint, e2e and axe foundations suite, Coolify Dockerfile

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

## Lot 1 done when

- `pnpm test`, `pnpm build`, `pnpm lint:rules`, `pnpm test:e2e` all pass.
- `/` and `/fr` match the validated mockup's header, hero and wall label, at desktop and 360 px.
- No Nuxt file remains on `v6`; history is intact.
