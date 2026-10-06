# Visionary Engineer, Lot 2 (home sequences, light motion, mobile nav) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the home page with sequences 2 to 5 (Positioning, Selected work, Method, Conversion) as in the approved mockup, move all text reveals off GSAP (CSS hero + IntersectionObserver), load GSAP only with the sculpture, extend the sculpture trajectory (fade at Work, return at Conversion), and add the mobile menu, per-page canonical metadata and page-enter transitions.

**Architecture:** Hero items animate with pure CSS keyframes on load (no JavaScript, title visible for LCP). Below-fold blocks use a tiny client `Reveal` that sets `data-revealed` through an IntersectionObserver; CSS transitions do the motion. GSAP + ScrollTrigger move into a `SculptureTrajectory` client module loaded with `next/dynamic` only when the 3D scene is active, so they leave the initial bundle. A pure `localizedPath()` drives canonical/hreflang metadata. A build-output test enforces the 160 KB gzip initial-JS budget and the absence of GSAP from it.

**Tech Stack:** Next.js 16.3.7, React 19, next-intl 4.14.7 (`localeCookie: false`), Tailwind 4, three 0.186 + @react-three/fiber 9, gsap 3.15 (sculpture chunk only), Vitest 5, Playwright 1.63 + axe.

**Spec:** `docs/superpowers/specs/2026-09-29-portfolio-v6-visionary-engineer-design.md` (§3.5 motion decision of 2026-09-29, §4.1 home, §5.2, §7 budget ≤ 160 KB).
**Approved mockup:** `.superpowers/brainstorm/1199-1790689239/content/home-sequences.html`.
**Previous lot:** `docs/superpowers/plans/2026-09-29-visionary-lot1-foundations-hero.md` (its roadmap lists what Lot 2 inherits).

## Global Constraints

- Owner rules: not "vibecoded"; never a purple gradient; buttons are rectangles (radius ≤ 2px, `data-button` e2e guard exists); no fake reviews, metrics or counters (only confirmed numbers: ZenLife "1 200+ utilisateurs actifs en six mois" is confirmed); no vague hero; no emoji as icons (SVG only); **no em dash (U+2014) in any copy, FR or EN**; no custom cursor, nothing follows the mouse except the sculpture tilt; never AI-generated photos; favicon; no "made with AI".
- Motion (spec §3.5, decided 2026-09-29): hero = CSS only; below-fold = IntersectionObserver + CSS transitions, once; GSAP only for the sculpture trajectory and never in the initial JS. Everything static under `prefers-reduced-motion: reduce`. No scroll hijacking.
- Budget (spec §7): initial JS for `/` ≤ **160 KB gzip** (excluding `noModule` polyfills and the dynamically loaded 3D/trajectory chunks).
- Honesty: ContractIQ always shows "Co-développé avec Jérémie Zitti" / "Co-built with Jérémie Zitti". Hero lede says **"des produits livrés, pas des maquettes"** (ContractIQ has no public URL; ZenLife's server is down). Conversion promises **"je vous réponds sous 48 heures"** (confirmed by the owner).
- Colours/fonts as in Lot 1 (`obsidian`, `obsidian-2`, `ivory`, `champagne` (only accent), `muted`, `faint`, `graphite` (never text), `line`; Cormorant Garamond / Manrope / IBM Plex Mono).
- French copy uses the typographic apostrophe `’` (a unit test enforces it).
- Standalone server for manual checks: `PORT=3100 HOSTNAME=0.0.0.0 node .next/standalone/server.js &`, query `http://127.0.0.1:3100` (127.0.0.1 binding self-redirects). Playwright already does this.
- Never touch or stage the owner's untracked files: `new.md`, `image*.png`, `3002/`, `.claude/`. Stage explicit paths only.
- Next.js 16 docs: `node_modules/next/dist/docs/`. If an API here does not match the installed version, adapt minimally, keep the behaviour, report it.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. A visitor whose JavaScript fails must still see every below-fold section (not only the hero). Pinned in Task 1 (safety timer kept for `[data-reveal]`) and tested in Task 6 (chunks blocked, scroll to Conversion, text visible).
2. GSAP must not creep back into the initial bundle through a static import. Pinned in Task 1 (dynamic `SculptureTrajectory`) and tested in Task 6 (`bundle.dist.test.ts` fails if `ScrollTrigger` appears in initial chunks or if gzip > 160 KB).
3. Reduced-motion and no-JS visitors must see the Conversion ring as a still image, and the hero stage must not stay fixed over the page. Pinned in Task 4 (CSS `:has()` rule) and tested in Task 6.
4. The mobile menu must work without JavaScript and close after navigating. Pinned in Task 5 (`<details>` disclosure + close on pathname change) and tested in Task 6.
5. The English home must not show French leftovers in the new sections (untranslated keys). Pinned in Task 2 (message parity test) and tested in Task 6 (EN page contains the EN headings).

---

## File Structure (changes in Lot 2)

```
messages/fr.json, messages/en.json            # + positioning, work, method, conversion; hero.ledeRest fix
src/lib/i18n/localized-path.ts                # pure localizedPath(href, locale, params?)
src/lib/seo/page-metadata.ts                  # pageMetadata({ locale, href, params?, title?, description? })
src/components/motion/Reveal.tsx              # rewritten: IntersectionObserver, no GSAP
src/components/home/Hero.tsx                  # CSS keyframe entrance, no Reveal
src/components/home/Positioning.tsx
src/components/home/SelectedWork.tsx          # + WorkCase item component inside
src/components/home/Method.tsx
src/components/home/Conversion.tsx
src/components/sculpture/SculptureStage.tsx   # trajectory moved out; loads it dynamically
src/components/sculpture/SculptureTrajectory.tsx  # GSAP + ScrollTrigger (dynamic chunk only)
src/components/site/Header.tsx, MobileMenu.tsx, ButtonLink.tsx
src/app/[locale]/page.tsx, layout.tsx, template.tsx
src/assets/work/ubbfy.png, contractiq.png, zenlife.png
src/styles/globals.css
tests/unit/localized-path.test.ts, messages.test.ts (unchanged rules), tests/dist/bundle.dist.test.ts
tests/e2e/home.spec.ts, foundations.spec.ts (adjusted), sculpture.spec.ts (adjusted)
```

---

### Task 1: Light motion architecture (CSS hero, IntersectionObserver reveals, GSAP out of the initial bundle)

**Files:**
- Modify: `src/components/motion/Reveal.tsx` (rewrite), `src/components/home/Hero.tsx`, `src/components/sculpture/SculptureStage.tsx`, `src/styles/globals.css`, `tests/e2e/foundations.spec.ts` (axe wait helper only if needed)
- Create: `src/components/sculpture/SculptureTrajectory.tsx`

**Interfaces:**
- Produces:
  - `<Reveal className? as?: 'div' | 'section' | 'ul'>`: marks every descendant `[data-reveal]` with `data-revealed` once it intersects (rootMargin `0px 0px -12% 0px`), staggering by setting `--reveal-i` (0..n within the wrapper). Adds `reveal-ready` to `<html>` on mount. Under reduced motion, marks everything at once.
  - `<SculptureTrajectory stage={RefObject<HTMLDivElement>} progress={RefObject<number>} onFadedChange={(faded: boolean) => void} />` (default export, client). Renders `null`. Owns all GSAP/ScrollTrigger code. Task 4 extends it.
  - Hero items carry `data-hero` and a `--hero-i` index; CSS animates them on load.

- [ ] **Step 1: Rewrite `src/components/motion/Reveal.tsx`**

```tsx
'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

type Props = { children: ReactNode; className?: string; as?: ElementType };

/**
 * Reveal-once for below-the-fold content. CSS owns the motion: items are hidden only while
 * `html.js` is present, motion is allowed and the layout's safety timer has not fired
 * (see globals.css). This component only flags items as they enter the viewport.
 */
export function Reveal({ children, className, as: Tag = 'div' }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    document.documentElement.classList.add('reveal-ready');
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    items.forEach((item, i) => item.style.setProperty('--reveal-i', String(i % 6)));
    const show = (item: Element) => item.setAttribute('data-revealed', '');
    if (
      document.documentElement.classList.contains('reveal-done') ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      items.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      }),
      { rootMargin: '0px 0px -12% 0px' },
    );
    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: CSS for both mechanisms** — in `src/styles/globals.css`, replace the block that starts with `/* Reveal-once: content is only hidden when JS is present…` (and its `@media` rule) with:

```css
/* Hero entrance: pure CSS, no JavaScript dependency (LCP stays the h1). */
@media (prefers-reduced-motion: no-preference) {
  [data-hero] {
    animation: hero-rise 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
    animation-delay: calc(var(--hero-i, 0) * 90ms);
  }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

/* Below-the-fold reveal-once: hidden only when JS runs, motion is allowed and the
   layout's safety timer has not fired; <Reveal> sets data-revealed on intersection. */
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] {
    transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
    transition-delay: calc(var(--reveal-i, 0) * 80ms);
  }
  html.js:not(.reveal-done) [data-reveal]:not([data-revealed]) {
    opacity: 0;
    transform: translateY(18px);
  }
}
```
Keep the layout's `EARLY_JS` unchanged (it still adds `js` and the 2.5 s `reveal-done` rescue when `reveal-ready` never appears).

- [ ] **Step 3: Hero uses CSS entrance** — in `src/components/home/Hero.tsx`: remove the `Reveal` import and wrapper (replace `<Reveal className="relative z-10">…</Reveal>` with `<div className="relative z-10">…</div>`), replace each `data-reveal` with `data-hero` plus an inline index style, in order 0..4:

```tsx
<p data-hero style={{ '--hero-i': 0 } as React.CSSProperties} …>
<h1 data-hero style={{ '--hero-i': 1 } as React.CSSProperties} …>
<p data-hero style={{ '--hero-i': 2 } as React.CSSProperties} …>
<div data-hero style={{ '--hero-i': 3 } as React.CSSProperties} …>
<p data-hero style={{ '--hero-i': 4 } as React.CSSProperties} …>
```
Import `type CSSProperties` from `react` and use `as CSSProperties` (no `React.` namespace).

- [ ] **Step 4: Create `src/components/sculpture/SculptureTrajectory.tsx`** (moves the existing trajectory code out of the stage, unchanged in behaviour for now)

```tsx
'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  stage: RefObject<HTMLDivElement | null>;
  progress: RefObject<number>;
  onFadedChange: (faded: boolean) => void;
};

