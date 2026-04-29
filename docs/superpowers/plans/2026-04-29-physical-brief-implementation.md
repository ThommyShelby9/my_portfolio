# Physical Brief — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer `/brief` en expérience 3D blueprint où chaque réponse révèle une pièce wireframe d'une maquette qui se construit en parallèle du form, avec un step 5 d'inspection orbit avant submit.

**Architecture:** Additif côté frontend uniquement. Le composable `useBriefForm` reste source de vérité. Une couche 3D (`BriefMaquette3D` + Scene/Pieces) lit le state via un computed (`useMaquetteState`) et anime en réaction. Capability gating (WebGL + perf + viewport ≥ 768) avec fallback gracieux vers form pleine largeur. Step 5 ajoute un écran récap + inspection orbit avant `submit()`. Mini-maquette tournante sur `/brief/confirmation` via snapshot sessionStorage.

**Tech Stack:** Nuxt 3 + Vue 3 + TypeScript (existant). Ajout : `@tresjs/nuxt`, `@tresjs/cientos`, `@tresjs/rapier` (TresJS = équivalent Vue de React Three Fiber, basé sur Three.js et Rapier WASM). Tests : Vitest (unit) + Playwright (e2e).

**Spec source :** `docs/superpowers/specs/2026-04-28-physical-brief-design.md`

---

## File Structure

**New files:**
- `composables/useWebGLCapability.ts` — détection WebGL + perf, mémoïsé module-level
- `composables/useMaquetteState.ts` — computed `PieceSpec[]` dérivé de `useBriefForm().state`
- `components/brief/BriefMaquette3D.vue` — wrapper ClientOnly + capability gate + dynamic import
- `components/brief/BriefStep5Review.vue` — récap textuel + boutons step 5 (côté form)
- `components/brief/maquette/Scene.vue` — `<TresCanvas>` + lights + camera + grid + `<RapierWorld>`
- `components/brief/maquette/Piece.vue` — pièce wireframe générique (LineSegments + reveal anim)
- `components/brief/maquette/Pieces/ProjectTypePiece.vue`
- `components/brief/maquette/Pieces/ContextPiece.vue`
- `components/brief/maquette/Pieces/FramePiece.vue`
- `components/brief/maquette/Pieces/IdentityPiece.vue`
- `components/brief/maquette/PitchTag.vue` — étiquette suspendue (cientos `<Html>`)
- `components/brief/maquette/Annotations.vue` — labels mono "N1, SCALE 1:50"
- `components/brief/maquette/OrbitInspector.vue` — OrbitControls + raycast hover (step 5 only)
- `tests/unit/composables/useWebGLCapability.spec.ts`
- `tests/unit/composables/useMaquetteState.spec.ts`
- `tests/e2e/brief-3d.spec.ts`

**Modified files:**
- `package.json` — deps TresJS
- `nuxt.config.ts` — module `@tresjs/nuxt`
- `types/brief.ts` — `TOTAL_BRIEF_STEPS = 5`, `BriefStep = 1|2|3|4|5`
- `composables/useBriefForm.ts` — snapshot sessionStorage avant `clearDraft()`
- `components/brief/BriefForm.vue` — render `BriefStep5Review` quand step === 5
- `components/brief/BriefStepNav.vue` — adaptation logique last-step pour step 5
- `pages/brief/index.vue` — layout split desktop / stack mobile
- `pages/brief/confirmation.vue` — mini-maquette display-only

---

## Task 1: Installer TresJS et configurer le module Nuxt

**Files:**
- Modify: `package.json` (deps)
- Modify: `nuxt.config.ts:12-23` (modules array)

- [ ] **Step 1: Installer les dépendances TresJS**

```bash
pnpm add @tresjs/nuxt @tresjs/cientos @tresjs/rapier three
pnpm add -D @types/three
```

- [ ] **Step 2: Ajouter le module à `nuxt.config.ts`**

Modifier la liste `modules` pour ajouter `'@tresjs/nuxt'` après `'nuxt-security'` :

```ts
modules: [
  '@nuxtjs/tailwindcss',
  '@nuxt/fonts',
  '@nuxt/image',
  '@nuxt/content',
  '@nuxtjs/i18n',
  '@vueuse/nuxt',
  '@pinia/nuxt',
  '@nuxtjs/sitemap',
  '@nuxtjs/robots',
  'nuxt-security',
  '@tresjs/nuxt',
],
```

- [ ] **Step 3: Vérifier que le dev server boot**

Run: `pnpm dev`
Expected: Nuxt démarre sans erreur, page `/brief` s'affiche encore avec le form actuel (la 3D pas encore intégrée).
Stop le server (Ctrl+C).

- [ ] **Step 4: Vérifier que typecheck passe**

Run: `pnpm typecheck`
Expected: PASS (pas de nouvelle erreur).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml nuxt.config.ts
git commit -m "chore: add tresjs/nuxt + cientos + rapier for physical brief 3D"
```

---

## Task 2: Étendre `types/brief.ts` à 5 étapes

**Files:**
- Modify: `types/brief.ts:5-6`

- [ ] **Step 1: Mettre à jour les constantes de step**

Remplacer le contenu de `types/brief.ts` :

```ts
export type {
  BriefInput,
} from '~/server/utils/schemas/brief'

export type BriefStep = 1 | 2 | 3 | 4 | 5
export const TOTAL_BRIEF_STEPS = 5 as const

export const BRIEF_LOCALSTORAGE_KEY = 'rostel_portfolio_brief_draft_v1'
```

- [ ] **Step 2: Vérifier que le typecheck capte les usages cassés**

Run: `pnpm typecheck`
Expected: PASS. (Les usages actuels de `BriefStep` restent valides — `1 | 2 | 3 | 4` est un sous-type de `1 | 2 | 3 | 4 | 5`.)

- [ ] **Step 3: Commit**

```bash
git add types/brief.ts
git commit -m "feat(brief): bump TOTAL_BRIEF_STEPS to 5 for inspection step"
```

---

## Task 3: Composable `useWebGLCapability` — TDD

**Files:**
- Create: `composables/useWebGLCapability.ts`
- Test: `tests/unit/composables/useWebGLCapability.spec.ts`

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `tests/unit/composables/useWebGLCapability.spec.ts` :

```ts
import { describe, expect, it, beforeEach, vi } from 'vitest'

beforeEach(() => {
  // reset module-level memoization between tests
  vi.resetModules()
})

describe('useWebGLCapability', () => {
  it('returns supported=true when webgl2 context is available', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) => {
      if (kind === 'webgl2') return {} as any
      return null
    }) as any
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true })
    Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true })

    const { useWebGLCapability } = await import('~/composables/useWebGLCapability')
    const cap = useWebGLCapability()
    expect(cap.supported.value).toBe(true)
    expect(cap.lowPerf.value).toBe(false)
  })

  it('falls back to webgl when webgl2 missing', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) => {
      if (kind === 'webgl') return {} as any
      return null
    }) as any
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true })

    const { useWebGLCapability } = await import('~/composables/useWebGLCapability')
    expect(useWebGLCapability().supported.value).toBe(true)
  })

  it('returns supported=false when no webgl context', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any

    const { useWebGLCapability } = await import('~/composables/useWebGLCapability')
    expect(useWebGLCapability().supported.value).toBe(false)
  })

  it('flags lowPerf=true when hardwareConcurrency < 4', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({}) as any) as any
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, configurable: true })

    const { useWebGLCapability } = await import('~/composables/useWebGLCapability')
    expect(useWebGLCapability().lowPerf.value).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests pour vérifier qu'ils échouent**

Run: `pnpm vitest run tests/unit/composables/useWebGLCapability.spec.ts`
Expected: FAIL — `Cannot find module '~/composables/useWebGLCapability'`.

