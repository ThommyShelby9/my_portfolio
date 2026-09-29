# Visionary Engineer, Lot 3 (work, case studies, explorations, SEO) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish every real project as a typed Markdown case study (FR + EN) with a gallery, a `/realisations` index, an `/explorations` index for unsolicited design studies, per-project OG images, JSON-LD and `sitemap.ts` / `robots.ts`, all guarded by the no-fake-metrics check.

**Architecture:** Content lives in `content/{realisations,explorations}/{fr,en}/<slug>.md` (frontmatter + Markdown body). A server-only loader (`gray-matter` + Zod + `marked`) reads and validates everything at build time; the metric guard runs over every summary and body in a unit test. Pages are statically generated per locale and slug. Images are pre-converted to WebP in `public/work/<slug>/NN.webp` by a script; the loader reads their dimensions with `sharp` so `next/image` never shifts layout. Zero new client JavaScript except the existing `Reveal`.

**Tech Stack:** Next.js 16.3.7 (App Router, `generateStaticParams`, `next/og`), next-intl 4, gray-matter, marked, Zod 4, sharp, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-09-29-portfolio-v6-visionary-engineer-design.md` (§4 routes, §4.2 case study, §5.3 content model, §5.5 SEO, §6 content, §6.3 metric guard).

## Global Constraints

- Owner rules: no em dash (U+2014) anywhere in copy (FR, EN, Markdown bodies); no emoji as icons; rectangular buttons; champagne the only accent; `graphite` never for text; no fake metrics (§6.3); no AI photos; no custom cursor.
- Honesty (spec §2.11, §6): ContractIQ co-authored with **Jérémie Zitti** (credited on card and page); Explorations are labelled "Proposition de refonte non commandée" / "Unsolicited redesign proposal"; never show the Bénin Bouge political portraits (Talon, Wadagni, Wallace) nor its stock map; never present Skilluv; never show private gift/romantic repos; the TadagbeRhPlus client stays anonymised ("cabinet de conseil RH, Bénin"); ContractIQ landing stats are never reused.
- Confirmed proofs only (source must be stated in frontmatter): CCNS +240 % organic traffic in 6 months and Lighthouse SEO 100; TadagbeRhPlus −85 % manual entry and 3 CNSS updates with 0 regressions; ZenLife 1 200+ active users in 6 months. Counts taken from a repository are allowed with source `"compté dans le dépôt <repo>"`. Anything else numeric that is not a version, a year, or a small count (< 100) is removed.
- Roles for Freelance Club, Orinsu and IT-Opportunities-Tracker are not confirmed in detail: role text is `"Contribution à l’ingénierie"` / `"Engineering contribution"` and nothing more specific; the report flags them for the owner.
- Budget: initial JS for `/` stays ≤ 160 KB gzip (current 155.7 KB); case-study pages must not add client JS beyond `Reveal`.
- Locales: `fr` unprefixed, `en` under `/en`; FR slugs and EN slugs are identical (`/realisations/ubbfy` ↔ `/en/work/ubbfy`).
- French uses `’`; accessible names include the visible text (WCAG 2.5.3).
- e2e: `PW_PORT=3111 pnpm test:e2e` (a foreign process holds port 3000; never kill it). Manual checks: `PORT=3100 HOSTNAME=0.0.0.0 node .next/standalone/server.js &`.
- Never touch or stage `new.md`, `image*.png`, `3002/`, `.claude/`. Stage explicit paths.
- Next.js 16 docs in `node_modules/next/dist/docs/` (read before using `next/og`, `sitemap.ts`, `robots.ts`, `generateStaticParams`).
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. A case study whose body mentions a number that no proof backs must fail the build/test, not ship. Pinned in Task 1 (guard over all content) and Task 3 (content passes it).
2. An unknown slug (`/realisations/nope`, `/en/work/nope`) must return the localized 404, not a crash. Pinned in Task 4 (`dynamicParams = false` + `notFound`).
3. Every page must declare its own canonical and hreflang (no page falls back to the home canonical). Pinned in Task 5 (e2e over all prerendered routes).
4. Images must never shift layout or load at full size on phones. Pinned in Task 2 (dimensions from sharp) and Task 4 (`sizes`).
5. Explorations must never be presented as client work. Pinned in Task 1 (schema: `kind: 'exploration'` forbids `featured`/`liveUrl` claims) and Task 4 (visible label, e2e).

---

## File Structure

```
content/realisations/{fr,en}/<slug>.md      # 17 projects
content/explorations/{fr,en}/<slug>.md      # 4 studies
public/work/<slug>/NN.webp                  # gallery images (01 = cover)
scripts/work-media.mjs                      # converts sources → public/work/<slug>/NN.webp
src/lib/site.ts                             # SITE_URL, owner identity constants
src/lib/content/schema.ts                   # Zod schema for frontmatter
src/lib/content/metrics.ts                  # (exists) metric guard
src/lib/content/load.ts                     # server-only loader (all, bySlug, prev/next)
src/lib/content/markdown.ts                 # marked renderer (safe subset, heading ids)
src/components/work/{WorkCard,WorkIndex,CaseHeader,CaseBody,Gallery,CaseNav,ExplorationBadge}.tsx
src/app/[locale]/realisations/page.tsx
src/app/[locale]/realisations/[slug]/page.tsx
src/app/[locale]/realisations/[slug]/opengraph-image.tsx
src/app/[locale]/explorations/page.tsx
src/app/[locale]/explorations/[slug]/page.tsx   # same components, exploration label
src/app/sitemap.ts, src/app/robots.ts, src/app/opengraph-image.tsx (default)
src/components/seo/JsonLd.tsx
tests/unit/content.test.ts, page-metadata.test.ts
tests/e2e/work.spec.ts, seo.spec.ts
```

Note: the internal pathname for explorations detail pages must be added to `routing.pathnames` (`'/explorations/[slug]': '/explorations/[slug]'`).

---

### Task 1: Content engine (schema, loader, markdown, guard) + site constants

**Files:** Create `src/lib/site.ts`, `src/lib/content/schema.ts`, `src/lib/content/load.ts`, `src/lib/content/markdown.ts`, `tests/unit/content-engine.test.ts`, `tests/unit/page-metadata.test.ts`, fixtures `tests/fixtures/content/realisations/{fr,en}/demo.md`. Modify `src/lib/seo/page-metadata.ts` and `src/app/[locale]/layout.tsx` (use `SITE_URL`), `src/i18n/routing.ts` (explorations detail pathname), `messages/en.json` (`work.ctaFor` → `"Read the case study: {name}"`, carried from Lot 2), `package.json` (`gray-matter`, `marked`).

**Interfaces (produced):**
- `SITE_URL: string` (`process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rostelmissimawu.com'`), `OWNER = { name: 'Rostel Panoumassi', email: 'rmissimawu@gmail.com', linkedin: 'https://www.linkedin.com/in/rostelpanoumassi-6b6608335', github: 'https://github.com/ThommyShelby9', city: 'Cotonou', country: 'BJ', employer: 'KPS Groupe', yearsExperience: 6, yearsLead: 3 }`.
- `type ProjectKind = 'realisation' | 'exploration'`; `type Project = { kind; slug; locale; title; summary; year; duration?; role; team?; coauthors: string[]; stack: string[]; status: 'live' | 'archived' | 'private' | 'concept'; liveUrl?; repoUrl?; featured: number | null; order: number; client?: string; sector?: string; images: { src: string; alt: string; kind: 'public' | 'interior'; width: number; height: number }[]; proofs: { text: string; source: string }[]; seoDescription: string; bodyHtml: string; headings: { id: string; text: string }[] }`.
- `getProjects(kind, locale): Promise<Project[]>` sorted by `featured` (1..3 first) then `year` desc then `order`; `getProject(kind, locale, slug): Promise<Project | null>`; `getNeighbours(kind, locale, slug): { prev: Project | null; next: Project | null }`; `getAllSlugs(kind): string[]`.
- `renderMarkdown(md: string): { html: string; headings: { id: string; text: string }[] }` (h2 get slug ids; raw HTML in Markdown is not allowed: escape it; links get `rel="noopener"` when external).