/** Desktop scroll trajectory of the sculpture. Loaded only with the 3D scene (dynamic chunk). */
export default function SculptureTrajectory({ stage, progress, onFadedChange }: Props) {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
      const el = stage.current;
      if (!el) return;
      el.setAttribute('data-trajectory', 'on');
      gsap.to(el, {
        xPercent: 12, scale: 0.88, opacity: 0, ease: 'none',
        scrollTrigger: {
          start: 0, end: () => innerHeight * 1.2, scrub: true,
          onUpdate: (self) => {
            progress.current = self.progress;
            onFadedChange(self.progress >= 0.999);
          },
        },
      });
      return () => {
        el.removeAttribute('data-trajectory');
        onFadedChange(false);
        progress.current = 0;
      };
    });
    return () => mm.revert();
  });
  return null;
}
```

- [ ] **Step 5: Stage loads the trajectory dynamically** — in `src/components/sculpture/SculptureStage.tsx`:
  - delete the `useGSAP`, `gsap`, `ScrollTrigger` imports, the `gsap.registerPlugin` line and the whole `useGSAP(() => { … })` block;
  - add `const Trajectory = dynamic(() => import('./SculptureTrajectory'), { ssr: false, loading: () => null });`;
  - add `const onFadedChange = useCallback((f: boolean) => setFaded(f), []);`;
  - inside the returned JSX, next to the `SculptureBoundary`, render the trajectory only in live 3D mode:

```tsx
{mode === '3d' && !posterMode && (
  <Trajectory stage={box} progress={progress} onFadedChange={onFadedChange} />
)}
```
  Poster-capture mode keeps `data-trajectory="on"` through the existing prop (unchanged).

- [ ] **Step 6: Verify**

Run `pnpm test && pnpm build && pnpm test:e2e`. All existing e2e must pass (the hero h1 is now visible without JS, under reduced motion and when chunks are blocked; the axe tests wait for `[data-reveal]` opacity 1: with no `[data-reveal]` left on the home that wait resolves immediately). Then check the initial chunks of the built home do not contain GSAP:

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('.next/server/app/fr.html','utf8');const src=[...h.matchAll(/<script[^>]*src=\"([^\"]+\.js)\"[^>]*>/g)].filter(m=>!/noModule/i.test(m[0])).map(m=>m[1]);let hit=src.filter(s=>fs.readFileSync('.next'+s.replace('/_next',''),'utf8').includes('ScrollTrigger'));console.log(src.length,'initial scripts; with ScrollTrigger:',hit)"
```
Expected: an empty list. (Task 6 turns this into a permanent test.)

