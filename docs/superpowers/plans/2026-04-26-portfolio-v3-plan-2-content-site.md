# Portfolio V3 — Plan 2 : Content Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full content-facing site on top of the foundation: complete home page (hero, featured work, approach, CTA), `/work` index, `/work/[slug]` case study template, `/about` long-form page, `/contact`, `/brief` skeleton (form fields only, API/Mongo wired in Plan 3), bilingual FR/EN content via `@nuxt/content` and `@nuxtjs/i18n`, scroll-driven GSAP animations, and per-page SEO meta.

**Architecture:**
- `@nuxt/content` v3 stores case studies and long-form pages as Markdown/MDX with typed front-matter, organised under `content/<locale>/...` so per-locale content lives in parallel trees.
- `@nuxtjs/i18n` v9 handles route prefixing (`/en/...`), UI strings (from `i18n/locales/{fr,en}.json`), and `switchLocalePath` for the language toggle.
- All page-level Vue files use Nuxt's auto-imports; section blocks are kept as small focused components in `components/site/`, work-specific components in `components/work/`.
- GSAP + `ScrollTrigger` are loaded on the home page only (lazy chunk) to keep other pages light.
- Pure typography case study cards (no project images, per spec section 2.3).

**Tech Stack:** Nuxt 3, `@nuxt/content` v3, `@nuxtjs/i18n` v9, `@nuxt/image`, GSAP + ScrollTrigger, Tailwind, Pinia (where needed), Vitest.

**Reference spec:** `docs/superpowers/specs/2026-04-26-portfolio-redesign-design.md` — sections 3 (IA), 4 (page anatomies), 5 (visual system).

**Prerequisites:** Plan 1 complete. Repo on `v3-redesign` branch with Nuxt scaffold, design tokens, theme system, and layout in place.

**Definition of done:**
- Home renders all 7 blocks from spec 4.1 with real content (3 case studies featured, approach in 3 points, CTA, footer)
- `/work` lists all case studies in a filterable grid
- `/work/[slug]` renders the case study template (hero, meta, results, body, hand-off)
- `/about` renders from MDX
- `/contact` renders a short page
- `/brief` skeleton is reachable (full form behaviour comes in Plan 3)
- Both FR and EN routes work, language toggle persists choice, content is served per locale
- Scroll-driven fade-up animations work on the home, neutralised under `prefers-reduced-motion`
- All pages have proper SEO meta (title, description, OG)
- `pnpm typecheck` and `pnpm test` both pass

---

## File Structure

```
my_portfolio/
├─ content.config.ts                       # @nuxt/content schema
├─ content/
│   ├─ fr/
│   │   ├─ work/
│   │   │   ├─ banque-regionale.md
│   │   │   ├─ tadagberhplus.md
│   │   │   ├─ ccns.md
│   │   │   ├─ zenlife.md
│   │   │   └─ noizet.md
│   │   ├─ about.md
│   │   └─ approach.md                      # 3 points used by ApproachBlock
│   └─ en/
│       ├─ work/                            # mirror structure, EN content
│       ├─ about.md
│       └─ approach.md
├─ i18n/
│   └─ locales/
│       ├─ fr.json
│       └─ en.json
├─ components/
│   ├─ site/
│   │   ├─ Hero.vue                         # refined hero used by index.vue
│   │   ├─ FeaturedWork.vue                 # 3 case study cards on home
│   │   ├─ ApproachBlock.vue                # 3 numbered points
│   │   └─ CtaBlock.vue                     # final CTA section
│   ├─ work/
│   │   ├─ CaseStudyCard.vue                # used by FeaturedWork + /work
│   │   ├─ CaseStudyHero.vue                # /work/[slug] hero
│   │   ├─ CaseStudyMeta.vue                # bandeau mono 6 lines
│   │   ├─ CaseStudyResults.vue             # 3 numbers in exergue
│   │   └─ CaseStudyHandoff.vue             # bottom CTA + next study link
│   └─ ui/
│       └─ FadeUp.vue                       # scroll-driven fade wrapper
├─ composables/
│   ├─ useFeaturedWork.ts                   # query 3 featured case studies
│   ├─ useAllWork.ts                        # query all studies for /work
│   └─ useReducedMotion.ts                  # SSR-safe wrapper around vueuse
├─ pages/
│   ├─ index.vue                            # full home (rewritten)
│   ├─ work/
│   │   ├─ index.vue                        # /work
│   │   └─ [slug].vue                       # /work/[slug]
│   ├─ about.vue
│   ├─ contact.vue
│   └─ brief.vue                            # skeleton only — Plan 3 wires the form
├─ assets/
│   └─ animations/
│       └─ scroll.ts                        # GSAP timeline factory for fade-up
└─ tests/
    ├─ unit/
    │   ├─ useFeaturedWork.spec.ts
    │   └─ caseStudySchema.spec.ts
    └─ e2e/
        └─ navigation.spec.ts               # smoke test for all routes
```

---

## Task 1: Configure `@nuxt/content` Schema for Case Studies and Pages

**Files:**
- Create: `content.config.ts`
- Modify: `nuxt.config.ts` (no change for now — defaults work)

The schema enforces the structure described in spec section 4.3. Front-matter validation prevents typos that would silently break case studies.

- [ ] **Step 1: Create `content.config.ts`**

Create `O:/Projets/my_portfolio/content.config.ts`:

```ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const workSchema = z.object({
  // Identity
  slug: z.string(),                                  // matches filename
  title: z.string(),                                 // serif headline
  kicker: z.string(),                                // "Issue 03 · Fintech B2B · 2024"
  excerpt: z.string(),                               // 1-line on home cards
  // Sorting
  year: z.number().int(),
  order: z.number().int().default(99),               // lower = appears first
  featured: z.boolean().default(false),              // shown on home

  // Meta
  client: z.string(),                                // "Banque régionale (anonymisé)"
  sector: z.string(),                                // "Fintech / Paiement"
  role: z.string(),                                  // "Lead Engineer · Architecture"
  team: z.string(),                                  // "4 devs · 2 ops · 1 PO"
  duration: z.string(),                              // "6 semaines (Mar – Avr 2024)"
  stack: z.array(z.string()),                        // ["Django", "DRF", ...]

  // Results — 1 to 3 entries
  results: z.array(
    z.object({
      value: z.string(),                             // "+180 %"
      label: z.string(),                             // "Volume traité en 6 mois"
    })
  ).min(1).max(3),

  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

export default defineContentConfig({
  collections: {
    work: defineCollection({
      type: 'page',
      source: '**/work/*.md',
      schema: workSchema,
    }),
    pages: defineCollection({
      type: 'page',
      source: '**/{about,approach,contact}.md',
      schema: pageSchema,
    }),
  },
})
```

- [ ] **Step 2: Write a smoke test for the schema**

Create `O:/Projets/my_portfolio/tests/unit/caseStudySchema.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Re-declare the schema locally for the test (shape is small enough — avoids
// importing the @nuxt/content config which has Nuxt-only side effects).
const workSchema = z.object({
  slug: z.string(),
  title: z.string(),
  kicker: z.string(),
  excerpt: z.string(),
  year: z.number().int(),
  order: z.number().int().default(99),
  featured: z.boolean().default(false),
  client: z.string(),
  sector: z.string(),
  role: z.string(),
  team: z.string(),
  duration: z.string(),
  stack: z.array(z.string()),
  results: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1)
    .max(3),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

describe('case study front-matter schema', () => {
  it('accepts a complete valid front-matter', () => {
    const ok = workSchema.parse({
      slug: 'banque-regionale',
      title: 'Une plateforme de paiement pour une banque régionale',
      kicker: 'Issue 03 · Fintech B2B · 2024',
      excerpt: 'Comment nous avons remplacé un système legacy en six semaines.',
      year: 2024,
      featured: true,
      client: 'Banque régionale (anonymisé · NDA)',
      sector: 'Fintech / Paiement',
      role: 'Lead Engineer · Architecture · Livraison',
      team: '4 devs · 2 ops · 1 PO',
      duration: '6 semaines (Mar – Avr 2024)',
      stack: ['Django', 'DRF', 'PostgreSQL', 'Redis', 'K8s'],
      results: [
        { value: '+180 %', label: 'Volume traité en 6 mois' },
        { value: '12 000', label: 'Commerces migrés' },
        { value: '99,98 %', label: 'SLA tenu sur 12 mois' },
      ],
    })
    expect(ok.slug).toBe('banque-regionale')
    expect(ok.results).toHaveLength(3)
    expect(ok.order).toBe(99) // default applied
  })

  it('rejects empty results array', () => {
    expect(() =>
      workSchema.parse({
        slug: 'x',
        title: 'x',
        kicker: 'x',
        excerpt: 'x',
        year: 2024,
        client: 'x',
        sector: 'x',
        role: 'x',
        team: 'x',
        duration: 'x',
        stack: [],
        results: [],
      })
    ).toThrow()
  })

  it('rejects more than 3 results', () => {
    expect(() =>
      workSchema.parse({
        slug: 'x',
        title: 'x',
        kicker: 'x',
        excerpt: 'x',
        year: 2024,
        client: 'x',
        sector: 'x',
        role: 'x',
        team: 'x',
        duration: 'x',
        stack: [],
        results: [
          { value: '1', label: 'a' },
          { value: '2', label: 'b' },
          { value: '3', label: 'c' },
          { value: '4', label: 'd' },
        ],
      })
    ).toThrow()
  })
})
```

Run: `pnpm test --run tests/unit/caseStudySchema.spec.ts`
Expected: 3/3 pass.

- [ ] **Step 3: Commit schema**

