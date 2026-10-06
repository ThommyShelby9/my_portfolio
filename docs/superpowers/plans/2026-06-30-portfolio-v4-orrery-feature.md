# Portfolio v4 — Orrery Feature (Lots 2-3) Implementation Plan

> **For agentic workers:** implement task-by-task; each task ends with an independently verifiable deliverable. Graphics code is verified by `pnpm typecheck` + the dev server + e2e (no GPU in unit tests); pure logic is verified by Vitest (TDD).

**Goal:** Turn `/work` into the spatial "orrery" — the 11 case studies rendered as generative luminous bodies orbiting a central core, interactive (hover = highlight + label/stat, click = open the case study) — layered as progressive enhancement over the existing SSR list.

**Architecture:** A pure `space/bodies.ts` maps each case study's frontmatter to deterministic body parameters (hue from sector, size from impact, rings from duration, glow from stack). A `space/orrery.ts` Three.js scene factory renders a core + bodies on concentric orbits with raycast hover/click. A client-only `<WorkOrrery>` component mounts that scene on `/work` as an interactive stage above the page's existing DOM list (which stays as SSR/SEO/a11y/no-WebGL fallback). Reuses Lot 1's `resolveQuality` gating and the `space` store's `mode`.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, TypeScript strict, Three.js `^0.184.0` (dynamic import), Pinia, Vitest, Playwright.

## Global Constraints
- Progressive enhancement: `/work` MUST render its full case-study list and pass a11y WITHOUT WebGL. The orrery is a client-only enhancement layer; never required for content or navigation. (verbatim)
- `prefers-reduced-motion: reduce` OR no WebGL OR low-perf → the orrery does not start; the DOM list is the experience. Use `resolveQuality` from `~/space/quality`.
- Three.js dynamically imported only when the orrery actually starts (never SSR/initial bundle).
- Body params are DETERMINISTic from data (seed = slug) — stable across visits/SSR, no `Math.random()`.
- Bodies carry meaning: hue = sector, size = impact, rings = duration, glow = tech-stack breadth.
- DPR capped via `quality.maxDpr`; rAF paused on `document.hidden`; full dispose on destroy; pointer listeners removed.
- Cosmic palette only (flux: emerald `#19c98c`, indigo `#7a5cf0`, magenta `#ff5aaa`, amber `#ffae3b`, violet `#9b86ff`, core `#c9b6ff`).
- Package manager pnpm. Unit tests `pnpm vitest run <file>`.

**Prerequisite:** already on branch `v4-foundations` (continue here).

---

### Task 1: Body parameter mapping (pure, TDD)

**Files:**
- Create: `space/bodies.ts`
- Test: `tests/unit/space/bodies.spec.ts`

**Interfaces — Produces:**
- `interface CaseStudyLike { slug: string; sector: string; duration: string; stack: string[]; featured?: boolean; results?: { value: string; label: string }[] }`
- `interface BodyParams { slug: string; seed: number; color: string; hue: string; size: number; orbitRadius: number; orbitSpeed: number; orbitPhase: number; ringCount: number; glow: number }`
- `function sectorColor(sector: string): string` — keyword→flux-hex (case-insensitive), deterministic.
- `function caseStudyToBody(study: CaseStudyLike, index: number): BodyParams`
- `function buildBodies(studies: CaseStudyLike[]): BodyParams[]`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/space/bodies.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { sectorColor, caseStudyToBody, buildBodies } from '../../../space/bodies'

const sample = {
  slug: 'zenlife', sector: 'Wellness · SaaS', duration: '3 mois (août — octobre 2024)',
  stack: ['Laravel 10', 'Vue 3', 'MySQL', 'TailwindCSS'], featured: false,
  results: [{ value: '1 200+', label: 'users' }],
}

