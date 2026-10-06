# Portfolio v4 « Orrery » — Lot 1 (Fondations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the persistent WebGL "space" engine rendering a living aurora ambient background, apply the new cosmic dark-only design tokens, and prove the integration on the home page — with full no-WebGL / reduced-motion fallbacks.

**Architecture:** A single client-only `<SpaceCanvas>` mounted once in the default layout renders a full-screen aurora shader behind all content (`position: fixed`, behind the `z-index: 2` content). A pure `resolveQuality()` decides whether WebGL runs (gated on capability + `prefers-reduced-motion`) and at what DPR; when it doesn't run, a static CSS gradient is the backdrop. A Pinia `space` store holds the scene mode (`ambient` for now) for later lots. Content stays SSR/SSG — the canvas is pure progressive enhancement.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, TypeScript (strict), Three.js `^0.184.0` (dynamic-imported), Pinia (`@pinia/nuxt`), Tailwind + CSS custom properties, Vitest (`happy-dom`), Playwright + axe.

## Global Constraints

- Dark mode only at launch — do NOT add light-mode styling; remove existing `[data-theme='light']` overrides. (verbatim from spec §2.2)
- The editorial serif (Newsreader) is dropped. Type system = Bricolage Grotesque (display) + JetBrains Mono (mono) + Manrope (body). (spec §2.2)
- Content must render and pass a11y WITHOUT WebGL; the canvas is progressive enhancement only. (spec §3.5)
- `prefers-reduced-motion: reduce` → no WebGL loop, static gradient. (spec §3.5)
- WebGL absent / unsupported → static CSS gradient, zero Three.js loaded. (spec §3.5)
- Three.js MUST be dynamically imported (never in the initial bundle / SSR). (spec §3.5)
- DPR capped (≈1.5–1.75 desktop, 1 on low-perf). rAF paused when `document.hidden`. (spec §3.5)
- Reuse existing composables `useWebGLCapability`, `useReducedMotion`; do not duplicate them. (spec §2.5)
- Existing CSS custom-property NAMES (`--bg`, `--text`, `--accent`, …) must keep resolving — only their values change — so un-rehabbed pages don't break. (spec §3.7)
- Package manager is **pnpm**. Run unit tests with `pnpm vitest run <file>`.

**Prerequisite:** Create a dedicated branch off the current `v3-redesign` branch before Task 1, e.g. `git switch -c v4-foundations`. (If using a worktree via superpowers:using-git-worktrees, this is already handled.)

---

### Task 1: Quality resolver (pure gating logic)

The single source of truth deciding whether the WebGL engine runs and at what DPR. Pure function → fully unit-testable, no DOM.

**Files:**
- Create: `space/quality.ts`
- Test: `tests/unit/space/quality.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface Capability { supported: boolean; lowPerf: boolean; reduce: boolean }`
  - `interface QualitySettings { enabled: boolean; maxDpr: number }`
  - `function resolveQuality(cap: Capability): QualitySettings`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/space/quality.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { resolveQuality } from '../../../space/quality'