**Schema rules (Zod, `schema.ts`):**
- required: `title`, `summary` (≤ 220 chars), `year` (2015..2100), `role`, `stack` (≥ 1), `status`, `order` (int), `seoDescription` (≤ 170), `images` (array, may be empty), `proofs` (default `[]`, each `{ text, source }` non-empty), `coauthors` (default `[]`), `featured` (int 1..3 or null, default null).
- `status: 'live'` requires `liveUrl` (url).
- `kind: 'exploration'` (derived from the folder) requires `status: 'concept'`, forbids `featured` ≠ null and forbids `proofs`.
- `images[].src` must match `/^\/work\/[a-z0-9-]+\/\d{2}\.webp$/` and the file must exist in `public/` (loader check); `alt` non-empty; width/height are read by the loader with `sharp` (not written in frontmatter).
- slug = file name; FR and EN files must both exist for every slug (loader throws otherwise).

**Tests (`content-engine.test.ts`, written first, RED then GREEN):** schema accepts the demo fixture; rejects `status: live` without `liveUrl`; rejects an exploration with `featured: 1`; rejects a proof without `source`; `renderMarkdown` gives ids to h2, escapes `<script>`, adds `rel="noopener"` to `https://` links; the loader, pointed at the fixtures folder through an optional `root` parameter (`getProjects(kind, locale, { root })`), throws when the EN twin is missing. `page-metadata.test.ts`: `pageMetadata({ locale: 'en', href: '/realisations/[slug]', params: { slug: 'ubbfy' }, … })` gives canonical `https://rostelmissimawu.com/en/work/ubbfy` and `x-default` `https://rostelmissimawu.com/realisations/ubbfy`.

