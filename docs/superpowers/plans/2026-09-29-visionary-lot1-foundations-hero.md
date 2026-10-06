# Visionary Engineer, Lot 1 (Next.js foundations + hero with sculpture) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Astro skeleton on branch `v6` with a Next.js 16 app that serves the validated bilingual hero (FR at `/`, EN at `/en`) with the real-time champagne Möbius sculpture, its static poster fallback, GSAP reveals, the favicon set, an automated owner-rules check, a health endpoint, e2e + accessibility tests and a Coolify Dockerfile.

**Architecture:** Next.js 16 App Router with a single root layout at `src/app/[locale]/layout.tsx`, next-intl for routing (`fr` default without prefix, `en` prefixed) and messages, Tailwind CSS 4 tokens, fonts via `next/font`. The sculpture's geometry is a pure TypeScript module (unit-tested); a React Three Fiber component renders it; a client "stage" decides between the live 3D scene and a pre-rendered poster (reduced motion, no WebGL, loading), drives cursor tilt and scroll trajectory with GSAP ScrollTrigger, and pauses rendering when unseen. Pages are prerendered; `output: 'standalone'` feeds the Docker image.

**Tech Stack:** Next.js 16.3, React 19, TypeScript ^6 (fall back to ^5 only if Next rejects 6), next-intl 4, Tailwind CSS 4 (`@tailwindcss/postcss`), three 0.186 + @react-three/fiber 9, gsap 3.15 + @gsap/react 2, Vitest 5, Playwright 1.63 + @axe-core/playwright, sharp, pnpm 10, Node 22.

**Spec:** `docs/superpowers/specs/2026-09-29-portfolio-v6-visionary-engineer-design.md`

## Roadmap (this plan = Lot 1)

| Lot | Scope |
|---|---|
| **1** | Next.js scaffold, i18n routing, design system, layout, favicon, hero, Möbius sculpture + poster, reveals, owner-rules check, health, e2e/axe, Dockerfile (this file) |
| 2 | Rest of the home: Positioning (3 pillars + signature), Selected work cards, Method, Conversion; full sculpture trajectory (fade at Work, reappear before Conversion); header mobile menu (no nav below md today), `pageMetadata(locale, href)` helper for per-page canonical/hreflang, page transitions ≤ 300 ms (spec §3.5) |
| 3 | Content: MDX loader + Zod schema + metric guard over real content; `/realisations`, `/realisations/[slug]`, `/explorations`; images; OG images; JSON-LD; `sitemap.ts` + `robots.ts` (spec §5.5) |
| 4 | Conversion: `/brief` + `/brief/merci`, `/contact` (Server Actions, Firestore, SMTP, rate limit, honeypot), `/api/hit` stats, `/confidentialite`, `/cgu` |
| 5 | `/a-propos`, `/cv` + PDF, `/terminal`, 404, required-pages owner rule, Lighthouse budget, full e2e sweep, README, Coolify cut-over; gate `?sculpture=poster` behind an env flag before cut-over |

## Global Constraints

- Owner rules (spec §2): not "vibecoded"; never a purple gradient; buttons are rectangles (`border-radius` max 2px); no fake reviews, metrics or client counters; no vague hero; no emoji as icons (SVG only); **no em dash (U+2014) in any site copy, FR or EN**; **no custom cursor**, nothing follows the mouse except the sculpture's subtle tilt; never AI-generated photos; favicon required; no "made with AI" tag.
- Relaxations valid for this direction only: the sculpture may tilt with the cursor (desktop, fine pointer only, ±0.2 rad, smoothed); scroll animations allowed (reveals once, sculpture rotation/drift). **Everything off under `prefers-reduced-motion: reduce`**; no scroll hijacking, no unskippable intro.
- Owner facts: 6 years of experience, 3 as tech lead; Head of Engineering and Innovation, KPS Groupe, Cotonou.
- Colours (spec §3.2): `--obsidian #101112`, `--obsidian-2 #161719`, `--ivory #E9E5DC`, `--champagne #BCA57B` (only accent), `--muted #A7A49C`, `--faint #8A8C90`, `--graphite #55575B` (**decorative only, never text**), `--line #26272A`. Dark theme only.
- Fonts via `next/font/google` (self-hosted at build): Cormorant Garamond (500, 600, italic 500), Manrope (400, 500, 600), IBM Plex Mono (400, 500).
- Locales: `fr` default, unprefixed; `en` under `/en`; `localeDetection: false`.
- Sculpture (spec §3.4): Möbius ribbon, base circle radius 1.9, ribbon width 0.95, one half-twist; desktop 6 strands over two laps (12 visible), mobile 3 (6 visible); material colour `#d8c196`, metalness 1, roughness 0.24, clearcoat 0.7, clearcoatRoughness 0.2; warm key light `0xffe3b0` intensity 2.2 at (4,5,6), cool rim `0x9fb4ff` 0.6 at (-6,-2,-4); environment from `RoomEnvironment` (no downloaded HDR); `dpr` max 2 desktop, 1.5 mobile. Loaded after idle; poster shown while loading, without WebGL, and under reduced motion; decorative (`aria-hidden`).
- French copy uses the typographic apostrophe `’` (never ASCII `'` in FR strings).
- Next.js 16 differs from older versions: `proxy.ts` replaces `middleware.ts`, `params` are Promises, Turbopack is the default bundler. When unsure about an API, read the bundled docs in `node_modules/next/dist/docs/` before writing code; for next-intl read https://next-intl.dev/docs. If an API in this plan does not match the installed version, adapt minimally, keep the behaviour, and report the adaptation.
- Package manager pnpm; Node >= 22.12.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. A device or browser without WebGL (blocked, old GPU) must show the poster, never a blank box or a console error. Pinned in Task 6 (e2e with `getContext` patched to return `null` for WebGL).
2. If the reveal JavaScript fails to load or throws, the hero text must still become visible (the v5 portfolio once hid every title this way). Pinned in Task 5 (inline safety timer) and tested in Task 7 (e2e with JS chunks blocked).
3. An English-language browser opening `/` must stay on the French home (shared links must be stable). Pinned in Task 2 (`localeDetection: false`) and tested in Task 7.
4. The render loop must stop when the sculpture is off screen or the tab is hidden (battery on phones). Pinned in Task 6 (`data-running` attribute + e2e after scrolling away).
5. An unknown locale segment (`/de`, `/xx/whatever`) must return a 404 page, not a crash. Pinned in Task 2 (`hasLocale` + `notFound()`) and tested in Task 7.

---

## File Structure (end of Lot 1)

```
.dockerignore  .gitignore  Dockerfile  AGENTS.md (written by next dev; commit it)
next.config.ts  postcss.config.mjs  tsconfig.json  package.json
playwright.config.ts  vitest.config.ts  vitest.dist.config.ts
messages/fr.json  messages/en.json
public/  favicon.ico favicon.svg apple-touch-icon.png icon-192.png icon-512.png icon-maskable-512.png site.webmanifest
public/sculpture/mobius-desktop.webp  public/sculpture/mobius-mobile.webp
scripts/ico.mjs  scripts/favicons.mjs  scripts/prepare-standalone.mjs  scripts/sculpture-poster.mjs
src/assets/brand/favicon.svg
src/proxy.ts
src/i18n/routing.ts  src/i18n/navigation.ts  src/i18n/request.ts
src/styles/globals.css  src/styles/fonts.ts
src/app/[locale]/layout.tsx  src/app/[locale]/page.tsx  src/app/[locale]/not-found.tsx
src/app/api/health/route.ts
src/components/site/SkipLink.tsx  Header.tsx  Footer.tsx  LocaleSwitch.tsx  Monogram.tsx  ButtonLink.tsx
src/components/home/Hero.tsx  src/components/motion/Reveal.tsx
src/components/sculpture/mobius.ts        # pure geometry (tested)
src/components/sculpture/Sculpture.tsx    # R3F scene
src/components/sculpture/SculptureStage.tsx  # poster/3D decision, tilt, scroll, pause
src/lib/content/metrics.ts                # carried over from the Astro work (tested), used in Lot 3
tools/owner-rules.ts
tests/unit/metrics.test.ts  owner-rules.test.ts  ico.test.ts  messages.test.ts  mobius.test.ts
tests/dist/owner-rules.dist.test.ts
tests/e2e/foundations.spec.ts  tests/e2e/sculpture.spec.ts
```