describe('resolveQuality', () => {
  it('disables WebGL when unsupported', () => {
    expect(resolveQuality({ supported: false, lowPerf: false, reduce: false }))
      .toEqual({ enabled: false, maxDpr: 1 })
  })

  it('disables WebGL when reduced motion is requested', () => {
    expect(resolveQuality({ supported: true, lowPerf: false, reduce: true }))
      .toEqual({ enabled: false, maxDpr: 1 })
  })

  it('enables at full DPR on a capable device', () => {
    expect(resolveQuality({ supported: true, lowPerf: false, reduce: false }))
      .toEqual({ enabled: true, maxDpr: 1.75 })
  })

  it('enables but caps DPR to 1 on low-perf devices', () => {
    expect(resolveQuality({ supported: true, lowPerf: true, reduce: false }))
      .toEqual({ enabled: true, maxDpr: 1 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/space/quality.spec.ts`
Expected: FAIL — `Failed to resolve import "../../../space/quality"` (file does not exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `space/quality.ts`:

```ts
export interface Capability {
  supported: boolean
  lowPerf: boolean
  reduce: boolean
}

export interface QualitySettings {
  enabled: boolean
  maxDpr: number
}

/**
 * Single source of truth for whether the WebGL space engine runs and at
 * what device-pixel-ratio cap. Pure — no DOM, no side effects.
 */
export function resolveQuality(cap: Capability): QualitySettings {
  if (!cap.supported || cap.reduce) {
    return { enabled: false, maxDpr: 1 }
  }
  return { enabled: true, maxDpr: cap.lowPerf ? 1 : 1.75 }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/space/quality.spec.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add space/quality.ts tests/unit/space/quality.spec.ts
git commit -m "feat(space): add WebGL quality/gating resolver"
```

---

### Task 2: Pinia `space` store (scene state)

Holds the current scene mode and whether the engine is live. Trivial now (`ambient` only), but it is the pilot point that Lots 3–4 will drive from the route.

**Files:**
- Create: `stores/space.ts`
- Test: `tests/unit/stores/space.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type SpaceMode = 'ambient' | 'orrery' | 'focus'`
  - `useSpaceStore()` → state `{ mode: SpaceMode; enabled: boolean }`, actions `setMode(m: SpaceMode): void`, `setEnabled(v: boolean): void`. Default state `{ mode: 'ambient', enabled: false }`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/stores/space.spec.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSpaceStore } from '../../../stores/space'

describe('space store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to ambient mode, disabled', () => {
    const store = useSpaceStore()
    expect(store.mode).toBe('ambient')
    expect(store.enabled).toBe(false)
  })

  it('updates mode', () => {
    const store = useSpaceStore()
    store.setMode('orrery')
    expect(store.mode).toBe('orrery')
  })

  it('updates enabled flag', () => {
    const store = useSpaceStore()
    store.setEnabled(true)
    expect(store.enabled).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/stores/space.spec.ts`
Expected: FAIL — cannot resolve `../../../stores/space`.

- [ ] **Step 3: Write minimal implementation**

Create `stores/space.ts`:

```ts
import { defineStore } from 'pinia'

export type SpaceMode = 'ambient' | 'orrery' | 'focus'

interface SpaceState {
  mode: SpaceMode
  enabled: boolean
}

/**
 * Scene state for the WebGL space layer. `mode` is driven by the route in
 * later lots (ambient = home, orrery = /work, focus = /work/[slug]).
 * `enabled` mirrors whether the engine actually started (capability + motion).
 */
export const useSpaceStore = defineStore('space', {
  state: (): SpaceState => ({ mode: 'ambient', enabled: false }),
  actions: {
    setMode(m: SpaceMode) {
      this.mode = m
    },
    setEnabled(v: boolean) {
      this.enabled = v
    },
  },
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/stores/space.spec.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add stores/space.ts tests/unit/stores/space.spec.ts
git commit -m "feat(space): add pinia scene store (ambient mode)"
```

---

### Task 3: Aurora shader module

The GLSL for the breathing aurora background, exported as plain strings so the engine can feed them to a `ShaderMaterial`. A smoke test guards the contract (required uniforms/outputs present).

**Files:**
- Create: `space/shaders/aurora.ts`
- Test: `tests/unit/space/aurora.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `export const vertexShader: string`, `export const fragmentShader: string`. The fragment declares `uniform float uTime;` and writes `gl_FragColor`. The vertex writes `gl_Position` and a `varying vec2 vUv`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/space/aurora.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { vertexShader, fragmentShader } from '../../../space/shaders/aurora'

describe('aurora shader', () => {
  it('vertex shader sets gl_Position and a vUv varying', () => {
    expect(vertexShader).toContain('gl_Position')
    expect(vertexShader).toContain('vUv')
  })

  it('fragment shader animates on uTime and writes gl_FragColor', () => {
    expect(fragmentShader).toContain('uniform float uTime')
    expect(fragmentShader).toContain('gl_FragColor')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/space/aurora.spec.ts`
Expected: FAIL — cannot resolve `../../../space/shaders/aurora`.

- [ ] **Step 3: Write minimal implementation**

Create `space/shaders/aurora.ts`:

```ts
// Full-screen aurora/plasma background. Cosmic ink base with slow flux of
// indigo → emerald → magenta. Drives off uTime; cheap value-noise FBM so it
// stays light on low-end GPUs.

export const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const fragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0;
  float t = uTime * 0.04;

  float n = fbm(p + vec2(t, t * 0.6) + fbm(p * 1.5 - t));

  vec3 ink     = vec3(0.027, 0.024, 0.071);
  vec3 indigo  = vec3(0.478, 0.361, 0.941);
  vec3 emerald = vec3(0.098, 0.788, 0.549);
  vec3 magenta = vec3(1.000, 0.353, 0.667);

  vec3 col = ink;
  col = mix(col, indigo,  smoothstep(0.35, 0.85, n) * 0.55);
  col = mix(col, emerald, smoothstep(0.55, 0.95, fbm(p * 1.2 + t)) * 0.18);
  col = mix(col, magenta, smoothstep(0.60, 1.00, fbm(p * 0.8 - t * 0.7)) * 0.12);

  float vignette = smoothstep(1.2, 0.2, length(uv - 0.5));
  col = mix(ink, col, vignette);

  gl_FragColor = vec4(col, 1.0);
}
`
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/space/aurora.spec.ts`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add space/shaders/aurora.ts tests/unit/space/aurora.spec.ts
git commit -m "feat(space): add aurora background shader"
```

---

### Task 4: WebGL engine

Wraps Three.js: a full-screen plane with the aurora `ShaderMaterial`, an rAF loop driving `uTime`, resize handling, DPR cap, pause, and clean teardown. Three.js is dynamic-imported here so it never enters the SSR/initial bundle. Verified by typecheck (it needs a real GPU to render, so behaviour is covered by the e2e/manual path in Task 8).

**Files:**
- Create: `space/engine.ts`

**Interfaces:**
- Consumes: `QualitySettings` from `./quality` (Task 1); `vertexShader`, `fragmentShader` from `./shaders/aurora` (Task 3).
- Produces:
  - `interface SpaceEngine { resize(): void; setPaused(paused: boolean): void; destroy(): void }`
  - `function createSpaceEngine(canvas: HTMLCanvasElement, quality: QualitySettings): Promise<SpaceEngine>`

- [ ] **Step 1: Write the implementation**

Create `space/engine.ts`:

```ts
import type { QualitySettings } from './quality'
import { vertexShader, fragmentShader } from './shaders/aurora'

export interface SpaceEngine {
  resize: () => void
  setPaused: (paused: boolean) => void
  destroy: () => void
}

/**
 * Boots the ambient aurora scene on the given canvas. Three.js is loaded
 * dynamically so it stays out of the SSR/initial bundle. Caller is
 * responsible for only invoking this when `quality.enabled` is true.
 */
export async function createSpaceEngine(
  canvas: HTMLCanvasElement,
  quality: QualitySettings,
): Promise<SpaceEngine> {
  const THREE = await import('three')

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr))
  renderer.setSize(window.innerWidth, window.innerHeight, false)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  }

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
  const geometry = new THREE.PlaneGeometry(2, 2)
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const clock = new THREE.Clock()
  let raf = 0

  function render() {
    uniforms.uTime.value = clock.getElapsedTime()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(render)
  }

  function start() {
    if (!raf) {
      clock.start()
      raf = requestAnimationFrame(render)
    }
  }

  function stop() {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
  }

  function setPaused(paused: boolean) {
    if (paused) stop()
    else start()
  }

  window.addEventListener('resize', resize, { passive: true })
  start()

  function destroy() {
    stop()
    window.removeEventListener('resize', resize)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }

  return { resize, setPaused, destroy }
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS — no type errors introduced by `space/engine.ts` (Three.js types come from `@types/three`, already a devDependency).

- [ ] **Step 3: Commit**

```bash
git add space/engine.ts
git commit -m "feat(space): add three.js aurora engine (dynamic import)"
```

---

### Task 5: `<SpaceCanvas>` client component

The mount point. Gates on capability + reduced motion via `resolveQuality`, reflects the result into the store, lazy-loads the engine only when enabled, pauses on tab hide, and tears down cleanly. The `.space-bg` element carries the static gradient fallback so something correct always paints, even with no WebGL.

**Files:**
- Create: `components/space/SpaceCanvas.client.vue`

**Interfaces:**
- Consumes: `resolveQuality` (Task 1); `createSpaceEngine` (Task 4); `useSpaceStore` (Task 2); auto-imported `useWebGLCapability`, `useReducedMotion`.
- Produces: a component auto-imported as `<SpaceCanvas />` (path-prefix disabled in `nuxt.config.ts`). Client-only by the `.client.vue` suffix.

- [ ] **Step 1: Write the implementation**

Create `components/space/SpaceCanvas.client.vue`:

```vue
<script setup lang="ts">
import { resolveQuality } from '~/space/quality'
import type { SpaceEngine } from '~/space/engine'

const { supported, lowPerf } = useWebGLCapability()
const { reduce } = useReducedMotion()
const space = useSpaceStore()

const canvas = ref<HTMLCanvasElement | null>(null)
let engine: SpaceEngine | null = null
let onVisibility: (() => void) | null = null

onMounted(async () => {
  const quality = resolveQuality({
    supported: supported.value,
    lowPerf: lowPerf.value,
    reduce: reduce.value,
  })
  space.setEnabled(quality.enabled)

  if (!quality.enabled || !canvas.value) return

  const { createSpaceEngine } = await import('~/space/engine')
  engine = await createSpaceEngine(canvas.value, quality)

  onVisibility = () => engine?.setPaused(document.hidden)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  engine?.destroy()
  engine = null
})
</script>

<template>
  <div class="space-bg" aria-hidden="true">
    <canvas ref="canvas" class="space-bg__canvas" />
  </div>
</template>

<style scoped>
.space-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* Static fallback: painted whenever the canvas is absent/transparent
     (no WebGL, reduced motion, or before the engine boots). */
  background:
    radial-gradient(80% 70% at 20% 25%, rgba(25, 201, 140, 0.10), transparent 60%),
    radial-gradient(70% 80% at 85% 20%, rgba(122, 92, 240, 0.18), transparent 60%),
    radial-gradient(90% 90% at 60% 100%, rgba(255, 90, 170, 0.08), transparent 60%),
    var(--bg);
}
.space-bg__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS — no new errors. (`useWebGLCapability`, `useReducedMotion`, `useSpaceStore`, `ref`, `onMounted`, `onBeforeUnmount` are Nuxt auto-imports.)

- [ ] **Step 3: Commit**

```bash
git add components/space/SpaceCanvas.client.vue
git commit -m "feat(space): add SpaceCanvas mount with fallback + tab-hide pause"
```

---

### Task 6: Cosmic dark-only tokens, fonts, and serif removal

Re-skin the design system: replace the warm "editorial atelier" palette with the cosmic dark palette (same variable NAMES so nothing breaks), delete the light-theme overrides, drop Newsreader, and repoint the now-orphaned `editorial` font slot to the display family. Includes the minimal home-hero touch that proves the new identity.

**Files:**
- Modify: `assets/css/main.css:9-74` (the `:root,[data-theme='dark']` block and the `[data-theme='light']` block)
- Modify: `assets/css/main.css:281-285` (`.editorial` utility)
- Modify: `tailwind.config.ts:31` (the `editorial` font family)
- Modify: `nuxt.config.ts:165-172` (`fonts.families` — remove Newsreader)
- Modify: `types/theme.ts` (`THEME_DEFAULT`)
- Modify: `pages/index.vue:219-227` (hero `--em` line: serif italic → display)

- [ ] **Step 1: Replace the dark palette and delete the light block**

In `assets/css/main.css`, replace the whole block from `:root,` (line 9) through the closing `}` of `[data-theme='light']` (line 74) with:

```css
:root,
[data-theme='dark'],
[data-theme='light'] {
  /* Surfaces — cosmic ink */
  --bg: #070612;
  --bg-raised: #0e0c1e;
  --bg-overlay: #151229;
  --bg-paper: #100d22;
  --paper-tint: rgba(201, 182, 255, 0.04);

  /* Ink */
  --text: #e9e6f7;
  --text-mute: #b3aed0;
  --text-soft: #7d77a0;

  /* Lines */
  --border: #1a1730;
  --border-strong: #272243;
  --rule: rgba(201, 182, 255, 0.12);

  /* Accents — luminous violet + flux */
  --accent: #9b86ff;
  --accent-soft: rgba(155, 134, 255, 0.16);
  --accent-warm: #ff5aaa;
  --accent-cool: #19c98c;
  --accent-ink: #070612;

  /* Flux palette (used by generative bodies in Lot 2) */
  --flux-emerald: #19c98c;
  --flux-indigo: #7a5cf0;
  --flux-magenta: #ff5aaa;
  --core: #c9b6ff;

  /* Status */
  --available: #19c98c;
  --error: #ff6b8a;
  --success: #19c98c;

  /* Effects */
  --grain-opacity: 0.04;
  --halo: radial-gradient(800px circle at var(--mx, 50%) var(--my, 30%), rgba(155, 134, 255, 0.10), transparent 60%);
  color-scheme: dark;
}
```

- [ ] **Step 2: Repoint the `.editorial` utility to the display font**

In `assets/css/main.css`, replace the `.editorial` rule (was lines 281-285):

```css
.editorial {
  font-family: theme('fontFamily.display');
  font-weight: 500;
  font-style: normal;
}
```

- [ ] **Step 3: Repoint the Tailwind `editorial` family**

In `tailwind.config.ts`, change the `editorial` entry (line 31) from the Newsreader/serif stack to the display stack:

```ts
        editorial: ['"Bricolage Grotesque"', 'Inter', '-apple-system', 'sans-serif'],
```

- [ ] **Step 4: Remove Newsreader from the font loader**

In `nuxt.config.ts`, delete the Newsreader line from `fonts.families` so the block reads:

```ts
  fonts: {
    families: [
      { name: 'Bricolage Grotesque', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'Manrope', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },
```

- [ ] **Step 5: Default the theme to dark**

In `types/theme.ts`, change the default:

```ts
export const THEME_DEFAULT: ThemeMode = 'dark'
```

- [ ] **Step 6: Re-skin the hero accent line (serif italic → display)**

In `pages/index.vue`, replace the `.hero__title-line--em` rule (lines 219-227) with:

```css
.hero__title-line--em {
  font-family: theme('fontFamily.display');
  font-weight: 500;
  font-style: normal;
  font-size: clamp(3rem, 8.5vw, 8rem);
  color: var(--accent);
  letter-spacing: -0.04em;
  line-height: 0.96;
}
```

- [ ] **Step 7: Verify build artifacts regenerate and types still pass**

Run: `pnpm typecheck`
Expected: PASS — no type errors. (Token values are CSS-only; the TS changes are a string literal and a font-array edit.)

- [ ] **Step 8: Commit**

```bash
git add assets/css/main.css tailwind.config.ts nuxt.config.ts types/theme.ts pages/index.vue
git commit -m "feat(design): cosmic dark-only tokens, drop Newsreader serif"
```

---

### Task 7: Mount the space layer in the layout

Swap the old `<AmbientBackground>` (halo + grain) for `<SpaceCanvas>` so the aurora is the new ambient backdrop across every page, while keeping `<CursorAura>`.

**Files:**
- Modify: `layouts/default.vue:10`

**Interfaces:**
- Consumes: `<SpaceCanvas>` (Task 5).

- [ ] **Step 1: Replace the ambient background**

In `layouts/default.vue`, replace line 10 (`<AmbientBackground />`) with:

```vue
    <SpaceCanvas />
```

The template head becomes:

```vue
  <div class="layout">
    <a href="#main-content" class="skip-link">{{ skipLabel }}</a>

    <SpaceCanvas />
    <CursorAura />

    <SiteHeader />
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS. (`<SpaceCanvas>` and `<CursorAura>` are auto-imported components.)

- [ ] **Step 3: Manual smoke check**

Run: `pnpm dev` then open `http://localhost:3000`.
Expected: a dark cosmic background with a slowly shifting aurora behind the home hero; the hero title "Du logiciel / qui tient." renders in the display font with the violet accent line; no console errors. Toggle OS reduced-motion (or DevTools → Rendering → "Emulate prefers-reduced-motion: reduce") and reload — the background is the static gradient, no animation, content unchanged. Stop the server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add layouts/default.vue
git commit -m "feat(space): mount SpaceCanvas as the global ambient layer"
```

---

### Task 8: e2e — content & fallback survive without motion

Locks the non-negotiables: the home content renders and stays accessible, the space layer is present and `aria-hidden`, and the reduced-motion path renders fine.

**Files:**
- Create: `tests/e2e/space-fallback.spec.ts`

**Interfaces:**
- Consumes: the running app (Playwright `webServer` runs `pnpm dev` at `http://localhost:3000`).

- [ ] **Step 1: Write the test**

Create `tests/e2e/space-fallback.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('home renders the hero heading independent of WebGL', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
})

test('space layer exists and is hidden from assistive tech', async ({ page }) => {
  await page.goto('/')
  const space = page.locator('.space-bg')
  await expect(space).toHaveCount(1)
  await expect(space).toHaveAttribute('aria-hidden', 'true')
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('content + fallback render with no critical a11y violations', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#hero-heading')).toBeVisible()
    await expect(page.locator('.space-bg')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run the test**

Run: `pnpm exec playwright test tests/e2e/space-fallback.spec.ts`
Expected: PASS (3 passed). Playwright auto-starts `pnpm dev`; first run may take up to ~120s for the dev server to boot.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/space-fallback.spec.ts
git commit -m "test(space): e2e for content + reduced-motion fallback"
```

---

## Self-Review

**Spec coverage (against `2026-06-29-portfolio-v4-orrery-design.md` §3):**
- §3.2 tokens + typography (dark-only, drop serif) → Task 6 ✅
- §3.3 `<SpaceCanvas>` client-only, mounted once, fixed behind content → Task 5 + Task 7 ✅
- §3.3 `space/engine.ts` (lazy Three, ambient plane + ShaderMaterial, resize, DPR cap, destroy) → Task 4 ✅
- §3.3 aurora shader → Task 3 ✅
- §3.3 `stores/space.ts` (mode `ambient`, enabled) → Task 2 ✅
- §3.3 fonts: drop Newsreader → Task 6 ✅
- §3.3 home hero on new tokens → Task 6 (hero `--em`) + Task 7 (smoke) ✅
- §3.4 control flow (layout mounts once → gate → lazy engine → fallback → tab-hide pause) → Task 5 + Task 7 ✅
- §3.5 fallbacks: no-WebGL/reduced-motion static gradient, SSR-safe, dynamic Three import, DPR cap, rAF pause → Task 1 (gate), Task 4 (DPR/pause/dynamic import), Task 5 (`.client` + fallback) ✅
- §3.6 tests: Vitest store + gating + shader; Playwright + axe fallback → Tasks 1–3, 8 ✅. Non-regression of existing routes → covered by `pnpm typecheck` + existing e2e suite remaining green.

**Placeholder scan:** none — every code/test step contains complete content.

**Type consistency:** `Capability`/`QualitySettings` (Task 1) consumed unchanged by `resolveQuality` calls in Task 5 and `createSpaceEngine` in Task 4. `SpaceEngine` (Task 4) is the type held in Task 5. `SpaceMode` + `useSpaceStore` shape (Task 2) match the store usage in Task 5 (`space.setEnabled`). `vertexShader`/`fragmentShader` names (Task 3) match the import in Task 4. ✅

**Out of scope (deferred to later lots, per spec §3.2):** generative project bodies + sector→hue table (Lot 2), the `/work` orrery and camera transitions (Lot 3), case-study pages and remaining re-skin (Lot 4), `/brief` re-skin + final polish (Lot 5), light mode.