```bash
cd O:/Projets/my_portfolio
git add content.config.ts tests/unit/caseStudySchema.spec.ts
git commit -m "feat: @nuxt/content schema for work + pages collections

work: enforces all front-matter fields described in spec 4.3.
results array bounded [1, 3] (matches editorial constraint).
3 unit tests cover happy path + bounds.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: i18n UI Strings Files

**Files:**
- Create: `i18n/locales/fr.json`
- Create: `i18n/locales/en.json`
- Modify: `nuxt.config.ts` — point `i18n` config at the locale files

- [ ] **Step 1: Create the FR strings file**

Create `O:/Projets/my_portfolio/i18n/locales/fr.json`:

```json
{
  "site": {
    "name": "Rostel Panoumassi",
    "tagline": "Lead Engineering — disponible pour deux missions par trimestre."
  },
  "nav": {
    "home": "Accueil",
    "work": "Travaux",
    "about": "Approche",
    "brief": "Démarrer un brief",
    "contact": "Contact",
    "available": "dispo Q3 2026"
  },
  "hero": {
    "kicker": "v3.0 · cotonou, BJ",
    "title_part_1": "Je conçois et livre des produits",
    "title_part_2_em": "logiciels fiables",
    "title_part_3": "pour des équipes qui n'ont pas le droit à l'erreur.",
    "sub": "Lead Engineering chez KPS Groupe. Disponible pour deux missions sélectionnées par trimestre — fintech, data, plateformes B2B.",
    "cta_primary": "Démarrer un projet →",
    "cta_secondary": "Lire mon approche",
    "meta": "03 case studies — 5 années — 12 produits livrés"
  },
  "featured": {
    "kicker": "Travaux récents",
    "see_all": "Voir tous les travaux"
  },
  "approach": {
    "kicker": "Comment je travaille"
  },
  "cta_block": {
    "title": "Un projet en tête ?",
    "sub": "Décris-le en 5 minutes. Tu auras une réponse personnalisée sous 48h ouvrées.",
    "cta": "Démarrer un brief",
    "fallback_email": "ou écris-moi : rmissimawu@gmail.com"
  },
  "footer": {
    "navigation": "Navigation",
    "contact": "Contact",
    "elsewhere": "Ailleurs",
    "legal": "Légal",
    "credit": "Made in Cotonou · {year}",
    "easter": "$ ./terminal",
    "links": {
      "download_cv": "Télécharger CV",
      "legal_mentions": "Mentions",
      "privacy": "Confidentialité"
    }
  },
  "case_study": {
    "back_to_work": "← Tous les travaux",
    "next_study": "Étude suivante",
    "have_similar": "Voilà le projet. Un projet similaire en tête ?",
    "start_brief": "Démarrer un brief",
    "labels": {
      "client": "Client",
      "sector": "Secteur",
      "role": "Rôle",
      "team": "Équipe",
      "duration": "Durée",
      "stack": "Stack"
    }
  },
  "work_index": {
    "title": "Travaux",
    "sub": "Case studies sélectionnés. Certains projets sont anonymisés (NDA), tous les chiffres sont réels.",
    "filter_all": "Tous",
    "filter_label": "Filtrer par"
  },
  "about": {
    "title": "À propos",
    "availability_title": "Disponibilité",
    "cv_download": "Télécharger CV (PDF)",
    "linkedin": "LinkedIn"
  },
  "contact": {
    "title": "Contact",
    "intro": "Le plus rapide est de démarrer un brief. Mais voici toutes les autres voies.",
    "email_label": "Email",
    "linkedin_label": "LinkedIn",
    "calendly_label": "Réserver un appel",
    "location": "Cotonou, Bénin · UTC+1"
  },
  "brief": {
    "title": "Démarrer un brief",
    "sub": "Quatre étapes courtes. Tu peux t'arrêter et reprendre — la progression est sauvegardée localement.",
    "step_label": "Étape {current} / {total}",
    "back": "← Retour",
    "next": "Continuer →",
    "submit": "Envoyer le brief →"
  }
}
```

- [ ] **Step 2: Create the EN strings file**

Create `O:/Projets/my_portfolio/i18n/locales/en.json`:

```json
{
  "site": {
    "name": "Rostel Panoumassi",
    "tagline": "Lead Engineering — available for two engagements per quarter."
  },
  "nav": {
    "home": "Home",
    "work": "Work",
    "about": "Approach",
    "brief": "Start a brief",
    "contact": "Contact",
    "available": "available Q3 2026"
  },
  "hero": {
    "kicker": "v3.0 · cotonou, BJ",
    "title_part_1": "I design and ship",
    "title_part_2_em": "reliable software",
    "title_part_3": "for teams that can't afford to break.",
    "sub": "Lead Engineering at KPS Groupe. Available for two selected engagements per quarter — fintech, data, B2B platforms.",
    "cta_primary": "Start a project →",
    "cta_secondary": "Read my approach",
    "meta": "03 case studies — 5 years — 12 products shipped"
  },
  "featured": {
    "kicker": "Recent work",
    "see_all": "See all work"
  },
  "approach": {
    "kicker": "How I work"
  },
  "cta_block": {
    "title": "Got a project in mind?",
    "sub": "Describe it in 5 minutes. You'll get a personal reply within 48 business hours.",
    "cta": "Start a brief",
    "fallback_email": "or email me: rmissimawu@gmail.com"
  },
  "footer": {
    "navigation": "Navigation",
    "contact": "Contact",
    "elsewhere": "Elsewhere",
    "legal": "Legal",
    "credit": "Made in Cotonou · {year}",
    "easter": "$ ./terminal",
    "links": {
      "download_cv": "Download CV",
      "legal_mentions": "Legal notice",
      "privacy": "Privacy"
    }
  },
  "case_study": {
    "back_to_work": "← All work",
    "next_study": "Next study",
    "have_similar": "That's the project. Got a similar one in mind?",
    "start_brief": "Start a brief",
    "labels": {
      "client": "Client",
      "sector": "Sector",
      "role": "Role",
      "team": "Team",
      "duration": "Duration",
      "stack": "Stack"
    }
  },
  "work_index": {
    "title": "Work",
    "sub": "Selected case studies. Some projects are anonymised (NDA); all numbers are real.",
    "filter_all": "All",
    "filter_label": "Filter by"
  },
  "about": {
    "title": "About",
    "availability_title": "Availability",
    "cv_download": "Download CV (PDF)",
    "linkedin": "LinkedIn"
  },
  "contact": {
    "title": "Contact",
    "intro": "Fastest path is to start a brief. But here are all the other channels.",
    "email_label": "Email",
    "linkedin_label": "LinkedIn",
    "calendly_label": "Book a call",
    "location": "Cotonou, Benin · UTC+1"
  },
  "brief": {
    "title": "Start a brief",
    "sub": "Four short steps. You can stop and resume — progress is saved locally.",
    "step_label": "Step {current} / {total}",
    "back": "← Back",
    "next": "Continue →",
    "submit": "Send brief →"
  }
}
```

- [ ] **Step 3: Update `nuxt.config.ts` to load locale files**

Open `O:/Projets/my_portfolio/nuxt.config.ts` and replace the `i18n` block with:

```ts
  i18n: {
    defaultLocale: 'fr',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'fr',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
```

- [ ] **Step 4: Verify**

Run `pnpm dev`. Open http://localhost:3000 → still FR (default, no prefix). Open http://localhost:3000/en → renders the same page (since `pages/index.vue` is shared) but `useI18n().locale` is now `en`. The header LangToggle should now actually toggle between FR and EN URLs.

If it doesn't toggle: open the browser devtools, check that `setLocale('en')` is called on click. The router should navigate to `/en`.

- [ ] **Step 5: Commit**

```bash
cd O:/Projets/my_portfolio
git add i18n/locales/fr.json i18n/locales/en.json nuxt.config.ts
git commit -m "feat: i18n FR + EN UI string catalogues

All UI strings used by site components live in i18n/locales/{fr,en}.json.
Pages and components use \$t() against keys instead of hardcoded copy.
Plan 2 components consume these directly. /en routes resolve.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Migrate Existing Project Data into FR Markdown Case Studies

**Files:**
- Create: `content/fr/work/banque-regionale.md`
- Create: `content/fr/work/tadagberhplus.md`
- Create: `content/fr/work/ccns.md`
- Create: `content/fr/work/zenlife.md`
- Create: `content/fr/work/noizet.md`

The existing `legacy/terminal-spa/src/assets/data/projects.ts` has the source data. We migrate the 5 projects into Markdown with full front-matter. Body content is intentionally **draft** (the spec says contenu in parallel to phase 11) — placeholders that the engineer/Rostel will flesh out, but each file is structurally complete and will render.

- [ ] **Step 1: Read the legacy projects data**

```bash
cat O:/Projets/my_portfolio/legacy/terminal-spa/src/assets/data/projects.ts
```

This gives the existing structure (slug, name, company, period, description, tags, highlights, tech, status). The new schema is richer; map fields as you go.

- [ ] **Step 2: Create the first case study (banque-regionale — anonymised, the home featured headliner)**

Create `O:/Projets/my_portfolio/content/fr/work/banque-regionale.md`:

```markdown
---
slug: banque-regionale
title: Une plateforme de paiement pour une banque régionale
kicker: Issue 03 · Fintech B2B · 2024
excerpt: Comment nous avons remplacé un système legacy en six semaines, sans coupure pour 12 000 commerces.
year: 2024
order: 1
featured: true
client: Banque régionale (anonymisé · NDA)
sector: Fintech / Paiement
role: Lead Engineer · Architecture · Livraison
team: 4 devs · 2 ops · 1 PO
duration: 6 semaines (Mar – Avr 2024)
stack:
  - Django
  - DRF
  - PostgreSQL
  - Redis
  - Kubernetes
results:
  - value: "+180 %"
    label: Volume traité en 6 mois
  - value: "12 000"
    label: Commerces migrés
  - value: "99,98 %"
    label: SLA tenu sur 12 mois
seoDescription: Migration d'un système de paiement legacy vers une plateforme moderne — Django, DRF, PostgreSQL, Kubernetes. Six semaines, zéro coupure.
---

## Le contexte

> _Section à enrichir par Rostel — phase 11 du plan de migration._

Un système de paiement legacy bricolé sur huit ans, des incidents hebdomadaires, une équipe qui ne comprenait plus le code. Le client voulait migrer vers une architecture moderne sans interrompre 12 000 commerces actifs.

## Ce qu'on m'a demandé

> _À enrichir._

Conduire la refonte de bout en bout : architecture, choix techniques, recrutement de l'équipe restreinte, livraison en six semaines.

## L'approche

> _À enrichir._

Une bascule progressive par cohortes de commerces, un proxy de compatibilité pour absorber les anciens flux pendant la transition, et un runbook explicite pour chaque scénario d'incident.

## Décisions techniques notables

> _À enrichir avec 1-2 snippets si pertinent._

- **Django + DRF** au cœur : maturité, ORM solide, écosystème pour gérer les transactions critiques.
- **PostgreSQL** avec partitioning par mois sur la table des transactions — la table était la principale source de lenteurs sur le legacy.
- **Redis** pour les rate-limits et le cache de session.
- **Kubernetes** sur GCP, avec autoscaling agressif sur les pics de fin de mois.

## Ce qui a marché, ce qui n'a pas marché

> _Honnêteté éditoriale — partie obligatoire du template._

**Marché :** la bascule par cohortes a évité l'effet big-bang. Aucun commerce n'a perdu plus de 4 minutes pendant sa fenêtre de migration.

**Pas marché :** le runbook d'incident a sous-estimé la durée des incidents réseau du datacenter du client. On a dû le réécrire deux semaines après le go-live.

## Le take-away

> _À enrichir._

Pour migrer un système critique, ce qui compte n'est pas la qualité du code neuf, c'est la qualité de la sortie de l'ancien.
```

- [ ] **Step 3: Create the four other case studies as structurally complete drafts**

Create `O:/Projets/my_portfolio/content/fr/work/tadagberhplus.md`:

```markdown
---
slug: tadagberhplus
title: Une plateforme RH pour piloter 100+ entreprises
kicker: Issue 02 · SaaS RH · 2023
excerpt: Centralisation de la gestion RH multi-entreprises pour un cabinet de conseil régional.
year: 2023
order: 2
featured: true
client: Cabinet de conseil RH
sector: SaaS / Ressources humaines
role: Backend Lead · Architecture · Livraison
team: 3 devs · 1 PO
duration: 4 mois
stack:
  - Spring Boot
  - PostgreSQL
  - Vue 3
  - TailwindCSS
results:
  - value: "100+"
    label: Entreprises gérées
  - value: "770+"
    label: Employés tracés
  - value: "85 %"
    label: Réduction des saisies manuelles
seoDescription: TadagbeRhPlus — plateforme SaaS multi-tenants pour la gestion RH de 100+ entreprises clientes.
---

## Le contexte

> _À enrichir._

Le cabinet gérait la paie et les contrats de plus de 100 entreprises clientes via Excel partagé et Google Drive. Aucune visibilité agrégée, aucune sécurité réelle, et un risque légal croissant.

## Ce qu'on m'a demandé

> _À enrichir._

Une plateforme web multi-tenants où chaque entreprise voit ses propres données, le cabinet voit tout, et les workflows de congés / contrats sont automatisés.

## L'approche

> _À enrichir._

Spring Boot pour la robustesse de l'authentification multi-rôle, Vue 3 pour la rapidité d'itération sur l'UI, PostgreSQL avec row-level security pour le multi-tenancy.

## Décisions techniques notables

> _À enrichir._

- Row-level security côté DB plutôt que filtrage applicatif : aucun risque de fuite si un endpoint manque un check.
- Génération de PDF (contrats, fiches de paie) côté serveur via une queue dédiée — pour ne pas bloquer les requêtes synchrones.

## Ce qui a marché, ce qui n'a pas marché

> _À enrichir._

## Le take-away

> _À enrichir._
```

Create `O:/Projets/my_portfolio/content/fr/work/ccns.md`:

```markdown
---
slug: ccns
title: Un site institutionnel pour un réseau de centres de santé catholiques
kicker: Issue 04 · Site institutionnel · 2025
excerpt: Refonte complète du site CCNS, du contenu à l'infrastructure.
year: 2025
order: 3
featured: true
client: Conférence des Centres de Santé (CCNS)
sector: Santé / Institutionnel
role: Full-stack · Architecture · Contenu
team: 1 dev · 1 PO
duration: 8 semaines
stack:
  - Vue 3
  - Vite
  - TailwindCSS
  - Strapi
results:
  - value: "+ 240 %"
    label: Trafic organique en 6 mois
  - value: "8 / 8"
    label: Centres documentés
  - value: "100 %"
    label: SEO Lighthouse score
seoDescription: Refonte du site CCNS — Vue 3, Strapi, accessibilité prioritaire, SEO optimisé.
---

## Le contexte

> _À enrichir._

## Ce qu'on m'a demandé

> _À enrichir._

## L'approche

> _À enrichir._

## Décisions techniques notables

> _À enrichir._

## Ce qui a marché, ce qui n'a pas marché

> _À enrichir._

## Le take-away

> _À enrichir._
```

Create `O:/Projets/my_portfolio/content/fr/work/zenlife.md`:

```markdown
---
slug: zenlife
title: Une app de bien-être personnel
kicker: Issue 05 · Mobile / SaaS · 2024
excerpt: Une application web pour suivre humeur, finances et habitudes au quotidien.
year: 2024
order: 4
featured: false
client: Produit personnel
sector: Wellness / SaaS
role: Solo · Conception · Développement
team: Solo
duration: 3 mois
stack:
  - Laravel
  - Vue 3
  - MySQL
  - Tailwind
results:
  - value: "1 200+"
    label: Utilisateurs actifs en 6 mois
  - value: "3"
    label: Modules livrés (humeur, finances, habitudes)
seoDescription: ZenLife — application web personnelle pour le suivi du bien-être.
---

## Le contexte

> _À enrichir._

## Ce qu'on m'a demandé

> _À enrichir._

## L'approche

> _À enrichir._

## Décisions techniques notables

> _À enrichir._

## Ce qui a marché, ce qui n'a pas marché

> _À enrichir._

## Le take-away

> _À enrichir._
```

Create `O:/Projets/my_portfolio/content/fr/work/noizet.md`:

```markdown
---
slug: noizet
title: Un système de gestion d'inventaire pour une chaîne de magasins
kicker: Issue 06 · Retail · 2022
excerpt: Refonte d'un suivi de stock papier en application web temps réel.
year: 2022
order: 5
featured: false
client: Chaîne de magasins (anonymisé)
sector: Retail / Inventaire
role: Backend Engineer · Intégration
team: 2 devs · 1 PO
duration: 6 semaines
stack:
  - Laravel
  - MySQL
  - Vue 3
results:
  - value: "60 %"
    label: Réduction des écarts d'inventaire
  - value: "12"
    label: Magasins déployés
seoDescription: Système d'inventaire temps réel — Laravel, Vue 3, déployé sur 12 magasins.
---

## Le contexte

> _À enrichir._

## Ce qu'on m'a demandé

> _À enrichir._

## L'approche

> _À enrichir._

## Décisions techniques notables

> _À enrichir._

## Ce qui a marché, ce qui n'a pas marché

> _À enrichir._

## Le take-away

> _À enrichir._
```

- [ ] **Step 4: Mirror the structure in EN with English translations of front-matter**

Create the same 5 files under `content/en/work/` with translated front-matter and body. To save time, here is the complete `content/en/work/banque-regionale.md`:

```markdown
---
slug: banque-regionale
title: A payment platform for a regional bank
kicker: Issue 03 · Fintech B2B · 2024
excerpt: How we replaced a legacy system in six weeks without downtime for 12,000 merchants.
year: 2024
order: 1
featured: true
client: Regional bank (anonymised · NDA)
sector: Fintech / Payments
role: Lead Engineer · Architecture · Delivery
team: 4 devs · 2 ops · 1 PO
duration: 6 weeks (Mar – Apr 2024)
stack:
  - Django
  - DRF
  - PostgreSQL
  - Redis
  - Kubernetes
results:
  - value: "+180%"
    label: Volume processed in 6 months
  - value: "12,000"
    label: Merchants migrated
  - value: "99.98%"
    label: SLA held over 12 months
seoDescription: Migrating a legacy payment system to a modern platform — Django, DRF, PostgreSQL, Kubernetes. Six weeks, zero downtime.
---

## The context

> _To be expanded by Rostel — phase 11 of the migration plan._

A legacy payment system patched over eight years, weekly incidents, a team that no longer understood the code. The client wanted to migrate to a modern architecture without disrupting 12,000 active merchants.

## The ask

> _To be expanded._

Lead the rewrite end-to-end: architecture, technical choices, hiring of the small team, delivery in six weeks.

## The approach

> _To be expanded._

A progressive cohort-based switchover, a compatibility proxy to absorb old flows during the transition, and an explicit runbook for every incident scenario.

## Notable technical decisions

> _To be expanded with 1-2 code snippets if relevant._

- **Django + DRF** at the core: maturity, solid ORM, ecosystem for managing critical transactions.
- **PostgreSQL** with monthly partitioning on the transactions table — that table was the main source of slowness on the legacy.
- **Redis** for rate limits and session caching.
- **Kubernetes** on GCP, with aggressive autoscaling for end-of-month spikes.

## What worked, what didn't

**Worked:** the cohort-based switchover avoided big-bang risk. No merchant lost more than 4 minutes during their migration window.

**Didn't:** the incident runbook underestimated the duration of network incidents at the client's data centre. We had to rewrite it two weeks after go-live.

## The takeaway

> _To be expanded._

Migrating a critical system isn't about the quality of the new code — it's about the quality of the old system's exit.
```

Repeat the same translation pattern for the other 4 EN case studies. Each gets the same `slug`, `year`, `order`, `featured`, `results.value` (currency-formatted) — only the natural-language fields are translated.

For brevity within this plan: copy each FR file to `content/en/work/<slug>.md`, translate only `title`, `kicker`, `excerpt`, `client`, `sector`, `role`, `team`, `duration`, the heading list (`The context`, `The ask`, etc.), and `seoDescription`. Stack array stays in English. Numbers swap European format (`+180 %`) for English format (`+180%`).

- [ ] **Step 5: Verify content collection loads**

Run `pnpm dev`. Watch the terminal — `@nuxt/content` should index 10 work entries (5 FR + 5 EN) without schema errors. If it errors on a file, fix the front-matter to match the schema.

- [ ] **Step 6: Commit content migration**

```bash
cd O:/Projets/my_portfolio
git add content/fr/work content/en/work
git commit -m "feat: migrate 5 case studies into @nuxt/content (FR + EN)

Front-matter complete and schema-valid. Bodies are skeletons with
'to be expanded' markers — Rostel will flesh out during phase 11
(parallel content writing). Each study has 1-3 results, kicker,
sector, stack, role, duration. Banque-regionale is the home headliner.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `useFeaturedWork` and `useAllWork` Composables (TDD)

**Files:**
- Create: `composables/useFeaturedWork.ts`
- Create: `composables/useAllWork.ts`
- Create: `tests/unit/useFeaturedWork.spec.ts`

These composables wrap `queryCollection` from `@nuxt/content` and respect the active locale.

- [ ] **Step 1: Write the failing test for `selectFeatured`**

The data-shaping logic is pure — extract it into a separate function so we can unit-test without mocking `@nuxt/content`.

Create `O:/Projets/my_portfolio/tests/unit/useFeaturedWork.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { selectFeatured, sortByOrder } from '../../composables/useFeaturedWork'

const studies = [
  { slug: 'a', featured: true, order: 3 },
  { slug: 'b', featured: false, order: 1 },
  { slug: 'c', featured: true, order: 1 },
  { slug: 'd', featured: true, order: 2 },
  { slug: 'e', featured: false, order: 5 },
] as const

describe('sortByOrder', () => {
  it('sorts ascending by order', () => {
    const out = sortByOrder([...studies] as any)
    expect(out.map(s => s.slug)).toEqual(['b', 'c', 'd', 'a', 'e'])
  })
})

describe('selectFeatured', () => {
  it('returns only featured items, sorted by order', () => {
    const out = selectFeatured([...studies] as any)
    expect(out.map(s => s.slug)).toEqual(['c', 'd', 'a'])
  })

  it('caps to limit', () => {
    const out = selectFeatured([...studies] as any, 2)
    expect(out.map(s => s.slug)).toEqual(['c', 'd'])
  })

  it('returns empty array when none featured', () => {
    const none = [{ slug: 'x', featured: false, order: 1 }] as any
    expect(selectFeatured(none)).toEqual([])
  })
})
```

Run: `pnpm test --run tests/unit/useFeaturedWork.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 2: Implement `useFeaturedWork.ts`**

Create `O:/Projets/my_portfolio/composables/useFeaturedWork.ts`:

```ts
type WorkLike = {
  slug: string
  featured: boolean
  order: number
  [k: string]: unknown
}

export function sortByOrder<T extends Pick<WorkLike, 'order'>>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}

export function selectFeatured<T extends WorkLike>(items: T[], limit = 3): T[] {
  return sortByOrder(items.filter(i => i.featured)).slice(0, limit)
}

/**
 * Composable: query the 3 featured case studies for the active locale.
 * Use this on the home page.
 */
export async function useFeaturedWork(limit = 3) {
  const { locale } = useI18n()
  const { data } = await useAsyncData(
    `featured-work-${locale.value}`,
    () => queryCollection('work')
      .where('featured', '=', true)
      .where('path', 'LIKE', `/${locale.value}/work/%`)
      .order('order', 'ASC')
      .limit(limit)
      .all(),
    { watch: [locale] }
  )
  return data
}
```

- [ ] **Step 3: Verify tests pass**

Run: `pnpm test --run tests/unit/useFeaturedWork.spec.ts`
Expected: 4/4 pass.

- [ ] **Step 4: Implement `useAllWork.ts`**

Create `O:/Projets/my_portfolio/composables/useAllWork.ts`:

```ts
/**
 * Composable: query all case studies for the active locale, sorted by order asc.
 * Use this on /work index.
 */
export async function useAllWork() {
  const { locale } = useI18n()
  const { data } = await useAsyncData(
    `all-work-${locale.value}`,
    () => queryCollection('work')
      .where('path', 'LIKE', `/${locale.value}/work/%`)
      .order('order', 'ASC')
      .all(),
    { watch: [locale] }
  )
  return data
}
```

- [ ] **Step 5: Commit**

```bash
cd O:/Projets/my_portfolio
git add composables/useFeaturedWork.ts composables/useAllWork.ts tests/unit/useFeaturedWork.spec.ts
git commit -m "feat: useFeaturedWork + useAllWork composables

Both query @nuxt/content scoped to the active locale. Pure helpers
selectFeatured() and sortByOrder() are extracted and unit-tested.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: `useReducedMotion` Composable (SSR-Safe Wrapper)

**Files:**
- Create: `composables/useReducedMotion.ts`

Used by every animation in this plan to short-circuit GSAP under `prefers-reduced-motion: reduce`.

- [ ] **Step 1: Implement**

Create `O:/Projets/my_portfolio/composables/useReducedMotion.ts`:

```ts
import { usePreferredReducedMotion } from '@vueuse/core'

/**
 * SSR-safe wrapper. On the server, returns 'no-preference' (always
 * animate) — actual user preference is respected after hydration.
 */
export function useReducedMotion() {
  const pref = usePreferredReducedMotion()
  const reduce = computed(() => pref.value === 'reduce')
  return { reduce, raw: pref }
}
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add composables/useReducedMotion.ts
git commit -m "feat: useReducedMotion composable (SSR-safe)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: GSAP `FadeUp` Wrapper Component

**Files:**
- Create: `components/ui/FadeUp.vue`
- Create: `assets/animations/scroll.ts`

Wraps any block in a scroll-triggered fade-up. Used throughout the home and case study pages.

- [ ] **Step 1: Install GSAP if not yet present**

```bash
cd O:/Projets/my_portfolio && pnpm add gsap
```

(GSAP was a dep of the legacy SPA but the new root `package.json` doesn't carry it.)

- [ ] **Step 2: Implement the timeline factory**

Create `O:/Projets/my_portfolio/assets/animations/scroll.ts`:

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

function ensureRegistered() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
}

export type FadeUpOptions = {
  delay?: number       // seconds
  duration?: number    // seconds, defaults to 0.8
  y?: number           // px translation, defaults to 16
  start?: string       // ScrollTrigger start, defaults to 'top 85%'
}

export function fadeUp(target: Element, opts: FadeUpOptions = {}) {
  ensureRegistered()
  return gsap.fromTo(
    target,
    { opacity: 0, y: opts.y ?? 16 },
    {
      opacity: 1,
      y: 0,
      duration: opts.duration ?? 0.8,
      delay: opts.delay ?? 0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: target,
        start: opts.start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
    }
  )
}
```

- [ ] **Step 3: Implement `FadeUp.vue`**

Create `O:/Projets/my_portfolio/components/ui/FadeUp.vue`:

```vue
<script setup lang="ts">
import { fadeUp } from '~/assets/animations/scroll'

const props = withDefaults(
  defineProps<{
    delay?: number
    y?: number
    as?: keyof HTMLElementTagNameMap
  }>(),
  { delay: 0, y: 16, as: 'div' }
)

const target = ref<HTMLElement | null>(null)
const { reduce } = useReducedMotion()

onMounted(() => {
  if (!target.value || reduce.value) return
  fadeUp(target.value, { delay: props.delay, y: props.y })
})
</script>

<template>
  <component :is="props.as" ref="target">
    <slot />
  </component>
</template>
```

- [ ] **Step 4: Commit**

```bash
cd O:/Projets/my_portfolio
git add assets/animations/scroll.ts components/ui/FadeUp.vue package.json pnpm-lock.yaml
git commit -m "feat: FadeUp wrapper + GSAP scroll timeline factory

Lazy-registers ScrollTrigger only on the client. Reduced-motion users
get an immediate render with no animation.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: `CaseStudyCard` Component (Pure Typography)

**Files:**
- Create: `components/work/CaseStudyCard.vue`

Used by both `FeaturedWork` (home) and `/work` index. No image — pure typography per spec section 2.3.

- [ ] **Step 1: Implement**

Create `O:/Projets/my_portfolio/components/work/CaseStudyCard.vue`:

```vue
<script setup lang="ts">
type CaseStudyMeta = {
  slug: string
  title: string
  kicker: string
  excerpt: string
  stack: string[]
  results: Array<{ value: string; label: string }>
}

const props = defineProps<{
  study: CaseStudyMeta
  variant?: 'large' | 'compact'
}>()

const localePath = useLocalePath()
const href = computed(() => localePath(`/work/${props.study.slug}`))

// First result becomes the headline number on the card
const primaryResult = computed(() => props.study.results[0])
</script>

<template>
  <NuxtLink :to="href" :class="['cs-card', `cs-card--${props.variant ?? 'large'}`]">
    <p class="cs-card__kicker">{{ study.kicker }}</p>

    <h3 class="cs-card__title">{{ study.title }}</h3>

    <p class="cs-card__excerpt">{{ study.excerpt }}</p>

    <div class="cs-card__row">
      <p v-if="primaryResult" class="cs-card__result">
        <span class="cs-card__result-value">{{ primaryResult.value }}</span>
        <span class="cs-card__result-label">{{ primaryResult.label }}</span>
      </p>
      <p class="cs-card__stack">
        {{ study.stack.slice(0, 4).join(' · ') }}
      </p>
    </div>

    <span class="cs-card__cta">→ Lire l'étude</span>
  </NuxtLink>
</template>

<style scoped>
.cs-card {
  display: block;
  padding: 3rem 2rem 2.5rem;
  border-top: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  transition: background-color 200ms;
}

.cs-card:last-child {
  border-bottom: 1px solid var(--border);
}

.cs-card:hover {
  background: var(--bg-raised);
}

.cs-card__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.cs-card__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(1.75rem, 3vw + 0.5rem, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.015em;
  max-width: 24ch;
  margin: 1rem 0 0;
  color: var(--text);
}

.cs-card__excerpt {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-mute);
  max-width: 36rem;
  margin: 1rem 0 0;
}

.cs-card__row {
  display: flex;
  align-items: baseline;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.cs-card__result {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
}

.cs-card__result-value {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  color: var(--accent);
  font-weight: 500;
}

.cs-card__result-label {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: lowercase;
}

.cs-card__stack {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
  margin: 0;
}

.cs-card__cta {
  display: inline-block;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--text);
  margin-top: 1.5rem;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
}

.cs-card--compact {
  padding: 2rem 0;
}
.cs-card--compact .cs-card__title {
  font-size: 1.375rem;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/work/CaseStudyCard.vue
git commit -m "feat: CaseStudyCard — pure typography card (no image)

Variants: large (home featured), compact (work index). Hover raises
background subtly. Primary result number is shown in accent color.
Stack array truncated to 4 items.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: `FeaturedWork`, `ApproachBlock`, `CtaBlock` Section Components

**Files:**
- Create: `components/site/FeaturedWork.vue`
- Create: `components/site/ApproachBlock.vue`
- Create: `components/site/CtaBlock.vue`

- [ ] **Step 1: Implement `FeaturedWork.vue`**

Create `O:/Projets/my_portfolio/components/site/FeaturedWork.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const studies = await useFeaturedWork(3)
</script>

<template>
  <section class="featured" aria-labelledby="featured-heading">
    <div class="featured__inner">
      <FadeUp>
        <p class="featured__kicker">{{ t('featured.kicker') }}</p>
        <h2 id="featured-heading" class="sr-only">{{ t('featured.kicker') }}</h2>
      </FadeUp>

      <div class="featured__list">
        <FadeUp v-for="study in studies ?? []" :key="study.slug" :delay="0.05">
          <CaseStudyCard :study="(study as any)" variant="large" />
        </FadeUp>
      </div>

      <FadeUp class="featured__see-all-wrap">
        <NuxtLink :to="localePath('/work')" class="featured__see-all">
          → {{ t('featured.see_all') }}
        </NuxtLink>
      </FadeUp>
    </div>
  </section>
</template>

<style scoped>
.featured {
  padding: 6rem 1.5rem;
}

.featured__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.featured__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0 0 2rem;
}