describe('sectorColor', () => {
  it('maps known sector keywords to flux hexes (case-insensitive)', () => {
    expect(sectorColor('Fintech B2B')).toBe('#19c98c')
    expect(sectorColor('Data / AI')).toBe('#7a5cf0')
    expect(sectorColor('Wellness · SaaS')).toBe('#ff5aaa')
    expect(sectorColor('E-commerce')).toBe('#ffae3b')
  })
  it('falls back to violet for unknown sectors', () => {
    expect(sectorColor('Something else')).toBe('#9b86ff')
  })
})

describe('caseStudyToBody', () => {
  it('is deterministic for the same input', () => {
    const a = caseStudyToBody(sample, 3)
    const b = caseStudyToBody(sample, 3)
    expect(a).toEqual(b)
  })
  it('derives sane ranges', () => {
    const p = caseStudyToBody(sample, 3)
    expect(p.slug).toBe('zenlife')
    expect(p.color).toBe('#ff5aaa')
    expect(p.size).toBeGreaterThanOrEqual(0.7)
    expect(p.size).toBeLessThanOrEqual(1.5)
    expect(p.ringCount).toBeGreaterThanOrEqual(0)
    expect(p.ringCount).toBeLessThanOrEqual(3)
    expect(p.glow).toBeGreaterThanOrEqual(0.2)
    expect(p.glow).toBeLessThanOrEqual(1)
    expect(p.orbitRadius).toBeGreaterThan(0)
    expect(p.orbitPhase).toBeGreaterThanOrEqual(0)
    expect(p.orbitPhase).toBeLessThan(Math.PI * 2)
  })
  it('parses duration months into ring count', () => {
    expect(caseStudyToBody({ ...sample, duration: '1 mois' }, 0).ringCount).toBe(0)
    expect(caseStudyToBody({ ...sample, duration: '3 mois' }, 0).ringCount).toBe(1)
    expect(caseStudyToBody({ ...sample, duration: '8 mois' }, 0).ringCount).toBe(2)
    expect(caseStudyToBody({ ...sample, duration: '12 mois' }, 0).ringCount).toBe(3)
  })
})

describe('buildBodies', () => {
  it('maps a list preserving order and assigning increasing orbit radii', () => {
    const bodies = buildBodies([sample, { ...sample, slug: 'ccns', sector: 'Fintech' }])
    expect(bodies.map(b => b.slug)).toEqual(['zenlife', 'ccns'])
    expect(bodies[1].orbitRadius).toBeGreaterThan(bodies[0].orbitRadius)
  })
})
```

- [ ] **Step 2: Run to verify it fails** — `pnpm vitest run tests/unit/space/bodies.spec.ts` → FAIL (module missing).

- [ ] **Step 3: Implement** — Create `space/bodies.ts`:

```ts
export interface CaseStudyLike {
  slug: string
  sector: string
  duration: string
  stack: string[]
  featured?: boolean
  results?: { value: string, label: string }[]
}

export interface BodyParams {
  slug: string
  seed: number
  color: string
  hue: string
  size: number
  orbitRadius: number
  orbitSpeed: number
  orbitPhase: number
  ringCount: number
  glow: number
}

const FLUX = {
  emerald: '#19c98c',
  indigo: '#7a5cf0',
  magenta: '#ff5aaa',
  amber: '#ffae3b',
  violet: '#9b86ff',
}

/** Deterministic 32-bit string hash → unsigned int. */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Keyword → flux hex. Case-insensitive; violet fallback. */
export function sectorColor(sector: string): string {
  const s = sector.toLowerCase()
  if (/fintech|finance|bank|pay|paie|wallet/.test(s)) return FLUX.emerald
  if (/data|\bai\b|\bml\b|analytic|ia\b/.test(s)) return FLUX.indigo
  if (/well|health|care|life|sant|bien/.test(s)) return FLUX.magenta
  if (/commerce|ecom|e-com|retail|shop|boutique|vente/.test(s)) return FLUX.amber
  return FLUX.violet
}