Kept from the Astro work: `scripts/ico.mjs`, `scripts/favicons.mjs`, `tools/owner-rules.ts`, `tests/unit/{metrics,owner-rules,ico}.test.ts`, `vitest.config.ts`, `vitest.dist.config.ts`, `tests/dist/owner-rules.dist.test.ts`, `src/content/metrics.ts` (moved). Everything else Astro-specific is removed.

---

### Task 1: Replace Astro with a Next.js 16 scaffold

**Files:**
- Delete: `astro.config.mjs`, `src/content.config.ts`, `src/content/schemas.ts`, `src/content/works/`, `src/i18n/`, `src/components/`, `src/layouts/`, `src/views/`, `src/pages/`, `src/data/`, `src/styles/`, `tests/unit/i18n.test.ts`, `tests/unit/schemas.test.ts`, `playwright.config.ts` if present
- Move: `src/content/metrics.ts` → `src/lib/content/metrics.ts`
- Create: `next.config.ts`, `tsconfig.json` (replace), `src/app/layout.tsx` (temporary), `src/app/page.tsx` (temporary), `scripts/prepare-standalone.mjs`
- Modify: `package.json`, `.gitignore`, `tests/unit/metrics.test.ts` (import path)

**Interfaces:**
- Produces: `pnpm build` = `next build` then copy of `public/` and `.next/static/` into `.next/standalone/`; `pnpm start` = `node .next/standalone/server.js` (env `PORT`, `HOSTNAME`). Path alias `@/*` → `src/*`.

- [ ] **Step 1: Check the starting point**

Run: `git branch --show-current && git status --short -- . ':!new.md' ':!image*.png' ':!3002' ':!.claude'`
Expected: `v6`, and no tracked-file changes. (Untracked `new.md`, `image*.png`, `3002/`, `.claude/` belong to the owner: never delete or commit them.)

- [ ] **Step 2: Remove Astro sources and dependencies, move the metric guard**

```bash
git rm -r -q astro.config.mjs src/content.config.ts src/content/schemas.ts src/content/works src/i18n src/components src/layouts src/views src/pages src/data src/styles tests/unit/i18n.test.ts tests/unit/schemas.test.ts
mkdir -p src/lib/content && git mv src/content/metrics.ts src/lib/content/metrics.ts
sed -i "s#'../../src/content/metrics'#'../../src/lib/content/metrics'#" tests/unit/metrics.test.ts
pnpm remove astro @astrojs/node @astrojs/mdx @astrojs/sitemap @astrojs/check @fontsource/cormorant-garamond @fontsource/schibsted-grotesk @fontsource/ibm-plex-mono
rm -rf dist .astro
```
Expected: `git status` shows deletions and the rename; `src/lib/content/metrics.ts` exists.

- [ ] **Step 3: Install the Next.js stack**

```bash
pnpm add next@^16.3.6 react@^19.3.0 react-dom@^19.3.0 next-intl@^4.14.7 three@^0.186.1 @react-three/fiber@^9.8.1 gsap@^3.15.0 @gsap/react@^2.1.2
pnpm add -D typescript@^6 @types/node @types/react @types/react-dom @types/three tailwindcss@^4.3.3 @tailwindcss/postcss@^4.3.3 postcss
```
Expected: no peer-dependency error (R3F 9 peers on React `>=19 <19.4`). `sharp`, `vitest`, `@playwright/test`, `@axe-core/playwright` are already installed; keep `pnpm.onlyBuiltDependencies` and add `"@tailwindcss/oxide"` and `"unrs-resolver"` to it if pnpm reports them as blocked build scripts.

- [ ] **Step 4: Write `package.json` scripts** (keep the existing `name`, `version`, `type`, `packageManager`, `engines`, dependencies, `pnpm` block)

```json
"scripts": {
  "dev": "next dev",
  "build": "next build && node scripts/prepare-standalone.mjs",
  "start": "node .next/standalone/server.js",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "lint:rules": "vitest run --config vitest.dist.config.ts",
  "favicons": "node scripts/favicons.mjs",
  "sculpture:poster": "node scripts/sculpture-poster.mjs"
}
```

- [ ] **Step 5: Write `scripts/prepare-standalone.mjs`**

```js
// next build (output: 'standalone') does not copy public/ and .next/static/ into the
// standalone folder; the server needs both to serve assets.
import { cpSync, existsSync } from 'node:fs';

if (!existsSync('.next/standalone/server.js')) {
  console.error('prepare-standalone: .next/standalone/server.js not found, did next build run with output: "standalone"?');
  process.exit(1);
}
cpSync('public', '.next/standalone/public', { recursive: true });
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
console.log('prepare-standalone: public/ and .next/static/ copied');
```

- [ ] **Step 6: Write `next.config.ts`**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 7: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.mjs", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "legacy", "3002"]
}
```
Next may rewrite some fields on first build (e.g. `jsx`); accept its changes.

- [ ] **Step 8: Update `.gitignore`** (append)

```gitignore
.next/
next-env.d.ts
*.tsbuildinfo
```

- [ ] **Step 9: Temporary root layout and page** (replaced in Task 2)

`src/app/layout.tsx`:
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:
```tsx
export default function Page() {
  return <p>v6 Next.js scaffold</p>;
}
```

- [ ] **Step 10: Verify build, standalone and unit tests**

Run: `pnpm build && ls .next/standalone/server.js .next/standalone/public/favicon.svg && pnpm test`
Expected: build succeeds (Next runs its own type-check), both files listed, unit tests (metrics, owner-rules, ico) pass. If `next build` rejects TypeScript 6, install `typescript@^5` instead and note it in the report.

- [ ] **Step 11: Commit** (include `AGENTS.md` if Next created it)

```bash
git add -A -- . ':!new.md' ':!image*.png'
git commit -m "chore(v6): replace the Astro skeleton with a Next.js 16 scaffold

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Locale routing and messages (next-intl)

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/i18n/request.ts`, `src/proxy.ts`, `messages/fr.json`, `messages/en.json`, `src/app/[locale]/layout.tsx` (minimal, styled in Task 3), `src/app/[locale]/page.tsx` (minimal, replaced in Task 5), `src/app/[locale]/not-found.tsx`
- Delete: `src/app/layout.tsx`, `src/app/page.tsx` (Task 1 placeholders)
- Modify: `next.config.ts`
- Test: `tests/unit/messages.test.ts`

**Interfaces:**
- Produces:
  - `routing` (from `@/i18n/routing`) with `locales: ['fr','en']`, `defaultLocale: 'fr'`, `localePrefix: 'as-needed'`, `localeDetection: false`, `pathnames` (below); `type Locale = 'fr' | 'en'`.
  - `Link`, `usePathname`, `useRouter`, `getPathname`, `redirect` from `@/i18n/navigation`.
  - Message namespaces `meta`, `nav`, `hero`, `footer` with the exact keys below.

- [ ] **Step 1: Write the failing test `tests/unit/messages.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') acc[path] = value;
    else Object.assign(acc, flatten(value, path));
    return acc;
  }, {});
}