- [ ] **Step 3: Implémenter le composable**

Créer `composables/useWebGLCapability.ts` :

```ts
let cached: { supported: boolean; lowPerf: boolean } | null = null

function detect(): { supported: boolean; lowPerf: boolean } {
  if (cached) return cached
  if (typeof window === 'undefined') {
    cached = { supported: false, lowPerf: true }
    return cached
  }

  let supported = false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    supported = gl !== null
  }
  catch {
    supported = false
  }

  const cores = (navigator as any).hardwareConcurrency
  const memory = (navigator as any).deviceMemory
  const lowPerf =
    (typeof cores === 'number' && cores < 4) ||
    (typeof memory === 'number' && memory < 4)

  cached = { supported, lowPerf }
  return cached
}

export function useWebGLCapability() {
  const result = detect()
  return {
    supported: ref(result.supported),
    lowPerf: ref(result.lowPerf),
  }
}
```

- [ ] **Step 4: Run tests pour vérifier qu'ils passent**

Run: `pnpm vitest run tests/unit/composables/useWebGLCapability.spec.ts`
Expected: PASS — 4 tests verts.

- [ ] **Step 5: Commit**

```bash
git add composables/useWebGLCapability.ts tests/unit/composables/useWebGLCapability.spec.ts
git commit -m "feat(brief): add useWebGLCapability composable"
```

---

## Task 4: Composable `useMaquetteState` — TDD

**Files:**
- Create: `composables/useMaquetteState.ts`
- Test: `tests/unit/composables/useMaquetteState.spec.ts`

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `tests/unit/composables/useMaquetteState.spec.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { computeMaquetteState } from '~/composables/useMaquetteState'
import type { BriefInput } from '~/types/brief'

type FormState = Omit<BriefInput, 'turnstileToken' | 'locale'>

const empty: FormState = {
  projectType: 'new', pitch: '', currentState: 'idea', teamSize: 'solo',
  hasTechTeam: false, hasDesigner: false, hasProductOwner: false,
  notes: null, deadline: 'flexible', budget: 'undefined',
  firstName: '', lastName: '', email: '', company: null, website: null,
  source: null, prefersCall: false,
}

describe('computeMaquetteState', () => {
  it('returns 4 pieces, all hidden when state is empty and step is 1', () => {
    const pieces = computeMaquetteState(empty, 1)
    expect(pieces).toHaveLength(4)
    expect(pieces.every(p => !p.revealed)).toBe(true)
  })

  it('reveals project-type piece when projectType is filled and step >= 1', () => {
    const state = { ...empty, projectType: 'new' as const, pitch: 'a real pitch text' }
    const pieces = computeMaquetteState(state, 1)
    expect(pieces.find(p => p.id === 'project-type')?.revealed).toBe(true)
  })

  it('does not reveal project-type when pitch is empty', () => {
    const pieces = computeMaquetteState(empty, 1)
    expect(pieces.find(p => p.id === 'project-type')?.revealed).toBe(false)
  })

  it('reveals context piece when at step 2 with teamSize set', () => {
    const state = { ...empty, projectType: 'new' as const, pitch: 'pitch', teamSize: 'small' as const }
    const pieces = computeMaquetteState(state, 2)
    expect(pieces.find(p => p.id === 'context')?.revealed).toBe(true)
  })

  it('reveals frame piece when at step 3', () => {
    const state = { ...empty, pitch: 'pitch', deadline: 'q1' as const, budget: '20-50k' as const }
    const pieces = computeMaquetteState(state, 3)
    expect(pieces.find(p => p.id === 'frame')?.revealed).toBe(true)
  })

  it('reveals identity piece when at step 4 with firstName + lastName', () => {
    const state = { ...empty, pitch: 'pitch', firstName: 'Rostel', lastName: 'Panoumassi' }
    const pieces = computeMaquetteState(state, 4)
    expect(pieces.find(p => p.id === 'identity')?.revealed).toBe(true)
  })

  it('all 4 pieces revealed at step 5 with full state', () => {
    const state: FormState = {
      ...empty, projectType: 'redesign', pitch: 'pitch text', currentState: 'mvp',
      teamSize: 'medium', deadline: 'q2', budget: '50-100k',
      firstName: 'A', lastName: 'B', email: 'a@b.fr',
    }
    const pieces = computeMaquetteState(state, 5)
    expect(pieces.every(p => p.revealed)).toBe(true)
  })

  it('maps projectType=audit to sphere kind', () => {
    const state = { ...empty, projectType: 'audit' as const, pitch: 'p' }
    const pieces = computeMaquetteState(state, 1)
    expect(pieces.find(p => p.id === 'project-type')?.kind).toBe('sphere')
  })

  it('maps projectType=feature to plate kind', () => {
    const state = { ...empty, projectType: 'feature' as const, pitch: 'p' }
    const pieces = computeMaquetteState(state, 1)
    expect(pieces.find(p => p.id === 'project-type')?.kind).toBe('plate')
  })

  it('cylinder height grows with teamSize', () => {
    const small = computeMaquetteState({ ...empty, pitch: 'p', teamSize: 'solo' }, 2)
    const large = computeMaquetteState({ ...empty, pitch: 'p', teamSize: 'large' }, 2)
    const hSmall = small.find(p => p.id === 'context')!.dimensions[1]
    const hLarge = large.find(p => p.id === 'context')!.dimensions[1]
    expect(hLarge).toBeGreaterThan(hSmall)
  })
})
```

- [ ] **Step 2: Run tests pour vérifier qu'ils échouent**

Run: `pnpm vitest run tests/unit/composables/useMaquetteState.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implémenter le composable**

Créer `composables/useMaquetteState.ts` :

```ts
import type { ComputedRef } from 'vue'
import type { BriefInput, BriefStep } from '~/types/brief'

type FormState = Omit<BriefInput, 'turnstileToken' | 'locale'>

export type PieceKind = 'box' | 'cylinder' | 'frame' | 'plate' | 'sphere'

export type PieceSpec = {
  id: 'project-type' | 'context' | 'frame' | 'identity'
  kind: PieceKind
  dimensions: [number, number, number]
  position: [number, number, number]
  label: string
  revealed: boolean
}

const PROJECT_TYPE_KIND: Record<FormState['projectType'], PieceKind> = {
  new: 'box',
  redesign: 'box',
  feature: 'plate',
  audit: 'sphere',
}

const TEAM_SIZE_HEIGHT: Record<FormState['teamSize'], number> = {
  solo: 0.4,
  small: 0.7,
  medium: 1.0,
  large: 1.3,
}

const BUDGET_WIDTH: Record<FormState['budget'], number> = {
  'undefined': 2.0,
  '<10k': 1.6,
  '10-20k': 1.9,
  '20-50k': 2.3,
  '50-100k': 2.7,
  '>100k': 3.1,
}

const DEADLINE_DEPTH: Record<FormState['deadline'], number> = {
  'flexible': 2.0,
  'asap': 1.4,
  'q1': 1.7,
  'q2': 2.0,
  'q3-q4': 2.4,
}