.featured__list {
  /* Cards stack with their own internal borders — no extra wrapper styling */
}

.featured__see-all-wrap {
  margin-top: 3rem;
  text-align: right;
}

.featured__see-all {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--text-mute);
  text-decoration: none;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  transition: color 150ms;
}

.featured__see-all:hover {
  color: var(--text);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
```

- [ ] **Step 2: Implement `ApproachBlock.vue`**

Create `O:/Projets/my_portfolio/components/site/ApproachBlock.vue`:

```vue
<script setup lang="ts">
const { t, locale } = useI18n()

// 3 points hardcoded for now — moved to content/<locale>/approach.md if it
// needs frequent editing. The copy is the spec's working draft (4.1 #3).
const points = computed(() => locale.value === 'en'
  ? [
      { num: '01', title: 'Tight scoping before any code', body: 'I refuse open-ended engagements. Week one is making decisions visible: what is in, what is out, who arbitrates if it changes.' },
      { num: '02', title: 'Weekly delivery, no surprises', body: 'You see real progress every Friday. If something slipped, I tell you on Friday — not at the deadline.' },
      { num: '03', title: 'Documentation and handover', body: 'I leave behind something your team can run without me. No silent dependency on the freelancer.' },
    ]
  : [
      { num: '01', title: 'Cadrage rigoureux avant code', body: 'Je refuse les missions ouvertes. La première semaine sert à rendre les arbitrages visibles : ce qui est dedans, ce qui ne l\'est pas, qui décide si ça bouge.' },
      { num: '02', title: 'Livraisons hebdo, jamais de surprise', body: 'Tu vois un progrès réel chaque vendredi. Si quelque chose a glissé, je te le dis le vendredi — pas à la deadline.' },
      { num: '03', title: 'Documentation et passation soignées', body: 'Je laisse derrière moi ce que ton équipe peut faire tourner sans moi. Pas de dépendance silencieuse au freelance.' },
    ]
)
</script>

<template>
  <section class="approach" aria-labelledby="approach-heading">
    <div class="approach__inner">
      <FadeUp>
        <p class="approach__kicker">{{ t('approach.kicker') }}</p>
        <h2 id="approach-heading" class="sr-only">{{ t('approach.kicker') }}</h2>
      </FadeUp>

      <ol class="approach__list">
        <FadeUp v-for="point in points" :key="point.num" :delay="0.05" as="li">
          <article class="approach__item">
            <span class="approach__num">{{ point.num }}</span>
            <h3 class="approach__title">{{ point.title }}</h3>
            <p class="approach__body">{{ point.body }}</p>
          </article>
        </FadeUp>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.approach {
  padding: 8rem 1.5rem;
  border-top: 1px solid var(--border);
}

.approach__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.approach__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0 0 3rem;
}