const flatFr = flatten(fr as Tree);
const flatEn = flatten(en as Tree);

describe('messages', () => {
  it('have the same keys in FR and EN', () => {
    expect(Object.keys(flatFr).sort()).toEqual(Object.keys(flatEn).sort());
  });

  it('have no empty value', () => {
    for (const [key, value] of Object.entries({ ...flatFr, ...flatEn })) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('never contain an em dash (owner rule)', () => {
    for (const [key, value] of [...Object.entries(flatFr), ...Object.entries(flatEn)]) {
      expect(value.includes('—'), key).toBe(false);
    }
  });

  it('use the typographic apostrophe in French', () => {
    for (const [key, value] of Object.entries(flatFr)) {
      expect(value.includes("'"), key).toBe(false);
    }
  });

  it('state the owner facts in the hero', () => {
    expect(flatFr['hero.ledeRest']).toContain('Six ans d’expérience, dont trois comme tech lead');
    expect(flatEn['hero.ledeRest']).toContain('Six years of experience, three as tech lead');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test tests/unit/messages.test.ts`
Expected: FAIL, cannot resolve `../../messages/fr.json`.

- [ ] **Step 3: Write `messages/fr.json`**

```json
{
  "meta": {
    "title": "Rostel Panoumassi · Ingénierie de produits numériques",
    "description": "Je conçois et je livre des plateformes SaaS, de paiement et de gestion, de l’architecture à la production. Six ans d’expérience, dont trois comme tech lead. Cotonou, Bénin."
  },
  "nav": {
    "label": "Navigation principale",
    "skip": "Aller au contenu",
    "work": "Réalisations",
    "expertise": "Expertise",
    "about": "À propos",
    "explorations": "Explorations",
    "cta": "Parler d’un projet",
    "switchLocale": "Read this site in English",
    "home": "Accueil, Rostel Panoumassi"
  },
  "hero": {
    "eyebrow": "Ingénierie de produits numériques · Cotonou",
    "titleBefore": "Je conçois et je livre des plateformes ",
    "titleEm": "SaaS, de paiement et de gestion",
    "titleAfter": ", de l’architecture à la production.",
    "ledeName": "Rostel Panoumassi",
    "ledeRest": ", ingénieur produit et Head of Engineering chez KPS Groupe. Six ans d’expérience, dont trois comme tech lead. Ubbfy, ContractIQ, ZenLife : des produits en production, pas des maquettes.",
    "ctaWork": "Voir les réalisations",
    "ctaProject": "Parler d’un projet",
    "scroll": "Défiler pour découvrir"
  },
  "footer": {
    "privacy": "Confidentialité",
    "terms": "CGU",
    "built": "Conçu et développé à la main"
  },
  "notFound": {
    "title": "Cette page n’existe pas.",
    "back": "Retour à l’accueil"
  }
}
```

- [ ] **Step 4: Write `messages/en.json`**

```json
{
  "meta": {
    "title": "Rostel Panoumassi · Digital product engineering",
    "description": "I design and ship SaaS, payment and management platforms, from architecture to production. Six years of experience, three as tech lead. Cotonou, Benin."
  },
  "nav": {
    "label": "Main navigation",
    "skip": "Skip to content",
    "work": "Work",
    "expertise": "Expertise",
    "about": "About",
    "explorations": "Explorations",
    "cta": "Discuss a project",
    "switchLocale": "Lire ce site en français",
    "home": "Home, Rostel Panoumassi"
  },
  "hero": {
    "eyebrow": "Digital product engineering · Cotonou",
    "titleBefore": "I design and ship ",
    "titleEm": "SaaS, payment and management",
    "titleAfter": " platforms, from architecture to production.",
    "ledeName": "Rostel Panoumassi",
    "ledeRest": ", product engineer and Head of Engineering at KPS Groupe. Six years of experience, three as tech lead. Ubbfy, ContractIQ, ZenLife: products in production, not mockups.",
    "ctaWork": "See the work",
    "ctaProject": "Discuss a project",
    "scroll": "Scroll to discover"
  },
  "footer": {
    "privacy": "Privacy",
    "terms": "Terms",
    "built": "Designed and built by hand"
  },
  "notFound": {
    "title": "This page does not exist.",
    "back": "Back to the home page"
  }
}
```

- [ ] **Step 5: Run the test**

Run: `pnpm test tests/unit/messages.test.ts`
Expected: PASS.

- [ ] **Step 6: Write `src/i18n/routing.ts`**

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
  // Shared links must stay stable: never redirect "/" based on the browser language.
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/realisations': { fr: '/realisations', en: '/work' },
    '/realisations/[slug]': { fr: '/realisations/[slug]', en: '/work/[slug]' },
    '/explorations': '/explorations',
    '/a-propos': { fr: '/a-propos', en: '/about' },
    '/brief': '/brief',
    '/contact': '/contact',
    '/cv': '/cv',
    '/confidentialite': { fr: '/confidentialite', en: '/privacy' },
    '/cgu': { fr: '/cgu', en: '/terms' },
  },
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 7: Write `src/i18n/navigation.ts`, `src/i18n/request.ts`, `src/proxy.ts`**

`src/i18n/navigation.ts`:
```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

`src/i18n/request.ts`:
```ts
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

`src/proxy.ts`:
```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
```

- [ ] **Step 8: Enable the plugin in `next.config.ts`**

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 9: Minimal locale layout, page and 404** (delete `src/app/layout.tsx` and `src/app/page.tsx` first)

`src/app/[locale]/layout.tsx`:
```tsx
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`src/app/[locale]/page.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import type { Locale } from '@/i18n/routing';

export default function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations('hero');
  return (
    <h1>
      {t('titleBefore')}
      <em>{t('titleEm')}</em>
      {t('titleAfter')}
    </h1>
  );
}
```

`src/app/[locale]/not-found.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <section>
      <h1>{t('title')}</h1>
      <Link href="/">{t('back')}</Link>
    </section>
  );
}
```

Note: `LayoutProps` and `PageProps` are global helper types generated by Next (`next typegen`, also run by `next build`/`next dev`). An unknown top-level segment like `/de` matches `[locale]`, fails `hasLocale` and renders the 404.

- [ ] **Step 10: Build and inspect**

Run: `pnpm build && pnpm start` in the background (`PORT=3100 HOSTNAME=127.0.0.1 pnpm start &`), then:
```bash
curl -s http://127.0.0.1:3100/ | grep -o '<html lang="fr"'
curl -s http://127.0.0.1:3100/en | grep -o '<html lang="en"'
curl -s -o /dev/null -w "%{http_code}\n" -H 'Accept-Language: en-US' http://127.0.0.1:3100/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3100/de
```
Expected: `<html lang="fr"`, `<html lang="en"`, `200` (no redirect for an English browser), `404`. Stop the server.

- [ ] **Step 11: Commit**

```bash
git add -A -- src messages next.config.ts tests/unit/messages.test.ts
git commit -m "feat(v6): next-intl routing (fr default, /en), bilingual messages and 404

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Design system, site chrome and favicon

**Files:**
- Create: `postcss.config.mjs`, `src/styles/globals.css`, `src/styles/fonts.ts`, `src/components/site/{SkipLink,Header,Footer,LocaleSwitch,Monogram,ButtonLink}.tsx`
- Replace: `src/assets/brand/favicon.svg` (monogram), `public/site.webmanifest`; regenerate `public/` icons with `pnpm favicons`
- Modify: `src/app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `routing`, `Link`, `usePathname` (Task 2); messages `meta`, `nav`, `footer`.
- Produces:
  - Tailwind colour utilities `obsidian`, `obsidian-2`, `ivory`, `champagne`, `muted`, `faint`, `graphite`, `line`; font utilities `font-serif`, `font-sans`, `font-mono`.
  - `<ButtonLink href variant="primary" | "ghost" arrow?>` (renders the next-intl `Link`, typed `href` from `routing.pathnames`).
  - The layout wraps pages with `SkipLink`, `Header`, `<main id="main" tabIndex={-1}>`, `Footer`; sets `metadata` (title, description, alternates, icons, manifest) and the `html.js` class early (inline script) for Task 5.

- [ ] **Step 1: `postcss.config.mjs`**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
```

- [ ] **Step 2: `src/styles/fonts.ts`**

```ts
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from 'next/font/google';

export const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});
```

- [ ] **Step 3: `src/styles/globals.css`**

```css
@import 'tailwindcss';

@theme inline {
  --color-obsidian: #101112;
  --color-obsidian-2: #161719;
  --color-ivory: #e9e5dc;
  --color-champagne: #bca57b;
  --color-muted: #a7a49c;
  --color-faint: #8a8c90;
  --color-graphite: #55575b;
  --color-line: #26272a;

  --font-serif: var(--font-cormorant), Georgia, 'Times New Roman', serif;
  --font-sans: var(--font-manrope), system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, Consolas, monospace;
}

@layer base {
  html { color-scheme: dark; -webkit-text-size-adjust: 100%; }
  body {
    background: var(--color-obsidian);
    color: var(--color-ivory);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    overflow-wrap: anywhere;
  }
  :focus-visible { outline: 2px solid var(--color-champagne); outline-offset: 3px; }
  ::selection { background: var(--color-champagne); color: var(--color-obsidian); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Site components**

`src/components/site/Monogram.tsx`:
```tsx
export function Monogram() {
  return (
    <span className="flex items-center gap-2.5 font-serif text-[22px] font-semibold tracking-[0.02em]">
      RP
      <span aria-hidden="true" className="inline-block h-px w-7 bg-champagne" />
    </span>
  );
}
```

`src/components/site/ButtonLink.tsx`:
```tsx
import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';

type Props = ComponentProps<typeof Link> & { variant?: 'primary' | 'ghost'; arrow?: boolean };

const base =
  'group inline-flex items-center gap-2.5 rounded-[2px] px-5 py-3.5 text-[13.5px] font-semibold no-underline transition-colors';
const variants = {
  primary: 'bg-ivory text-obsidian hover:bg-champagne',
  ghost: 'border border-[#3a3b3e] text-ivory hover:border-champagne hover:text-champagne',
};

export function ButtonLink({ variant = 'primary', arrow = false, className = '', children, ...rest }: Props) {
  return (
    <Link {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {arrow && (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"
             className="transition-transform group-hover:translate-x-0.5">
          <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )}
    </Link>
  );
}
```

`src/components/site/SkipLink.tsx`:
```tsx
import { useTranslations } from 'next-intl';

export function SkipLink() {
  const t = useTranslations('nav');
  return (
    <a href="#main"
       className="absolute left-5 top-[-100px] z-50 rounded-[2px] bg-ivory px-3.5 py-2.5 font-medium text-obsidian no-underline focus:top-3">
      {t('skip')}
    </a>
  );
}
```

`src/components/site/LocaleSwitch.tsx`:
```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/navigation';

export function LocaleSwitch() {
  const locale = useLocale();
  const other = locale === 'fr' ? 'en' : 'fr';
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations('nav');
  return (
    <Link
      // next-intl types `href` per pathname; dynamic params come from the current route.
      // @ts-expect-error -- pathname and params always belong to the current, valid route
      href={{ pathname, params }}
      locale={other}
      hrefLang={other}
      lang={other}
      aria-label={t('switchLocale')}
      className="font-mono text-xs font-medium text-muted no-underline hover:text-ivory"
    >
      {other.toUpperCase()}
    </Link>
  );
}
```
If the installed next-intl version accepts `{ pathname, params }` without an error, remove the `@ts-expect-error` line (an unused directive fails type-checking).

`src/components/site/Header.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ButtonLink } from './ButtonLink';
import { LocaleSwitch } from './LocaleSwitch';
import { Monogram } from './Monogram';

export function Header() {
  const t = useTranslations('nav');
  const items = [
    { href: '/realisations', label: t('work') },
    { href: '/realisations', label: t('expertise'), hash: 'expertise' },
    { href: '/a-propos', label: t('about') },
    { href: '/explorations', label: t('explorations') },
  ] as const;
  return (
    <header className="sticky top-0 z-30 bg-linear-to-b from-obsidian to-obsidian/0">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-5 py-5 md:gap-10 md:px-10">
        <Link href="/" aria-label={t('home')} className="text-ivory no-underline">
          <Monogram />
        </Link>
        <nav aria-label={t('label')} className="ml-auto hidden md:block">
          <ul className="flex gap-8 text-[13.5px] text-muted">
            {items.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="no-underline hover:text-ivory">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <LocaleSwitch />
          <ButtonLink href="/brief" variant="primary">{t('cta')}</ButtonLink>
        </div>
      </div>
    </header>
  );
}
```
Note: "Expertise" points to `/realisations` for now; Lot 2 retargets it to the home "Positioning" anchor. Remove the unused `hash` field if the type-checker complains.

`src/components/site/Footer.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-line py-9 text-[13px] text-faint">
      <div className="mx-auto flex max-w-[1280px] flex-wrap gap-x-7 gap-y-3 px-5 md:px-10">
        <span>Rostel Panoumassi, Cotonou</span>
        <a href="mailto:rmissimawu@gmail.com" className="no-underline hover:text-ivory">rmissimawu@gmail.com</a>
        <a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" rel="me noopener" className="no-underline hover:text-ivory">LinkedIn</a>
        <a href="https://github.com/ThommyShelby9" rel="me noopener" className="no-underline hover:text-ivory">GitHub</a>
        <span className="flex flex-wrap gap-x-5 gap-y-3 md:ml-auto">
          <Link href="/confidentialite" className="no-underline hover:text-ivory">{t('privacy')}</Link>
          <Link href="/cgu" className="no-underline hover:text-ivory">{t('terms')}</Link>
          <span>{t('built')}</span>
        </span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Layout with chrome, metadata and the early `js` class** — replace `src/app/[locale]/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { SkipLink } from '@/components/site/SkipLink';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { mono, sans, serif } from '@/styles/fonts';
import '@/styles/globals.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rostelmissimawu.com';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'meta' });
  const url = (l: Locale) => new URL(getPathname({ locale: l, href: '/' }), SITE).toString();
  return {
    metadataBase: new URL(SITE),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url(locale as Locale),
      languages: { fr: url('fr'), en: url('en'), 'x-default': url('fr') },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
  };
}

export const viewport = { themeColor: '#101112' };

// Adds `js` before first paint so reveal styles only hide content when JS runs,
// and force-reveals everything after 2.5 s even if the reveal code never loads.
const EARLY_JS = `document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('reveal-done')},2500);`;

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY_JS }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <SkipLink />
          <Header />
          <main id="main" tabIndex={-1} className="relative">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```
`suppressHydrationWarning` on `<html>` is required because the inline script adds classes before React hydrates. Page-level `canonical` for pages other than `/` is set by those pages in later lots.

- [ ] **Step 6: Monogram favicon** — replace `src/assets/brand/favicon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="6" fill="#101112"/>
  <text x="32" y="40" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="700" fill="#E9E5DC">RP</text>
  <rect x="18" y="47" width="28" height="2" fill="#BCA57B"/>
</svg>
```

Replace `public/site.webmanifest`:
```json
{
  "name": "Rostel Panoumassi",
  "short_name": "Rostel P.",
  "start_url": "/",
  "display": "browser",
  "background_color": "#101112",
  "theme_color": "#101112",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
Open `scripts/favicons.mjs` and change its maskable padding background from `'#0e0d0c'` to `'#101112'`. Then run `pnpm favicons` and look at `public/icon-512.png` with an image viewer: "RP" and the champagne line must be legible.

- [ ] **Step 7: Build and inspect**

Run: `pnpm build && pnpm test`, then start the standalone server on port 3100 and check:
```bash
curl -s http://127.0.0.1:3100/ | grep -o 'rel="icon"[^>]*' | head -2
curl -s http://127.0.0.1:3100/en | grep -o 'hrefLang="fr"[^>]*'
```
Expected: two icon links; the EN page's language link points to `/`. Take screenshots of `/` at 1440×900 and 360×740 (Playwright with `channel: 'msedge'` from a throwaway script under `.superpowers/`, deleted afterwards) and confirm: header on one line at desktop, no horizontal overflow at 360 px, rectangular buttons.

- [ ] **Step 8: Commit**

```bash
git add -A -- postcss.config.mjs src public scripts/favicons.mjs
git commit -m "feat(v6): Obsidian & Champagne design system, site chrome and monogram favicon

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Möbius geometry (pure module)

**Files:**
- Create: `src/components/sculpture/mobius.ts`
- Test: `tests/unit/mobius.test.ts`

**Interfaces:**
- Produces:
  - `type Vec3 = [number, number, number]`
  - `interface RibbonParams { radius: number; width: number; halfTwists: number; strandsPerSide: number; samples: number }`
  - `DESKTOP_RIBBON: RibbonParams` = `{ radius: 1.9, width: 0.95, halfTwists: 1, strandsPerSide: 6, samples: 360 }`
  - `MOBILE_RIBBON: RibbonParams` = same with `strandsPerSide: 3, samples: 240`
  - `laps(p: RibbonParams): 1 | 2`
  - `strandOffsets(p: RibbonParams): number[]`
  - `pointAt(p: RibbonParams, offset: number, angle: number): Vec3`
  - `strandPath(p: RibbonParams, offset: number): Vec3[]` (length `p.samples * laps(p)`, open list; the consumer closes it)
  - `strandRadius(p: RibbonParams, offset: number): number`

- [ ] **Step 1: Write the failing test `tests/unit/mobius.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import {
  DESKTOP_RIBBON, MOBILE_RIBBON, laps, pointAt, strandOffsets, strandPath, strandRadius, type Vec3,
} from '../../src/components/sculpture/mobius';

const close = (a: Vec3, b: Vec3) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

describe('Möbius ribbon geometry', () => {
  it('needs two laps per strand for an odd number of half-twists', () => {
    expect(laps(DESKTOP_RIBBON)).toBe(2);
    expect(laps({ ...DESKTOP_RIBBON, halfTwists: 2 })).toBe(1);
  });

  it('uses only positive offsets when strands run two laps (12 visible on desktop, 6 on mobile)', () => {
    const d = strandOffsets(DESKTOP_RIBBON);
    const m = strandOffsets(MOBILE_RIBBON);
    expect(d).toHaveLength(6);
    expect(m).toHaveLength(3);
    expect(d.every((o) => o > 0 && o < DESKTOP_RIBBON.width / 2)).toBe(true);
  });

  it('uses mirrored offsets when the twist is even', () => {
    const offsets = strandOffsets({ ...DESKTOP_RIBBON, halfTwists: 2 });
    expect(offsets).toHaveLength(12);
    expect(offsets.filter((o) => o < 0)).toHaveLength(6);
  });

  it('has the Möbius property: one lap swaps the side of the ribbon', () => {
    const off = 0.3;
    expect(close(pointAt(DESKTOP_RIBBON, off, 2 * Math.PI), pointAt(DESKTOP_RIBBON, -off, 0))).toBe(true);
  });

  it('closes every strand after its laps', () => {
    for (const off of strandOffsets(DESKTOP_RIBBON)) {
      const turns = laps(DESKTOP_RIBBON) * 2 * Math.PI;
      expect(close(pointAt(DESKTOP_RIBBON, off, turns), pointAt(DESKTOP_RIBBON, off, 0))).toBe(true);
    }
  });

  it('samples each strand evenly over its laps', () => {
    const path = strandPath(DESKTOP_RIBBON, 0.2);
    expect(path).toHaveLength(DESKTOP_RIBBON.samples * 2);
    expect(close(path[0], pointAt(DESKTOP_RIBBON, 0.2, 0))).toBe(true);
  });

  it('keeps centre points on the base circle', () => {
    const [x, y, z] = pointAt(DESKTOP_RIBBON, 0, 1.234);
    expect(Math.hypot(x, y)).toBeCloseTo(DESKTOP_RIBBON.radius, 9);
    expect(z).toBeCloseTo(0, 9);
  });

  it('makes edge strands thinner than inner strands', () => {
    const offsets = strandOffsets(DESKTOP_RIBBON);
    const inner = strandRadius(DESKTOP_RIBBON, offsets[0]);
    const outer = strandRadius(DESKTOP_RIBBON, offsets[offsets.length - 1]);
    expect(inner).toBeGreaterThan(outer);
    expect(outer).toBeGreaterThan(0.02);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test tests/unit/mobius.test.ts`
Expected: FAIL, cannot resolve the module.

- [ ] **Step 3: Write `src/components/sculpture/mobius.ts`**

```ts
export type Vec3 = [number, number, number];

export interface RibbonParams {
  radius: number;
  width: number;
  halfTwists: number;
  strandsPerSide: number;
  samples: number;
}

export const DESKTOP_RIBBON: RibbonParams = { radius: 1.9, width: 0.95, halfTwists: 1, strandsPerSide: 6, samples: 360 };
export const MOBILE_RIBBON: RibbonParams = { ...DESKTOP_RIBBON, strandsPerSide: 3, samples: 240 };

/** With an odd number of half-twists a strand returns on the opposite side after one lap. */
export function laps(p: RibbonParams): 1 | 2 {
  return p.halfTwists % 2 === 1 ? 2 : 1;
}

/** Offsets across the ribbon width; two-lap strands draw both sides, so they only need one side. */
export function strandOffsets(p: RibbonParams): number[] {
  const half = p.width / 2;
  const offsets: number[] = [];
  for (let k = 0; k < p.strandsPerSide; k++) {
    const off = ((k + 0.5) / p.strandsPerSide) * half;
    offsets.push(off);
    if (laps(p) === 1) offsets.push(-off);
  }
  return offsets;
}

/** Point of the strand at `offset` for a base-circle angle (radians, may exceed 2π). */
export function pointAt(p: RibbonParams, offset: number, angle: number): Vec3 {
  const twist = (p.halfTwists * angle) / 2;
  const radial = p.radius + offset * Math.cos(twist);
  return [radial * Math.cos(angle), radial * Math.sin(angle), offset * Math.sin(twist)];
}

export function strandPath(p: RibbonParams, offset: number): Vec3[] {
  const count = p.samples * laps(p);
  return Array.from({ length: count }, (_, i) => pointAt(p, offset, (i / p.samples) * 2 * Math.PI));
}

/** Inner strands slightly thicker than the edges, for a machined look. */
export function strandRadius(p: RibbonParams, offset: number): number {
  const edge = Math.abs(offset) / (p.width / 2);
  return 0.026 + 0.014 * (1 - edge);
}
```

- [ ] **Step 4: Run the test**

Run: `pnpm test tests/unit/mobius.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sculpture/mobius.ts tests/unit/mobius.test.ts
git commit -m "feat(v6): pure Möbius ribbon geometry for the signature sculpture

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Hero and reveal-once motion

**Files:**
- Create: `src/components/motion/Reveal.tsx`, `src/components/home/Hero.tsx`
- Modify: `src/app/[locale]/page.tsx`, `src/styles/globals.css` (append reveal rules)

**Interfaces:**
- Consumes: messages `hero`, `ButtonLink` (Task 3), `html.js` / `html.reveal-done` classes set by the layout (Task 3).
- Produces:
  - `<Reveal as? className?>`: client wrapper; any descendant with `data-reveal` fades/slides in once when the wrapper enters the viewport; staggered 90 ms.
  - `<Hero />`: server component rendering the hero copy and a `<div data-sculpture-slot>` placeholder that Task 6 fills with `SculptureStage`.

- [ ] **Step 1: Append reveal rules to `src/styles/globals.css`**

```css
/* Reveal-once: content is only hidden when JS is present, motion is allowed,
   and the safety timer (layout) has not fired yet. */
@media (prefers-reduced-motion: no-preference) {
  html.js:not(.reveal-done) [data-reveal]:not([data-revealed]) {
    opacity: 0;
    transform: translateY(18px);
  }
}
```

- [ ] **Step 2: `src/components/motion/Reveal.tsx`**

```tsx
'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current);
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          items,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
            onStart: () => items.forEach((el) => el.setAttribute('data-revealed', '')),
          },
        );
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        items.forEach((el) => el.setAttribute('data-revealed', ''));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: `src/components/home/Hero.tsx`**

```tsx
import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/site/ButtonLink';
import { Reveal } from '@/components/motion/Reveal';

export function Hero({ sculpture }: { sculpture?: React.ReactNode }) {
  const t = useTranslations('hero');
  return (
    <section className="relative mx-auto grid min-h-[92svh] max-w-[1280px] items-center gap-10 px-5 pt-[6vh] md:px-10 lg:grid-cols-[1.25fr_1fr] lg:pt-[10vh]">
      <div data-sculpture-slot className="order-first lg:order-last">{sculpture}</div>
      <Reveal className="relative z-10">
        <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">
          {t('eyebrow')}
        </p>
        <h1 data-reveal className="mt-5 font-serif text-[clamp(38px,4.3vw,62px)] font-medium leading-[1.04] tracking-[-0.015em]">
          {t('titleBefore')}
          <em className="italic text-champagne">{t('titleEm')}</em>
          {t('titleAfter')}
        </h1>
        <p data-reveal className="mb-8 mt-6 max-w-[52ch] text-[16.5px] leading-[1.7] text-muted">
          <strong className="font-medium text-ivory">{t('ledeName')}</strong>
          {t('ledeRest')}
        </p>
        <div data-reveal className="flex flex-wrap gap-3.5">
          <ButtonLink href="/realisations" variant="primary" arrow>{t('ctaWork')}</ButtonLink>
          <ButtonLink href="/brief" variant="ghost">{t('ctaProject')}</ButtonLink>
        </div>
        <p data-reveal className="mt-[10vh] flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
          <span aria-hidden="true" className="block h-[38px] w-px bg-linear-to-b from-champagne to-transparent" />
          {t('scroll')}
        </p>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 4: Replace `src/app/[locale]/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Hero } from '@/components/home/Hero';
import type { Locale } from '@/i18n/routing';

export default function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  return <Hero />;
}
```

- [ ] **Step 5: Build and inspect**

Run: `pnpm build && pnpm test`. Start the standalone server on port 3100 and check with a throwaway Playwright script (Edge channel, under `.superpowers/`, deleted afterwards):
- `/` at 1440×900: after 1.5 s, the h1 has computed `opacity: 1`;
- same with `page.emulateMedia({ reducedMotion: 'reduce' })`: the h1 is visible immediately (opacity 1 on first check);
- same with `javaScriptEnabled: false`: the h1 is visible.
Report the three observations.

- [ ] **Step 6: Commit**

```bash
git add -A -- src
git commit -m "feat(v6): bilingual hero with reveal-once motion and no-JS / reduced-motion safety

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: The sculpture (R3F scene, stage, poster)

**Files:**
- Create: `src/components/sculpture/Sculpture.tsx`, `src/components/sculpture/SculptureStage.tsx`, `scripts/sculpture-poster.mjs`, `public/sculpture/mobius-desktop.webp`, `public/sculpture/mobius-mobile.webp`
- Modify: `src/app/[locale]/page.tsx` (pass the stage into `Hero`)
- Test: `tests/e2e/sculpture.spec.ts` (runs in Task 7's Playwright setup; write it here, run it after Task 7 exists or run it with a temporary config as described in Step 6)

**Interfaces:**
- Consumes: `DESKTOP_RIBBON`, `MOBILE_RIBBON`, `strandOffsets`, `strandPath`, `strandRadius`, `RibbonParams` (Task 4); `Hero` `sculpture` prop (Task 5).
- Produces:
  - `<Sculpture params frozen progress tilt />` (default export, client-only): `params: RibbonParams`, `frozen: boolean` (fixed pose, no idle rotation), `progress: React.RefObject<number>` (0 to 1 scroll progress), `tilt: React.RefObject<{ x: number; y: number }>`, `running: boolean` (drives `frameloop`).
  - `<SculptureStage />` (client): renders `<div data-sculpture-stage data-state="poster" | "3d" data-running="true" | "false" aria-hidden="true">`. Poster mode: reduced motion, no WebGL, before idle, or `?sculpture=poster`. `?sculpture=poster` also freezes the scene and sets `document.documentElement.dataset.poster = '1'` for the poster script.

- [ ] **Step 1: `src/components/sculpture/Sculpture.tsx`**

```tsx
'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { strandOffsets, strandPath, strandRadius, type RibbonParams } from './mobius';

interface Props {
  params: RibbonParams;
  frozen: boolean;
  running: boolean;
  progress: RefObject<number>;
  tilt: RefObject<{ x: number; y: number }>;
  dpr: number;
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Ribbon({ params, frozen, progress, tilt }: Omit<Props, 'running' | 'dpr'>) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: 0, y: 0 });
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xd8c196, metalness: 1, roughness: 0.24, clearcoat: 0.7, clearcoatRoughness: 0.2,
      }),
    [],
  );
  const geometries = useMemo(
    () =>
      strandOffsets(params).map((offset) => {
        const points = strandPath(params, offset).map(([x, y, z]) => new THREE.Vector3(x, y, z));
        const curve = new THREE.CatmullRomCurve3(points, true);
        return new THREE.TubeGeometry(curve, points.length, strandRadius(params, offset), 10, true);
      }),
    [params],
  );
  useEffect(() => () => {
    geometries.forEach((g) => g.dispose());
    material.dispose();
  }, [geometries, material]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const p = progress.current ?? 0;
    const target = tilt.current ?? { x: 0, y: 0 };
    current.current.x += (target.x - current.current.x) * 0.05;
    current.current.y += (target.y - current.current.y) * 0.05;
    const idle = frozen ? 0 : clock.getElapsedTime() * 0.12;
    group.current.rotation.set(0.35 + current.current.x + p * 0.55, idle + current.current.y + p * 0.9, 0.1);
  });

  return (
    <group ref={group}>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={material} />
      ))}
    </group>
  );
}