**Global content guard (in the same test file, runs over the real `content/` folder):** for every project and locale, `findUnsourcedMetrics(summary + ' ' + stripTags(bodyHtml), proofs)` must be `[]` (import from `src/lib/content/metrics.ts`); no string anywhere contains `\u2014`; FR strings contain no ASCII `'`. With the `content/` folder still empty in this task, the guard passes trivially; Task 3 makes it meaningful.

**Steps:** install deps (`pnpm add gray-matter marked`), write fixtures and failing tests, implement, `pnpm test`, `pnpm build`, commit `feat(v6): typed Markdown content engine with metric guard and site constants`.

---

### Task 2: Media pipeline and captures

**Files:** Create `scripts/work-media.mjs`, `scripts/work-media.config.mjs`, `public/work/<slug>/NN.webp`. No app code.

**`work-media.config.mjs`** maps each slug to an ordered list of sources (`{ from: 'git:v5-manifesto:public/images/ubbfy.png' | 'file:<absolute or repo-relative path>' | 'url:https://…', crop?: { top?: number; bottom?: number; left?: number; right?: number } (px), kind: 'public' | 'interior', alt: { fr, en } }`). `work-media.mjs` resolves each source (git show / copy / Playwright capture at 1440×900 @2x for `url:`), applies the crop, resizes to max width 1600, writes WebP quality 80 as `public/work/<slug>/01.webp`, `02.webp`, …, and prints a JSON manifest (`slug`, `file`, `width`, `height`, `alt`) to `scripts/work-media.manifest.json` (committed; Task 3 copies alts from it).