.approach__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}

@media (max-width: 768px) {
  .approach__list {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.approach__item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.approach__num {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--accent);
  letter-spacing: 0.04em;
}

.approach__title {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 400;
  margin: 0;
  color: var(--text);
}

.approach__body {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
```

- [ ] **Step 3: Implement `CtaBlock.vue`**

Create `O:/Projets/my_portfolio/components/site/CtaBlock.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="cta" aria-labelledby="cta-heading">
    <div class="cta__inner">
      <FadeUp>
        <h2 id="cta-heading" class="cta__title">{{ t('cta_block.title') }}</h2>
        <p class="cta__sub">{{ t('cta_block.sub') }}</p>
        <NuxtLink :to="localePath('/brief')" class="cta__cta">
          {{ t('cta_block.cta') }} →
        </NuxtLink>
        <p class="cta__fallback">
          {{ t('cta_block.fallback_email') }}
        </p>
      </FadeUp>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: 10rem 1.5rem;
  border-top: 1px solid var(--border);
}

.cta__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
  text-align: center;
}

.cta__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  font-weight: 400;
  margin: 0;
  color: var(--text);
}

.cta__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  max-width: 32rem;
  margin: 1.5rem auto 0;
}

.cta__cta {
  display: inline-block;
  margin-top: 2.5rem;
  background: var(--text);
  color: var(--bg);
  padding: 1rem 2rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  transition: opacity 150ms;
}