export default function Sculpture({ params, frozen, running, progress, tilt, dpr }: Props) {
  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: frozen }}
      camera={{ fov: 32, position: [0, 0, 11], near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Environment />
      <directionalLight color={0xffe3b0} intensity={2.2} position={[4, 5, 6]} />
      <directionalLight color={0x9fb4ff} intensity={0.6} position={[-6, -2, -4]} />
      <Ribbon params={params} frozen={frozen} progress={progress} tilt={tilt} />
    </Canvas>
  );
}
```
If the `RoomEnvironment` import path differs in three 0.186 (`three/addons/environments/RoomEnvironment.js`), use whichever resolves.

- [ ] **Step 2: `src/components/sculpture/SculptureStage.tsx`**

```tsx
'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { DESKTOP_RIBBON, MOBILE_RIBBON } from './mobius';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Sculpture = dynamic(() => import('./Sculpture'), { ssr: false });

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function SculptureStage() {
  const box = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState<'poster' | '3d'>('poster');
  const [visible, setVisible] = useState(true);
  // The desktop stage is `position: fixed`, so it always "intersects"; it is really gone
  // once the scroll trajectory has faded it out.
  const [faded, setFaded] = useState(false);
  const [posterMode, setPosterMode] = useState(false);
  const [mobile, setMobile] = useState(false);

  // Decide once on mount: 3D only with motion allowed, WebGL present, after the browser is idle.
  useEffect(() => {
    const isPoster = new URLSearchParams(location.search).get('sculpture') === 'poster';
    setMobile(matchMedia('(max-width: 1023px)').matches);
    if (isPoster) {
      document.documentElement.dataset.poster = '1';
      setPosterMode(true);
      setMode('3d');
      return;
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL()) return;
    const start = () => setMode('3d');
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 1200);
    return () => window.clearTimeout(id);
  }, []);

  // Pause rendering when off screen or when the tab is hidden.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; update(); });
    io.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  // Cursor tilt: desktop, fine pointer, motion allowed, not in poster mode.
  useEffect(() => {
    if (posterMode || !matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const onMove = (e: PointerEvent) => {
      tilt.current = { x: (e.clientY / innerHeight - 0.5) * 0.4, y: (e.clientX / innerWidth - 0.5) * 0.4 };
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, [posterMode]);

  // Scroll trajectory for the hero: drift right, shrink, fade (Lot 2 extends it to later sections).
  useGSAP(() => {
    if (posterMode) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
      gsap.to(box.current, {
        xPercent: 12, scale: 0.88, opacity: 0, ease: 'none',
        scrollTrigger: {
          start: 0, end: () => innerHeight * 1.2, scrub: true,
          onUpdate: (self) => {
            progress.current = self.progress;
            setFaded(self.progress >= 0.999);
          },
        },
      });
    });
    return () => mm.revert();
  }, { dependencies: [posterMode] });

  const params = mobile ? MOBILE_RIBBON : DESKTOP_RIBBON;
  const poster = mobile ? '/sculpture/mobius-mobile.webp' : '/sculpture/mobius-desktop.webp';
  const running = mode === '3d' && visible && !faded && !posterMode;

  return (
    <div
      ref={box}
      data-sculpture-stage
      data-state={mode}
      data-running={String(running)}
      aria-hidden="true"
      className="pointer-events-none relative h-[42svh] w-full lg:fixed lg:right-0 lg:top-0 lg:h-svh lg:w-1/2"
    >
      {mode === 'poster' && (
        // eslint-disable-next-line @next/next/no-img-element -- decorative, pre-sized poster; next/image adds nothing here
        <img
          src={poster}
          alt=""
          data-sculpture-poster
          className="absolute inset-0 m-auto h-full w-full object-contain"
        />
      )}
      {mode === '3d' && (
        <Sculpture
          params={params}
          frozen={posterMode}
          running={running || posterMode}
          progress={progress}
          tilt={tilt}
          dpr={mobile ? 1.5 : 2}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Mount the stage in the hero** — replace `src/app/[locale]/page.tsx`

```tsx
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Hero } from '@/components/home/Hero';
import { SculptureStage } from '@/components/sculpture/SculptureStage';
import type { Locale } from '@/i18n/routing';

export default function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  return <Hero sculpture={<SculptureStage />} />;
}
```

Append to `src/styles/globals.css` (poster capture mode hides everything but the stage and makes the page transparent):
```css
html[data-poster='1'], html[data-poster='1'] body { background: transparent; }
html[data-poster='1'] body > *:not(main),
html[data-poster='1'] main > section > *:not([data-sculpture-slot]) { visibility: hidden; }
```

- [ ] **Step 4: `scripts/sculpture-poster.mjs`**

```js
// Renders the live sculpture once, frozen, and saves transparent WebP posters used when
// 3D is not shown (reduced motion, no WebGL, before idle). Needs a running server:
//   pnpm build && PORT=3100 HOSTNAME=127.0.0.1 pnpm start   (in another terminal)
//   pnpm sculpture:poster
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const BASE = process.env.POSTER_BASE_URL ?? 'http://127.0.0.1:3100';
const targets = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
];

mkdirSync('public/sculpture', { recursive: true });
const browser = await chromium.launch({ channel: process.env.POSTER_CHANNEL || undefined });
try {
  for (const t of targets) {
    const page = await browser.newPage({ viewport: t.viewport, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/?sculpture=poster`, { waitUntil: 'networkidle' });
    const stage = page.locator('[data-sculpture-stage] canvas');
    await stage.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(1500); // let PMREM + first frames settle
    const png = await stage.screenshot({ omitBackground: true });
    await sharp(png).webp({ quality: 82, alphaQuality: 90 }).toFile(`public/sculpture/mobius-${t.name}.webp`);
    console.log(`poster written: public/sculpture/mobius-${t.name}.webp`);
    await page.close();
  }
} finally {
  await browser.close();
}
```

- [ ] **Step 5: Generate the posters**

```bash
pnpm build
PORT=3100 HOSTNAME=127.0.0.1 pnpm start &   # remember the PID, stop it afterwards
POSTER_CHANNEL=msedge pnpm sculpture:poster   # or leave POSTER_CHANNEL empty once Chromium is installed (Task 7)
```
Expected: both files exist, desktop roughly 1440×1800 px, transparent background. Look at both images: a champagne striated Möbius ring, fully inside the frame, no text or header visible. Stop the server. Rebuild (`pnpm build`) so the posters are copied into the standalone output.

- [ ] **Step 6: Write `tests/e2e/sculpture.spec.ts`** (executed in Task 7)

```ts
import { expect, test } from '@playwright/test';

test.describe('sculpture', () => {
  test('mounts the 3D scene after idle on a capable desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop behaviour');
    await page.goto('/');
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-state', '3d', { timeout: 8000 });
    await expect(stage.locator('canvas')).toBeVisible();
    await expect(stage).toHaveAttribute('aria-hidden', 'true');
  });

  test('shows the poster under reduced motion, with no canvas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(2500);
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-state', 'poster');
    await expect(stage.locator('canvas')).toHaveCount(0);
    await expect(page.locator('[data-sculpture-poster]')).toBeVisible();
  });

  test('falls back to the poster when WebGL is unavailable, without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      // Test double: every WebGL context request is refused, other contexts work normally.
      type AnyGetContext = (this: HTMLCanvasElement, ...args: unknown[]) => unknown;
      const proto = HTMLCanvasElement.prototype as unknown as { getContext: AnyGetContext };
      const original = proto.getContext;
      proto.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
        if (typeof args[0] === 'string' && args[0].startsWith('webgl')) return null;
        return original.apply(this, args);
      };
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-sculpture-stage]')).toHaveAttribute('data-state', 'poster');
    await expect(page.locator('[data-sculpture-poster]')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('stops rendering when scrolled far away', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop behaviour');
    await page.goto('/');
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-state', '3d', { timeout: 8000 });
    await page.evaluate(() => {
      document.body.style.minHeight = '400vh';
      scrollTo(0, innerHeight * 3);
    });
    await expect(stage).toHaveAttribute('data-running', 'false', { timeout: 4000 });
  });
});
```
Note on the last test: on desktop the stage is fixed, so the pause comes from the `faded` state (scroll progress reached 1), not from the IntersectionObserver; on mobile the stage is in the flow and the observer pauses it.

- [ ] **Step 7: Build, look, commit**

Run `pnpm build && pnpm test`. Start the server and take Edge screenshots of `/` at 1440×900 (after 4 s), at 1440×900 scrolled by 600 px, and at 390×844. Confirm: sculpture on the right half, text readable on the left, it drifts and fades on scroll, mobile shows it above the text without overlapping the header.

```bash
git add -A -- src scripts/sculpture-poster.mjs public/sculpture tests/e2e/sculpture.spec.ts
git commit -m "feat(v6): real-time champagne Möbius sculpture with poster fallback, tilt, scroll drift and render pause

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Owner rules on the built site, health, e2e + axe, Dockerfile