export function computeMaquetteState(state: FormState, step: BriefStep): PieceSpec[] {
  const pitchFilled = state.pitch.trim().length > 0

  return [
    {
      id: 'project-type',
      kind: PROJECT_TYPE_KIND[state.projectType] ?? 'box',
      dimensions: [1.4, 0.9, 1.4],
      position: [0, 0.45, 0],
      label: `N1 — ${state.projectType.toUpperCase()}`,
      revealed: step >= 1 && pitchFilled,
    },
    {
      id: 'context',
      kind: 'cylinder',
      dimensions: [0.45, TEAM_SIZE_HEIGHT[state.teamSize] ?? 0.4, 0.45],
      position: [-1.2, (TEAM_SIZE_HEIGHT[state.teamSize] ?? 0.4) / 2, 0.6],
      label: `N2 — TEAM ${state.teamSize.toUpperCase()}`,
      revealed: step >= 2 && pitchFilled,
    },
    {
      id: 'frame',
      kind: 'frame',
      dimensions: [
        BUDGET_WIDTH[state.budget] ?? 2.0,
        0.05,
        DEADLINE_DEPTH[state.deadline] ?? 2.0,
      ],
      position: [0, 0.025, 0],
      label: `N3 — SCOPE ${state.deadline.toUpperCase()}`,
      revealed: step >= 3,
    },
    {
      id: 'identity',
      kind: 'plate',
      dimensions: [0.6, 0.05, 0.3],
      position: [0.9, 0.025, 0.7],
      label: `N4 — ${state.firstName.charAt(0)}${state.lastName.charAt(0)}`.toUpperCase(),
      revealed: step >= 4 && state.firstName.length > 0 && state.lastName.length > 0,
    },
  ]
}

export function useMaquetteState(): ComputedRef<PieceSpec[]> {
  const { state, step } = useBriefForm()
  return computed(() => computeMaquetteState(state.value, step.value))
}
```

- [ ] **Step 4: Run tests pour vérifier qu'ils passent**

Run: `pnpm vitest run tests/unit/composables/useMaquetteState.spec.ts`
Expected: PASS — 10 tests verts.

- [ ] **Step 5: Commit**

```bash
git add composables/useMaquetteState.ts tests/unit/composables/useMaquetteState.spec.ts
git commit -m "feat(brief): add useMaquetteState computed composable"
```

---

## Task 5: Plomberie step 5 dans BriefForm + StepNav (sans 3D)

**Files:**
- Create: `components/brief/BriefStep5Review.vue`
- Modify: `components/brief/BriefForm.vue:13-18`
- Modify: `components/brief/BriefStepNav.vue:30-47`

**Goal:** Le form gère désormais 5 steps. Step 5 = écran récap textuel + bouton "Envoyer". Step 4 dernier bouton = "Continuer →" qui appelle `next()`. Comme la 3D n'est pas encore là, le form occupe toute la largeur — on validera visuellement en CLI.

- [ ] **Step 1: Créer `BriefStep5Review.vue`**

Créer `components/brief/BriefStep5Review.vue` :

```vue
<script setup lang="ts">
const { t } = useI18n()
const { state, submitting, submitError, submit, back } = useBriefForm()

const recap = computed(() => [
  { label: t('brief.recap.projectType'), value: state.value.projectType },
  { label: t('brief.recap.pitch'), value: state.value.pitch },
  { label: t('brief.recap.currentState'), value: state.value.currentState },
  { label: t('brief.recap.teamSize'), value: state.value.teamSize },
  { label: t('brief.recap.deadline'), value: state.value.deadline },
  { label: t('brief.recap.budget'), value: state.value.budget },
  { label: t('brief.recap.identity'), value: `${state.value.firstName} ${state.value.lastName} <${state.value.email}>` },
])
</script>

