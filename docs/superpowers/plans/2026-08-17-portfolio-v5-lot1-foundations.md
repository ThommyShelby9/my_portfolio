# Portfolio v5 « Manifeste » — Lot 1 (Fondations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rip out the rejected v4 WebGL cosmic layer and lay the foundations of the cinematic-dark "Manifeste" direction — new dark-filmic tokens, new typography (Inter + Newsreader + JetBrains Mono, no Poppins), the reusable film-frame + atmosphere primitives, and the CSS/SVG Gargantua black hole — leaving a site that still builds and renders.

**Architecture:** Delete `space/` + the space/orrery Vue components + their tests, and unwire their three usages so nothing dangles. Repaint the global CSS custom-property values (same names) to a warm-ink filmic palette and repoint the Tailwind font families. Add two new client components under `components/film/` — `FilmAtmosphere` (letterbox, vignette, grain, flicker, dust, warm haze) mounted once in the layout, and `Gargantua` (a pure-CSS black hole) placed on the home hero as the first visible proof.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, TypeScript (strict), Tailwind + CSS custom properties, `@nuxt/fonts`, Vitest (happy-dom), Playwright + axe. No WebGL, no Three.js in v5.

**Spec:** `docs/superpowers/specs/2026-08-17-portfolio-v5-manifesto-design.md`

## Global Constraints

- Dark only. No light-mode styling. (spec §3)
- No WebGL / no Three.js anywhere in the new direction; Gargantua and all atmosphere are CSS/SVG only. (spec §2, §7)
- Drop Poppins. Type system = Inter (grotesque display/UI/body) + Newsreader (serif, long-form reading) + JetBrains Mono (data/labels/HUD). (spec §3)
- Palette: ink `#060607`/`#0a0a0b`, warm off-white `#f3efe6`, one warm amber light `#e8b25a`, cold blue `#7fa8d8`. (spec §3)
- Existing CSS custom-property NAMES (`--bg`, `--text`, `--accent`, `--border`, …) must keep resolving — only their VALUES change — so un-rebuilt pages don't reference undefined vars. (spec §8)
- Everything renders + is a11y-clean WITHOUT JS/motion (SSR); `prefers-reduced-motion: reduce` → no animation, static. (spec §8)
- Atmosphere/Gargantua must be cheap CSS (no jank); animations pause when the tab is hidden. (spec §8)
- KEEP `composables/useWebGLCapability.ts` and its unit test — the `/brief` 3D maquette still uses it (out of Lot 1 scope). Do NOT remove it.
- Package manager pnpm. Unit tests: `pnpm vitest run <file>`. Typecheck: `pnpm typecheck`.

**Prerequisite:** Create a dedicated branch off the current `v3-redesign` branch before Task 1, e.g. `git switch -c v5-manifesto`.

---

### Task 1: Remove the v4 WebGL cosmic layer + unwire its usages

Deletes the whole cosmic subsystem and the three places that mount it, leaving a site that typechecks and whose remaining tests pass.

**Files:**
- Delete: `space/bodies.ts`, `space/engine.ts`, `space/orrery.ts`, `space/projectBody.ts`, `space/quality.ts`, `space/shaders/aurora.ts`
- Delete: `components/space/SpaceCanvas.client.vue`, `components/work/WorkOrrery.client.vue`, `components/work/ProjectBody.client.vue`
- Delete: `stores/space.ts`
- Delete tests: `tests/e2e/space-fallback.spec.ts`, `tests/e2e/work-orrery.spec.ts`, `tests/unit/space/aurora.spec.ts`, `tests/unit/space/bodies.spec.ts`, `tests/unit/space/quality.spec.ts`, `tests/unit/stores/space.spec.ts`
- Modify: `layouts/default.vue` (remove `<SpaceCanvas />`)
- Modify: `pages/work/index.vue` (remove the `<ClientOnly><WorkOrrery/></ClientOnly>` block)
- Modify: `components/work/CaseStudyHero.vue` (remove `<ProjectBody :study="study" />`), and if the `study` prop becomes unused, `pages/work/[slug].vue` (remove the `:study` binding to `<CaseStudyHero>`)