**Files:**
- Modify: `tools/owner-rules.ts` (add `custom-cursor` rule), `tests/unit/owner-rules.test.ts`, `tests/dist/owner-rules.dist.test.ts` (read Next output)
- Create: `src/app/api/health/route.ts`, `playwright.config.ts`, `tests/e2e/foundations.spec.ts`, `Dockerfile`, `.dockerignore`

**Interfaces:**
- Consumes: everything above; `tests/e2e/sculpture.spec.ts` (Task 6).
- Produces: `RuleId` gains `'custom-cursor'`; `GET /api/health` → `200 {"ok":true}`.

- [ ] **Step 1: Add the failing custom-cursor case to `tests/unit/owner-rules.test.ts`** (inside the existing `describe`)

```ts
  it('flags a custom cursor image but allows pointer and default cursors', () => {
    expect(rules([{ path: 'a.css', content: 'body{cursor:url(/c.png) 4 4, auto}' }])).toEqual(['custom-cursor']);
    expect(rules([{ path: 'a.css', content: '.btn{cursor:pointer}.x{cursor:default}' }])).toEqual([]);
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test tests/unit/owner-rules.test.ts`
Expected: FAIL (no `custom-cursor` violation reported).

- [ ] **Step 3: Implement in `tools/owner-rules.ts`**