<template>
  <section class="step5">
    <h2 class="step5__title">{{ t('brief.step5.title') }}</h2>
    <p class="step5__sub">{{ t('brief.step5.sub') }}</p>

    <dl class="step5__list">
      <div v-for="row in recap" :key="row.label" class="step5__row">
        <dt class="step5__dt">{{ row.label }}</dt>
        <dd class="step5__dd">{{ row.value || '—' }}</dd>
      </div>
    </dl>

    <p v-if="submitError" class="step5__error" role="alert">{{ submitError }}</p>

    <div class="step5__actions">
      <button type="button" class="step5__back" :disabled="submitting" @click="back">
        ← {{ t('brief.back') }}
      </button>
      <button type="button" class="step5__submit" :disabled="submitting" @click="submit">
        {{ submitting ? '…' : t('brief.submit') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.step5 { display: flex; flex-direction: column; gap: 1.5rem; }
.step5__title {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem; line-height: 1.2; font-weight: 400; margin: 0;
}
.step5__sub {
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem; color: var(--text-mute); margin: 0;
}
.step5__list { display: flex; flex-direction: column; gap: 0.75rem; margin: 0; }
.step5__row {
  display: grid; grid-template-columns: 8rem 1fr; gap: 1rem;
  padding: 0.625rem 0; border-bottom: 1px solid var(--border);
}
.step5__dt {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-soft);
}
.step5__dd {
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem; color: var(--text); margin: 0;
  word-break: break-word;
}
.step5__error {
  font-family: theme('fontFamily.mono'); font-size: 0.8125rem;
  color: var(--error); margin: 0;
}
.step5__actions {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1rem;
}
.step5__back {
  font-family: theme('fontFamily.mono'); font-size: 0.75rem; letter-spacing: 0.04em;
  background: transparent; color: var(--text-mute); border: 0;
  padding: 0.625rem 1rem; cursor: pointer;
}
.step5__back:hover { color: var(--text); }
.step5__submit {
  font-family: theme('fontFamily.mono'); font-size: 0.8125rem;
  letter-spacing: 0.06em; text-transform: uppercase;
  background: var(--text); color: var(--bg); border: 0;
  padding: 0.875rem 1.5rem; cursor: pointer; transition: opacity 150ms;
}
.step5__submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
```

- [ ] **Step 2: Ajouter clés i18n FR/EN**

Modifier `locales/fr.json` (ajouter sous la clé `brief`) :

```json
"step5": {
  "title": "Inspecte ton brief",
  "sub": "Vérifie le récap, modifie si nécessaire, puis envoie."
},
"recap": {
  "projectType": "Type",
  "pitch": "Pitch",
  "currentState": "État",
  "teamSize": "Équipe",
  "deadline": "Deadline",
  "budget": "Budget",
  "identity": "Contact"
}
```

Modifier `locales/en.json` similairement :

```json
"step5": {
  "title": "Review your brief",
  "sub": "Check the recap, edit if needed, then send."
},
"recap": {
  "projectType": "Type",
  "pitch": "Pitch",
  "currentState": "State",
  "teamSize": "Team",
  "deadline": "Deadline",
  "budget": "Budget",
  "identity": "Contact"
}
```

- [ ] **Step 3: Modifier `BriefForm.vue` pour rendre step 5**

Remplacer le bloc `<transition>` (lignes 13-18) par :

```vue
<transition name="step" mode="out-in">
  <BriefStep1Project v-if="step === 1" key="step-1" />
  <BriefStep2Context v-else-if="step === 2" key="step-2" />
  <BriefStep3Frame v-else-if="step === 3" key="step-3" />
  <BriefStep4Identity v-else-if="step === 4" key="step-4" />
  <BriefStep5Review v-else key="step-5" />
</transition>
```

Et masquer `BriefStepNav` quand `step === 5` (les boutons sont dans `BriefStep5Review`) — modifier la prop `:is-last-step` qui devient `step === 4` et wrap dans `v-if` :

```vue
<BriefStepNav
  v-if="step < 5"
  :step="step"
  :can-go-back="step > 1"
  :is-last-step="false"
  :submitting="submitting"
  @back="back"
  @next="next"
  @submit="submit"
/>
```

(Note : on ne montre plus jamais le bouton submit dans `BriefStepNav` — il vit dans `BriefStep5Review`. `is-last-step` est forcé à `false` ce qui garde toujours le bouton "Continuer →" jusqu'au step 4, qui appelle `next()` et avance à 5.)

- [ ] **Step 4: Vérifier que les 4 e2e existants passent toujours**

Le test "Continuer advances to step 2" doit rester vert. Les 3 autres tests aussi.

Run: `pnpm test:e2e tests/e2e/brief.spec.ts`
Expected: PASS — 4 tests verts. Si le test sur step 2 échoue, vérifier que le bouton "Continuer →" est bien visible en step 1 (c'est le cas, car `is-last-step=false` toujours).

- [ ] **Step 5: Vérifier en navigateur**

Run: `pnpm dev`
- Aller sur `/brief`, remplir steps 1-4 rapidement.
- En step 4, le bouton doit dire "Continuer →" (pas "Envoyer").
- Cliquer "Continuer →" → arrivée en step 5 avec récap textuel.
- Bouton "Envoyer le brief" présent en step 5.
- Bouton "← Retour" ramène en step 4.

Stop le server.

- [ ] **Step 6: Commit**

```bash
git add components/brief/BriefStep5Review.vue components/brief/BriefForm.vue components/brief/BriefStepNav.vue locales/fr.json locales/en.json
git commit -m "feat(brief): add step 5 review screen, defer submit until step 5"
```

---

## Task 6: Snapshot sessionStorage avant submit + lecture sur confirmation

**Files:**
- Modify: `composables/useBriefForm.ts:103-137` (fonction `submit`)
- Modify: `pages/brief/confirmation.vue` (ajout import snapshot, pas encore de 3D)

**Goal:** Avant `clearDraft()` dans `submit()`, sauvegarder le state final dans `sessionStorage` sous clé `brief-final-snapshot`. La page de confirmation peut lire ce snapshot. Pas de 3D encore — juste la plomberie.

- [ ] **Step 1: Ajouter le snapshot dans `submit()`**

Dans `composables/useBriefForm.ts`, juste avant `clearDraft()` (ligne 127), ajouter :

```ts
if (import.meta.client) {
  try {
    sessionStorage.setItem(
      'brief-final-snapshot',
      JSON.stringify(state.value),
    )
  }
  catch {
    /* private mode or quota — non-fatal */
  }
}

clearDraft()
```

- [ ] **Step 2: Lire le snapshot dans la page confirmation**

Dans `pages/brief/confirmation.vue`, juste après le bloc `definePageMeta`, ajouter :

```ts
const briefSnapshot = ref<Record<string, any> | null>(null)

onMounted(() => {
  if (typeof sessionStorage === 'undefined') return
  try {
    const raw = sessionStorage.getItem('brief-final-snapshot')
    if (raw) briefSnapshot.value = JSON.parse(raw)
  }
  catch {
    briefSnapshot.value = null
  }
})
```

(La maquette display-only sera branchée Task 12 — pour l'instant on stocke juste la donnée.)

- [ ] **Step 3: Vérifier dev**

Run: `pnpm dev`
- Soumettre un brief complet.
- Sur `/brief/confirmation`, ouvrir DevTools → Application → Session Storage → vérifier la clé `brief-final-snapshot` présente avec le state JSON.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add composables/useBriefForm.ts pages/brief/confirmation.vue
git commit -m "feat(brief): snapshot final state to sessionStorage on submit"
```

---

## Task 7: Layout split + injection isMaquetteEnabled (sans canvas)

**Files:**
- Modify: `pages/brief/index.vue`
- Create: `components/brief/BriefMaquette3D.vue` (placeholder rendu null pour l'instant)

**Goal:** Restructurer la page `/brief` en split desktop / stack mobile. Provide `isMaquetteEnabled` au sous-arbre. Render un `BriefMaquette3D` placeholder qui retourne `null` — la vraie scène vient Task 8+.

- [ ] **Step 1: Créer le wrapper `BriefMaquette3D.vue` (placeholder)**

Créer `components/brief/BriefMaquette3D.vue` :

```vue
<script setup lang="ts">
const props = defineProps<{ mode?: 'form' | 'display-only' }>()

const supported = ref(false)
const lowPerf = ref(false)
const wideEnough = ref(false)

if (import.meta.client) {
  const cap = useWebGLCapability()
  supported.value = cap.supported.value
  lowPerf.value = cap.lowPerf.value
  wideEnough.value = window.innerWidth >= 768

  const onResize = () => {
    wideEnough.value = window.innerWidth >= 768
  }
  window.addEventListener('resize', onResize)
  onUnmounted(() => window.removeEventListener('resize', onResize))
}

const enabled = computed(() => supported.value && !lowPerf.value && wideEnough.value)

defineExpose({ enabled })
</script>

<template>
  <div v-if="enabled" class="maquette" data-test="brief-maquette">
    <!-- Scene mounted here in Task 8 -->
    <p class="maquette__placeholder">Maquette 3D — scene will mount here</p>
  </div>
</template>

<style scoped>
.maquette {
  width: 100%;
  height: 100%;
  background: #0a1525;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.maquette__placeholder {
  color: #7ec8ff;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  opacity: 0.4;
}
</style>
```

- [ ] **Step 2: Restructurer `pages/brief/index.vue` en split layout**

Remplacer le contenu complet de `pages/brief/index.vue` par :

```vue
<script setup lang="ts">
const { t } = useI18n()
const maquetteRef = ref<{ enabled: ComputedRef<boolean> } | null>(null)

useSeoMeta({
  title: () => `${t('brief.title')} — ${t('site.name')}`,
  description: () => t('brief.sub'),
})
</script>

<template>
  <article class="brief">
    <header class="brief__header">
      <h1 class="brief__title">{{ t('brief.title') }}</h1>
      <p class="brief__sub">{{ t('brief.sub') }}</p>
    </header>

    <div class="brief__split">
      <div class="brief__form-col">
        <BriefForm />
      </div>
      <div class="brief__maquette-col">
        <ClientOnly>
          <BriefMaquette3D ref="maquetteRef" mode="form" />
        </ClientOnly>
      </div>
    </div>
  </article>
</template>

<style scoped>
.brief {
  padding: 6rem 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
}

.brief__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.brief__split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.brief__form-col {
  min-width: 0;
}

.brief__maquette-col {
  display: none;
}

@media (min-width: 768px) {
  .brief__split {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 3rem;
    align-items: start;
  }
  .brief__maquette-col {
    display: block;
    position: sticky;
    top: 6rem;
    height: calc(100vh - 12rem);
    min-height: 480px;
  }
}
</style>
```

- [ ] **Step 3: Vérifier en navigateur**

Run: `pnpm dev`
- Desktop ≥ 768 : voir le placeholder cyan "Maquette 3D — scene will mount here" à droite, form à gauche.
- Resize en mobile (< 768) : la colonne maquette disparaît, form en pleine largeur.
- Form fonctionne (steps 1→5 navigables).

Stop server.

- [ ] **Step 4: Run e2e tests**

Run: `pnpm test:e2e tests/e2e/brief.spec.ts`
Expected: PASS — 4 tests verts (selectors par texte tolèrent le split).

- [ ] **Step 5: Commit**

```bash
git add pages/brief/index.vue components/brief/BriefMaquette3D.vue
git commit -m "feat(brief): split layout + BriefMaquette3D placeholder with capability gate"
```

---

## Task 8: `Scene.vue` minimale — TresCanvas, lights, camera, grid

**Files:**
- Create: `components/brief/maquette/Scene.vue`
- Modify: `components/brief/BriefMaquette3D.vue` (charger Scene en async)

**Goal:** La scène 3D existe avec un fond bleu nuit, une grille cyan, lumière, caméra. Pas encore de pièces ni de Rapier — juste une scène vide visible.

- [ ] **Step 1: Créer `Scene.vue`**

Créer `components/brief/maquette/Scene.vue` :

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { GridHelper, AmbientLight, DirectionalLight, PerspectiveCamera } from 'three'
</script>

<template>
  <TresCanvas clear-color="#0a1525" :alpha="false" window-size>
    <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="[4, 3, 6]" :look-at="[0, 0.5, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
    <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" :position="[0, 0, 0]" />
  </TresCanvas>
</template>

<style scoped>
:deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
```

(Note : on injectera l'opacité de la grille via material `transparent` + `opacity: 0.15` dans Task 10 quand on raffinera. Pour l'instant, blueprint cyan sur bleu nuit = lisible.)

- [ ] **Step 2: Charger `Scene` en async dans `BriefMaquette3D.vue`**

Remplacer le `<template>` du wrapper par :

```vue
<template>
  <div v-if="enabled" class="maquette" data-test="brief-maquette">
    <Suspense>
      <Scene />
      <template #fallback>
        <p class="maquette__placeholder">◆ chargement</p>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
const Scene = defineAsyncComponent(() => import('./maquette/Scene.vue'))
// ... reste du script existant inchangé (capability detection)
</script>
```

(Réorganiser le `<script setup>` pour que le `defineAsyncComponent` soit en haut. Garder toute la logique de capability detection.)

Le `<script setup>` complet devient :

```vue
<script setup lang="ts">
const Scene = defineAsyncComponent(() => import('./maquette/Scene.vue'))

defineProps<{ mode?: 'form' | 'display-only' }>()

const supported = ref(false)
const lowPerf = ref(false)
const wideEnough = ref(false)

if (import.meta.client) {
  const cap = useWebGLCapability()
  supported.value = cap.supported.value
  lowPerf.value = cap.lowPerf.value
  wideEnough.value = window.innerWidth >= 768

  const onResize = () => {
    wideEnough.value = window.innerWidth >= 768
  }
  window.addEventListener('resize', onResize)
  onUnmounted(() => window.removeEventListener('resize', onResize))
}

const enabled = computed(() => supported.value && !lowPerf.value && wideEnough.value)
defineExpose({ enabled })
</script>
```

- [ ] **Step 3: Vérifier en navigateur**

Run: `pnpm dev`
- Sur `/brief` desktop : la colonne droite affiche un fond bleu nuit avec une grille cyan en perspective.
- Pas d'erreur console.
- Mobile : pas de canvas.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/brief/maquette/Scene.vue components/brief/BriefMaquette3D.vue
git commit -m "feat(brief): mount empty TresCanvas scene with grid + camera"
```

---

## Task 9: `Piece.vue` générique + `ProjectTypePiece` + intégration au state

**Files:**
- Create: `components/brief/maquette/Piece.vue`
- Create: `components/brief/maquette/Pieces/ProjectTypePiece.vue`
- Modify: `components/brief/maquette/Scene.vue` (ajouter le Piece)

**Goal:** Une première pièce (project-type) apparaît dans la scène quand le user remplit le pitch. Reveal = simple opacity fade pour l'instant. Rapier intégré Task 11.

- [ ] **Step 1: Créer `Piece.vue` générique**

Créer `components/brief/maquette/Piece.vue` :

```vue
<script setup lang="ts">
import {
  BoxGeometry, CylinderGeometry, SphereGeometry,
  EdgesGeometry, LineBasicMaterial,
} from 'three'
import type { PieceKind } from '~/composables/useMaquetteState'

const props = defineProps<{
  position: [number, number, number]
  kind: PieceKind
  dimensions: [number, number, number]
  revealed: boolean
}>()

const opacity = ref(0)

watch(() => props.revealed, (now) => {
  if (now) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      opacity.value = 0.9
      return
    }
    let start = performance.now()
    const tick = (t: number) => {
      const elapsed = t - start
      opacity.value = Math.min(0.9, (elapsed / 400) * 0.9)
      if (opacity.value < 0.9) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  else {
    opacity.value = 0
  }
}, { immediate: true })

const baseGeometry = computed(() => {
  const [w, h, d] = props.dimensions
  switch (props.kind) {
    case 'box':
    case 'frame':
    case 'plate':
      return new BoxGeometry(w, h, d)
    case 'cylinder':
      return new CylinderGeometry(w, w, h, 16)
    case 'sphere':
      return new SphereGeometry(w / 2, 16, 12)
  }
})

const edges = computed(() => new EdgesGeometry(baseGeometry.value))
const material = computed(() => new LineBasicMaterial({
  color: '#7ec8ff',
  transparent: true,
  opacity: opacity.value,
}))

watchEffect(() => {
  material.value.opacity = opacity.value
})

onUnmounted(() => {
  baseGeometry.value.dispose()
  edges.value.dispose()
  material.value.dispose()
})
</script>

<template>
  <TresGroup :position="position">
    <TresLineSegments :geometry="edges" :material="material" />
  </TresGroup>
</template>
```

- [ ] **Step 2: Créer `ProjectTypePiece.vue`**

Créer `components/brief/maquette/Pieces/ProjectTypePiece.vue` :

```vue
<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'project-type')!)
</script>

<template>
  <Piece
    :position="piece.position"
    :kind="piece.kind"
    :dimensions="piece.dimensions"
    :revealed="piece.revealed"
  />
</template>
```

- [ ] **Step 3: Brancher `ProjectTypePiece` dans `Scene.vue`**

Modifier `components/brief/maquette/Scene.vue` template :

```vue
<template>
  <TresCanvas clear-color="#0a1525" :alpha="false" window-size>
    <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="[4, 3, 6]" :look-at="[0, 0.5, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
    <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" :position="[0, 0, 0]" />
    <ProjectTypePiece />
  </TresCanvas>
</template>
```

(Les composants `Pieces/*` et `Piece` sont auto-imports via Nuxt grâce à `pathPrefix: false`. Confirmer.)

- [ ] **Step 4: Vérifier en navigateur**

Run: `pnpm dev`
- `/brief` desktop : grille visible. La pièce ne devrait PAS être visible (pitch vide → revealed false).
- Step 1 : sélectionner "Construire un produit depuis zéro", remplir le pitch.
- À mesure que le pitch se remplit (textarea reactive sur input), une box wireframe cyan doit apparaître au centre de la grille avec un fade-in.
- Pas d'erreur console.

Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/brief/maquette/Piece.vue components/brief/maquette/Pieces/ProjectTypePiece.vue components/brief/maquette/Scene.vue
git commit -m "feat(brief): first wireframe piece reveals when pitch is filled"
```

---

## Task 10: Pieces restantes — Context, Frame, Identity + PitchTag

**Files:**
- Create: `components/brief/maquette/Pieces/ContextPiece.vue`
- Create: `components/brief/maquette/Pieces/FramePiece.vue`
- Create: `components/brief/maquette/Pieces/IdentityPiece.vue`
- Create: `components/brief/maquette/PitchTag.vue`
- Modify: `components/brief/maquette/Scene.vue`

- [ ] **Step 1: Créer `ContextPiece.vue`**

Créer `components/brief/maquette/Pieces/ContextPiece.vue` :

```vue
<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'context')!)
</script>