- [ ] **Step 1: Delete the cosmic files (tracked, so git-recoverable)**

```bash
git rm space/bodies.ts space/engine.ts space/orrery.ts space/projectBody.ts space/quality.ts space/shaders/aurora.ts \
       components/space/SpaceCanvas.client.vue components/work/WorkOrrery.client.vue components/work/ProjectBody.client.vue \
       stores/space.ts \
       tests/e2e/space-fallback.spec.ts tests/e2e/work-orrery.spec.ts \
       tests/unit/space/aurora.spec.ts tests/unit/space/bodies.spec.ts tests/unit/space/quality.spec.ts tests/unit/stores/space.spec.ts
```

- [ ] **Step 2: Unwire `<SpaceCanvas />` in the layout**

In `layouts/default.vue`, delete the line `    <SpaceCanvas />` (leaving `<CursorAura />`, `<SiteHeader />`, etc.). The template head becomes:

```vue
  <div class="layout">
    <a href="#main-content" class="skip-link">{{ skipLabel }}</a>

    <CursorAura />

    <SiteHeader />
```

- [ ] **Step 3: Unwire `<WorkOrrery>` on /work**

In `pages/work/index.vue`, remove the entire client-only orrery block (the `<ClientOnly>` wrapping `<WorkOrrery :studies="…" />` plus its surrounding `<section class="work-index__orrery">` if present) and its scoped `.work-index__orrery` CSS rule. The DOM list below stays untouched.

- [ ] **Step 4: Unwire `<ProjectBody>` in the case-study hero**

Read `components/work/CaseStudyHero.vue`. Remove the `<ProjectBody :study="study" />` element. Then check whether the `study` prop is still used elsewhere in that component:
- If `study` is now unused, remove it from `defineProps`, remove any `CaseStudyLike` import, and remove the `:study="(study as any)"` binding on `<CaseStudyHero>` in `pages/work/[slug].vue`.
- If `study` is still used, leave the prop.

- [ ] **Step 5: Verify nothing dangles**

Run: `pnpm typecheck`
Expected: exit 0. If it reports an unresolved import of `~/space/*`, `SpaceCanvas`, `WorkOrrery`, `ProjectBody`, or `useSpaceStore`, fix that reference (it means a usage was missed).

Run: `pnpm vitest run`
Expected: PASS — the remaining unit suites (brief, schema, rateLimiter, useFeaturedWork, useTheme, useWebGLCapability, useMaquetteState) all green; the deleted `space`/`stores/space` suites are gone.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(v5): remove the v4 WebGL cosmic layer + unwire its usages"
```

---

### Task 2: Dark-filmic design tokens

Repaint the global palette to warm ink + one amber light, keeping every existing variable name so un-rebuilt pages keep resolving.

**Files:**
- Modify: `assets/css/main.css` (the `:root, [data-theme='dark'], [data-theme='light']` token block, currently lines ~5–51)

- [ ] **Step 1: Replace the token block**

In `assets/css/main.css`, replace the entire comment header + token block (from `/* ===… v4 — Cosmic …` through the closing `}` of the `color-scheme: dark;` rule) with:

```css
/* =========================================================
   v5 — Manifeste (cinematic dark, single palette)
   [data-theme] kept as a no-op alias
   ========================================================= */