**Sources (use exactly these; cover = first):**
- `ubbfy`: `git:v5-manifesto:public/images/ubbfy.png` (crop right 4 px to remove the scrollbar sliver); plus `url:https://app.ubbfy.com` login page if it renders cleanly.
- `contractiq`: `.superpowers/assets/contractiq/` in this order: `02b-contract-detail-risks.png`, `01-command-center.png`, `02-contract-detail-ai.png`, `03-health-score.png`, `04b-at-risk-list.png`, `05-invoice-extracted-fields.png`, `06-ghost-subscriptions.png`, `07-public-signature-page.png` (never `08-pricing-plans.png`).
- `zenlife`: `.superpowers/assets/zenlife/`: `desktop-dash.png`, `tableau-de-bord-dark.png` (crop to the top 1100 px), `finances-resume-dark.png`, `planificateur-jour-dark.png`, `pensees-positives-dark.png`, `mobile-dash.png`.
- `tadagberhplus`, `ccns`, `leconsultant`, `easytowork`, `planus`, `whatspay`, `upgrade`, `freelanceclub`, `bilalsekou`, `mariette`: `git:v5-manifesto:public/images/<file>.png` (files: `tadagberhplus.png`, `ccns.png`, `leconsultant.png`, `easytowork.png`, `planus.png`, `whatspay.png`, `upgrade.png`, `freelanceclub.png`, `bilal_portfolio.png`, `portfolio_mariette.png`); add `url:` captures of the live home page for `tadagberhplus.com`, `ccnsbenin.vercel.app`, `leconsultant.bj`, `easytowork.fr`, `planus-analytics.com`, `whatspay.africa`, `upgrade-afrique.com`, `freelanceclubs.com` as `02` when the capture is clean (no cookie banner covering content, no error).
- `moncarnet`: live `url:https://moncarnet.kheios.com` + the repo screenshots `gh api repos/ThommyShelby9/moncarnet/contents/public/decouvrir` (download 4 representative `.webp`, fictional data only; describe them in the report).
- `kaba`, `orinsu`, `it-opportunities-tracker`: no clean public visuals are known → no images (typographic case study). Do not invent.
- Explorations: `lecentre` → `url:https://lecentre.kheios.com` (home + one inner page); `procom` → `url:https://procom.agency` (home); `beninbouge` → run the local project `O:/Projets/beninbouge` (`npm run dev` on a free port, do not modify the repo) and capture home, interactive department map and an article page, **excluding any section showing the Talon/Wadagni/Wallace portraits or the stock map image** (scroll past or crop; if impossible, skip that screen); `najaexperts` → run `O:/Projets/najaynexperts` locally the same way and capture its proposal pages. If a local project cannot start in 10 minutes of effort, capture nothing for it and report.
- Every capture must be visually checked with the image tool: no personal data, no browser chrome, no emoji-heavy UI chrome from the capture tool, no cookie banner.

**Steps:** write config + script, run it, inspect every image, commit `feat(v6): work media pipeline and project galleries` (commit `public/work/**`, the scripts and the manifest). Report per slug: files, dimensions, what each shows, anything skipped and why.

---

### Task 3: Content migration and new projects (FR + EN)

**Files:** Create `content/realisations/{fr,en}/<slug>.md` for: `ubbfy`, `contractiq`, `zenlife`, `tadagberhplus`, `freelanceclub`, `whatspay`, `leconsultant`, `easytowork`, `ccns`, `planus`, `upgrade`, `moncarnet`, `kaba`, `orinsu`, `it-opportunities-tracker`, `bilalsekou`, `mariette`; and `content/explorations/{fr,en}/<slug>.md` for `beninbouge`, `lecentre`, `najaexperts`, `procom`.

**Sources (read them; never invent facts):**
- Existing case studies: `git show v5-manifesto:content/{fr,en}/work/<slug>.md` (12 projects; owner-authored).
- Repository inventory: `.superpowers/inventory/github-personal.md`, `.superpowers/inventory/github-orgs.md` (ContractIQ, MonCarnet, Kaba, Orinsu, IT-Opportunities-Tracker, explorations).
- Media manifest: `scripts/work-media.manifest.json` (image paths + alts).
- Spec §6.1–6.3 and this plan's Global Constraints.