- [ ] **Step 7: Commit**

```bash
git add src/components/motion/Reveal.tsx src/components/home/Hero.tsx src/components/sculpture/SculptureStage.tsx src/components/sculpture/SculptureTrajectory.tsx src/styles/globals.css tests/e2e
git commit -m "perf(v6): CSS hero entrance, IntersectionObserver reveals, GSAP only in the sculpture chunk

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Copy, work images and localized paths

**Files:**
- Modify: `messages/fr.json`, `messages/en.json`
- Create: `src/lib/i18n/localized-path.ts`, `src/lib/seo/page-metadata.ts`, `src/assets/work/ubbfy.png`, `src/assets/work/contractiq.png`, `src/assets/work/zenlife.png`
- Modify: `src/app/[locale]/layout.tsx` (use `pageMetadata`), `src/app/[locale]/page.tsx` (home metadata)
- Test: `tests/unit/localized-path.test.ts`

**Interfaces:**
- Produces:
  - `localizedPath(href: keyof typeof routing.pathnames, locale: Locale, params?: Record<string, string>): string` — `'/'`+`fr` → `/`, `'/'`+`en` → `/en`, `'/realisations/[slug]'`+`en`+`{slug:'ubbfy'}` → `/en/work/ubbfy`.
  - `pageMetadata({ locale, href, params?, title, description }): Metadata` — sets `title`, `description`, `alternates.canonical` (absolute), `alternates.languages` `{ fr, en, 'x-default': fr }`.
  - Message namespaces `positioning`, `work`, `method`, `conversion` (keys below).
  - Static images importable as `@/assets/work/<slug>.png`.

- [ ] **Step 1: Failing test `tests/unit/localized-path.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { localizedPath } from '../../src/lib/i18n/localized-path';

describe('localizedPath', () => {
  it.each([
    ['/', 'fr', undefined, '/'],
    ['/', 'en', undefined, '/en'],
    ['/realisations', 'fr', undefined, '/realisations'],
    ['/realisations', 'en', undefined, '/en/work'],
    ['/realisations/[slug]', 'fr', { slug: 'ubbfy' }, '/realisations/ubbfy'],
    ['/realisations/[slug]', 'en', { slug: 'ubbfy' }, '/en/work/ubbfy'],
    ['/a-propos', 'en', undefined, '/en/about'],
    ['/confidentialite', 'en', undefined, '/en/privacy'],
    ['/brief', 'en', undefined, '/en/brief'],
  ] as const)('%s in %s → %s', (href, locale, params, expected) => {
    expect(localizedPath(href, locale, params)).toBe(expected);
  });

  it('throws when a dynamic segment has no value', () => {
    expect(() => localizedPath('/realisations/[slug]', 'fr')).toThrow(/slug/);
  });
});
```

- [ ] **Step 2: Run it — FAIL (module missing).** `pnpm test tests/unit/localized-path.test.ts`

- [ ] **Step 3: `src/lib/i18n/localized-path.ts`**

```ts
import { routing, type Locale } from '@/i18n/routing';

type Href = keyof typeof routing.pathnames;