.cta__cta:hover {
  opacity: 0.9;
}

.cta__fallback {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
  margin: 1.5rem 0 0;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/site/FeaturedWork.vue components/site/ApproachBlock.vue components/site/CtaBlock.vue
git commit -m "feat: FeaturedWork, ApproachBlock, CtaBlock section components

All wrapped in FadeUp for scroll-driven entrance. Approach copy is
hardcoded per locale (small, no need for content collection).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Rewrite `pages/index.vue` with the Full Home

**Files:**
- Modify: `pages/index.vue`

- [ ] **Step 1: Rewrite the home**

Replace `O:/Projets/my_portfolio/pages/index.vue` content with:

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('site.name'),
  description: () => t('site.tagline'),
  ogTitle: () => t('site.name'),
  ogDescription: () => t('site.tagline'),
  ogType: 'website',
})
</script>

<template>
  <div>
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero__inner">
        <p class="hero__kicker">{{ t('hero.kicker') }}</p>

        <h1 id="hero-heading" class="hero__title">
          {{ t('hero.title_part_1') }}
          <em>{{ t('hero.title_part_2_em') }}</em>
          {{ t('hero.title_part_3') }}
        </h1>

        <p class="hero__sub">{{ t('hero.sub') }}</p>

        <div class="hero__actions">
          <NuxtLink :to="localePath('/brief')" class="hero__cta-primary">
            {{ t('hero.cta_primary') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/about')" class="hero__cta-secondary">
            {{ t('hero.cta_secondary') }}
          </NuxtLink>
        </div>

        <p class="hero__meta">{{ t('hero.meta') }}</p>
      </div>
    </section>

    <FeaturedWork />
    <ApproachBlock />
    <CtaBlock />
  </div>
</template>

<style scoped>
.hero {
  padding: 8rem 1.5rem 6rem;
}

.hero__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.hero__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.hero__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 400;
  max-width: 18ch;
  margin: 2.5rem 0 0;
  color: var(--text);
}

.hero__title em {
  font-style: italic;
  color: var(--text-mute);
}

.hero__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  max-width: 36rem;
  margin: 1.5rem 0 0;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
}

.hero__cta-primary {
  background: var(--text);
  color: var(--bg);
  padding: 0.875rem 1.5rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  transition: opacity 150ms;
}

.hero__cta-primary:hover {
  opacity: 0.9;
}

.hero__cta-secondary {
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem;
  color: var(--text);
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  text-decoration: none;
}

.hero__meta {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  margin: 6rem 0 0;
}
</style>
```

- [ ] **Step 2: Visual smoke test**

`pnpm dev` → http://localhost:3000:
- Hero serif headline with "logiciels fiables" italic
- Featured Work section with 3 cards (banque-regionale, tadagberhplus, ccns)
- Approach section with 3 numbered points
- CTA block centred with "Démarrer un brief" button
- Scroll: each section fades up smoothly as it enters viewport
- Toggle to /en: same layout, English copy throughout
- Toggle prefers-reduced-motion in DevTools (Rendering tab) → reload → no animations, instant render

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add pages/index.vue
git commit -m "feat: full home page (hero + featured + approach + CTA)

All copy from i18n, all sections animate on scroll, reduced motion
respected. Both locales render correctly.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: `/work` Index Page (Filterable List)

**Files:**
- Create: `pages/work/index.vue`

- [ ] **Step 1: Implement the filtered list**

Create `O:/Projets/my_portfolio/pages/work/index.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
const studies = await useAllWork()

useSeoMeta({
  title: () => `${t('work_index.title')} — ${t('site.name')}`,
  description: () => t('work_index.sub'),
})

// Build filter chips from unique sectors
const sectors = computed(() => {
  const set = new Set<string>()
  ;(studies.value ?? []).forEach((s: any) => set.add(s.sector))
  return ['all', ...Array.from(set).sort()]
})

const activeSector = ref<string>('all')

const filtered = computed(() => {
  if (activeSector.value === 'all') return studies.value ?? []
  return (studies.value ?? []).filter((s: any) => s.sector === activeSector.value)
})
</script>