:root,
[data-theme='dark'],
[data-theme='light'] {
  /* Surfaces — warm filmic ink */
  --bg: #060607;
  --bg-raised: #0d0d0f;
  --bg-overlay: #141416;
  --bg-paper: #0a0a0b;
  --paper-tint: rgba(243, 239, 230, 0.04);

  /* Ink — warm off-white */
  --text: #f3efe6;
  --text-mute: #b8b3a7;
  --text-soft: #8b877c;

  /* Lines */
  --border: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.17);
  --rule: rgba(255, 255, 255, 0.10);

  /* Accents — the one warm light (amber) + a cold blue for contrast beats */
  --accent: #e8b25a;
  --accent-soft: rgba(232, 178, 90, 0.16);
  --accent-warm: #e8b25a;
  --accent-cool: #7fa8d8;
  --accent-ink: #060607;

  /* Film */
  --amber: #e8b25a;
  --cold: #7fa8d8;
  --dim: #57544c;
  --core: #e8b25a;

  /* Status */
  --available: #7bb872;
  --error: #ff6b8a;
  --success: #7bb872;

  /* Effects */
  --grain-opacity: 0.05;
  --halo: radial-gradient(800px circle at var(--mx, 50%) var(--my, 30%), rgba(232, 178, 90, 0.08), transparent 60%);
  color-scheme: dark;
}
```

(`--core` is kept as an amber alias so any leftover reference from a not-yet-rebuilt component still resolves; `--flux-*` are dropped because only the deleted orrery used them.)

- [ ] **Step 2: Verify no kept file references a now-undefined var**

Run: `pnpm exec grep -rEln "var\(--flux-" components pages || true` (or use the Grep tool for `var\(--flux-`).
Expected: no matches in `components/` or `pages/`. If any match exists, add that variable back into the block as an amber alias.

Run: `pnpm typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add assets/css/main.css
git commit -m "feat(v5): dark-filmic design tokens (warm ink + amber light)"
```

---

### Task 3: Typography — Inter + Newsreader + JetBrains Mono (drop Poppins)

**Files:**
- Modify: `nuxt.config.ts` (the `fonts.families` array)
- Modify: `tailwind.config.ts` (the `fontFamily` block, ~lines 29–35)

- [ ] **Step 1: Load the three families**

In `nuxt.config.ts`, replace the `fonts.families` array with:

```ts
  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Newsreader', provider: 'google', weights: [400, 500], styles: ['normal', 'italic'] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },
```

- [ ] **Step 2: Repoint the Tailwind families**

In `tailwind.config.ts`, replace the `fontFamily` block with:

```ts
      fontFamily: {
        // v5 — Inter (UI/display), Newsreader (reading serif), JetBrains Mono (data)
        display: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        editorial: ['"Newsreader"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: exit 0 (font arrays + config only; no type impact).

- [ ] **Step 4: Commit**

```bash
git add nuxt.config.ts tailwind.config.ts
git commit -m "feat(v5): typography — Inter + Newsreader + JetBrains Mono (drop Poppins)"
```

---

### Task 4: Film-frame + atmosphere primitive

A single client-only component, mounted once in the layout, that paints the cinematic frame (letterbox, vignette, grain, flicker) and the ambient (a faint warm haze + drifting dust). Ported from the validated prototype. All `aria-hidden`, all disabled under reduced-motion.

**Files:**
- Create: `components/film/FilmAtmosphere.client.vue`
- Modify: `layouts/default.vue` (mount `<FilmAtmosphere />` where `<SpaceCanvas />` was)

**Interfaces:**
- Produces: `<FilmAtmosphere />` — auto-imported (Nuxt path-prefix disabled), client-only via the `.client.vue` suffix, no props.

- [ ] **Step 1: Create the component**

Create `components/film/FilmAtmosphere.client.vue`:

```vue
<script setup lang="ts">
const dust = ref<HTMLElement | null>(null)
onMounted(() => {
  // A handful of slow-drifting dust motes, generated so we don't hand-write 14 spans.
  if (!dust.value) return
  const seed = [7, 19, 31, 43, 55, 67, 4, 16, 28, 52, 64, 76, 88, 38]
  for (let i = 0; i < 14; i++) {
    const m = document.createElement('span')
    m.className = 'film-mote'
    m.style.left = `${(seed[i] * 1.3) % 100}%`
    m.style.top = `${18 + ((seed[i] * 2.1) % 72)}%`
    m.style.animationDelay = `${-(seed[i] % 26)}s`
    m.style.animationDuration = `${22 + (seed[i] % 18)}s`
    dust.value.appendChild(m)
  }
})
</script>

<template>
  <div class="film" aria-hidden="true">
    <div ref="dust" class="film-atmos">
      <div class="film-haze" />
    </div>
    <div class="film-bar film-bar--top" />
    <div class="film-bar film-bar--bot" />
    <div class="film-vignette" />
    <div class="film-grain" />
    <div class="film-flicker" />
  </div>
</template>

<style scoped>
.film { position: fixed; inset: 0; z-index: 0; pointer-events: none; }

/* ambient light + dust (behind content) */
.film-atmos { position: absolute; inset: 0; overflow: hidden; }
.film-haze {
  position: absolute; left: 50%; bottom: -40vh; width: 150vw; height: 120vh;
  transform: translateX(-50%); border-radius: 50%; filter: blur(80px);
  background: radial-gradient(circle at 50% 50%, rgba(232,178,90,.12), rgba(232,120,60,.04) 40%, transparent 66%);
  animation: film-swell 30s ease-in-out infinite;
}
@keyframes film-swell {
  0%, 100% { transform: translateX(-50%) translateY(0) scale(1); opacity: .8; }
  50% { transform: translateX(-50%) translateY(-4vh) scale(1.06); opacity: 1; }
}
:deep(.film-mote) {
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: #f3efe6; opacity: 0; filter: blur(.3px); animation: film-float 26s linear infinite;
}
@keyframes film-float {
  0% { transform: translateY(40px); opacity: 0; }
  14% { opacity: .5; } 86% { opacity: .4; }
  100% { transform: translateY(-140px) translateX(28px); opacity: 0; }
}

/* film frame (over content, faint) */
.film-bar { position: fixed; left: 0; right: 0; height: 26px; background: #000; }
.film-bar--top { top: 0; border-bottom: 1px solid var(--border); }
.film-bar--bot { bottom: 0; border-top: 1px solid var(--border); }
.film-vignette {
  position: fixed; inset: 0;
  background: radial-gradient(130% 95% at 50% 42%, transparent 48%, #000000e6 100%);
  animation: film-breathe 16s ease-in-out infinite;
}
@keyframes film-breathe { 0%, 100% { opacity: .92; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
.film-grain {
  position: fixed; inset: -50%; width: 200%; height: 200%; opacity: var(--grain-opacity); mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: film-grain .8s steps(4) infinite;
}
@keyframes film-grain { 0%{transform:translate(0,0)} 25%{transform:translate(-6%,4%)} 50%{transform:translate(4%,-5%)} 75%{transform:translate(-3%,3%)} 100%{transform:translate(2%,-2%)} }
.film-flicker { position: fixed; inset: 0; background: #000; opacity: 0; animation: film-flick 7s steps(1) infinite; }
@keyframes film-flick { 0%,7%,9%,60%,62%,100%{opacity:0} 8%{opacity:.045} 61%{opacity:.06} 85%{opacity:0} 86%{opacity:.035} 87%{opacity:0} }

@media (prefers-reduced-motion: reduce) {
  .film-haze, .film-vignette, .film-grain, .film-flicker { animation: none; }
  :deep(.film-mote) { animation: none; opacity: .3; }
}
</style>
```

- [ ] **Step 2: Mount it in the layout**

In `layouts/default.vue`, add `<FilmAtmosphere />` as the first child inside `.layout` (where `<SpaceCanvas />` used to be), before `<CursorAura />`:

```vue
    <a href="#main-content" class="skip-link">{{ skipLabel }}</a>

    <FilmAtmosphere />
    <CursorAura />
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck` → exit 0.
Then with `pnpm dev`, open `http://localhost:3000`: the page shows the warm ink background, top/bottom letterbox bars, faint grain, and (on the client) drifting dust. Toggle DevTools "prefers-reduced-motion: reduce" → animations stop, page still readable. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add components/film/FilmAtmosphere.client.vue layouts/default.vue
git commit -m "feat(v5): film-frame + atmosphere primitive, mounted in layout"
```

---

### Task 5: Gargantua — the CSS black hole, on the home hero

A pure-CSS/SVG black hole (dark sphere + accretion disk wrapping over/under via the Einstein ring + hot spot + bloom + faint stars), ported from the validated prototype, dropped onto the home hero in place of the old `HeroConstellation`. This is Lot 1's first visible proof; the full manifesto scroll is Lot 2.

**Files:**
- Create: `components/film/Gargantua.vue`
- Delete: `components/ui/HeroConstellation.vue`
- Modify: `pages/index.vue` (replace `<HeroConstellation />` with `<Gargantua />`)

**Interfaces:**
- Produces: `<Gargantua />` — auto-imported, no props, `aria-hidden`. Decorative; contains no accessible content.

- [ ] **Step 1: Create the component**

Create `components/film/Gargantua.vue`:

```vue
<template>
  <div class="gz" aria-hidden="true">
    <div class="gz-stars" />
    <div class="gz-bloom" />
    <div class="gz-disk" />
    <div class="gz-sphere" />
    <div class="gz-ring" />
    <div class="gz-disk-front" />
    <div class="gz-hot" />
  </div>
</template>

<style scoped>
.gz {
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  --d: clamp(300px, 64vh, 660px); width: var(--d); height: var(--d);
  pointer-events: none; transition: filter 2.4s ease;
}
/* warm→cold hook for later scenes */
:global(body.is-cold) .gz { filter: hue-rotate(178deg) saturate(.72) brightness(.82); }

.gz-stars {
  position: absolute; inset: -120%; border-radius: 50%;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.6), transparent),
    radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,.4), transparent),
    radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,.5), transparent),
    radial-gradient(1px 1px at 85% 25%, rgba(255,255,255,.35), transparent),
    radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,.45), transparent);
  opacity: .5;
}
.gz-bloom {
  position: absolute; inset: -70%; border-radius: 50%; filter: blur(56px);
  background: radial-gradient(circle, rgba(240,180,110,.24), rgba(230,120,60,.07) 40%, transparent 62%);
  animation: gz-breath 16s ease-in-out infinite;
}
@keyframes gz-breath { 0%,100%{ opacity:.85; transform:scale(1) } 50%{ opacity:1; transform:scale(1.06) } }
.gz-disk {
  position: absolute; left: -70%; right: -70%; top: 50%; height: 20%; transform: translateY(-50%); filter: blur(4px);
  background: radial-gradient(ellipse 46% 60% at 50% 50%, #fff, rgba(255,235,200,.95) 20%, rgba(250,170,90,.7) 42%, rgba(230,110,55,.2) 60%, transparent 74%);
}
.gz-sphere {
  position: absolute; inset: 0; border-radius: 50%; z-index: 2;
  background: radial-gradient(circle at 50% 50%, rgba(120,100,84,.16), rgba(20,16,14,.92) 46%, #000 66%);
  box-shadow: inset 0 0 60px #000;
}
.gz-ring {
  position: absolute; inset: -9%; border-radius: 50%; z-index: 3;
  filter: blur(2px) drop-shadow(0 0 26px rgba(255,190,120,.6));
  background: radial-gradient(circle, transparent 44%, rgba(255,236,205,.95) 49%, rgba(255,196,132,.55) 54%, rgba(255,150,90,.12) 60%, transparent 66%);
  animation: gz-spin 60s linear infinite;
}
@keyframes gz-spin { to { transform: rotate(360deg); } }
.gz-disk-front {
  position: absolute; left: -70%; right: -70%; top: 50%; height: 20%; transform: translateY(-50%); z-index: 4; filter: blur(4px);
  background: radial-gradient(ellipse 46% 60% at 50% 50%, #fff, rgba(255,235,200,.9) 22%, rgba(250,170,90,.55) 42%, transparent 66%);
  clip-path: inset(50% 0 0 0);
}
.gz-hot {
  position: absolute; left: 63%; top: 50%; width: 15%; height: 15%; transform: translate(-50%,-50%); z-index: 5;
  border-radius: 50%; filter: blur(6px);
  background: radial-gradient(circle, #fff, rgba(255,240,210,.7) 40%, transparent 70%);
}
@media (prefers-reduced-motion: reduce) { .gz-bloom, .gz-ring { animation: none; } }
</style>
```

- [ ] **Step 2: Swap it onto the home hero**

Delete the old constellation and use Gargantua:

```bash
git rm components/ui/HeroConstellation.vue
```

In `pages/index.vue`, replace `<HeroConstellation />` (line ~52) with `<Gargantua />`. Leave the rest of the home as-is (it is fully rebuilt in Lot 2).

- [ ] **Step 3: Verify**

Run: `pnpm typecheck` → exit 0 (no dangling `HeroConstellation`).
With `pnpm dev`, open `/`: a recognizable Gargantua (dark sphere, bright warm ring wrapping over/under, horizontal disk, hot spot, bloom, faint stars) renders behind the hero. Reduced-motion → the ring/bloom stop but it still reads as a black hole. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add components/film/Gargantua.vue pages/index.vue
git commit -m "feat(v5): CSS Gargantua black hole on the home hero"
```

---

### Task 6: e2e — layout renders, film frame present, a11y + reduced-motion

Replaces the deleted `space-fallback` e2e with a foundations smoke test.

**Files:**
- Create: `tests/e2e/film.spec.ts`

- [ ] **Step 1: Write the test**

Create `tests/e2e/film.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('home renders its hero heading (content independent of the film layer)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
})

test('the film atmosphere is present and hidden from assistive tech', async ({ page }) => {
  await page.goto('/')
  const film = page.locator('.film')
  await expect(film).toHaveCount(1)
  await expect(film).toHaveAttribute('aria-hidden', 'true')
})

test('reduced motion: home renders with no critical a11y violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
})
```

- [ ] **Step 2: Run**

Run: `pnpm exec playwright test tests/e2e/film.spec.ts`
Expected: 3/3 pass. (Playwright auto-starts `pnpm dev`; first run may take up to ~240s. If chromium is missing, `pnpm exec playwright install chromium` once.)
If the a11y test surfaces a real contrast violation from the new tokens, fix the offending token/usage — do not weaken the test.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/film.spec.ts
git commit -m "test(v5): e2e for the film layer + reduced-motion a11y"
```

## Self-Review

**Spec coverage (against `2026-08-17-portfolio-v5-manifesto-design.md`):**
- §7 remove the whole v4 WebGL layer + Poppins → Task 1 (files/usages) + Task 3 (Poppins) ✅
- §3 dark-filmic palette → Task 2 ✅
- §3 typography Inter/Newsreader/JetBrains → Task 3 ✅
- §3 film frame (letterbox, vignette, grain, flicker) + atmosphere (haze, dust) → Task 4 ✅
- §3 Gargantua (CSS/SVG, no WebGL), hero centerpiece → Task 5 ✅
- §8 renders without JS/motion; reduced-motion; a11y; content in DOM → Tasks 4–6 (reduced-motion guards, e2e) ✅
- Keep `/brief`, content, i18n, useWebGLCapability → untouched by Lot 1 (explicit constraint) ✅

**Out of scope (later lots):** the home manifesto scroll + scenes + warm→cold JS (Lot 2); the opt-in procedural sound (Lot 3); /work index + case-study cinematic treatment (Lot 4); about/contact/brief/legal/privacy re-skin + the brief 3D-maquette decision (Lot 5).

**Placeholder scan:** none — every step has concrete commands/code.

**Type/name consistency:** `<FilmAtmosphere />` (Task 4) and `<Gargantua />` (Task 5) are the only new component names; both are used exactly as defined. The `body.is-cold` hook in Gargantua is defined here for Lot 2 to toggle; it is inert until then. Token names in Task 2 are a superset of the v4 names minus `--flux-*` (verified unused in kept files in Task 2 Step 2).