/** Public URL path of an internal route for a locale (fr unprefixed, en under /en). */
export function localizedPath(href: Href, locale: Locale, params?: Record<string, string>): string {
  const entry = routing.pathnames[href] as string | Record<Locale, string>;
  const template = typeof entry === 'string' ? entry : entry[locale];
  const path = template.replace(/\[(\w+)\]/g, (_, name: string) => {
    const value = params?.[name];
    if (!value) throw new Error(`localizedPath: missing value for [${name}] in ${href}`);
    return encodeURIComponent(value);
  });
  if (locale === routing.defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}
```
The test imports through a relative path; `@/i18n/routing` resolves in Vitest only if an alias exists. If Vitest cannot resolve `@/`, add `resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }` to `vitest.config.ts` (import `fileURLToPath` from `node:url`).

- [ ] **Step 4: Run it — PASS.**

- [ ] **Step 5: `src/lib/seo/page-metadata.ts`**

```ts
import type { Metadata } from 'next';
import type { routing, Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rostelmissimawu.com';

type Args = {
  locale: Locale;
  href: keyof typeof routing.pathnames;
  params?: Record<string, string>;
  title: string;
  description: string;
};

export function pageMetadata({ locale, href, params, title, description }: Args): Metadata {
  const abs = (l: Locale) => new URL(localizedPath(href, l, params), SITE).toString();
  return {
    title,
    description,
    alternates: {
      canonical: abs(locale),
      languages: { fr: abs('fr'), en: abs('en'), 'x-default': abs('fr') },
    },
  };
}
```
In `src/app/[locale]/layout.tsx`: keep `metadataBase`, `icons`, `manifest` and the default `title`/`description`, but **remove `alternates`** from the layout (pages own their canonical now). In `src/app/[locale]/page.tsx` add:

```tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'meta' });
  return pageMetadata({ locale: locale as Locale, href: '/', title: t('title'), description: t('description') });
}
```

- [ ] **Step 6: Messages** — in both files, change `hero.ledeRest` and add the namespaces below (keep all existing keys).

`messages/fr.json`:
```json
"hero": { "ledeRest": ", ingénieur produit et Head of Engineering chez KPS Groupe. Six ans d’expérience, dont trois comme tech lead. Ubbfy, ContractIQ, ZenLife : des produits livrés, pas des maquettes." },
"positioning": {
  "kicker": "02 · Au-delà du développement",
  "title": "Je ne livre pas du code. Je livre des produits qui tiennent.",
  "vision": "Vision", "visionText": "Comprendre le métier, les utilisateurs et les contraintes avant d’écrire une ligne.",
  "architecture": "Architecture", "architectureText": "Choisir les fondations : données, paiements, sécurité, montée en charge.",
  "execution": "Exécution", "executionText": "Construire, tester, mettre en production et faire évoluer avec l’équipe.",
  "signatureA": "Les idées sont partout.", "signatureB": "L’exécution est une discipline."
},
"work": {
  "kicker": "03 · Réalisations",
  "title": "Trois produits, de l’architecture au lancement.",
  "all": "Toutes les réalisations",
  "cta": "Voir l’étude de cas",
  "coBuilt": "Co-développé avec",
  "ubbfy": { "what": "ERP et pointage géolocalisé", "role": "Lead engineer", "roleDetail": "refonte et architecture", "challenge": "Reconstruire un ERP complet autour d’une seule API, servie à trois clients : web, PWA et application Flutter.", "alt": "Ubbfy, page d’accueil et aperçu du suivi des candidats" },
  "contractiq": { "what": "SaaS d’analyse de contrats par IA", "role": "Architecture et développement", "roleDetail": "produit B2B", "challenge": "Extraire parties, échéances et clauses à risque de contrats PDF, puis alerter avant chaque renouvellement. Gemini en moteur principal, OpenAI en secours.", "alt": "ContractIQ, analyse des risques d’un contrat par l’IA" },
  "zenlife": { "what": "Application bien-être, web et mobile", "role": "Conception et développement", "roleDetail": "seul", "challenge": "Planning, budget, messagerie et rappels réunis dans une seule application, utilisée par 1 200+ personnes actives en six mois.", "alt": "ZenLife, tableau de bord de l’application" }
},
"method": {
  "kicker": "04 · Méthode",
  "title": "De l’idée à la production, sans perdre le fil.",
  "discover": "Découvrir", "discoverText": "Comprendre le problème, les utilisateurs, les objectifs et les contraintes.",
  "design": "Concevoir le système", "designText": "Définir l’expérience, l’architecture, les fonctionnalités et les choix techniques.",
  "build": "Construire et valider", "buildText": "Développer, tester, recueillir les retours et améliorer le produit.",
  "evolve": "Faire évoluer", "evolveText": "Préparer la maintenance, les performances et les nouvelles fonctionnalités."
},
"conversion": {
  "kicker": "05 · Votre projet",
  "title": "Parlons de votre projet.",
  "text": "Une plateforme à concevoir, un produit à reprendre ou une équipe à structurer : décrivez votre besoin en quelques minutes, je vous réponds sous 48 heures.",
  "brief": "Décrire mon projet",
  "email": "Écrire un email"
}
```
(The JSON above shows the `hero` object with only its changed key for brevity: edit that one key in the existing `hero` object, do not drop the others.)

`messages/en.json`:
```json
"hero": { "ledeRest": ", product engineer and Head of Engineering at KPS Groupe. Six years of experience, three as tech lead. Ubbfy, ContractIQ, ZenLife: products shipped, not mockups." },
"positioning": {
  "kicker": "02 · Beyond development",
  "title": "I don’t just ship code. I ship products that hold up.",
  "vision": "Vision", "visionText": "Understand the business, the users and the constraints before writing a line.",
  "architecture": "Architecture", "architectureText": "Choose the foundations: data, payments, security, scale.",
  "execution": "Execution", "executionText": "Build, test, ship to production and keep improving with the team.",
  "signatureA": "Ideas are everywhere.", "signatureB": "Execution is a discipline."
},
"work": {
  "kicker": "03 · Selected work",
  "title": "Three products, from architecture to launch.",
  "all": "All work",
  "cta": "Read the case study",
  "coBuilt": "Co-built with",
  "ubbfy": { "what": "ERP and geolocated time clock", "role": "Lead engineer", "roleDetail": "rebuild and architecture", "challenge": "Rebuild a complete ERP around a single API serving three clients: web, PWA and a Flutter app.", "alt": "Ubbfy, home page and candidate pipeline preview" },
  "contractiq": { "what": "AI contract analysis SaaS", "role": "Architecture and development", "roleDetail": "B2B product", "challenge": "Extract parties, deadlines and risky clauses from PDF contracts, then alert before every renewal. Gemini as the main engine, OpenAI as fallback.", "alt": "ContractIQ, AI risk analysis of a contract" },
  "zenlife": { "what": "Wellness app, web and mobile", "role": "Design and development", "roleDetail": "solo", "challenge": "Planning, budget, messaging and reminders in a single app, used by 1,200+ active people within six months.", "alt": "ZenLife, app dashboard" }
},
"method": {
  "kicker": "04 · Method",
  "title": "From idea to production, without losing the thread.",
  "discover": "Discover", "discoverText": "Understand the problem, the users, the goals and the constraints.",
  "design": "Design the system", "designText": "Define the experience, the architecture, the features and the technical choices.",
  "build": "Build and validate", "buildText": "Develop, test, gather feedback and improve the product.",
  "evolve": "Evolve", "evolveText": "Prepare maintenance, performance and new features."
},
"conversion": {
  "kicker": "05 · Your project",
  "title": "Let’s talk about your project.",
  "text": "A platform to design, a product to take over or a team to structure: describe your needs in a few minutes, I reply within 48 hours.",
  "brief": "Describe my project",
  "email": "Send an email"
}
```
Run `pnpm test tests/unit/messages.test.ts` (parity, no em dash, FR apostrophes, owner facts): PASS.

- [ ] **Step 7: Work images**

```bash
mkdir -p src/assets/work
git show v5-manifesto:public/images/ubbfy.png > src/assets/work/ubbfy.png
cp .superpowers/assets/zenlife/desktop-dash.png src/assets/work/zenlife.png
cp .superpowers/assets/contractiq/02b-contract-detail-risks.png src/assets/work/contractiq.png
```
(Chosen by the controller: the AI risk analysis of a fictional contract, demo data only. The folder holds 12 captures for Lot 3.) Open all three with an image viewer: no browser chrome, no personal data, no error overlay.

- [ ] **Step 8: Verify and commit**

Run `pnpm test && pnpm build`. Check the built home HTML contains exactly one `<link rel="canonical"` and `hrefLang="en"` pointing to `/en`.

```bash
git add messages src/lib src/assets/work src/app/[locale]/layout.tsx src/app/[locale]/page.tsx tests/unit/localized-path.test.ts vitest.config.ts
git commit -m "feat(v6): home copy FR/EN, work images, localizedPath + pageMetadata for per-page canonical

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Home sequences 2 to 5