<template>
  <Piece
    :position="piece.position"
    :kind="piece.kind"
    :dimensions="piece.dimensions"
    :revealed="piece.revealed"
  />
</template>
```

- [ ] **Step 2: Créer `FramePiece.vue`** (même structure)

```vue
<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'frame')!)
</script>

<template>
  <Piece
    :position="piece.position"
    :kind="piece.kind"
    :dimensions="piece.dimensions"
    :revealed="piece.revealed"
  />
</template>
```

- [ ] **Step 3: Créer `IdentityPiece.vue`** (même structure)

```vue
<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'identity')!)
</script>

<template>
  <Piece
    :position="piece.position"
    :kind="piece.kind"
    :dimensions="piece.dimensions"
    :revealed="piece.revealed"
  />
</template>
```

- [ ] **Step 4: Créer `PitchTag.vue`**

Créer `components/brief/maquette/PitchTag.vue` :

```vue
<script setup lang="ts">
import { Html } from '@tresjs/cientos'
const { state } = useBriefForm()

const truncated = computed(() => {
  const p = state.value.pitch.trim()
  if (!p) return ''
  return p.length > 120 ? p.slice(0, 120) + '…' : p
})

const visible = computed(() => truncated.value.length > 0)
</script>

<template>
  <Html v-if="visible" :position="[0, 2.4, 0]" center>
    <div class="pitch-tag">{{ truncated }}</div>
  </Html>