Extend the union:
```ts
export type RuleId = 'em-dash' | 'emoji' | 'pill' | 'purple-gradient' | 'ai-tag' | 'favicon' | 'custom-cursor';
```
Inside `checkOwnerRules`, in the CSS section after the purple-gradient loop:
```ts
    const cursor = css.match(/cursor\s*:\s*url\(/i);
    if (cursor) add('custom-cursor', file.path, cursor[0]);
```

- [ ] **Step 4: Run unit tests**

Run: `pnpm test`
Expected: PASS (all unit files).

- [ ] **Step 5: Point the built-site check at Next's output** — replace `tests/dist/owner-rules.dist.test.ts`

```ts
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, it } from 'vitest';
import { checkOwnerRules } from '../../tools/owner-rules';

// Prerendered pages and the CSS shipped to browsers.
const ROOTS = ['.next/server/app', '.next/static'];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

it('the built site complies with the owner rules', () => {
  for (const root of ROOTS) expect(existsSync(root), `run \`pnpm build\` first (${root})`).toBe(true);
  const files = ROOTS.flatMap((root) =>
    walk(root)
      .filter((p) => /\.(html|css)$/.test(p))
      .map((p) => ({ path: relative('.', p), content: readFileSync(p, 'utf8') })),
  );
  const pages = files.filter((f) => f.path.endsWith('.html'));
  expect(pages.length).toBeGreaterThan(0);
  // Next's own error shells (_not-found, _global-error) are framework output, not site copy.
  const siteFiles = files.filter((f) => !/[\\/]_(not-found|global-error)/.test(f.path));
  expect(checkOwnerRules(siteFiles)).toEqual([]);
});
```

- [ ] **Step 6: Health route `src/app/api/health/route.ts`**

```ts
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}
```

- [ ] **Step 7: `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    command: 'pnpm build && node .next/standalone/server.js',
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { PORT: String(PORT), HOSTNAME: '127.0.0.1' },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
```
Install the browser: `pnpm exec playwright install chromium`.

- [ ] **Step 8: `tests/e2e/foundations.spec.ts`**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('foundations', () => {
  test('French home is the default and states what, for whom', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('SaaS, de paiement et de gestion');
    await expect(page.getByText(/Six ans d’expérience, dont trois comme tech lead/)).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en$/);
    expect(errors).toEqual([]);
  });

  test('English home lives under /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('SaaS, payment and management');
  });

  test('locale switch goes to the same page in the other language and back', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[hreflang="en"]').first().click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.locator('a[hreflang="fr"]').first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('an English browser opening / stays on the French home', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/127\.0\.0\.1:3000\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await context.close();
  });

  test('unknown locale segments return a 404', async ({ request }) => {
    for (const path of ['/de', '/xx/whatever']) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(404);
    }
  });

  test('favicons and manifest are served', async ({ request }) => {
    for (const path of ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/site.webmanifest', '/sculpture/mobius-desktop.webp']) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });

  test('health endpoint answers', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test('no horizontal overflow on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ['/', '/en']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('keyboard: skip link first, visible focus', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Aller au contenu' });
    await expect(skip).toBeFocused();
    expect(await skip.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  });

  test('hero text becomes visible even if the page scripts never load', async ({ page }) => {
    await page.route('**/_next/static/chunks/**', (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(3000);
    const opacity = await page.getByRole('heading', { level: 1 }).evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });

  for (const path of ['/', '/en']) {
    test(`no accessibility violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('home is readable and shows the poster', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-sculpture-poster]')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voir les réalisations' })).toBeVisible();
  });
});
```

- [ ] **Step 9: Run everything**

Run: `pnpm test && pnpm build && pnpm lint:rules && pnpm test:e2e`
Expected: all pass on both projects. Fix code (never the rules or the assertions) when something fails; if an assertion is genuinely wrong for Next 16 behaviour (e.g. a trailing-slash redirect), adjust the regex and explain it in the report. The canvas `aria-hidden` wrapper must keep axe clean; if axe flags the R3F canvas, add `role="presentation"` via the Canvas `gl.domElement` in `onCreated`.

- [ ] **Step 10: `Dockerfile` and `.dockerignore`**

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
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=https://rostelmissimawu.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build /app/.next/standalone ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
```

`.dockerignore`:
```
node_modules
.next
.git
.superpowers
docs
tests
test-results
playwright-report
coverage
legacy
3002
new.md
image*.png
.env
.env.*
```
Docker is not installed on the development machine: the image is validated on the first Coolify deployment. Do not claim it was built.

- [ ] **Step 11: Commit**

```bash
git add -A -- tools tests src/app/api playwright.config.ts Dockerfile .dockerignore
git commit -m "test(v6): owner rules on the Next build, health endpoint, e2e + axe suite, Coolify Dockerfile

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

## Lot 1 done when

- `pnpm test`, `pnpm build`, `pnpm lint:rules`, `pnpm test:e2e` pass (desktop and mobile projects).
- `/` (FR) and `/en` show the validated hero with the live Möbius on capable desktops, the poster otherwise, and match the prototype `.superpowers/brainstorm/288-1790671180/content/visionary-hero-v2.html` in layout and tone.
- No Astro file remains; the owner's untracked files (`new.md`, `image*.png`, `3002/`, `.claude/`) are untouched.
