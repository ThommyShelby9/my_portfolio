# Portfolio v5 — Lot 2A « Accueil manifeste : l'engloutissement » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the home page into a scroll-driven manifesto where a fixed, animated Gargantua black hole engulfs the crédo scenes as the visitor scrolls.

**Architecture:** Lift Gargantua out of the (clipped) hero into a **fixed, viewport-centered stage layer** that persists through the scroll. A single client scroll engine (`useManifesto`) reads native `scroll` on a rAF loop and (a) applies an "ingestion" transform to each `[data-eat]` scene block as it crosses the hole and (b) sets a `--feed` CSS variable that flares the black hole when it swallows a scene. All scene copy is server-rendered in the DOM; the motion is progressive enhancement; `prefers-reduced-motion` makes everything static. The pure ingestion math is a DOM-free module unit-tested in isolation (matching this repo's "extract pure logic, test that" pattern).

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>` + TS, `@nuxtjs/i18n` (FR default / EN), Tailwind + CSS custom properties, Vitest (happy-dom) + Playwright. CSS/SVG + a little JS only — **no WebGL/Three**.

**Spec:** `docs/superpowers/specs/2026-08-17-portfolio-v5-manifesto-design.md` (§2 concept, §3 canon, §5 scenes, §8 non-negotiables). This plan refines the spec's "Gargantua scrolls away" into "Gargantua persists and **engulfs** the scenes, then recedes at the invitation," per the owner-validated prototype.

**Reference prototype (source of the exact CSS + scroll code to port):** `.superpowers/gargantua-experience.html` (gitignored, present in the working tree — read it; do not ship it). Its `.void-*` layers are the enhanced Gargantua; its `<script>` is the engulf math.

## Global Constraints

- **Dark only. CSS/SVG + JS only — NO WebGL/Three/canvas** in any new/modified code. `three` + `composables/useWebGLCapability.ts` stay untouched (the out-of-scope `/brief` maquette uses them).
- **SSR + a11y first:** every scene's text renders in the DOM without JS. Engulf/motion is a client-only enhancement. `prefers-reduced-motion: reduce` → no transforms, no ingestion, Gargantua static; all content readable. Contrast AA.
- **Gargantua is home-only and must be a FIXED viewport layer** at **z-index 1** — a sibling of the page content, NEVER nested inside `.hero`, `.site-header`, or any transformed/`backdrop-filter`/`will-change` ancestor (they clip or trap `position:fixed`). Layer order is fixed by the existing scale: `.film` = 0 (FilmAtmosphere, untouched) < **Gargantua stage = 1** < content = 2 < header = 50 < skip-link = 100 < cursor = 9998/9999.
- **One scroll owner:** the manifesto engine owns a single rAF `scroll` loop. Do not add competing scroll listeners; the retired hero GSAP parallax is removed, not doubled.
- **i18n preserved:** FR (default `/`) + EN (`/en`). Add every new key to BOTH `i18n/locales/fr.json` and `i18n/locales/en.json` (flat nested JSON, no codegen). `/brief`, `/work`, and `content/` are untouched.
- **`#hero-heading` MUST remain** the `id` on the hero `<h1>` (e2e asserts it visible). FilmAtmosphere's `.film` (single, `aria-hidden="true"`) is untouched.
- **Verification rulings (from Lot 1 ledger — do not re-litigate):**
  - Do NOT run `pnpm typecheck` (hangs in this env).
  - Run unit tests as `CI=true pnpm vitest run` in the FOREGROUND (default reporter buffers when piped/backgrounded; foreground ~9s).
  - E2E: `pnpm exec playwright test <spec>` (auto-starts `pnpm dev`; first run up to ~240s; `pnpm exec playwright install chromium` once if missing). If `@nuxt/content` SQLite flakes, delete `.data/content/contents.sqlite*` via `node -e` (Python is unavailable) and retry.
  - Windows: script with `node -e`, not Python. Package manager is **pnpm**.

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `assets/manifesto/engulf.ts` | Create | Pure, DOM-free ingestion math (`ingestT`, `computeEngulf`, `computeFeed`). The unit-tested core. |
| `tests/unit/manifesto/engulf.spec.ts` | Create | Unit tests for the math. |
| `composables/useManifesto.ts` | Create | Client scroll engine: one rAF loop; applies engulf transforms to `[data-eat]`, sets `--feed`/`--void-recede`/`--progress` on `:root`; tracks `progress`/`activeScene`; pauses on `document.hidden`; reduced-motion no-op; full cleanup. |
| `components/home/GargantuaStage.client.vue` | Create | The fixed, viewport-centered layer (z-index 1) holding `<Gargantua/>`; reads `--feed`/`--void-recede`; `aria-hidden`. |
| `components/home/ManifestoScene.vue` | Create | One crédo scene: SSR heading + copy inside a `[data-eat]` block; decorative index; a11y-correct `<section>`/heading. |
| `components/film/Gargantua.vue` | Modify | Add orbital streams (differential rotation), `--feed`-driven photon/bloom brightening, ingestion flare — ported from the prototype `.void-*`. Keep Doppler/halo/photon/shadow, `aria-hidden`, the reduced-motion block, and the `body.is-cold` hook. |
| `pages/index.vue` | Modify | Compose the manifesto: hero thesis scene (keeps `#hero-heading`) → crédo scenes (`ManifestoScene` ×4, engulfed) → proof (`FeaturedWork`) → invitation (`CtaBlock`). Mount `GargantuaStage` + boot `useManifesto` (client). Retire the hero GSAP parallax. Preserve SEO. |
| `i18n/locales/fr.json`, `i18n/locales/en.json` | Modify | Add the `manifesto.*` copy namespace. |
| `tests/e2e/navigation.spec.ts` | Modify | Update stale home assertions to the new manifesto copy. |
| `tests/e2e/manifesto.spec.ts` | Create | Smoke: all scene headings SSR-present; `#hero-heading` + `.film` preserved; reduced-motion → no critical Axe violations. |

Dropped from the home (NOT deleted — reversible, may be reused later): `ApproachBlock`, `LabBlock`, `HeroStatusCard`. `FeaturedWork` (proof) and `CtaBlock` (invitation) are retained as scenes.

---

### Task 1: Enhanced Gargantua — orbital motion + ingestion feed

Give the black hole real life: differential orbital streams (inner faster than outer), a `--feed`-driven brightening of the photon ring + bloom, and an ingestion flare. Ported verbatim (adapting class names) from the prototype.

**Files:**
- Modify: `components/film/Gargantua.vue`
- Reference (read, don't edit): `.superpowers/gargantua-experience.html`

**Interfaces:**
- Produces: `<Gargantua />` — unchanged public shape (auto-imported, no props, `aria-hidden`). New behavior: reads the inherited CSS var `--feed` (0..1, default 0) to brighten. When `--feed` is absent it renders exactly like a calm variant-03 black hole.

- [ ] **Step 1: Read both sources**

Read the current `components/film/Gargantua.vue` and the prototype `.superpowers/gargantua-experience.html`. In the prototype, the black hole is the `.void` element and its `.void-*` children (`void-bloom`, `void-disk`, `void-halo`, `void-stream--out`, `void-sphere`, `void-stream--in`, `void-photon`, `void-diskf`, `void-hot`, `void-flare`) plus the `@keyframes spin`/`breath`.

- [ ] **Step 2: Port the enhanced layers into Gargantua.vue**

Rewrite `components/film/Gargantua.vue` so the template/`.gz-*` structure carries the prototype's photoreal-03 look **with motion**, keeping the existing contract:
- Keep the root `<div class="gz" aria-hidden="true">` and its sizing (`--d: clamp(300px, 64vh, 660px)`, `position:absolute; left:50%; top:44%`), so it still works standalone.
- Replace the inner layers with the prototype's set, renamed `.void-*` → `.gz-*` (e.g. `.gz-bloom`, `.gz-disk`, `.gz-halo`, `.gz-stream--out`, `.gz-sphere`, `.gz-stream--in`, `.gz-photon`, `.gz-diskf`, `.gz-hot`, `.gz-flare`). Copy the gradients, masks, blurs, z-order, and the two differential `spin` durations verbatim.
- Wire `--feed` exactly as the prototype does: `.gz-bloom` scale/opacity scale with `var(--feed)`, `.gz-photon` drop-shadow grows with `var(--feed)`, `.gz-flare` opacity = `calc(var(--feed)*.9)`. Add `.gz{ --feed: 0; }` as the local default so a standalone Gargantua is calm.
- **Keep the existing `:global(body.is-cold) .gz { filter: hue-rotate(178deg) saturate(.72) brightness(.82); }` hook** (Lot 2B toggles it) and the `@media (prefers-reduced-motion: reduce)` block — extend the reduced-motion block to also freeze `.gz-stream--out`, `.gz-stream--in`, `.gz-flare`, `.gz-bloom` (`animation:none`), leaving a legible static black hole.
- No `<script>` logic, no props: pure template + scoped `<style>` (it stays CSS/SVG-only).

- [ ] **Step 3: Verify (structure + regression — NOT typecheck)**

- `CI=true pnpm vitest run` (foreground) → suite still green (no unit test targets this file; confirm no regression).
- Grep confirms: `aria-hidden="true"` present; `@media (prefers-reduced-motion: reduce)` present and lists the stream/flare/bloom; `:global(body.is-cold)` hook still present; no `three`/`webgl`/`canvas`/`<script` in the file.
- Do NOT run `pnpm dev`/typecheck; visual check happens after Task 4.

- [ ] **Step 4: Commit**

```bash
git add components/film/Gargantua.vue
git commit -m "feat(v5): Gargantua orbital motion + --feed ingestion glow"
```

---

### Task 2: The ingestion math (pure, DOM-free) + unit tests

Extract the prototype's scroll math into a pure module so it can be unit-tested and reused by the engine. TDD.

**Files:**
- Create: `assets/manifesto/engulf.ts`
- Test: `tests/unit/manifesto/engulf.spec.ts`

**Interfaces:**
- Produces:
  - `clamp(v:number, a:number, b:number): number`
  - `ingestT(distance:number, vh:number): number` — the ingestion progress `t` ∈ [0,1] for a scene block whose center is `distance` px from the viewport center (positive = below the hole), given viewport height `vh`. `t = clamp((0.15*vh - distance)/(0.60*vh), 0, 1)`.
  - `computeEngulf(distance:number, vh:number): { scale:number; shift:number; rotate:number; opacity:number; blur:number }` — `scale=1-0.92t`, `shift=-distance*t`, `rotate=-34*t`, `opacity=1-t^1.25`, `blur=13*t`.
  - `computeFeed(distance:number, vh:number): number` — `t*(1-t)*4`, i.e. peaks (=1) at `t=0.5`.
- Consumed by: `composables/useManifesto.ts` (Task 3).

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/manifesto/engulf.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { clamp, ingestT, computeEngulf, computeFeed } from '~/assets/manifesto/engulf'

const VH = 1000

describe('clamp', () => {
  it('bounds below, within, above', () => {
    expect(clamp(-5, 0, 1)).toBe(0)
    expect(clamp(0.3, 0, 1)).toBe(0.3)
    expect(clamp(9, 0, 1)).toBe(1)
  })
})

describe('ingestT', () => {
  it('is 0 while the block sits at/below the start line (distance = 0.15*vh)', () => {
    expect(ingestT(0.15 * VH, VH)).toBe(0)
    expect(ingestT(0.5 * VH, VH)).toBe(0)
  })
  it('is 1 once the block is well above the hole (distance = -0.45*vh)', () => {
    expect(ingestT(-0.45 * VH, VH)).toBe(1)
    expect(ingestT(-0.9 * VH, VH)).toBe(1)
  })
  it('passes through 0.5 at the mid-ingestion distance', () => {
    // t = 0.5  =>  distance = 0.15*vh - 0.5*0.60*vh = -0.15*vh
    expect(ingestT(-0.15 * VH, VH)).toBeCloseTo(0.5, 5)
  })
})

describe('computeEngulf', () => {
  it('is the identity transform at t=0', () => {
    const e = computeEngulf(0.15 * VH, VH)
    expect(e.scale).toBeCloseTo(1, 5)
    expect(e.opacity).toBeCloseTo(1, 5)
    expect(e.blur).toBeCloseTo(0, 5)
    expect(e.shift).toBeCloseTo(0, 5)
    expect(e.rotate).toBeCloseTo(0, 5)
  })
  it('collapses toward the hole at t=1', () => {
    const d = -0.45 * VH
    const e = computeEngulf(d, VH)
    expect(e.scale).toBeCloseTo(0.08, 5)
    expect(e.opacity).toBeCloseTo(0, 5)
    expect(e.blur).toBeCloseTo(13, 5)
    expect(e.rotate).toBeCloseTo(-34, 5)
    expect(e.shift).toBeCloseTo(-d, 5) // pulled onto the hole center
  })
})

describe('computeFeed', () => {
  it('is 0 at the extremes and peaks at 1 mid-ingestion', () => {
    expect(computeFeed(0.15 * VH, VH)).toBeCloseTo(0, 5)
    expect(computeFeed(-0.45 * VH, VH)).toBeCloseTo(0, 5)
    expect(computeFeed(-0.15 * VH, VH)).toBeCloseTo(1, 5) // t=0.5 => 0.5*0.5*4
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `CI=true pnpm vitest run tests/unit/manifesto/engulf.spec.ts`
Expected: FAIL (module `~/assets/manifesto/engulf` not found).

- [ ] **Step 3: Implement the module**

Create `assets/manifesto/engulf.ts`:

```ts
export function clamp(v: number, a: number, b: number): number {
  return v < a ? a : v > b ? b : v
}

// Ingestion progress for a scene block whose center is `distance` px from the
// viewport center (positive = still below the hole), given viewport height `vh`.
export function ingestT(distance: number, vh: number): number {
  return clamp((0.15 * vh - distance) / (0.6 * vh), 0, 1)
}

export interface EngulfTransform {
  scale: number
  shift: number
  rotate: number
  opacity: number
  blur: number
}

export function computeEngulf(distance: number, vh: number): EngulfTransform {
  const t = ingestT(distance, vh)
  return {
    scale: 1 - 0.92 * t,
    shift: -distance * t,
    rotate: -34 * t,
    opacity: 1 - Math.pow(t, 1.25),
    blur: 13 * t,
  }
}

// Flare contribution of one block mid-ingestion; peaks (=1) at t=0.5.
export function computeFeed(distance: number, vh: number): number {
  const t = ingestT(distance, vh)
  return t * (1 - t) * 4
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `CI=true pnpm vitest run tests/unit/manifesto/engulf.spec.ts`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add assets/manifesto/engulf.ts tests/unit/manifesto/engulf.spec.ts
git commit -m "feat(v5): pure ingestion math for the manifesto engulf + tests"
```

---

### Task 3: The scroll engine + the fixed Gargantua stage

Wire the math to the DOM: a client composable driving one rAF loop, and the fixed layer that hosts the black hole and glows as it feeds.

**Files:**
- Create: `composables/useManifesto.ts`
- Create: `components/home/GargantuaStage.client.vue`
- Reference: `.superpowers/gargantua-experience.html` (its `<script>` is the loop to adapt)

**Interfaces:**
- `GargantuaStage` — `<GargantuaStage />`, auto-imported, client-only (`.client.vue`), no props, `aria-hidden`. Renders a `position:fixed` full-viewport centered container at **z-index 1** holding `<Gargantua/>`; its transform reads `--void-recede` (0..1 → scale down + fade as the reel ends). It does NOT bind scroll itself.
- `useManifesto(opts?: { eatSelector?: string }): { progress: Ref<number>; feed: Ref<number>; activeScene: Ref<number>; start(): void; stop(): void }` — the single scroll owner. `start()` (call in `onMounted`) is a **no-op under `prefers-reduced-motion: reduce`**. It queries `document.querySelectorAll(eatSelector)` (default `[data-eat]`), and on each rAF-throttled scroll:
  - for each eat block, computes `computeEngulf(centerY - vh/2, vh)` and writes `transform`/`opacity`/`filter` inline;
  - sets `--feed` = max `computeFeed(...)` across blocks, `--progress` = scroll fraction, and `--void-recede` = smooth ramp for `progress > 0.9`, all on `document.documentElement`;
  - updates the returned refs. `stop()` (call in `onBeforeUnmount`) removes listeners, cancels rAF, and clears the inline styles it set. Pauses work while `document.hidden`.

- [ ] **Step 1: Create the composable**

Create `composables/useManifesto.ts`. Skeleton (fill the loop by adapting the prototype `<script>`; use the Task-2 math):

```ts
import { ref, type Ref } from 'vue'
import { computeEngulf, computeFeed, clamp } from '~/assets/manifesto/engulf'

export function useManifesto(opts: { eatSelector?: string } = {}) {
  const eatSelector = opts.eatSelector ?? '[data-eat]'
  const progress = ref(0)
  const feed = ref(0)
  const activeScene = ref(0)

  let eats: HTMLElement[] = []
  let raf = 0
  let ticking = false
  let running = false
  const root = () => document.documentElement

  function frame() {
    ticking = false
    const vh = window.innerHeight
    const holeC = vh / 2
    let f = 0
    let nearest = 0
    let nearestDist = Infinity
    for (let i = 0; i < eats.length; i++) {
      const el = eats[i]
      const r = el.getBoundingClientRect()
      const c = r.top + r.height / 2
      const dist = c - holeC
      const e = computeEngulf(dist, vh)
      el.style.transform = `translateY(${e.shift.toFixed(1)}px) scale(${e.scale.toFixed(3)}) rotate(${e.rotate.toFixed(1)}deg)`
      el.style.opacity = e.opacity.toFixed(3)
      el.style.filter = e.blur > 0.25 ? `blur(${e.blur.toFixed(1)}px)` : 'none'
      f = Math.max(f, computeFeed(dist, vh))
      if (Math.abs(dist) < nearestDist) { nearestDist = Math.abs(dist); nearest = i }
    }
    const scrolled = window.scrollY
    const max = Math.max(1, document.documentElement.scrollHeight - vh)
    const p = clamp(scrolled / max, 0, 1)
    feed.value = f
    progress.value = p
    activeScene.value = nearest
    root().style.setProperty('--feed', f.toFixed(3))
    root().style.setProperty('--progress', p.toFixed(4))
    root().style.setProperty('--void-recede', clamp((p - 0.9) / 0.1, 0, 1).toFixed(3))
  }

  function onScroll() {
    if (document.hidden || !running) return
    if (!ticking) { raf = requestAnimationFrame(frame); ticking = true }
  }

  function start() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    running = true
    eats = Array.from(document.querySelectorAll<HTMLElement>(eatSelector))
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    frame()
  }

  function stop() {
    running = false
    removeEventListener('scroll', onScroll)
    removeEventListener('resize', onScroll)
    if (raf) cancelAnimationFrame(raf)
    for (const el of eats) { el.style.transform = ''; el.style.opacity = ''; el.style.filter = '' }
    root().style.removeProperty('--feed')
    root().style.removeProperty('--progress')
    root().style.removeProperty('--void-recede')
  }

  return { progress, feed, activeScene, start, stop } as {
    progress: Ref<number>; feed: Ref<number>; activeScene: Ref<number>; start(): void; stop(): void
  }
}
```

- [ ] **Step 2: Create the fixed stage**

Create `components/home/GargantuaStage.client.vue`:

```vue
<template>
  <div class="gz-stage" aria-hidden="true">
    <Gargantua />
  </div>
</template>

<style scoped>
.gz-stage {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  display: grid;
  place-items: center;
  /* recede as the reel ends (set by useManifesto on :root) */
  transform: scale(calc(1 - var(--void-recede, 0) * 0.22));
  opacity: calc(1 - var(--void-recede, 0) * 0.7);
  transition: opacity 0.4s linear;
}
/* Gargantua sizes itself; keep it centered in the fixed layer rather than the hero. */
.gz-stage :deep(.gz) { position: relative; left: auto; top: auto; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .gz-stage { transform: none; opacity: 0.85; }
}
</style>
```

- [ ] **Step 3: Verify**

- `CI=true pnpm vitest run` (foreground) → green (engulf math tests still pass; no new unit target for the DOM wiring — that is covered by the Task-5 e2e + the Task-4 manual check).
- Grep: `GargantuaStage.client.vue` contains `aria-hidden` and `z-index: 1`; `useManifesto.ts` guards `prefers-reduced-motion` in `start()`, removes both listeners + cancels rAF in `stop()`, and references `computeEngulf`/`computeFeed`.
- No `pnpm dev`/typecheck here.

- [ ] **Step 4: Commit**

```bash
git add composables/useManifesto.ts components/home/GargantuaStage.client.vue
git commit -m "feat(v5): manifesto scroll engine + fixed Gargantua stage"
```

---

### Task 4: The manifesto scenes, content & home rewrite (the visible experience)

Compose the actual home: the fixed stage, the SSR scenes, the engulfed crédo, the proof and the invitation — wired to the engine. This is the checkpoint the owner will see.

**Files:**
- Create: `components/home/ManifestoScene.vue`
- Modify: `pages/index.vue`
- Modify: `i18n/locales/fr.json`, `i18n/locales/en.json`
- Reference: `.superpowers/gargantua-experience.html` (scene rhythm, film-frame spacing)

**Interfaces:**
- `ManifestoScene` — `<ManifestoScene :index="1" :kicker="…" :title="…" />`. Props: `index: number`, `kicker: string`, `title: string`. Renders a full-height `<section class="scene">` centered, whose inner heading block carries `data-eat` (so the engine ingests it). Uses the crédo title as an `<h2>`. SSR: fully present without JS.
- Consumes: `useManifesto` (booted in `pages/index.vue`), `GargantuaStage`, and the retained `FeaturedWork` / `CtaBlock`.

- [ ] **Step 1: Add the copy keys to both locales**

In `i18n/locales/fr.json` and `i18n/locales/en.json`, add a `manifesto` object. FR values:

```json
"manifesto": {
  "hero_eyebrow": "Rostel Panoumassi — Lead Engineering · Cotonou, BJ",
  "hero_title_1": "Du logiciel",
  "hero_title_2": "qui tient.",
  "hero_sub": "Pour les équipes qui n'ont pas le droit à l'erreur.",
  "scroll": "Défiler",
  "credo": {
    "c1": { "k": "01 — Le crédo", "t": "Ce qui casse en production ne prévient jamais." },
    "c2": { "k": "02 — La méthode", "t": "On livre chaque semaine. Ou on ne livre pas." },
    "c3": { "k": "03 — La passation", "t": "Le code que je laisse doit tourner sans moi." },
    "c4": { "k": "04 — L'honnêteté", "t": "Je vous dirai ce qui ne marche pas. Surtout ça." }
  },
  "proof_kicker": "04 — Les preuves"
}
```

EN values (same keys):

```json
"manifesto": {
  "hero_eyebrow": "Rostel Panoumassi — Lead Engineering · Cotonou, BJ",
  "hero_title_1": "Software",
  "hero_title_2": "that holds.",
  "hero_sub": "For teams that cannot afford to fail.",
  "scroll": "Scroll",
  "credo": {
    "c1": { "k": "01 — The creed", "t": "What breaks in production never warns you first." },
    "c2": { "k": "02 — The method", "t": "We ship every week. Or we don't ship." },
    "c3": { "k": "03 — The handover", "t": "The code I leave behind must run without me." },
    "c4": { "k": "04 — The honesty", "t": "I'll tell you what doesn't work. Especially that." }
  },
  "proof_kicker": "04 — The proof"
}
```

Keep valid JSON (commas, escaping). Do not touch existing keys.

- [ ] **Step 2: Create the scene component**

Create `components/home/ManifestoScene.vue`:

```vue
<script setup lang="ts">
defineProps<{ index: number; kicker: string; title: string }>()
</script>

<template>
  <section class="scene">
    <div class="scene__eat" data-eat>
      <p class="scene__kicker">{{ kicker }}</p>
      <h2 class="scene__title">{{ title }}</h2>
    </div>
  </section>
</template>

<style scoped>
.scene { min-height: 100vh; display: grid; place-items: center; padding: 12vh 6vw; text-align: center; }
.scene__eat { will-change: transform, opacity, filter; transform-origin: center center; max-width: 22ch; }
.scene__kicker {
  font-family: theme('fontFamily.mono'); font-size: 0.72rem; letter-spacing: 0.24em;
  text-transform: uppercase; color: var(--accent); margin: 0 0 1.1rem;
}
.scene__title {
  font-family: theme('fontFamily.editorial'); font-weight: 400;
  font-size: clamp(1.9rem, 5.2vw, 3.6rem); line-height: 1.08; letter-spacing: -0.01em;
  color: var(--text); margin: 0; text-wrap: balance; text-shadow: 0 2px 40px rgba(0,0,0,.7);
}
</style>
```

- [ ] **Step 3: Rewrite the home**

Rewrite `pages/index.vue` to compose the manifesto. Keep the entire `<script setup>` SEO block (`useSeoMeta`, `seoDescription`, locale) — only swap the animation booting. Requirements:
- Keep `useI18n`, `useLocalePath`, and the full `useSeoMeta({...})` call verbatim.
- Remove the `bootHomeAnimations`/`bootParallax` import and their `onMounted`/`onBeforeUnmount` usage. Instead:
  ```ts
  const manifesto = useManifesto()
  onMounted(() => manifesto.start())
  onBeforeUnmount(() => manifesto.stop())
  ```
- Template (replace the whole `<template>`):
  ```vue
  <template>
    <div class="home">
      <GargantuaStage />

      <!-- SCENE 0 — thesis (keeps #hero-heading) -->
      <section class="hero" aria-labelledby="hero-heading">
        <div class="hero__inner container-narrow">
          <p class="hero__eyebrow">{{ t('manifesto.hero_eyebrow') }}</p>
          <h1 id="hero-heading" class="hero__title">
            <span>{{ t('manifesto.hero_title_1') }}</span>
            <span class="hero__title--em">{{ t('manifesto.hero_title_2') }}</span>
          </h1>
          <p class="hero__sub">{{ t('manifesto.hero_sub') }}</p>
          <div class="hero__scroll" aria-hidden="true">
            <span>{{ t('manifesto.scroll') }}</span><span class="hero__scroll-arw">↓</span>
          </div>
        </div>
      </section>

      <!-- SCENES 1-4 — the crédo, engulfed -->
      <ManifestoScene :index="1" :kicker="t('manifesto.credo.c1.k')" :title="t('manifesto.credo.c1.t')" />
      <ManifestoScene :index="2" :kicker="t('manifesto.credo.c2.k')" :title="t('manifesto.credo.c2.t')" />
      <ManifestoScene :index="3" :kicker="t('manifesto.credo.c3.k')" :title="t('manifesto.credo.c3.t')" />
      <ManifestoScene :index="4" :kicker="t('manifesto.credo.c4.k')" :title="t('manifesto.credo.c4.t')" />

      <!-- PROOF — the work stands still while the creed is consumed -->
      <FeaturedWork />

      <!-- INVITATION -->
      <CtaBlock />
    </div>
  </template>
  ```
- Scoped styles: give `.hero` `min-height: 100vh; display:grid; place-items:center; position:relative; z-index:2;` (content sits above the z-1 stage). Style `.hero__eyebrow` (mono, amber, letter-spacing), `.hero__title` (editorial/serif per spec — `theme('fontFamily.editorial')`, `clamp(2.8rem, 9vw, 6.5rem)`, line-height ~1), `.hero__title--em` amber, `.hero__sub` (muted, max-width ~32ch), `.hero__scroll` (mono caption + a `bob` arrow, `@media reduce` → no animation). Ensure the home content wrapper stacks above the fixed stage (`.home { position: relative; z-index: 2; }`). Delete all obsolete hero-grid CSS.
- Do NOT reference `HeroStatusCard`, `ApproachBlock`, `LabBlock`, `SplitText`, `MagneticLink` in this file anymore (they may remain imported elsewhere; here they're simply unused).

- [ ] **Step 4: Verify (dev smoke for this task — it's the visible one)**

- `CI=true pnpm vitest run` (foreground) → green.
- Start `pnpm dev`; poll `http://localhost:3000/` until it returns real HTML (first compile may 503 briefly — retry). Confirm in the SSR HTML: `id="hero-heading"` present; all four crédo titles present (e.g. grep the FR strings); `class="gz"` present (Gargantua rendered); the page has no server error. Then `http://localhost:3000/en` shows the EN copy. Stop the dev server when done.
- Manual (human, after commit): scrolling engulfs the crédo blocks and Gargantua flares. (Reduced-motion + full a11y are locked by Task 5.)

- [ ] **Step 5: Commit**

```bash
git add pages/index.vue components/home/ManifestoScene.vue i18n/locales/fr.json i18n/locales/en.json
git commit -m "feat(v5): manifesto home — engulfed crédo scenes, thesis hero, proof + invitation"
```

---

### Task 5: Keep the suite green — e2e for the manifesto (content, a11y, reduced-motion)

The rewrite changes the home copy that `navigation.spec.ts` asserts and needs its own smoke. Update the stale assertions and add a manifesto spec.

**Files:**
- Modify: `tests/e2e/navigation.spec.ts`
- Create: `tests/e2e/manifesto.spec.ts`

- [ ] **Step 1: Update the stale navigation assertions**

Open `tests/e2e/navigation.spec.ts`. Its FR home assertions currently expect `'logiciels fiables'` / `'Travaux récents'` / `'Comment je travaille'` and EN `'reliable software'` — copy that no longer exists. Update ONLY the home-page assertions to the new manifesto copy: FR `h1` contains `'qui tient.'` (and `'Du logiciel'`), EN (`/en`) `h1` contains `'that holds.'`. Leave assertions about other routes (`/work`, `/brief`, nav links) intact — those strings are unchanged. If it asserted `'Comment je travaille'`/`'Travaux récents'` on the home, replace with a crédo line that is now present, e.g. FR `'Ce qui casse en production ne prévient jamais.'`.

- [ ] **Step 2: Write the manifesto smoke spec**

Create `tests/e2e/manifesto.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('the thesis hero heading is present (content independent of the engine)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
})

test('all four crédo scenes render their titles in the DOM (SSR content)', async ({ page }) => {
  await page.goto('/')
  for (const line of [
    'Ce qui casse en production ne prévient jamais.',
    'On livre chaque semaine. Ou on ne livre pas.',
    'Le code que je laisse doit tourner sans moi.',
    'Je vous dirai ce qui ne marche pas. Surtout ça.',
  ]) {
    await expect(page.getByText(line, { exact: false })).toBeVisible()
  }
})

test('the fixed Gargantua stage is present and hidden from assistive tech', async ({ page }) => {
  await page.goto('/')
  const stage = page.locator('.gz-stage')
  await expect(stage).toHaveCount(1)
  await expect(stage).toHaveAttribute('aria-hidden', 'true')
})

test('reduced motion: home renders with no serious/critical a11y violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
})
```

- [ ] **Step 3: Run the e2e**

Run: `pnpm exec playwright test tests/e2e/manifesto.spec.ts tests/e2e/navigation.spec.ts tests/e2e/film.spec.ts`
Expected: all pass. (If a real contrast violation surfaces from a new scene token/usage, fix the offending CSS/token — do NOT weaken the test.) If `@nuxt/content` SQLite flakes, clean `.data/content/contents.sqlite*` via `node -e` and retry.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/manifesto.spec.ts tests/e2e/navigation.spec.ts
git commit -m "test(v5): e2e for the manifesto home + refresh navigation copy assertions"
```

---

## Self-Review

**Spec coverage (against `2026-08-17-portfolio-v5-manifesto-design.md`):**
- §2/§3 wonder from light + motion, Gargantua as centerpiece with real motion → Task 1 (orbital + feed) + Task 3 (fixed stage). ✅
- §5 manifesto scenes (thesis → crédo → preuves → invitation) → Task 4 (hero + `ManifestoScene`×4 + `FeaturedWork` + `CtaBlock`). ✅ (« la méthode » and « ce qui casse » land as crédo scenes c2/c4; the full method/proof-reel expansion + warm→cold + HUD are **Lot 2B**, explicitly out of scope here.)
- §8 SSR content without JS, reduced-motion static, AA, bilingual, `/brief` untouched → Tasks 3 (reduced-motion no-op), 4 (SSR copy in both locales), 5 (a11y + reduced-motion e2e). ✅
- Engulf mechanic (owner-validated prototype) → Tasks 2 (math + tests) + 3 (engine). ✅

**Out of scope (Lot 2B):** warm→cold bascule (`body.is-cold` toggle at the honesty scene — hook already present in Gargantua), the filmic HUD (timecode/progress/skip-to-work), the expanded « méthode/preuves » reel, per-scene slow reveals polish, offscreen-pause perf tuning beyond `document.hidden`.

**Placeholder scan:** none — every step has concrete code, exact paths, or a verbatim reference to the prototype file for the CSS/scroll port.

**Type/name consistency:** `useManifesto` returns `{ progress, feed, activeScene, start, stop }` (Task 3) — consumed as `manifesto.start()/stop()` in Task 4. `computeEngulf`/`computeFeed`/`ingestT`/`clamp` (Task 2) are the exact names imported by the composable (Task 3) and the tests. `[data-eat]` is written by `ManifestoScene` (Task 4) and queried by the default `eatSelector` (Task 3). `--feed` is set by the engine (Task 3), read by Gargantua (Task 1); `--void-recede` set by the engine (Task 3), read by `GargantuaStage` (Task 3). `#hero-heading` preserved (Task 4) and asserted (Task 5). `.gz-stage` produced (Task 3) and asserted (Task 5).