</template>

<style scoped>
.pitch-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #7ec8ff;
  background: rgba(10, 21, 37, 0.85);
  border: 1px solid rgba(126, 200, 255, 0.3);
  padding: 6px 10px;
  max-width: 280px;
  text-align: center;
  white-space: pre-wrap;
  pointer-events: none;
  user-select: none;
}
</style>
```

- [ ] **Step 5: Brancher tout dans `Scene.vue`**

Template final de `Scene.vue` :

```vue
<template>
  <TresCanvas clear-color="#0a1525" :alpha="false" window-size>
    <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="[4, 3, 6]" :look-at="[0, 0.5, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
    <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" :position="[0, 0, 0]" />
    <ProjectTypePiece />
    <ContextPiece />
    <FramePiece />
    <IdentityPiece />
    <PitchTag />
  </TresCanvas>
</template>
```

- [ ] **Step 6: Vérifier en navigateur**

Run: `pnpm dev`
- `/brief` desktop, parcourir steps 1→4 :
  - Step 1 + pitch : box (project-type) + tag pitch suspendu cyan apparaissent.
  - Step 2 + teamSize : cylinder (context) apparaît à côté.
  - Step 3 : frame plate apparaît.
  - Step 4 + nom : plaque identity apparaît.
- Step 5 : toutes les pièces présentes.
- Pas d'erreur console.

Stop server.

- [ ] **Step 7: Commit**

```bash
git add components/brief/maquette/Pieces components/brief/maquette/PitchTag.vue components/brief/maquette/Scene.vue
git commit -m "feat(brief): all 4 pieces + pitch tag reveal as form is filled"
```

---

## Task 11: Annotations + camera dolly entre steps + reduced-motion

**Files:**
- Create: `components/brief/maquette/Annotations.vue`
- Modify: `components/brief/maquette/Scene.vue` (camera dolly + Annotations)

**Goal:** Labels mono "N1, SCALE 1:50" autour de la scène. Camera lerp entre presets selon le step. Respect `prefers-reduced-motion`.

- [ ] **Step 1: Créer `Annotations.vue`**

Créer `components/brief/maquette/Annotations.vue` :

```vue
<script setup lang="ts">
import { Html } from '@tresjs/cientos'
const pieces = useMaquetteState()

const labels = computed(() => pieces.value.filter(p => p.revealed).map(p => ({
  id: p.id,
  text: p.label,
  position: [p.position[0], p.position[1] + p.dimensions[1] / 2 + 0.3, p.position[2]] as [number, number, number],
})))
</script>

<template>
  <Html
    v-for="label in labels"
    :key="label.id"
    :position="label.position"
    center
  >
    <span class="annotation">{{ label.text }}</span>
  </Html>
  <Html :position="[-2.2, -0.3, -2.2]">
    <span class="annotation annotation--scale">SCALE 1:50</span>
  </Html>
</template>

<style scoped>
.annotation {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #7ec8ff;
  opacity: 0.6;
  letter-spacing: 0.06em;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}
.annotation--scale {
  opacity: 0.4;
}
</style>
```

- [ ] **Step 2: Ajouter camera dolly + Annotations dans `Scene.vue`**

Remplacer le `<script setup>` et le template de `Scene.vue` :

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'

const { step } = useBriefForm()

const STEP_PRESETS: Record<number, { pos: [number, number, number]; look: [number, number, number] }> = {
  1: { pos: [4, 3, 6],   look: [0, 0.5, 0] },
  2: { pos: [4, 3, 6.5], look: [-0.4, 0.5, 0.3] },
  3: { pos: [3, 4, 6],   look: [0, 0.4, 0] },
  4: { pos: [3.5, 3, 6], look: [0.3, 0.5, 0.3] },
  5: { pos: [4.5, 3.5, 7], look: [0, 0.7, 0] },
}

const cameraPos = ref<[number, number, number]>(STEP_PRESETS[1].pos)
const cameraLook = ref<[number, number, number]>(STEP_PRESETS[1].look)

const reduceMotion = import.meta.client
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

watch(() => step.value, (s) => {
  const preset = STEP_PRESETS[s] ?? STEP_PRESETS[1]
  if (reduceMotion) {
    cameraPos.value = preset.pos
    cameraLook.value = preset.look
    return
  }
  const start = performance.now()
  const fromPos = [...cameraPos.value] as [number, number, number]
  const fromLook = [...cameraLook.value] as [number, number, number]
  const tick = (t: number) => {
    const k = Math.min(1, (t - start) / 800)
    const e = k * k * (3 - 2 * k)
    cameraPos.value = [
      fromPos[0] + (preset.pos[0] - fromPos[0]) * e,
      fromPos[1] + (preset.pos[1] - fromPos[1]) * e,
      fromPos[2] + (preset.pos[2] - fromPos[2]) * e,
    ]
    cameraLook.value = [
      fromLook[0] + (preset.look[0] - fromLook[0]) * e,
      fromLook[1] + (preset.look[1] - fromLook[1]) * e,
      fromLook[2] + (preset.look[2] - fromLook[2]) * e,
    ]
    if (k < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})
</script>

<template>
  <TresCanvas clear-color="#0a1525" :alpha="false" window-size>
    <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="cameraPos" :look-at="cameraLook" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
    <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" :position="[0, 0, 0]" />
    <ProjectTypePiece />
    <ContextPiece />
    <FramePiece />
    <IdentityPiece />
    <PitchTag />
    <Annotations />
  </TresCanvas>
</template>
```

- [ ] **Step 3: Vérifier en navigateur**

Run: `pnpm dev`
- Parcourir 1→5, observer un dolly subtle de la caméra entre chaque step.
- Labels mono apparaissent au-dessus des pièces révélées.
- DevTools → Rendering → activer `prefers-reduced-motion: reduce` → vérifier qu'il n'y a plus de transition (snap direct).

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/brief/maquette/Annotations.vue components/brief/maquette/Scene.vue
git commit -m "feat(brief): camera dolly between steps + annotation labels"
```

---

## Task 12: `OrbitInspector.vue` actif en step 5

**Files:**
- Create: `components/brief/maquette/OrbitInspector.vue`
- Modify: `components/brief/maquette/Scene.vue` (monter OrbitInspector v-if step === 5)

**Goal:** En step 5, OrbitControls actifs (rotation libre, polar limit, distance limit). Hover des pièces affiche un tooltip HTML.

- [ ] **Step 1: Créer `OrbitInspector.vue`**

Créer `components/brief/maquette/OrbitInspector.vue` :

```vue
<script setup lang="ts">
import { OrbitControls, Html } from '@tresjs/cientos'

const pieces = useMaquetteState()
const hovered = ref<{ id: string; pos: [number, number, number] } | null>(null)

const tooltipText: Record<string, (state: any) => string> = {
  'project-type': (s) => `Type : ${s.projectType}`,
  'context': (s) => `Équipe : ${s.teamSize}`,
  'frame': (s) => `Deadline ${s.deadline} · budget ${s.budget}`,
  'identity': (s) => `${s.firstName} ${s.lastName}`,
}

const { state } = useBriefForm()

function onPieceHover(id: string, pos: [number, number, number]) {
  hovered.value = { id, pos }
}

function onPieceLeave() {
  hovered.value = null
}

defineExpose({ onPieceHover, onPieceLeave })
</script>