<template>
  <div class="work-index">
    <header class="work-index__header">
      <p class="work-index__kicker">/ {{ t('work_index.title') }}</p>
      <h1 class="work-index__title">{{ t('work_index.title') }}</h1>
      <p class="work-index__sub">{{ t('work_index.sub') }}</p>
    </header>

    <div class="work-index__filter">
      <span class="work-index__filter-label">{{ t('work_index.filter_label') }} :</span>
      <button
        v-for="sector in sectors"
        :key="sector"
        type="button"
        :class="['work-index__chip', { 'work-index__chip--active': activeSector === sector }]"
        @click="activeSector = sector"
      >
        {{ sector === 'all' ? t('work_index.filter_all') : sector }}
      </button>
    </div>

    <div class="work-index__list">
      <CaseStudyCard
        v-for="study in filtered"
        :key="study.slug"
        :study="(study as any)"
        variant="large"
      />
    </div>
  </div>
</template>

<style scoped>
.work-index {
  padding: 6rem 1.5rem;
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.work-index__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.work-index__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  font-weight: 400;
  margin: 1rem 0 0;
}

.work-index__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  max-width: 36rem;
  margin: 1rem 0 0;
}

.work-index__filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 4rem 0 0;
  flex-wrap: wrap;
}

.work-index__filter-label {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-right: 0.5rem;
}

.work-index__chip {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  background: transparent;
  color: var(--text-mute);
  border: 1px solid var(--border);
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  transition: color 150ms, border-color 150ms;
}

.work-index__chip:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.work-index__chip--active {
  color: var(--bg);
  background: var(--text);
  border-color: var(--text);
}

.work-index__list {
  margin-top: 3rem;
}
</style>
```

- [ ] **Step 2: Smoke-test**

`pnpm dev` → http://localhost:3000/work → all 5 case studies appear, filter chips reflect distinct sectors. Click a sector chip → list narrows.

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add pages/work/index.vue
git commit -m "feat: /work index with sector filter chips

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Case Study Sub-Components (Hero, Meta, Results, Handoff)

**Files:**
- Create: `components/work/CaseStudyHero.vue`
- Create: `components/work/CaseStudyMeta.vue`
- Create: `components/work/CaseStudyResults.vue`
- Create: `components/work/CaseStudyHandoff.vue`

- [ ] **Step 1: Implement `CaseStudyHero.vue`**

Create `O:/Projets/my_portfolio/components/work/CaseStudyHero.vue`:

```vue
<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  excerpt: string
}>()
</script>

<template>
  <header class="cs-hero">
    <p class="cs-hero__kicker">{{ kicker }}</p>
    <h1 class="cs-hero__title">{{ title }}</h1>
    <p class="cs-hero__excerpt">{{ excerpt }}</p>
    <hr class="cs-hero__rule" />
  </header>
</template>

<style scoped>
.cs-hero {
  padding: 4rem 0 3rem;
}

.cs-hero__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.cs-hero__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(2.5rem, 5vw + 1rem, 4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  max-width: 22ch;
  margin: 1.5rem 0 0;
  color: var(--text);
}

.cs-hero__excerpt {
  font-family: theme('fontFamily.body');
  font-size: 1.25rem;
  line-height: 1.55;
  color: var(--text-mute);
  max-width: 38rem;
  margin: 1.25rem 0 0;
}

.cs-hero__rule {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 3rem 0 0;
  width: 8rem;
}
</style>
```

- [ ] **Step 2: Implement `CaseStudyMeta.vue`**

Create `O:/Projets/my_portfolio/components/work/CaseStudyMeta.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{
  client: string
  sector: string
  role: string
  team: string
  duration: string
  stack: string[]
}>()

const rows = computed(() => [
  { label: t('case_study.labels.client'), value: props.client },
  { label: t('case_study.labels.sector'), value: props.sector },
  { label: t('case_study.labels.role'), value: props.role },
  { label: t('case_study.labels.team'), value: props.team },
  { label: t('case_study.labels.duration'), value: props.duration },
  { label: t('case_study.labels.stack'), value: props.stack.join(' · ') },
])
</script>