**Frontmatter template:**
```yaml
---
title: Ubbfy
summary: Reconstruire un ERP complet autour d’une seule API, servie au web, à une PWA et à une application Flutter.
year: 2026
duration: 8 mois            # only if the source states it
role: Lead engineer, refonte et architecture
team: 4 développeurs, 1 mobile, 1 ops   # only if the source states it
coauthors: []
client: Ubbfy
sector: ERP, RH, multi-entreprises
stack: [Django 5, DRF, PostgreSQL, Redis, Channels, Vue 3, PrimeVue, Flutter]
status: live
liveUrl: https://app.ubbfy.com
featured: 1                 # ubbfy 1, contractiq 2, zenlife 3, everything else null
order: 1
images:
  - { src: /work/ubbfy/01.webp, alt: "…", kind: public }
proofs:
  - { text: 20 applications Django derrière une seule API, source: compté dans le dépôt ubbfy (contenu v5) }
seoDescription: …
---
```

**Body structure (both languages, h2 in this order, omit a section only when the source has nothing):** `## Les enjeux` / `## The challenge`; `## Fonctionnalités clés` / `## Key features`; `## Contraintes et décisions` / `## Constraints and decisions` (2 to 4 decisions, each with the why; this is where Rostel's own part is explicit); `## Résultat` / `## Outcome` (only sourced facts; if none, a qualitative sentence without numbers). Keep the v5 voice and details; tighten; remove every em dash (use a comma, a colon, parentheses or a new sentence); French typographic apostrophes; EN written natively, not word-for-word.

**Per-project rules:**
- `contractiq`: `coauthors: [Jérémie Zitti]`, `status: private` (no public URL), stack from the inventory, features from the inventory (AI extraction with Gemini + OpenAI fallback, risk analysis, health score, renewal alerts, invoices, ghost subscriptions, e-signature, multi-organisation billing with FedaPay, public API with HMAC webhooks); decisions: provider-agnostic AI layer, billable modules instead of fixed plans, multi-tenant organisations with audit logs; never the landing stats; counts allowed: "52 modèles Mongoose, environ 213 routes API, 44 fichiers de tests unitaires" with source "compté dans le dépôt contractiq".
- `zenlife`: proof `1 200+ utilisateurs actifs en six mois` / `1,200+ active users in six months` with source `confirmé par Rostel le 2026-09-28`; `status: archived` unless `https://zenlife.kheios.com` answers 200 during this task (then `live` + `liveUrl`).
- `tadagberhplus`: client stays `Cabinet de conseil RH, Bénin (confidentiel)`; proofs −85 % and CNSS as confirmed; no company counts.
- `ccns`: proofs +240 % and SEO 100 as confirmed.
- `mariette`, `bilalsekou`: client websites; `mariette` status `archived` (site was down), `bilalsekou` `private` unless live.
- `freelanceclub`, `orinsu`, `it-opportunities-tracker`: role `Contribution à l’ingénierie` / `Engineering contribution`; describe the product and stack from the inventory only; no claims about who led what.
- `kaba`, `moncarnet`: from the inventory; `moncarnet` `live` with `https://moncarnet.kheios.com` (Challenge e-Santé Bénin).
- Explorations: `status: concept`, no `liveUrl` for the redesign (the client's real site may be linked in the body as "site actuel"), body opens with one sentence stating it is an unsolicited proposal; Bénin Bouge body never names the political figures.

**Steps:** write all files; run `pnpm test` (the Task 1 guard now checks all content: fix wording, never the guard); `pnpm build`; commit `content(v6): 17 case studies and 4 explorations in FR and EN`. Report: per project the sources used, any fact left out for lack of source, and the three role-unconfirmed projects.

---

### Task 4: Work pages

**Files:** Create the `src/components/work/*` components and the four route files listed in File Structure; add messages (`workIndex.*`, `caseStudy.*`, `explorations.*`) FR + EN.

**Behaviour:**
- `/realisations`: kicker `Réalisations`, h1 `Des produits livrés, du premier schéma à la production.` / `Products shipped, from the first schema to production.`; lede one sentence; the three featured projects as large editorial rows (reuse the home case layout via a shared `WorkCase` component extracted from `SelectedWork`, with an optional `headingLevel`), then all other realisations as a grid of `WorkCard`s (cover image or, when no image, a typographic panel: project name in large serif on `obsidian-2` with the sector in mono), each showing name, what, role, year, stack (4 max), co-author line if any, and linking to the case study. End with the Conversion CTA block (reuse `Conversion`).
- `/realisations/[slug]` (`generateStaticParams` from `getAllSlugs('realisation')` × locales, `export const dynamicParams = false`): `CaseHeader` (kicker = sector, h1 = title, summary, a definition list: role, team, co-authors, year/duration, stack, status with live link `Voir le site` / `Visit the site` as an external link with `rel="noopener"`), cover image full width (priority), `CaseBody` rendering `bodyHtml` with the typographic styles of the site (serif h2, 17px body, champagne markers), `Gallery` of the remaining images (grid 2 columns on desktop, mask reveal on enter: CSS `clip-path: inset(0 0 100% 0)` → `inset(0)` through `data-reveal`, off under reduced motion), proofs block if any ("Résultat" band, champagne numbers extracted from `proofs[].text`), `CaseNav` previous/next, then the Conversion block. `generateMetadata` via `pageMetadata` + `openGraph.images`.
- `/explorations` and `/explorations/[slug]`: same components; every card and page shows `ExplorationBadge` ("Proposition de refonte non commandée" / "Unsolicited redesign proposal") above the title; no Conversion CTA text claiming client work.
- Unknown slug → localized 404 (dynamicParams false + `notFound()` in the page when `getProject` returns null).
- JSON-LD `CreativeWork` on each case page (`name`, `description`, `dateCreated` year, `author` Person, `contributor` for co-authors, `url`).
- `opengraph-image.tsx` for case pages (1200×630, `next/og`): obsidian background, "RP" monogram, project title in serif-like font (bundle Cormorant Garamond TTF from `@fontsource`? no: fetch the woff from `node_modules/next/dist/compiled/@vercel/og` default font is fine; use system serif fallback), sector in mono, champagne rule; plus `src/app/opengraph-image.tsx` default for the site.
- Nav: header "Réalisations" and "Explorations" links now resolve; the home "Voir l’étude de cas" links resolve.

**Tests (`tests/e2e/work.spec.ts`):** `/realisations` lists all 17 realisations (count cards + featured rows) and no exploration; each featured link opens its case page with h1 = title; `/en/work/contractiq` shows `Co-built with` and `Jérémie Zitti`; `/realisations/zenlife` shows the 1 200+ proof; `/explorations` shows 4 items each with the badge; `/realisations/nope` and `/en/work/nope` → 404 with localized text; gallery images have width/height attributes and `sizes`; axe on `/realisations`, one case page and `/explorations` (reduced motion); 360 px no overflow on those pages. Run the full suite + `pnpm lint:rules` (budget unchanged for `/`).

**Commit:** `feat(v6): work index, case studies and explorations pages`.

---

### Task 5: SEO completion

**Files:** `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/seo/JsonLd.tsx` (server component rendering `<script type="application/ld+json">` with `JSON.stringify` escaped for `</script>`), home JSON-LD (`Person` with `name`, `jobTitle`, `worksFor`, `address` Cotonou BJ, `sameAs` LinkedIn/GitHub, `knowsAbout`, plus `ProfessionalService` with `areaServed` and `serviceType` list), `tests/e2e/seo.spec.ts`.

**Behaviour:** sitemap lists every localized URL of every static page and every case/exploration page (FR + EN, with `alternates.languages`); robots allows all and points to the sitemap, disallows `/api/` and `/?sculpture=`; every prerendered HTML page (except 404) has exactly one canonical equal to its own URL and `hreflang` fr/en/x-default.

**Tests:** fetch `/sitemap.xml` and check every listed URL returns 200 and that its HTML canonical equals the listed URL; `/robots.txt` content; home JSON-LD parses and has `@type` Person and ProfessionalService; case JSON-LD parses.

**Commit:** `feat(v6): sitemap, robots, JSON-LD and per-page canonical coverage`.

---

## Lot 3 done when

`pnpm test`, `pnpm build`, `pnpm lint:rules`, `PW_PORT=3111 pnpm test:e2e` pass; every home link resolves; every page has its own canonical; the metric guard runs over all content.