**Files:**
- Create: `src/components/home/Positioning.tsx`, `src/components/home/SelectedWork.tsx`, `src/components/home/Method.tsx`, `src/components/home/Conversion.tsx`
- Modify: `src/app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `Reveal` (Task 1), messages (Task 2), `ButtonLink` (`data-button`), images `@/assets/work/*.png`.
- Produces: sections with ids `expertise` (Positioning), `realisations-accueil` (SelectedWork), `methode` (Method), `projet` (Conversion); attributes `data-sculpture-fade-out` on the SelectedWork `<section>` and `data-sculpture-return` on the Conversion `<section>` (Task 4 uses them); `data-conversion-poster` on Conversion's still image.

Layout and styles follow the approved mockup (`home-sequences.html`): container `mx-auto max-w-[1280px] px-5 md:px-10`; kicker `font-mono text-xs uppercase tracking-[0.14em] text-champagne`; h2 `font-serif text-[clamp(34px,4vw,56px)] leading-[1.05] font-medium max-w-[20ch]`; muted body text `text-muted`; section vertical rhythm `py-[14vh]` (Positioning `pt-[18vh]`).

- [ ] **Step 1: `Positioning.tsx`**

```tsx
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';

const PILLARS = ['vision', 'architecture', 'execution'] as const;

export function Positioning() {
  const t = useTranslations('positioning');
  return (
    <section id="expertise" className="mx-auto max-w-[1280px] px-5 pb-[12vh] pt-[18vh] md:px-10">
      <Reveal>
        <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
        <h2 data-reveal className="mt-3.5 max-w-[20ch] font-serif text-[clamp(34px,4vw,56px)] font-medium leading-[1.05]">{t('title')}</h2>
        <ol className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
          {PILLARS.map((key, i) => (
            <li key={key} data-reveal className="bg-obsidian px-7 pb-10 pt-8">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mb-2.5 mt-4 font-serif text-[32px] font-medium">{t(key)}</h3>
              <p className="text-[14.5px] leading-[1.65] text-muted">{t(`${key}Text`)}</p>
            </li>
          ))}
        </ol>
        <p data-reveal className="mt-[12vh] font-serif text-[clamp(30px,3.6vw,50px)] font-medium leading-[1.15]">
          {t('signatureA')} <em className="italic text-champagne">{t('signatureB')}</em>
        </p>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: `SelectedWork.tsx`**

```tsx
import Image, { type StaticImageData } from 'next/image';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/site/ButtonLink';
import { Link } from '@/i18n/navigation';
import contractiq from '@/assets/work/contractiq.png';
import ubbfy from '@/assets/work/ubbfy.png';
import zenlife from '@/assets/work/zenlife.png';

type Case = { slug: 'ubbfy' | 'contractiq' | 'zenlife'; name: string; image: StaticImageData; stack: string; coBuilt?: string };

const CASES: Case[] = [
  { slug: 'ubbfy', name: 'Ubbfy', image: ubbfy, stack: 'Django 5 · DRF · PostgreSQL · Redis · Vue 3 · Flutter' },
  { slug: 'contractiq', name: 'ContractIQ', image: contractiq, stack: 'Next.js · MongoDB · Gemini · OpenAI · FedaPay', coBuilt: 'Jérémie Zitti' },
  { slug: 'zenlife', name: 'ZenLife', image: zenlife, stack: 'Spring Boot · PostgreSQL · Redis · WebSocket · Vue 3 · Capacitor' },
];

export function SelectedWork() {
  const t = useTranslations('work');
  return (
    <section id="realisations-accueil" data-sculpture-fade-out className="mx-auto max-w-[1280px] px-5 pb-[10vh] pt-[6vh] md:px-10">
      <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
          <h2 data-reveal className="mt-3.5 max-w-[20ch] font-serif text-[clamp(34px,4vw,56px)] font-medium leading-[1.05]">{t('title')}</h2>
        </div>
        <Link data-reveal href="/realisations" className="border-b border-graphite pb-1 text-sm no-underline hover:border-champagne hover:text-champagne">{t('all')}</Link>
      </Reveal>
      <ol>
        {CASES.map((c, i) => (
          <li key={c.slug}>
            <Reveal
              as="article"
              className="group grid items-center gap-7 border-b border-line py-[9vh] lg:gap-14 lg:[grid-template-columns:7fr_5fr] lg:even:[grid-template-columns:5fr_7fr]"
            >
              <div data-reveal className={`relative aspect-[16/10] overflow-hidden border border-line bg-obsidian-2 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <Image
                  src={c.image}
                  alt={t(`${c.slug}.alt`)}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover object-top transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.035] motion-reduce:transition-none"
                />
              </div>
              <div data-reveal>
                <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mb-1.5 mt-3 font-serif text-[44px] font-medium leading-none">{c.name}</h3>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-champagne">{t(`${c.slug}.what`)}</p>
                <p className="mt-5 text-[13px] text-faint"><strong className="font-medium text-ivory">{t(`${c.slug}.role`)}</strong> · {t(`${c.slug}.roleDetail`)}</p>
                <p className="mb-4 mt-3.5 max-w-[46ch] text-base leading-[1.7] text-muted">{t(`${c.slug}.challenge`)}</p>
                {c.coBuilt && <p className="mb-5 text-[13px] text-muted">{t('coBuilt')} <strong className="font-medium text-ivory">{c.coBuilt}</strong></p>}
                <p className="mb-6 font-mono text-xs text-faint">{c.stack}</p>
                <ButtonLink href={{ pathname: '/realisations/[slug]', params: { slug: c.slug } }} variant="ghost" arrow>{t('cta')}</ButtonLink>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
```
Note: the case-study pages arrive in Lot 3; until then these links 404 (the localized 404 page). The `lg:even:` utility targets `<article>` parity only if articles are siblings; since each article is wrapped in its own `<li>`, apply the alternate grid with the `i % 2 === 1` check instead if Tailwind's `even:` does not match (keep the visual alternation).

- [ ] **Step 3: `Method.tsx`**

```tsx
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';

const STEPS = ['discover', 'design', 'build', 'evolve'] as const;

export function Method() {
  const t = useTranslations('method');
  return (
    <section id="methode" className="mx-auto max-w-[1280px] px-5 pb-[14vh] pt-[8vh] md:px-10">
      <Reveal>
        <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
        <h2 data-reveal className="mt-3.5 max-w-[20ch] font-serif text-[clamp(34px,4vw,56px)] font-medium leading-[1.05]">{t('title')}</h2>
        <ol className="mt-14 grid border-t border-line md:grid-cols-4">
          {STEPS.map((key, i) => (
            <li key={key} data-reveal className="relative pb-5 pr-6 pt-7 before:absolute before:-top-1 before:left-0 before:size-[7px] before:bg-champagne">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mb-2.5 mt-3.5 font-serif text-[26px] font-medium">{t(key)}</h3>
              <p className="max-w-[26ch] text-sm leading-[1.65] text-muted">{t(`${key}Text`)}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 4: `Conversion.tsx`**

```tsx
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/site/ButtonLink';

export function Conversion() {
  const t = useTranslations('conversion');
  const sig = useTranslations('positioning');
  return (
    <section id="projet" data-sculpture-return className="relative overflow-hidden border-t border-line py-[18vh]">
      {/* Still ring for visitors without the live trajectory (no JS, reduced motion, no WebGL, mobile). */}
      <picture>
        <source media="(max-width: 1023px)" srcSet="/sculpture/mobius-mobile.webp" />
        <img
          src="/sculpture/mobius-desktop.webp"
          alt=""
          aria-hidden="true"
          data-conversion-poster
          className="pointer-events-none mx-auto mb-8 block w-[70vw] max-w-[420px] lg:absolute lg:right-[-4%] lg:top-1/2 lg:mb-0 lg:w-[min(44vw,600px)] lg:max-w-none lg:-translate-y-1/2"
        />
      </picture>
      <Reveal className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
        <h2 data-reveal className="mt-3.5 max-w-[12ch] font-serif text-[clamp(46px,6vw,88px)] font-medium leading-[1.02]">{t('title')}</h2>
        <p data-reveal className="mb-8 mt-6 max-w-[48ch] text-[16.5px] leading-[1.7] text-muted">{t('text')}</p>
        <div data-reveal className="flex flex-wrap gap-3.5">
          <ButtonLink href="/brief" variant="primary" arrow>{t('brief')}</ButtonLink>
          <a data-button href="mailto:rmissimawu@gmail.com" className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-[2px] border border-[#3a3b3e] px-5 py-3.5 text-[13.5px] font-semibold text-ivory no-underline transition-colors hover:border-champagne hover:text-champagne">{t('email')}</a>
        </div>
        <p data-reveal className="mt-10 flex gap-6 text-[13.5px] text-faint">
          <a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" rel="me noopener" className="border-b border-graphite pb-1 no-underline hover:border-champagne hover:text-champagne">LinkedIn</a>
          <a href="https://github.com/ThommyShelby9" rel="me noopener" className="border-b border-graphite pb-1 no-underline hover:border-champagne hover:text-champagne">GitHub</a>
        </p>
        <p data-reveal className="mt-[10vh] font-serif text-[22px] font-medium text-muted">
          {sig('signatureA')} <em className="italic text-champagne">{sig('signatureB')}</em>
        </p>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 5: Assemble `src/app/[locale]/page.tsx`**

```tsx
return (
  <>
    <Hero sculpture={<SculptureStage />} />
    <Positioning />
    <SelectedWork />
    <Method />
    <Conversion />
  </>
);
```
(keep the `generateMetadata` from Task 2 and the existing `setRequestLocale` call; add the four imports.)

- [ ] **Step 6: Build and look**

Run `pnpm test && pnpm build`. Start the standalone server and take Edge screenshots (full page, after scrolling through to trigger reveals) at 1440×900 and 390×844 for `/` and `/en`. Compare with the approved mockup: same order, alternating image sides, ContractIQ co-author line, 48 h promise, ring at Conversion. Describe any difference.

- [ ] **Step 7: Commit**

```bash
git add src/components/home src/app/[locale]/page.tsx
git commit -m "feat(v6): home sequences 2-5: positioning, selected work, method, conversion

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Full sculpture trajectory (fade at Work, return at Conversion)

**Files:**
- Modify: `src/components/sculpture/SculptureTrajectory.tsx`, `src/styles/globals.css`

**Interfaces:**
- Consumes: `[data-sculpture-fade-out]` (SelectedWork section) and `[data-sculpture-return]` (Conversion section) from Task 3; `data-conversion-poster` still image.
- Produces: desktop with motion allowed: stage drifts/shrinks from the top, is fully faded when the Work section's top reaches 40 % of the viewport, stays hidden (render paused through `onFadedChange(true)`), fades back in on the right half while the Conversion section enters (top from 90 % to 40 %), and the Conversion still image is hidden while the live trajectory is on.

- [ ] **Step 1: Replace the tween in `SculptureTrajectory.tsx`** (inside the `mm.add` callback, after `el.setAttribute('data-trajectory', 'on')`)

```tsx
      const fadeOut = document.querySelector('[data-sculpture-fade-out]');
      const back = document.querySelector('[data-sculpture-return]');
      const out = gsap.timeline({
        scrollTrigger: {
          start: 0,
          endTrigger: fadeOut ?? undefined,
          end: fadeOut ? 'top 40%' : () => `+=${innerHeight * 1.2}`,
          scrub: true,
          onUpdate: (self) => { progress.current = self.progress; },
        },
      });
      out.to(el, { xPercent: 12, scale: 0.88, opacity: 0, ease: 'none' });

      if (back) {
        gsap.fromTo(
          el,
          { xPercent: 12, scale: 0.88, opacity: 0 },
          {
            xPercent: 0, scale: 0.8, opacity: 1, ease: 'none', immediateRender: false,
            scrollTrigger: { trigger: back, start: 'top 90%', end: 'top 40%', scrub: true },
          },
        );
      }

      // Hidden (fully faded) only between the end of the fade-out and the start of the return.
      ScrollTrigger.create({
        trigger: fadeOut ?? document.body,
        start: fadeOut ? 'top 40%' : 'top top',
        endTrigger: back ?? undefined,
        end: back ? 'top 90%' : 'max',
        onToggle: (self) => onFadedChange(self.isActive),
      });
```
Remove the previous single `gsap.to(el, …)` block. Keep the cleanup (remove `data-trajectory`, `onFadedChange(false)`, `progress.current = 0`).

- [ ] **Step 2: Hide the Conversion still image while the live trajectory runs** — append to `globals.css`:

```css
/* The live sculpture returns at Conversion on desktop; its still twin is only for everyone else. */
@media (min-width: 1024px) {
  html:has([data-sculpture-stage][data-trajectory='on']) [data-conversion-poster] { display: none; }
}
```

- [ ] **Step 3: Verify manually** (standalone server, Edge, 1440×900): at scroll 0 the ring is on the right; when the Work heading reaches mid-screen the ring is gone and `data-running="false"`; while scrolling into Conversion the ring fades back on the right, `data-running="true"`, and there is no second ring (the still image is hidden). With reduced motion: no fixed ring; the Conversion still image is visible. Record the observations.

- [ ] **Step 4: Commit**

```bash
git add src/components/sculpture/SculptureTrajectory.tsx src/styles/globals.css
git commit -m "feat(v6): sculpture fades at Selected work and returns at Conversion

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Mobile menu, header polish, page-enter transition

**Files:**
- Create: `src/components/site/MobileMenu.tsx`, `src/app/[locale]/template.tsx`
- Modify: `src/components/site/Header.tsx`, `src/components/site/ButtonLink.tsx`, `src/app/[locale]/layout.tsx`, `src/styles/globals.css`, `messages/fr.json`, `messages/en.json`

**Interfaces:**
- Consumes: messages `nav.*`; `Link`, `usePathname` from `@/i18n/navigation`.
- Produces: below `md`, a `<details data-mobile-menu>` disclosure in the header (summary label from `nav.menu`), listing the same links as the desktop nav + the CTA; closes on pathname change; works without JS. "Expertise" now links to the home `#expertise` section.

- [ ] **Step 1: Messages** — add to `nav` in FR `"menu": "Menu"`, `"closeMenu": "Fermer le menu"`; in EN `"menu": "Menu"`, `"closeMenu": "Close the menu"`.

- [ ] **Step 2: `src/components/site/MobileMenu.tsx`**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import type { NavItem } from './Header';

export function MobileMenu({ items }: { items: readonly NavItem[] }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const details = useRef<HTMLDetailsElement>(null);

  // Close after a client-side navigation (a no-JS visitor gets a full page load anyway).
  useEffect(() => { if (details.current) details.current.open = false; }, [pathname]);

  return (
    <details ref={details} data-mobile-menu className="group md:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-[2px] border border-[#3a3b3e] px-3 py-2 text-[13px] font-medium [&::-webkit-details-marker]:hidden">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" className="group-open:hidden" />
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" className="hidden group-open:block" />
        </svg>
        <span className="group-open:hidden">{t('menu')}</span>
        <span className="hidden group-open:inline">{t('closeMenu')}</span>
      </summary>
      <nav aria-label={t('label')} className="absolute inset-x-0 top-full border-b border-line bg-obsidian px-5 pb-8 pt-4">
        <ul className="flex flex-col gap-1 text-lg">
          {items.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="block py-3 font-serif text-[26px] no-underline">{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
```

- [ ] **Step 3: Header** — in `src/components/site/Header.tsx`:
  - export the item type: `export type NavItem = { href: ComponentProps<typeof Link>['href']; label: string };` (import `type ComponentProps` from `react`);
  - items: `{ href: '/realisations', label: t('work') }`, `{ href: { pathname: '/', hash: 'expertise' }, label: t('expertise') }`, `{ href: '/a-propos', label: t('about') }`, `{ href: '/explorations', label: t('explorations') }`, typed `NavItem[]`;
  - header classes: `sticky top-0 z-30 border-b border-transparent bg-obsidian/85 backdrop-blur-md` (legible background instead of the fading gradient); the inner row gets `relative`;
  - render `<MobileMenu items={items} />` inside the right-hand group, before `LocaleSwitch`;
  - the CTA `ButtonLink` keeps showing on mobile.

- [ ] **Step 4: ButtonLink never wraps** — add `whitespace-nowrap` to its `base` class string.

- [ ] **Step 5: Skip-link target without a stray outline** — in `layout.tsx`, `<main id="main" tabIndex={-1} className="relative focus:outline-none">`.

- [ ] **Step 6: Page-enter transition** — create `src/app/[locale]/template.tsx` (templates remount on navigation):

```tsx
import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
```
and append to `globals.css`:
```css
@media (prefers-reduced-motion: no-preference) {
  .page-enter { animation: page-enter 280ms ease-out both; }
}
@keyframes page-enter { from { opacity: 0; } to { opacity: 1; } }
```
The hero's own CSS entrance still runs on first load; the page fade only affects opacity.

- [ ] **Step 7: Verify and commit**

Run `pnpm test && pnpm build`. Edge at 360×740: the menu opens and closes, links visible, no horizontal overflow, CTA on one line. With JS disabled the `<details>` menu still opens. Desktop: header background legible over the Work images.

```bash
git add src/components/site src/app/[locale]/template.tsx src/app/[locale]/layout.tsx src/styles/globals.css messages
git commit -m "feat(v6): no-JS mobile menu, legible sticky header, Expertise anchor, page-enter fade

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Budget test and home e2e

**Files:**
- Create: `tests/dist/bundle.dist.test.ts`, `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/sculpture.spec.ts` (the "stops rendering" test no longer needs the min-height trick), `tests/e2e/foundations.spec.ts` (360 px overflow list gains nothing new; keep)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: `tests/dist/bundle.dist.test.ts`**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { expect, it } from 'vitest';

const BUDGET = 160 * 1024;

function initialScripts(page: string): string[] {
  const html = readFileSync(join('.next/server/app', page), 'utf8');
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/g)]
    .filter((m) => !/\bnoModule\b/i.test(m[0]))
    .map((m) => join('.next', m[1].replace(/^\/_next/, '')));
}

for (const page of ['fr.html', 'en.html']) {
  it(`${page}: initial JS stays within ${BUDGET / 1024} KB gzip and ships no GSAP`, () => {
    const files = initialScripts(page);
    expect(files.length).toBeGreaterThan(0);
    const sources = files.map((f) => readFileSync(f));
    const total = sources.reduce((sum, buf) => sum + gzipSync(buf).length, 0);
    expect(total, `gzip total ${Math.round(total / 1024)} KB`).toBeLessThanOrEqual(BUDGET);
    for (const [i, buf] of sources.entries()) {
      expect(buf.toString('utf8').includes('ScrollTrigger'), files[i]).toBe(false);
    }
  });
}
```
Run `pnpm build && pnpm lint:rules` (the dist config already includes `tests/dist/**`): PASS. Report the measured KB.

- [ ] **Step 2: `tests/e2e/home.spec.ts`**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('home sequences', () => {
  test('French home shows the four sequences in order', async ({ page }) => {
    await page.goto('/');
    const headings = page.getByRole('heading', { level: 2 });
    await expect(headings.nth(0)).toContainText('Je ne livre pas du code');
    await expect(headings.nth(1)).toContainText('Trois produits');
    await expect(headings.nth(2)).toContainText('De l’idée à la production');
    await expect(headings.nth(3)).toContainText('Parlons de votre projet');
    await expect(page.getByText('Co-développé avec')).toBeVisible();
    await expect(page.getByText(/sous 48 heures/)).toBeVisible();
    await expect(page.getByText(/des produits livrés, pas des maquettes/)).toBeVisible();
  });

  test('English home is fully translated', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /ship products that hold up/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Three products/ })).toBeVisible();
    await expect(page.getByText('Co-built with')).toBeVisible();
    await expect(page.getByText(/within 48 hours/)).toBeVisible();
  });

  test('below-fold text appears when scrolled into view', async ({ page }) => {
    await page.goto('/');
    const conv = page.getByRole('heading', { name: 'Parlons de votre projet.' });
    await conv.scrollIntoViewIfNeeded();
    await expect.poll(async () => conv.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });

  test('below-fold text is visible even when page scripts never load', async ({ page }) => {
    await page.route('**/_next/static/chunks/**', (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(3000);
    const conv = page.getByRole('heading', { name: 'Parlons de votre projet.' });
    await conv.scrollIntoViewIfNeeded();
    expect(await conv.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });

  test('reduced motion: everything visible at once, still ring at Conversion, stage not fixed', async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const conv = page.getByRole('heading', { name: 'Parlons de votre projet.' });
    expect(await conv.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect(page.locator('[data-conversion-poster]')).toBeVisible();
    if (!isMobile) {
      expect(await page.locator('[data-sculpture-stage]').evaluate((el) => getComputedStyle(el).position)).not.toBe('fixed');
    }
  });

  test('live sculpture fades at Work and returns at Conversion (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop trajectory');
    test.setTimeout(60_000);
    await page.goto('/');
    const stage = page.locator('[data-sculpture-stage]');
    await expect(stage).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
    await page.getByRole('heading', { name: /Trois produits/ }).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await expect(stage).toHaveAttribute('data-running', 'false', { timeout: 5000 });
    await page.getByRole('heading', { name: 'Parlons de votre projet.' }).scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-running', 'true', { timeout: 5000 });
    await expect(page.locator('[data-conversion-poster]')).toBeHidden();
  });

  test('mobile menu opens, lists the sections and works without JS', async ({ browser }) => {
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width: 360, height: 740 }, javaScriptEnabled });
      const page = await context.newPage();
      await page.goto('/');
      await page.locator('[data-mobile-menu] summary').click();
      await expect(page.locator('[data-mobile-menu] nav').getByRole('link', { name: 'Réalisations' })).toBeVisible();
      await context.close();
    }
  });

  test('home canonical and alternates', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en$/);
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', /rostelmissimawu\.com\/?$/);
  });

  for (const path of ['/', '/en']) {
    test(`no accessibility violations on the full home ${path}`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
```

- [ ] **Step 3: Adjust `tests/e2e/sculpture.spec.ts`** — in "stops rendering when scrolled far away", replace the `document.body.style.minHeight = '400vh'` trick with scrolling the Work heading into view (`page.getByRole('heading', { name: /Trois produits/ }).scrollIntoViewIfNeeded()` then `page.mouse.wheel(0, 300)`); keep the `data-running="true"` baseline and the `false` assertion.

- [ ] **Step 4: Run everything**

Run: `pnpm test && pnpm build && pnpm lint:rules && pnpm test:e2e`. All pass on desktop and mobile. Fix code, never assertions (explain any genuinely wrong assertion). Report the bundle size.

- [ ] **Step 5: Commit**

```bash
git add tests
git commit -m "test(v6): initial-JS budget + no-GSAP guard, home sequences e2e (trajectory, reveals, no-JS, reduced motion, mobile menu, a11y)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

## Lot 2 done when

- `pnpm test`, `pnpm build`, `pnpm lint:rules` (owner rules + JS budget), `pnpm test:e2e` all pass.
- The home matches the approved mockup in order, content and tone, FR and EN; the initial JS for `/` is ≤ 160 KB gzip with no GSAP; the sculpture fades at Work and returns at Conversion on capable desktops; everyone else sees still images and no fixed stage; the mobile menu works with and without JS.

## Roadmap after Lot 2

| Lot | Scope |
|---|---|
| 3 | MDX content (schema + metric guard over real content), `/realisations`, `/realisations/[slug]` (Ubbfy, ContractIQ, ZenLife galleries from `.superpowers/assets/`), `/explorations`, OG images, JSON-LD, `sitemap.ts` + `robots.ts`; home cards then read from content |
| 4 | `/brief` + `/brief/merci`, `/contact` (Server Actions, Firestore, SMTP, rate limit, honeypot), `/api/hit`, `/confidentialite`, `/cgu` |
| 5 | `/a-propos`, `/cv` + PDF, `/terminal`, required-pages owner rule, Lighthouse, gate `?sculpture=poster`, CSP hash for the inline script, `.gitignore` tidy, README, Coolify cut-over |