<template>
  <OrbitControls
    :enable-pan="false"
    :enable-zoom="true"
    :enable-damping="true"
    :damping-factor="0.08"
    :min-distance="3"
    :max-distance="10"
    :min-polar-angle="Math.PI * 0.1"
    :max-polar-angle="Math.PI * 0.45"
  />
  <Html v-if="hovered" :position="hovered.pos" center>
    <span class="inspector-tooltip">
      {{ tooltipText[hovered.id]?.(state) ?? '' }}
    </span>
  </Html>
</template>

<style scoped>
.inspector-tooltip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #0a1525;
  background: #7ec8ff;
  padding: 4px 8px;
  white-space: nowrap;
  pointer-events: none;
}
</style>
```

(Note : approche simple — le hover est déclenché par les `Pieces/*` via `@pointerenter`/`@pointerleave` sur le `<TresGroup>` de chaque pièce. On ajoutera ces handlers dans la step suivante.)

- [ ] **Step 2: Ajouter pointer events sur `Piece.vue`**

Modifier le template de `Piece.vue` :

```vue
<template>
  <TresGroup
    :position="position"
    @pointer-enter="emit('hover')"
    @pointer-leave="emit('leave')"
  >
    <TresLineSegments :geometry="edges" :material="material" />
  </TresGroup>
</template>
```

Et ajouter dans le `<script setup>` :

```ts
const emit = defineEmits<{ hover: []; leave: [] }>()
```

- [ ] **Step 3: Connecter Pieces aux events de l'inspector**

Modifier chaque `Pieces/<Name>Piece.vue` pour émettre vers Scene. Exemple pour `ProjectTypePiece.vue` :

```vue
<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'project-type')!)
const emit = defineEmits<{ hover: [id: string, pos: [number, number, number]]; leave: [] }>()
</script>

<template>
  <Piece
    :position="piece.position"
    :kind="piece.kind"
    :dimensions="piece.dimensions"
    :revealed="piece.revealed"
    @hover="emit('hover', 'project-type', piece.position)"
    @leave="emit('leave')"
  />
</template>
```

Répéter le pattern (avec id `'context'`, `'frame'`, `'identity'`) pour les 3 autres `Pieces/*`.

- [ ] **Step 4: Brancher dans `Scene.vue`**

Ajouter dans le `<script setup>` de Scene :

```ts
const inspectorRef = ref<{ onPieceHover: (id: string, pos: [number, number, number]) => void; onPieceLeave: () => void } | null>(null)

function handleHover(id: string, pos: [number, number, number]) {
  inspectorRef.value?.onPieceHover(id, pos)
}

function handleLeave() {
  inspectorRef.value?.onPieceLeave()
}
```

Modifier le template :

```vue
<TresCanvas clear-color="#0a1525" :alpha="false" window-size>
  <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="cameraPos" :look-at="cameraLook" />
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
  <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" :position="[0, 0, 0]" />
  <ProjectTypePiece @hover="handleHover" @leave="handleLeave" />
  <ContextPiece @hover="handleHover" @leave="handleLeave" />
  <FramePiece @hover="handleHover" @leave="handleLeave" />
  <IdentityPiece @hover="handleHover" @leave="handleLeave" />
  <PitchTag />
  <Annotations />
  <OrbitInspector v-if="step === 5" ref="inspectorRef" />
</TresCanvas>
```

- [ ] **Step 5: Vérifier en navigateur**

Run: `pnpm dev`
- Steps 1-4 : caméra fixe, hover ne déclenche rien (pas d'inspector).
- Step 5 : drag sur la scène → rotation libre. Hover sur une pièce → tooltip cyan apparaît au-dessus.
- Wheel scroll dans la scène → zoom (avec damping).
- Pas de pan possible.

Stop server.

- [ ] **Step 6: Commit**

```bash
git add components/brief/maquette/OrbitInspector.vue components/brief/maquette/Piece.vue components/brief/maquette/Pieces components/brief/maquette/Scene.vue
git commit -m "feat(brief): orbit inspector + piece hover tooltips for step 5"
```

---

## Task 13: Mini-maquette tournante sur `/brief/confirmation`

**Files:**
- Modify: `pages/brief/confirmation.vue`

**Goal:** Sur la page de confirmation, afficher la mini-maquette construite pendant le brief, en rotation auto, sans form ni step. Lecture depuis `sessionStorage` (déjà capturée Task 6).

- [ ] **Step 1: Adapter `BriefMaquette3D.vue` pour le mode `display-only`**

Le composant accepte déjà `mode?: 'form' | 'display-only'`. Il faut l'utiliser pour court-circuiter le `useBriefForm` et lire le snapshot :

Modifier le `<script setup>` de `BriefMaquette3D.vue` pour exposer une prop `snapshot` :

```ts
const props = defineProps<{
  mode?: 'form' | 'display-only'
  snapshot?: Record<string, any> | null
}>()
```

(La lecture du snapshot et l'injection dans `useMaquetteState` se fera via une prop drilling alternative : on crée un simple `Scene` variant pour display-only. Plus simple : on garde une seule Scene, mais on transforme `useMaquetteState` pour accepter un override en mode display.)

Ajouter dans `useMaquetteState.ts` une seconde fonction :

```ts
export function useStaticMaquetteState(state: FormState, step: BriefStep): ComputedRef<PieceSpec[]> {
  return computed(() => computeMaquetteState(state, step))
}
```

(Cette version prend des arguments fixes plutôt que de lire `useBriefForm`.)

- [ ] **Step 2: Créer une `SceneDisplayOnly.vue` minimale**

Créer `components/brief/maquette/SceneDisplayOnly.vue` :

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import type { PieceSpec } from '~/composables/useMaquetteState'

const props = defineProps<{ pieces: PieceSpec[] }>()

const angle = ref(0)
const reduceMotion = import.meta.client
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

if (import.meta.client && !reduceMotion) {
  let raf = 0
  const tick = () => {
    angle.value += 0.003
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  onUnmounted(() => cancelAnimationFrame(raf))
}

const cameraPos = computed<[number, number, number]>(() => {
  const r = 6
  return [Math.cos(angle.value) * r, 3, Math.sin(angle.value) * r]
})
</script>

<template>
  <TresCanvas clear-color="#0a1525" :alpha="false" window-size>
    <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="cameraPos" :look-at="[0, 0.5, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
    <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" />
    <Piece
      v-for="p in pieces"
      :key="p.id"
      :position="p.position"
      :kind="p.kind"
      :dimensions="p.dimensions"
      :revealed="p.revealed"
    />
  </TresCanvas>
</template>
```

- [ ] **Step 3: Brancher la mini-maquette dans `confirmation.vue`**

Modifier `pages/brief/confirmation.vue` :

Remplacer le bloc `briefSnapshot` (Task 6) par :

```ts
import { computeMaquetteState } from '~/composables/useMaquetteState'

const briefSnapshot = ref<Record<string, any> | null>(null)
const pieces = computed(() => {
  if (!briefSnapshot.value) return []
  return computeMaquetteState(briefSnapshot.value as any, 5)
})

onMounted(() => {
  if (typeof sessionStorage === 'undefined') return
  try {
    const raw = sessionStorage.getItem('brief-final-snapshot')
    if (raw) briefSnapshot.value = JSON.parse(raw)
  }
  catch {
    briefSnapshot.value = null
  }
})

const showMaquette = computed(() => {
  if (!import.meta.client) return false
  if (!briefSnapshot.value) return false
  const cap = useWebGLCapability()
  return cap.supported.value && !cap.lowPerf.value && window.innerWidth >= 768
})
```

Et au-dessus de `<h1 class="confirmation__title">` dans le template, ajouter :

```vue
<ClientOnly>
  <div v-if="showMaquette" class="confirmation__maquette">
    <SceneDisplayOnly :pieces="pieces" />
  </div>
</ClientOnly>
```

CSS dans le `<style scoped>` :

```css
.confirmation__maquette {
  width: 100%;
  height: 360px;
  margin: 0 0 3rem;
  background: #0a1525;
  position: relative;
}
```

- [ ] **Step 4: Vérifier en navigateur**

Run: `pnpm dev`
- Soumettre un brief complet.
- Sur `/brief/confirmation` desktop : maquette tournant lentement, pieces visibles.
- Visite directe `/brief/confirmation` (nouvel onglet) : pas de maquette (pas de snapshot), juste le texte (comportement existant).
- Mobile : pas de maquette.

Stop server.

- [ ] **Step 5: Commit**

```bash
git add composables/useMaquetteState.ts components/brief/maquette/SceneDisplayOnly.vue pages/brief/confirmation.vue
git commit -m "feat(brief): rotating mini-maquette on confirmation page"
```

---

## Task 14: e2e tests `brief-3d.spec.ts`

**Files:**
- Create: `tests/e2e/brief-3d.spec.ts`

- [ ] **Step 1: Écrire les 3 tests**

Créer `tests/e2e/brief-3d.spec.ts` :

```ts
import { test, expect } from '@playwright/test'

test.describe('Brief 3D maquette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brief')
    await page.evaluate(() => localStorage.clear())
  })

  test('desktop: canvas mounts in maquette column', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/brief')
    const canvas = page.locator('[data-test="brief-maquette"] canvas')
    await expect(canvas).toBeVisible({ timeout: 10000 })
    const box = await canvas.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThan(0)
    expect(box?.height ?? 0).toBeGreaterThan(0)
  })

  test('mobile: no canvas, form takes full width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/brief')
    const canvas = page.locator('[data-test="brief-maquette"]')
    await expect(canvas).toHaveCount(0)
  })

  test('step 5 is reachable and shows recap with submit button', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/brief')
    // step 1
    await page.locator('text=Construire un produit depuis zéro').click()
    await page.locator('textarea').fill('Une plateforme de paiement B2B pour PME africaines.')
    await page.locator('text=Continuer →').click()
    // step 2
    await page.locator('text=Idée / spec papier').first().click()
    await page.locator('text=Continuer →').click()
    // step 3
    await page.locator('text=Continuer →').click()
    // step 4
    await page.locator('input[type="text"]').first().fill('Test')
    await page.locator('input[type="text"]').nth(1).fill('User')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('text=Continuer →').click()
    // step 5
    await expect(page.locator('text=Inspecte ton brief')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Envoyer le brief')).toBeVisible()
    await expect(page.locator('text=← Retour')).toBeVisible()
  })
})
```

- [ ] **Step 2: Run tests**

Run: `pnpm test:e2e tests/e2e/brief-3d.spec.ts`
Expected: PASS — 3 tests verts.

Si le test step-5 échoue parce que les selectors ne matchent pas exactement (ex: nom de champ différent), ajuster les sélecteurs en consultant `BriefStep4Identity.vue` et `BriefStepNav.vue` puis re-run.

- [ ] **Step 3: Vérifier que le suite e2e existant passe encore**

Run: `pnpm test:e2e`
Expected: PASS — tous les e2e (brief.spec.ts existant + brief-3d.spec.ts nouveau) verts.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/brief-3d.spec.ts
git commit -m "test(brief): e2e coverage for 3D maquette + step 5 reachable"
```

---

## Task 15: QA pré-deploy + ajustements visuels finaux

**Files:** (ajustements selon retours QA — typiquement `Scene.vue`, CSS de `pages/brief/index.vue`)

**Goal:** Faire la checklist QA du spec section 7.4. Ajuster ce qui pose problème. Pas de nouveau code structurel — juste polish.

- [ ] **Step 1: Checklist Chrome desktop**

Run: `pnpm dev`
- Charger `/brief` : maquette charge en < 2s (Network throttle Fast 3G).
- Pieces apparaissent au fur et à mesure des steps.
- Step 5 : orbit fonctionne, hover affiche tooltips.
- Pas de warnings Three.js dans la console.

- [ ] **Step 2: Checklist Safari/iOS (DevTools mobile emulation iPhone 12 Pro)**

- Viewport 390×844 : stack vertical, pas de canvas.
- Flow complet jusqu'à step 5 : récap textuel s'affiche correctement.

- [ ] **Step 3: Checklist Firefox WebGL disabled**

- Ouvrir Firefox, `about:config` → `webgl.disabled = true` → reload `/brief`.
- Form pleine largeur (pas de colonne maquette).
- Step 5 récap s'affiche.

- [ ] **Step 4: Checklist `prefers-reduced-motion`**

- DevTools Chrome → Rendering → emulate `prefers-reduced-motion: reduce`.
- Pieces apparaissent en fade simple (pas de chute, pas de mouvement).
- Mini-maquette confirmation : pas de rotation auto.

- [ ] **Step 5: Memory check**

- Chrome Performance Monitor (`Cmd+Shift+P` → "Show Performance Monitor").
- Naviguer `/brief → /work → /brief` 5 fois.
- JS heap size doit revenir à un niveau stable (pas de croissance linéaire).
- Si fuite : vérifier que `Scene.vue` dispose les geometries dans `onUnmounted`. Ajouter cleanup si manquant.

- [ ] **Step 6: Lighthouse**

Run: `pnpm build && pnpm preview`
- Lighthouse desktop sur `/brief` : LCP < 2.5s, CLS < 0.1, Performance ≥ 85.
- Si LCP > 2.5s : vérifier que `BriefMaquette3D` est bien dynamic-imported (le bundle 3D ne devrait pas bloquer LCP du form).

- [ ] **Step 7: Commit final**

Si des ajustements ont été faits :

```bash
git add -A
git commit -m "polish(brief): QA pass — memory cleanup, perf tweaks"
```

Si rien à committer : c'est parfait, l'implémentation est terminée.

- [ ] **Step 8: Tag de fin de feature**

```bash
git log --oneline -20
# verifier que la feature est complete
```

Le branch `v3-redesign` contient maintenant la feature physical-brief complète. La merge vers `main` se fait selon le workflow habituel.

---

## Notes pour l'implémenteur

- **Ordre TDD :** Tasks 3 et 4 sont strictement TDD (tests avant code). Pour les composants Vue (Tasks 7-13), les tests e2e couvrent l'ensemble en Task 14 — pas besoin de tests unitaires sur les `.vue` (happy-dom n'a pas de WebGL réel).
- **Hot reload :** TresJS peut devenir bizarre en HMR. Si une scène devient incohérente en dev, faire un full reload (Cmd+Shift+R) avant de débugger.
- **Auto-imports :** Les composants sous `components/brief/maquette/` sont auto-importés via Nuxt config existante (`pathPrefix: false`). Pas besoin d'import explicite dans les templates Vue.
- **Rapier :** Le spec mentionne Rapier pour la chute physique des pièces. Le plan ci-dessus implémente le reveal en simple opacity fade (suffisant pour valider le flow). Une fois la feature validée, Rapier peut être ajouté comme amélioration ultérieure dans `Piece.vue` (watcher revealed → spawn RigidBody dynamic, contact → switch en kinematic, snap à la position cible). Cette extension est facultative — le spec accepte le fade comme fallback même quand Rapier marche, donc shipper sans Rapier reste fidèle à l'intention.
- **Si Rapier devient prioritaire :** ajouter `@tresjs/rapier` dans `Scene.vue` avec `<Physics :gravity="[0,-2,0]">` enveloppant les pieces, et modifier `Piece.vue` pour utiliser `<RigidBody>` avec `colliders="cuboid"`. Garder le fallback opacity fade pour `prefers-reduced-motion`.