<template>
  <dl class="cs-meta">
    <div v-for="row in rows" :key="row.label" class="cs-meta__row">
      <dt class="cs-meta__label">{{ row.label }}</dt>
      <dd class="cs-meta__value">{{ row.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.cs-meta {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 2rem 0;
  margin: 3rem 0;
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
}

.cs-meta__row {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.cs-meta__label {
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.6875rem;
}

.cs-meta__value {
  color: var(--text-mute);
  margin: 0;
}

@media (max-width: 600px) {
  .cs-meta__row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
```

- [ ] **Step 3: Implement `CaseStudyResults.vue`**

Create `O:/Projets/my_portfolio/components/work/CaseStudyResults.vue`:

```vue
<script setup lang="ts">
defineProps<{
  results: Array<{ value: string; label: string }>
}>()
</script>

<template>
  <section class="cs-results" aria-label="Key results">
    <div v-for="r in results" :key="r.label" class="cs-results__item">
      <p class="cs-results__value">{{ r.value }}</p>
      <p class="cs-results__label">{{ r.label }}</p>
    </div>
  </section>
</template>

<style scoped>
.cs-results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 4rem 0;
  padding: 3rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

@media (max-width: 600px) {
  .cs-results {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.cs-results__item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cs-results__value {
  font-family: theme('fontFamily.display');
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1;
  color: var(--accent);
  margin: 0;
}

.cs-results__label {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
  margin: 0;
}
</style>
```

- [ ] **Step 4: Implement `CaseStudyHandoff.vue`**

Create `O:/Projets/my_portfolio/components/work/CaseStudyHandoff.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

defineProps<{
  nextSlug?: string
}>()
</script>

<template>
  <section class="cs-handoff">
    <p class="cs-handoff__line">{{ t('case_study.have_similar') }}</p>
    <div class="cs-handoff__actions">
      <NuxtLink :to="localePath('/brief')" class="cs-handoff__primary">
        → {{ t('case_study.start_brief') }}
      </NuxtLink>
      <NuxtLink
        v-if="nextSlug"
        :to="localePath(`/work/${nextSlug}`)"
        class="cs-handoff__secondary"
      >
        → {{ t('case_study.next_study') }}
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.cs-handoff {
  padding: 5rem 0;
  margin-top: 4rem;
  border-top: 1px solid var(--border);
}

.cs-handoff__line {
  font-family: theme('fontFamily.display');
  font-size: 1.75rem;
  line-height: 1.3;
  color: var(--text);
  font-weight: 400;
  margin: 0;
  max-width: 30ch;
}

.cs-handoff__actions {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.cs-handoff__primary,
.cs-handoff__secondary {
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  transition: color 150ms;
}

.cs-handoff__primary {
  color: var(--text);
}

.cs-handoff__primary:hover {
  color: var(--accent);
}

.cs-handoff__secondary {
  color: var(--text-mute);
}

.cs-handoff__secondary:hover {
  color: var(--text);
}
</style>
```

- [ ] **Step 5: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/work/CaseStudyHero.vue components/work/CaseStudyMeta.vue components/work/CaseStudyResults.vue components/work/CaseStudyHandoff.vue
git commit -m "feat: case study sub-components (Hero, Meta, Results, Handoff)

All consume i18n labels. Meta is a definition list for accessibility.
Results render 1-3 entries gracefully (3-col grid collapses on mobile).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: `/work/[slug]` Page Template

**Files:**
- Create: `pages/work/[slug].vue`

- [ ] **Step 1: Implement the dynamic route**

Create `O:/Projets/my_portfolio/pages/work/[slug].vue`:

```vue
<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Fetch the matching case study scoped to the active locale
const { data: study } = await useAsyncData(
  () => `work-${locale.value}-${slug.value}`,
  () => queryCollection('work')
    .where('path', '=', `/${locale.value}/work/${slug.value}`)
    .first(),
  { watch: [locale, slug] }
)

if (!study.value) {
  throw createError({ statusCode: 404, statusMessage: 'Case study not found', fatal: true })
}

// Compute the next study (by `order`) for the hand-off block
const { data: nextStudy } = await useAsyncData(
  () => `work-next-${locale.value}-${slug.value}`,
  async () => {
    const all = await queryCollection('work')
      .where('path', 'LIKE', `/${locale.value}/work/%`)
      .order('order', 'ASC')
      .all()
    const idx = all.findIndex((s: any) => s.slug === slug.value)
    return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
  },
  { watch: [locale, slug] }
)

useSeoMeta({
  title: () => `${(study.value as any)?.seoTitle ?? (study.value as any)?.title} — ${t('site.name')}`,
  description: () => (study.value as any)?.seoDescription ?? (study.value as any)?.excerpt,
  ogTitle: () => (study.value as any)?.title,
  ogDescription: () => (study.value as any)?.excerpt,
  ogType: 'article',
})
</script>

<template>
  <article v-if="study" class="cs-page">
    <div class="cs-page__inner">
      <NuxtLink :to="useLocalePath()('/work')" class="cs-page__back">
        {{ t('case_study.back_to_work') }}
      </NuxtLink>

      <CaseStudyHero
        :kicker="(study as any).kicker"
        :title="(study as any).title"
        :excerpt="(study as any).excerpt"
      />

      <CaseStudyMeta
        :client="(study as any).client"
        :sector="(study as any).sector"
        :role="(study as any).role"
        :team="(study as any).team"
        :duration="(study as any).duration"
        :stack="(study as any).stack"
      />

      <CaseStudyResults :results="(study as any).results" />

      <div class="cs-page__body">
        <ContentRenderer :value="study as any" />
      </div>

      <CaseStudyHandoff :next-slug="(nextStudy as any)?.slug" />
    </div>
  </article>
</template>

<style scoped>
.cs-page {
  padding: 4rem 1.5rem 6rem;
}

.cs-page__inner {
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.cs-page__back {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
  text-decoration: none;
  letter-spacing: 0.06em;
}

.cs-page__back:hover {
  color: var(--text);
}

/* Long-form body styling — applied via :deep so @nuxt/content's rendered
   markdown picks it up */
.cs-page__body :deep(h2) {
  font-family: theme('fontFamily.display');
  font-size: 1.875rem;
  line-height: 1.2;
  font-weight: 400;
  margin: 3rem 0 1rem;
  color: var(--text);
}

.cs-page__body :deep(h3) {
  font-family: theme('fontFamily.display');
  font-size: 1.375rem;
  line-height: 1.3;
  font-weight: 400;
  margin: 2.5rem 0 1rem;
  color: var(--text);
}

.cs-page__body :deep(p) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
}

.cs-page__body :deep(ul),
.cs-page__body :deep(ol) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
  padding-left: 1.5rem;
}

.cs-page__body :deep(blockquote) {
  border-left: 2px solid var(--border-strong);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--text-soft);
  font-style: italic;
}

.cs-page__body :deep(code) {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  background: var(--bg-raised);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
}

.cs-page__body :deep(pre) {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  background: var(--bg-raised);
  padding: 1.25rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid var(--border);
}

.cs-page__body :deep(pre code) {
  background: transparent;
  padding: 0;
}

.cs-page__body :deep(strong) {
  color: var(--text);
}
</style>
```

- [ ] **Step 2: Smoke-test all 5 case studies**

`pnpm dev` then visit:
- http://localhost:3000/work/banque-regionale → renders hero, meta, results, body markdown, handoff
- http://localhost:3000/work/tadagberhplus
- http://localhost:3000/work/ccns
- http://localhost:3000/work/zenlife
- http://localhost:3000/work/noizet
- http://localhost:3000/work/does-not-exist → 404 page
- http://localhost:3000/en/work/banque-regionale → English version, all labels translated

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add pages/work/[slug].vue
git commit -m "feat: /work/[slug] case study page template

Hero + meta + results + ContentRenderer body + handoff. 404s on invalid
slug. Next-study computed by 'order' field for the handoff block. SEO
meta uses seoTitle/seoDescription front-matter or falls back to title/excerpt.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: `/about` Page (MDX-Driven)

**Files:**
- Create: `content/fr/about.md`
- Create: `content/en/about.md`
- Create: `pages/about.vue`

- [ ] **Step 1: Create FR about content**

Create `O:/Projets/my_portfolio/content/fr/about.md`:

```markdown
---
title: À propos
description: Lead Engineering chez KPS Groupe — disponible pour deux missions par trimestre.
---

## Bonjour. Je suis Rostel.

Lead Engineering chez KPS Groupe, basé à Cotonou.
J'ai conçu et livré douze produits depuis 2021, pour des banques, des fintechs, et des plateformes B2B.

## Disponibilité

**●  DISPO Q3 2026 — 2 missions / trimestre maximum**

Cadrage gratuit · Premier livrable sous 14 jours · Pas de mission de moins de 4 semaines.

## Comment je travaille

### Ma règle n°1 : un projet, une décision claire par jour

Trop de projets meurent d'indécision plus que de mauvais code. Je passe la première semaine à rendre les arbitrages visibles : ce qui est dans le scope, ce qui ne l'est pas, qui décide si le scope bouge.

### Ce que je ne fais pas

- Pas de "missions ouvertes" sans livrable défini
- Pas de stack imposée par hype
- Pas de sous-traitance silencieuse
- Pas de mission qui démarre sans contrat signé

### Ma stack par défaut

- **Backend** : Django, Spring Boot, Laravel selon le contexte
- **Frontend** : Vue 3, Nuxt, parfois React quand l'équipe est dessus
- **Data** : PostgreSQL, Redis, ClickHouse pour la télémétrie
- **Infra** : Docker, Kubernetes sur GCP/AWS, Cloudflare en edge
- **Outillage** : pytest, Playwright, GitHub Actions, Sentry

## Parcours

| Année | Entreprise | Rôle |
|-------|------------|------|
| 2024 — | KPS Groupe | Lead Engineering |
| 2022 — 2024 | Freelance / Independent | Backend Engineer |
| 2021 — 2022 | _Poste précédent_ | Software Engineer |

## Hors du code

> _Section à enrichir par Rostel — angle authentique : mentorat, lecture, side project, etc._

Quelque chose d'humain, pas du bullshit "passionné par les défis". À écrire avant la mise en production V1.
```

- [ ] **Step 2: Create EN about content**

Create `O:/Projets/my_portfolio/content/en/about.md`:

```markdown
---
title: About
description: Lead Engineering at KPS Groupe — available for two engagements per quarter.
---

## Hi. I'm Rostel.

Lead Engineering at KPS Groupe, based in Cotonou.
I have designed and shipped twelve products since 2021, for banks, fintechs, and B2B platforms.

## Availability

**●  AVAILABLE Q3 2026 — 2 engagements / quarter max**

Free scoping · First delivery under 14 days · No engagements shorter than 4 weeks.

## How I work

### Rule #1: one clear decision per project, per day

More projects die of indecision than of bad code. I spend the first week making trade-offs visible: what is in scope, what is not, who arbitrates if it changes.

### What I don't do

- No "open" engagements without a defined deliverable
- No stack imposed by hype
- No silent subcontracting
- No engagement starts without a signed contract

### My default stack

- **Backend**: Django, Spring Boot, Laravel depending on context
- **Frontend**: Vue 3, Nuxt, sometimes React when the team is already on it
- **Data**: PostgreSQL, Redis, ClickHouse for telemetry
- **Infra**: Docker, Kubernetes on GCP/AWS, Cloudflare at the edge
- **Tooling**: pytest, Playwright, GitHub Actions, Sentry

## Career

| Year | Company | Role |
|------|---------|------|
| 2024 — | KPS Groupe | Head of Engineering & Innovation |
| 2022 — 2024 | Freelance / Independent | Backend Engineer |
| 2021 — 2022 | _Previous role_ | Software Engineer |

## Outside of code

> _Section to be expanded by Rostel — authentic angle: mentoring, reading, side project, etc._

Something human, not "passionate about challenges" bullshit. To be written before V1 production.
```

- [ ] **Step 3: Implement `pages/about.vue`**

Create `O:/Projets/my_portfolio/pages/about.vue`:

```vue
<script setup lang="ts">
const { t, locale } = useI18n()

const { data: page } = await useAsyncData(
  () => `about-${locale.value}`,
  () => queryCollection('pages')
    .where('path', '=', `/${locale.value}/about`)
    .first(),
  { watch: [locale] }
)

useSeoMeta({
  title: () => `${(page.value as any)?.title ?? t('about.title')} — ${t('site.name')}`,
  description: () => (page.value as any)?.description,
})
</script>

<template>
  <article class="about">
    <div class="about__layout">
      <div v-if="page" class="about__body">
        <ContentRenderer :value="(page as any)" />
      </div>

      <aside class="about__sidebar">
        <NuxtImg
          src="/images/profile.jpg"
          alt="Rostel Panoumassi portrait"
          width="340"
          height="340"
          format="webp"
          loading="lazy"
          class="about__photo"
        />
        <div class="about__links">
          <a href="/cv.pdf" download class="about__link">{{ t('about.cv_download') }}</a>
          <a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" target="_blank" rel="noopener noreferrer" class="about__link">{{ t('about.linkedin') }}</a>
        </div>
      </aside>
    </div>
  </article>
</template>

<style scoped>
.about {
  padding: 5rem 1.5rem 6rem;
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.about__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 4rem;
  align-items: start;
}

@media (max-width: 900px) {
  .about__layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.about__body {
  max-width: theme('maxWidth.reading');
}

.about__body :deep(h2) {
  font-family: theme('fontFamily.display');
  font-size: clamp(2rem, 3vw + 0.5rem, 2.5rem);
  line-height: 1.15;
  font-weight: 400;
  margin: 0 0 1.5rem;
  letter-spacing: -0.02em;
}

.about__body :deep(h3) {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  line-height: 1.3;
  font-weight: 400;
  margin: 2.5rem 0 0.75rem;
}

.about__body :deep(p),
.about__body :deep(li) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-mute);
}

.about__body :deep(ul) {
  margin: 1rem 0 1.5rem;
}

.about__body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
}

.about__body :deep(th),
.about__body :deep(td) {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: left;
  color: var(--text-mute);
}

.about__body :deep(th) {
  color: var(--text-soft);
  font-weight: 500;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.about__body :deep(strong) {
  color: var(--text);
}

.about__sidebar {
  position: sticky;
  top: 6rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about__photo {
  border-radius: 4px;
  object-fit: cover;
  width: 100%;
  height: auto;
  filter: saturate(0.95);
}

.about__links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.about__link {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
  text-decoration: none;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  align-self: flex-start;
  letter-spacing: 0.04em;
}

.about__link:hover {
  color: var(--text);
}
</style>
```

- [ ] **Step 4: Move the profile photo to public**

```bash
# Copy the legacy profile photo to the new public/images
mkdir -p O:/Projets/my_portfolio/public/images
cp O:/Projets/my_portfolio/legacy/terminal-spa/public/images/profile.jpg O:/Projets/my_portfolio/public/images/profile.jpg
```

- [ ] **Step 5: Smoke-test**

`pnpm dev` → http://localhost:3000/about — page renders with body on left, sidebar with photo + links on right. Responsive: at <900px the sidebar drops below the body.

- [ ] **Step 6: Commit**

```bash
cd O:/Projets/my_portfolio
git add content/fr/about.md content/en/about.md pages/about.vue public/images/profile.jpg
git commit -m "feat: /about page with portrait sidebar (FR + EN)

Body comes from content/{locale}/about.md, rendered with ContentRenderer.
Sidebar holds the portrait photo (lazy NuxtImg, WebP), CV download,
LinkedIn. 'Hors du code' section is a placeholder waiting for content
phase 11.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: `/contact` Page

**Files:**
- Create: `pages/contact.vue`

- [ ] **Step 1: Implement**

Create `O:/Projets/my_portfolio/pages/contact.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => `${t('contact.title')} — ${t('site.name')}`,
  description: () => t('contact.intro'),
})

const channels = [
  { label: t('contact.email_label'), href: 'mailto:rmissimawu@gmail.com', value: 'rmissimawu@gmail.com' },
  { label: t('contact.linkedin_label'), href: 'https://www.linkedin.com/in/rostelpanoumassi-6b6608335', value: '@rostelpanoumassi' },
  { label: t('contact.calendly_label'), href: 'https://calendly.com/rostelpanoumassi', value: 'calendly.com/rostelpanoumassi' },
]
</script>

<template>
  <article class="contact">
    <header class="contact__header">
      <p class="contact__kicker">/ {{ t('contact.title') }}</p>
      <h1 class="contact__title">{{ t('contact.title') }}</h1>
      <p class="contact__intro">{{ t('contact.intro') }}</p>
    </header>

    <NuxtLink :to="localePath('/brief')" class="contact__cta">
      → {{ t('cta_block.cta') }}
    </NuxtLink>

    <ul class="contact__channels">
      <li v-for="c in channels" :key="c.label" class="contact__row">
        <span class="contact__label">{{ c.label }}</span>
        <a :href="c.href" class="contact__value" target="_blank" rel="noopener noreferrer">{{ c.value }}</a>
      </li>
      <li class="contact__row">
        <span class="contact__label">{{ t('case_study.labels.duration') }}</span>
        <span class="contact__value">{{ t('contact.location') }}</span>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.contact {
  padding: 6rem 1.5rem;
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.contact__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.contact__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  font-weight: 400;
  margin: 1rem 0 0;
}

.contact__intro {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  margin: 1rem 0 0;
}

.contact__cta {
  display: inline-block;
  margin-top: 3rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--text);
  border-bottom: 1px solid var(--accent);
  padding-bottom: 4px;
  text-decoration: none;
  letter-spacing: 0.04em;
}

.contact__channels {
  list-style: none;
  padding: 0;
  margin: 4rem 0 0;
  border-top: 1px solid var(--border);
}

.contact__row {
  display: grid;
  grid-template-columns: 12rem 1fr;
  gap: 2rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--border);
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
}

@media (max-width: 600px) {
  .contact__row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}

.contact__label {
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.6875rem;
}

.contact__value {
  color: var(--text-mute);
  text-decoration: none;
}

.contact__value:hover {
  color: var(--text);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add pages/contact.vue
git commit -m "feat: /contact page (channels + brief CTA)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: `/brief` Skeleton (Form Skin Only — Logic in Plan 3)

**Files:**
- Create: `pages/brief.vue`
- Create: `components/brief/BriefStepIndicator.vue`

The full form (validation, localStorage, multi-step navigation, submission to `/api/brief`) lives in **Plan 3**. This task only ships a *visible* placeholder so the navigation doesn't 404.

- [ ] **Step 1: Implement the step indicator (used in Plan 3)**

Create `O:/Projets/my_portfolio/components/brief/BriefStepIndicator.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  current: number
  total: number
}>()
</script>

<template>
  <div class="step-indicator">
    <span class="step-indicator__label">
      {{ t('brief.step_label', { current, total }) }}
    </span>
    <div class="step-indicator__bar">
      <span
        class="step-indicator__fill"
        :style="{ width: `${(current / total) * 100}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}

.step-indicator__bar {
  flex: 1;
  height: 2px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.step-indicator__fill {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 300ms ease-out;
}
</style>
```

- [ ] **Step 2: Implement the placeholder page**

Create `O:/Projets/my_portfolio/pages/brief.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => `${t('brief.title')} — ${t('site.name')}`,
  description: () => t('brief.sub'),
})
</script>

<template>
  <article class="brief">
    <header class="brief__header">
      <BriefStepIndicator :current="1" :total="4" />
      <h1 class="brief__title">{{ t('brief.title') }}</h1>
      <p class="brief__sub">{{ t('brief.sub') }}</p>
    </header>

    <div class="brief__placeholder">
      <p class="brief__placeholder-line">
        Plan 3 — formulaire complet (4 étapes, MongoDB, SMTP, Turnstile, Telegram).
        Cette page deviendra l'étape 1 du brief.
      </p>
    </div>
  </article>
</template>

<style scoped>
.brief {
  padding: 6rem 1.5rem;
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.brief__header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.brief__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  font-weight: 400;
  margin: 0;
}

.brief__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--text-mute);
  margin: 0;
}

.brief__placeholder {
  border: 1px dashed var(--border-strong);
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 4px;
}

.brief__placeholder-line {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--text-soft);
  margin: 0;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/brief/BriefStepIndicator.vue pages/brief.vue
git commit -m "feat: /brief skeleton + step indicator component

Page renders the title, sub-line, and a step indicator placeholder for
Plan 3 to fill in. Visible from nav without 404.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: E2E Smoke Tests for Navigation and i18n

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/navigation.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```bash
cd O:/Projets/my_portfolio && pnpm exec playwright install chromium
```

- [ ] **Step 2: Create `playwright.config.ts`**

Create `O:/Projets/my_portfolio/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
```

- [ ] **Step 3: Write the navigation spec**

Create `O:/Projets/my_portfolio/tests/e2e/navigation.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('Navigation smoke', () => {
  test('home loads with hero, featured, approach, CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('logiciels fiables')
    await expect(page.locator('text=Travaux récents')).toBeVisible()
    await expect(page.locator('text=Comment je travaille')).toBeVisible()
    await expect(page.locator('text=Démarrer un brief')).toBeVisible()
  })

  test('all primary routes return 200 in FR', async ({ page }) => {
    const routes = ['/', '/work', '/work/banque-regionale', '/about', '/contact', '/brief']
    for (const r of routes) {
      const resp = await page.goto(r)
      expect(resp?.status(), `route ${r}`).toBeLessThan(400)
    }
  })

  test('all primary routes return 200 in EN', async ({ page }) => {
    const routes = ['/en', '/en/work', '/en/work/banque-regionale', '/en/about', '/en/contact', '/en/brief']
    for (const r of routes) {
      const resp = await page.goto(r)
      expect(resp?.status(), `route ${r}`).toBeLessThan(400)
    }
  })

  test('language toggle switches FR ↔ EN', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Démarrer un brief')).toBeVisible()
    await page.locator('.lang-toggle').click()
    // After click we should be on /en/* with English UI
    await expect(page).toHaveURL(/\/en($|\/)/)
    await expect(page.locator('text=Start a brief')).toBeVisible()
  })

  test('theme toggle cycles auto → light → dark', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const initial = await html.getAttribute('data-theme')
    await page.locator('.theme-toggle').click()
    const next = await html.getAttribute('data-theme')
    expect(next).not.toBe(initial)
  })

  test('case study renders body markdown', async ({ page }) => {
    await page.goto('/work/banque-regionale')
    await expect(page.locator('h1')).toContainText('paiement')
    await expect(page.locator('text=Le contexte')).toBeVisible()
    await expect(page.locator('text=+180 %')).toBeVisible()
  })
})
```

- [ ] **Step 4: Run E2E**

```bash
cd O:/Projets/my_portfolio && pnpm test:e2e
```

Expected: 6/6 pass. The first run takes ~30s while Playwright spins up the dev server.

If any test fails, read the failure output. Most likely culprits:
- Locale toggle: `setLocale` may be called before EN routes resolve. Solution: ensure `prefix_except_default` is in nuxt.config.ts and `/en/...` routes physically resolve.
- Theme toggle data-theme: SSR may set `data-theme="dark"` initially. Toggle to "light" or "auto" both produce a different attribute — check the assertion logic.

- [ ] **Step 5: Commit**

```bash
cd O:/Projets/my_portfolio
git add playwright.config.ts tests/e2e/navigation.spec.ts
git commit -m "test: e2e navigation smoke (FR + EN routes, toggles, content)

6 tests cover: home renders all sections, all routes 200 in both
locales, language toggle changes URL + UI strings, theme toggle
changes data-theme, case study body markdown renders.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 17: Final Plan 2 Verification

- [ ] **Step 1: Typecheck clean**

```bash
cd O:/Projets/my_portfolio && pnpm typecheck
```

Expected: 0 errors. If errors: most often `useI18n` or `queryCollection` typing — cast `as any` on the destructured study object only where needed (the front-matter is loosely typed by `@nuxt/content` and a strict typing migration is a Plan 4 polish task, not a Plan 2 blocker).

- [ ] **Step 2: Unit + e2e all green**

```bash
cd O:/Projets/my_portfolio && pnpm test --run && pnpm test:e2e
```

Expected: all green.

- [ ] **Step 3: Manual smoke checklist**

Run `pnpm dev` and walk through:

- [ ] / renders with hero, 3 featured cards, 3 approach points, CTA, footer
- [ ] /work shows 5 case studies, sector chips filter
- [ ] /work/[slug] for each of the 5 → renders correctly
- [ ] /about renders with portrait sidebar
- [ ] /contact renders 4 channels
- [ ] /brief renders skeleton placeholder
- [ ] /en/* mirrors all of the above with English content
- [ ] Language toggle persists across reloads
- [ ] Theme toggle persists across reloads
- [ ] Footer "$ ./terminal" link → 404 (expected; created in Plan 4)
- [ ] No console errors in dev tools
- [ ] Lighthouse Performance > 90 on /, > 95 on /work/[slug]

- [ ] **Step 4: Final commit (no code, marker)**

```bash
cd O:/Projets/my_portfolio
git commit --allow-empty -m "milestone: Plan 2 complete — content site live

Home, /work, /work/[slug], /about, /contact, /brief skeleton all render
in FR and EN with content from @nuxt/content. Scroll animations work,
reduced motion respected, e2e green. Plan 3 wires the brief form
backend; Plan 4 brings terminal back, SEO polish, and deployment.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Plan 2 Complete

State at end of Plan 2:
- 6 user-facing routes (`/`, `/work`, `/work/[slug]`, `/about`, `/contact`, `/brief`) live in FR and EN
- 5 case studies migrated from legacy data with schema-validated front-matter
- All UI strings consume `useI18n()` from JSON catalogues
- Pure-typography case study cards render with correct hover state
- Scroll-driven fade-up animations work, reduced motion neutralises them
- 11 Vitest unit tests + 6 Playwright e2e tests passing
- Site is publicly readable; only the brief form is a placeholder
- Footer "$ ./terminal" link points to `/terminal` (404 until Plan 4)

Plan 3 (Brief funnel) starts from this state.