/** First integer found in a duration string ("3 mois (…)" → 3). 0 if none. */
function durationMonths(duration: string): number {
  const m = duration.match(/\d+/)
  return m ? parseInt(m[0], 10) : 0
}

function ringsFromMonths(months: number): number {
  if (months <= 1) return 0
  if (months <= 5) return 1
  if (months <= 9) return 2
  return 3
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

export function caseStudyToBody(study: CaseStudyLike, index: number): BodyParams {
  const seed = hash(study.slug)
  const resultsCount = study.results?.length ?? 1
  const size = clamp(0.8 + (study.featured ? 0.4 : 0) + (resultsCount - 1) * 0.1, 0.7, 1.5)
  const ringCount = ringsFromMonths(durationMonths(study.duration))
  const glow = clamp((study.stack?.length ?? 1) / 6, 0.2, 1)
  const orbitRadius = 2.6 + index * 0.62
  const orbitSpeed = 0.12 / Math.sqrt(orbitRadius) // outer orbits slower
  const orbitPhase = (seed % 360) * (Math.PI / 180)
  return {
    slug: study.slug,
    seed,
    color: sectorColor(study.sector),
    hue: study.sector,
    size,
    orbitRadius,
    orbitSpeed,
    orbitPhase,
    ringCount,
    glow,
  }
}

export function buildBodies(studies: CaseStudyLike[]): BodyParams[] {
  return studies.map((s, i) => caseStudyToBody(s, i))
}
```

- [ ] **Step 4: Run to verify it passes** — `pnpm vitest run tests/unit/space/bodies.spec.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add space/bodies.ts tests/unit/space/bodies.spec.ts
git commit -m "feat(orrery): add generative body-parameter mapping"
```

---

### Task 2: Orrery Three.js scene factory

**Files:**
- Create: `space/orrery.ts`

**Interfaces:**
- Consumes: `BodyParams` from `./bodies`.
- Produces:
  - `interface OrreryHandle { resize: () => void; setPaused: (p: boolean) => void; destroy: () => void }`
  - `interface OrreryOpts { maxDpr: number; onHover: (slug: string | null) => void; onSelect: (slug: string) => void }`
  - `function createOrrery(canvas: HTMLCanvasElement, bodies: BodyParams[], opts: OrreryOpts): Promise<OrreryHandle>`

- [ ] **Step 1: Implement** — Create `space/orrery.ts`. Requirements (implementer writes the Three.js; follow these precisely):
  - `const THREE = await import('three')` (dynamic).
  - `WebGLRenderer({ canvas, antialias: true, alpha: true })`; `setPixelRatio(Math.min(window.devicePixelRatio||1, opts.maxDpr))`; size to the canvas's clientWidth/clientHeight (NOT window — the orrery lives in a sized stage), updated on `resize()`.
  - `PerspectiveCamera(50, w/h, 0.1, 100)` positioned at roughly `(0, 2.5, 11)` looking at origin.
  - A central **core**: an emissive sphere (radius ~0.6) in `#c9b6ff` with an additive glow sprite/halo; gentle pulse.
  - For each body: a `SphereGeometry` (radius `0.18 * params.size`) with `MeshStandardMaterial` (color = params.color, `emissive` = same, `emissiveIntensity` = `0.4 + params.glow`); positioned on its orbit at radius `params.orbitRadius` in the XZ plane using `params.orbitPhase`. Add `params.ringCount` thin `TorusGeometry` rings around the body (slightly tilted). Add a faint full orbit circle (`LineLoop` / `RingGeometry` outline) per body in a low-opacity line color.
  - Lighting: one `PointLight` at the core + low `AmbientLight` so bodies read.
  - Store `userData.slug` on each body mesh for raycasting.
  - Animation loop: advance each body's angle by `params.orbitSpeed * dt`; slow whole-system Y rotation (~0.02 rad/s); subtle core pulse. Use a `Clock` + accumulated `elapsed` (do NOT reset on resume — mirror `space/engine.ts`).
  - Raycasting: on `pointermove` over the canvas, raycast from camera; if a body is hit, scale it up slightly + raise emissiveIntensity and call `opts.onHover(slug)`; when none hit, restore and call `opts.onHover(null)`. Throttle to animation frame (set a flag, resolve in the loop) to avoid per-event raycasts.
  - Click/tap: on `click`, raycast; if a body hit, call `opts.onSelect(slug)`.
  - `setPaused(p)`: stop/start the rAF (and clock).
  - `resize()`: re-read canvas client size, update renderer size + camera aspect + `setPixelRatio` (re-clamp).
  - `destroy()`: set a destroyed flag (guard restart), cancel rAF, remove `pointermove`/`click` listeners, dispose all geometries/materials/the renderer.
  - Keep it dependency-light (no extra Three addons required; if you use `OrbitControls`/post-processing, you may — but it's optional and must still tree-shake from dynamic import). Prefer no controls (it's an ambient orrery, not a free-orbit toy).

- [ ] **Step 2: Verify typecheck** — `pnpm typecheck` → exit 0, no new errors from `space/orrery.ts`. (No unit test — needs a GPU; behavior verified via the component + e2e + dev server.)

- [ ] **Step 3: Commit**

```bash
git add space/orrery.ts
git commit -m "feat(orrery): add three.js orbital scene factory"
```

---

### Task 3: `<WorkOrrery>` client component

**Files:**
- Create: `components/work/WorkOrrery.client.vue`

**Interfaces:**
- Consumes: `buildBodies` from `~/space/bodies`; `createOrrery` (dynamic `import('~/space/orrery')`); `resolveQuality` from `~/space/quality`; `useSpaceStore`, `useWebGLCapability`, `useReducedMotion`, `useLocalePath`, `useRouter` (auto-imports).
- Props: `studies: CaseStudyLike[]` (typed via the `bodies` module's `CaseStudyLike`).

- [ ] **Step 1: Implement** — Create `components/work/WorkOrrery.client.vue`:
  - `<script setup lang="ts">` with `const props = defineProps<{ studies: CaseStudyLike[] }>()` (import the type).
  - A `stage` ref (the sized container) + a `canvas` ref.
  - On mount: compute `quality = resolveQuality({supported, lowPerf, reduce})`; if `!quality.enabled` → do nothing (component still renders its `<div class="orrery__fallback">` hint is NOT needed; the page list is the fallback) and return. Otherwise dynamic-import `createOrrery`, build bodies via `buildBodies(props.studies)`, create the orrery with `onHover` (set a reactive `hovered` slug → show label overlay) and `onSelect` (router.push to `localePath('/work/'+slug)`).
  - Set `space.setMode('orrery')` on mount; restore `space.setMode('ambient')` on unmount.
  - Handle the unmount-during-async-init race (mirror `SpaceCanvas.client.vue`: `unmounted` flag, destroy if set after await).
  - Pause on `visibilitychange`.
  - Template: a `.orrery` stage (`position: relative; height: clamp(420px, 70vh, 760px)`) containing the `<canvas class="orrery__canvas">` (pointer-events: auto) and a hover label overlay (`<div class="orrery__label" v-if="hovered">` showing the hovered study's title + first result). Add `aria-hidden="true"` on the canvas + overlay (decorative; the list below is the accessible content). Provide a small `.orrery__hint` ("Survole · clique" / "Hover · click") for affordance.
  - Cleanup engine on unmount.

- [ ] **Step 2: Verify typecheck** — `pnpm typecheck` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/work/WorkOrrery.client.vue
git commit -m "feat(orrery): add interactive WorkOrrery client component"
```

---

### Task 4: Integrate the orrery into `/work` (enhancement over the list)

**Files:**
- Modify: `pages/work/index.vue`

- [ ] **Step 1: Implement** — In `pages/work/index.vue`:
  - After `<PageHero …/>` and before the filter bar, insert the orrery stage as a client-only enhancement that does NOT affect SSR content:
    ```vue
    <ClientOnly>
      <WorkOrrery :studies="(studies ?? []) as any" />
    </ClientOnly>
    ```
    (Pass the full `studies` list, not the filtered one, so the orbital map is stable; filtering still applies to the DOM list below.)
  - Keep the existing filter chips + DOM list exactly as-is (this remains the SSR/SEO/a11y/no-WebGL experience).
  - Add minimal scoped CSS so the orrery stage has breathing room (e.g. a top/bottom margin) and the section reads as the page's hero-stage. Do not remove or restructure the list.

- [ ] **Step 2: Verify** — `pnpm typecheck` → exit 0. Then with the dev server running, `/work` must still SSR the full list (curl `/work` and confirm the entries are present in HTML, i.e. progressive enhancement intact).

- [ ] **Step 3: Commit**

```bash
git add pages/work/index.vue
git commit -m "feat(orrery): mount the orrery as a progressive-enhancement stage on /work"
```

---

### Task 5: e2e — /work content + orrery fallback

**Files:**
- Create: `tests/e2e/work-orrery.spec.ts`

- [ ] **Step 1: Implement** — Create `tests/e2e/work-orrery.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('work page lists all case studies (SSR, independent of WebGL)', async ({ page }) => {
  await page.goto('/work')
  // The DOM list renders server-side; at least several entries present.
  const entries = page.locator('.work-list .entry')
  await expect(entries.first()).toBeVisible()
  expect(await entries.count()).toBeGreaterThanOrEqual(5)
})

test('reduced motion: /work content renders with no critical a11y violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/work')
  await expect(page.locator('.work-list .entry').first()).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
})
```

- [ ] **Step 2: Run** — `pnpm exec playwright test tests/e2e/work-orrery.spec.ts` → 2/2 pass. (If a real a11y violation surfaces from the orrery label/hint colors, fix the contrast — do not weaken the test.)

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/work-orrery.spec.ts
git commit -m "test(orrery): e2e for /work list + reduced-motion a11y"
```

---

### Task 6 (optional polish): single-body hero on `/work/[slug]`

**Files:**
- Create: `components/work/ProjectBody.client.vue`
- Modify: `components/work/CaseStudyHero.vue` (mount the body beside/behind the title)

- [ ] **Step 1: Implement** — A minimal client-only single-body render (one body from `caseStudyToBody(study, 0)`, slow self-rotation, its rings + glow, no orbit, no raycast), placed in the case-study hero as a decorative accent (`aria-hidden`). Gate on `resolveQuality`; render nothing when disabled. Reuse a trimmed path of `createOrrery` or a small dedicated factory `createProjectBody(canvas, params, {maxDpr})`. Keep it lightweight.

- [ ] **Step 2: Verify** — `pnpm typecheck` → 0; case-study pages still SSR their content; e2e suite green.

- [ ] **Step 3: Commit**

```bash
git add components/work/ProjectBody.client.vue components/work/CaseStudyHero.vue
git commit -m "feat(orrery): project-body accent on case-study hero"
```

## Self-Review
- Spec coverage: §2.3 generative bodies → Task 1; §2.4 orrery scene + hover/click + core → Tasks 2-3; /work integration with DOM fallback → Task 4; SEO/a11y/reduced-motion/no-WebGL fallback → Tasks 3-5; project-body hero (§2.4) → Task 6.
- Non-negotiables: progressive enhancement (list SSR, orrery client-only) → Tasks 4-5; dynamic Three import → Tasks 2-3; deterministic bodies → Task 1; DPR/pause/dispose → Task 2.
- Out of scope (later): camera "dive" cinematic transition into the case study; mobile-tuned simplified orrery; retiring the v3 HeroConstellation on the home.
