# Physical Brief — Design Spec

**Date :** 2026-04-28
**Branche :** v3-redesign
**Statut :** validé en brainstorming, prêt pour writing-plans

## 1. Intent

Transformer le brief funnel `/brief` (4 étapes existantes) en une expérience interactive 3D singulière où le client *assemble une maquette wireframe* de son projet en même temps qu'il remplit le form. La maquette est le miroir physique du brief : chaque réponse fait apparaître une pièce blueprint cyan sur grille technique, qui tombe et se snap en place avec une physique douce. Avant le submit final, un nouvel écran d'inspection (step 5) laisse le client orbiter la maquette finie et hover les pièces pour comprendre ce qu'il vient de décrire.

L'objectif n'est pas le "wow" gratuit. La 3D *signifie* quelque chose : un ingénieur qui construit des systèmes fiables, montrant en image ce qu'il fait en code. La maquette est une métaphore de l'artefact que le projet va devenir.

## 2. Décisions validées en brainstorming

| Question | Choix |
|---|---|
| Métaphore | Atelier d'ingénieur + assemblage (A+C de l'option 3 originale) |
| Layout | Split desktop : form gauche, maquette droite. Stack vertical mobile. |
| Direction visuelle | Blueprint / wireframe technique (cyan #7ec8ff sur fond bleu nuit #0a1525, grille, annotations mono) |
| Manipulation | Auto-assemblage pendant les 4 steps. Manipulation orbit + hover en nouveau step 5 d'inspection. |
| Stack | TresJS (`@tresjs/nuxt` + `@tresjs/cientos` + `@tresjs/rapier`) |
| Mini-maquette confirmation | Oui (rotation auto sur `/brief/confirmation`) |

## 3. Architecture

### 3.1 Layout

**Desktop (≥ 768px) :**
```
┌─────────────────────────────────────────────────┐
│  ◇ atelier — brief                              │
├──────────────────────┬──────────────────────────┤
│   BriefForm          │   BriefMaquette3D        │
│   (existant)         │   (nouveau, ClientOnly)  │
└──────────────────────┴──────────────────────────┘
```

**Mobile (< 768px) :** stack vertical, form en largeur pleine, maquette en sticky-bottom 40vh. Orbit désactivé sur touch (touch = scroll). Sur `/brief/confirmation` mobile, la maquette occupe la hauteur réservée.

### 3.2 Source de vérité

`useBriefForm().state` reste l'unique source de vérité. La couche 3D *lit* l'état via `useMaquetteState` (computed pur) et anime en réaction. Aucune écriture d'état depuis le canvas.

### 3.3 Arborescence des nouveaux fichiers

```
components/brief/
  BriefMaquette3D.vue          # wrapper ClientOnly + capability gate
  maquette/
    Scene.vue                   # <TresCanvas>, lights, camera, grid, RapierWorld
    Piece.vue                   # pièce wireframe générique
    Pieces/
      ProjectTypePiece.vue
      ContextPiece.vue
      FramePiece.vue
      IdentityPiece.vue
    Annotations.vue             # labels mono "N1, SCALE 1:50"
    PitchTag.vue                # étiquette suspendue avec début du pitch
    OrbitInspector.vue          # OrbitControls + raycast hover, step 5

components/brief/
  BriefStep5Review.vue          # form gauche en step 5 = récap + bouton submit

composables/
  useMaquetteState.ts           # state form → PieceSpec[]
  useWebGLCapability.ts         # WebGL + perf detection

types/brief.ts                   # MODIFIER : TOTAL_BRIEF_STEPS = 5

pages/brief/index.vue            # MODIFIER : layout split + injection
pages/brief/confirmation.vue     # MODIFIER : ajout mini-maquette tournante

tests/unit/composables/
  useMaquetteState.spec.ts
  useWebGLCapability.spec.ts

tests/e2e/
  brief-3d.spec.ts
```

### 3.4 Capability gating

`BriefMaquette3D` ne mount la scène que si **toutes** les conditions suivantes sont vraies :

1. `import.meta.client` (jamais SSR).
2. `useWebGLCapability().supported.value === true` (WebGL ou WebGL2 disponible).
3. `useWebGLCapability().lowPerf.value === false` (`hardwareConcurrency >= 4` et `deviceMemory >= 4` quand dispo, sinon défaut OK).
4. `window.innerWidth >= 768` (composable resize-aware avec breakpoint 768).

Si une condition est fausse → render `null`, `BriefForm` passe en pleine largeur via injection `isMaquetteEnabled = false`.

## 4. Composants

### 4.1 `BriefMaquette3D.vue`

- Pas de props. Lit `useBriefForm()`.
- Au mount, vérifie capabilities, sinon render null.
- Charge `Scene.vue` via `defineAsyncComponent` enveloppé dans `<ClientOnly>`.
- Provide `isMaquetteEnabled: true` au sous-arbre.
- Émet `inspect-ready` quand `step === 4 && form valide`.
- Skeleton SVG inline (~2kb) pendant le dynamic import.

### 4.2 `Scene.vue`

- `<TresCanvas clear-color="#0a1525" :alpha="false">`.
- Camera : `PerspectiveCamera`, fov 35, position `[4, 3, 6]`, lookAt `[0, 0.5, 0]`.
- Lights : `AmbientLight` 0.4 + `DirectionalLight` 0.6 position `[5, 8, 4]`.
- Grille : `GridHelper` color `#7ec8ff`, opacity 0.15, divisions 20×20.
- `<RapierWorld :gravity="[0, -2, 0]">` (gravité douce non-réaliste).
- Slot pour les `Pieces/*` qui s'auto-révèlent selon le `useMaquetteState()`.
- Caméra dolly subtle au changement de step (lerp 800ms entre presets par step).
- En step 5, monte `<OrbitInspector />` qui prend le contrôle de la camera.
- `onUnmounted` : dispose renderer, geometries, materials, free RapierWorld.

### 4.3 `Piece.vue`

```ts
defineProps<{
  position: [number, number, number]
  geometry: 'box' | 'cylinder' | 'frame' | 'plate' | 'sphere'
  dimensions: [number, number, number]
  label: string
  revealed: boolean
}>()
```

- Rendu : `<TresLineSegments>` avec `EdgesGeometry` selon `geometry`. Material `LineBasicMaterial` color `#7ec8ff`, opacity 0.9, transparent true.
- Reveal : watcher sur `revealed: false → true` :
  - Spawn `RigidBody type="dynamic"` à `position + [0, 2, 0]`.
  - Rapier laisse tomber, contact détecté → `RigidBody.setBodyType('kinematicPositionBased')`, snap à `position`.
  - Avec `prefers-reduced-motion: reduce` → opacity fade 200ms, position directe, pas de Rapier.
- Reveal échec (Rapier KO) : opacity fade fallback automatique.
- Label flottant via `<Html>` (cientos), monospace 10px, opacity 0.6, position offset `[0, dimensions[1]/2 + 0.3, 0]`.

### 4.4 `Pieces/*.vue`

Chacun lit la portion du state qui lui correspond et passe les props à `<Piece>`.

| Composant | Lit | Géométrie produite |
|---|---|---|
| `ProjectTypePiece` | `state.projectType` | `new` = box vide / `redesign` = box + frame intérieur / `feature` = plate fine / `audit` = sphère wireframe |
| `ContextPiece` | `state.currentState`, `teamSize`, `hasTechTeam`, `hasDesigner`, `hasProductOwner` | cylinder de hauteur proportionnelle à `teamSize`, anneaux empilés selon les rôles présents |
| `FramePiece` | `state.deadline`, `state.budget` | structure-cadre qui encadre les autres pièces. Largeur = budget, profondeur = deadline |
| `IdentityPiece` | `state.firstName`, `state.lastName` | plaque mono avec initiales, apparaît step 4, posée à la base |

Le pitch (textarea step 1) → `PitchTag.vue` : étiquette suspendue au-dessus de la maquette, texte mono cyan, max 120 chars + "…", aucun click handler.

### 4.5 `OrbitInspector.vue`

- Actif uniquement en step 5.
- `<OrbitControls>` (cientos) : rotation OK, pan OFF, zoom dampened, polar limits [10°, 80°], distance limits [3, 10].
- Raycaster on `pointermove` : intersect pièces → tooltip HTML (`<Html>` cientos), texte selon piece.id (`"Équipe : solo"`, `"Deadline : 1-3 mois"`, etc.). Fade in 150ms, suit le curseur.
- Aucun bouton dans la scène — les actions ("← Modifier", "Envoyer le brief →") sont dans `BriefStep5Review` côté form.

### 4.6 `BriefStep5Review.vue`

- Affiché à la place des inputs en step 5 (form gauche).
- Récap textuel structuré du `state` (lit le même mapping que `useMaquetteState` mais en français lisible).
- Si `isMaquetteEnabled === false` → affichage instructions + "Envoyer le brief" + "← Modifier".
- Si maquette active → consigne courte ("Inspecte ta maquette à droite. Drag pour tourner.") + boutons.
- Bouton "Envoyer le brief →" appelle `submit()` existant. Bouton "← Modifier" appelle `back()` (revient step 4).

### 4.7 Composables

**`useMaquetteState.ts`**
```ts
export type PieceSpec = {
  id: 'project-type' | 'context' | 'frame' | 'identity'
  kind: 'box' | 'cylinder' | 'frame' | 'plate' | 'sphere'
  dimensions: [number, number, number]
  position: [number, number, number]
  label: string
  revealed: boolean
}

export function useMaquetteState(): ComputedRef<PieceSpec[]>
```

Pure-ish — lit `useBriefForm().state` et `step` via `useState`, retourne computed. Testable en injectant un state synthétique.

**`useWebGLCapability.ts`**
```ts
export function useWebGLCapability(): {
  supported: Ref<boolean>
  lowPerf: Ref<boolean>
}
```

Au premier appel client : crée un `<canvas>` détaché, tente `getContext('webgl2') ?? getContext('webgl')`. Si échec → `supported = false`. Lit `navigator.hardwareConcurrency` et `navigator.deviceMemory` (si dispo). Mémoïsé module-level (un seul check par session).

## 5. Data flow

### 5.1 Cycle d'une réponse

1. User clique une option dans `BriefForm` (gauche).
2. `setField(...)` mute `state` (déjà existant).
3. `useMaquetteState()` recompute → la pièce concernée passe `revealed: true`.
4. Vue propage à `<Piece :revealed="true">`.
5. Watcher dans `Piece.vue` lance le reveal animation (Rapier ou fade).
6. Annotation label fade in après 600ms.

### 5.2 Step transitions

- `step 1 → 2` : `next()` existant. Caméra dolly subtle vers preset step 2.
- `step 4 → 5` (NOUVEAU) : le bouton actuel de step 4 (qui appelle `submit()`) devient "Continuer →" et appelle `next()`. Le turnstile token reste capturé en step 4 et conservé dans le state global du composable, prêt à être utilisé par `submit()` en step 5.
- `step 5 → submit` : `BriefStep5Review` "Envoyer" appelle `submit()` du composable. Comportement post-submit inchangé (clearDraft, navigateTo `/brief/confirmation` avec `?call=1` si applicable).
- `step 5 → 4` : `back()` standard.

### 5.3 Extension de TOTAL_BRIEF_STEPS

`types/brief.ts` :
```ts
export const TOTAL_BRIEF_STEPS = 5
export type BriefStep = 1 | 2 | 3 | 4 | 5
```

Step 5 ne mute aucun champ du payload Zod. Le payload envoyé à `/api/brief` est identique à aujourd'hui. **Server-side : zéro changement.**

### 5.4 Persistence

`localStorage` inchangé : `{ state, step }` sérialisé. Si user ferme l'onglet en step 5, il revient en step 5. Si capabilities changent (desktop → mobile reload), step 5 affiche le récap textuel sans canvas.

### 5.5 Confirmation

`/brief/confirmation` ajoute une mini-maquette qui tourne sur elle-même.

- Avant `clearDraft()` dans `useBriefForm.submit()`, snapshot du state final est écrit en `sessionStorage` sous clé `brief-final-snapshot`.
- `pages/brief/confirmation.vue` lit ce snapshot au mount, charge `BriefMaquette3D` en mode `display-only` (pas de form, pas de step, rotation auto, pas d'orbit).
- Si snapshot absent (visite directe `/brief/confirmation`) → pas de maquette, page texte uniquement (déjà le cas).
- Capabilities check identique. Si mobile / no-WebGL → page texte sans maquette.

## 6. Erreurs & edge cases

| Cas | Comportement |
|---|---|
| Capability check négatif | `BriefMaquette3D` render null. Form pleine largeur. Step 5 = récap textuel + submit. |
| `webglcontextlost` | Unmount Scene, log silencieux, fallback récap textuel. Pas de retry. |
| Rapier WASM fail | Try/catch dynamic import. Pieces en opacity fade (mode reduced-motion forcé). User ne voit pas le fallback. |
| Slow first paint | Skeleton SVG inline ~2kb pendant dynamic import. |
| State partiel/corrompu | `useMaquetteState` traite tout `state` partial. `revealed: false` par défaut. Aucun throw. |
| Pitch très long | `PitchTag` tronque à 120 chars + "…". Texte intégral dans form gauche. |
| Step 5 atteint sans WebGL (persist desktop → reload mobile) | Récap textuel auto, submit OK. |
| Submit fail (422/429/403/500) | Inchangé. Erreur dans form gauche / step 5. Maquette reste en place. User retoure step 4 sans perdre la maquette. |
| `prefers-reduced-motion: reduce` | Pas de chute, pas de rotation, pas de dolly. Reveals = opacity fade 200ms. Orbit step 5 reste actif (input volontaire). |
| Memory leak | `onUnmounted` Scene : dispose renderer/geometries/materials, free RapierWorld, retire listeners. |
| Hot module reload | Workaround dev = full reload si scène devient bizarre. Documenté README, pas dans le code. |

## 7. Tests

### 7.1 Unit (Vitest)

- `useMaquetteState.spec.ts` (6-8 cas) : state vide → 0 pieces revealed. State avec projectType seul → piece `project-type` revealed. State complet step ≥ 4 → toutes pieces revealed. Mapping projectType → kind. Mapping teamSize → dimensions cylinder. Reveal flag respecte step ordering.
- `useWebGLCapability.spec.ts` (3-4 cas) : mock `HTMLCanvasElement.prototype.getContext`. WebGL2 OK → supported true. Fail → supported false. `hardwareConcurrency = 2` → lowPerf true.
- Pas de test sur `Piece.vue` / `Scene.vue` (happy-dom n'a pas de WebGL réel, pas de valeur).

### 7.2 E2E (Playwright)

- `tests/e2e/brief.spec.ts` (existant) : aucune modification. Les 4 smoke tests continuent à passer.
- `tests/e2e/brief-3d.spec.ts` (nouveau, 3 tests) :
  1. **Desktop : maquette charge.** Goto `/brief`, attendre `<canvas>` présent + dimensions > 0.
  2. **Mobile : pas de maquette.** Viewport 375×667, goto `/brief`, vérifier `<canvas>` absent, form pleine largeur.
  3. **Step 5 ajouté au flow.** Remplir steps 1-4, cliquer "Continuer →" sur step 4, vérifier qu'on est en step 5 (bouton "Envoyer le brief" visible, pas de redirect immédiat).

### 7.3 Hors scope tests

- Visual regression sur la 3D : skip (trop fragile).
- Test de la physique : skip.
- Performance : check Lighthouse manuel pré-deploy. Target LCP < 2.5s, CLS < 0.1, INP < 200ms. La 3D charge post-LCP.

### 7.4 Checklist QA pré-deploy

- [ ] Chrome desktop : maquette charge, pieces tombent, orbit step 5 fonctionne
- [ ] Safari iOS : stack vertical, sticky-bottom maquette OK, orbit désactivé sur touch
- [ ] Firefox WebGL disabled (`webgl.disabled` about:config) : form pleine largeur, step 5 récap textuel
- [ ] `prefers-reduced-motion: reduce` (DevTools) : reveals en fade, pas de rotation auto
- [ ] Confirmation : mini-maquette tourne après submit, page directe = pas de maquette
- [ ] Memory : `/brief → /work → /brief` × 5 sans fuite GPU dans Chrome Performance Monitor

## 8. Hors scope

- Post-processing (bloom, SSAO) : non. Le wireframe blueprint n'en a pas besoin.
- Sound design : non.
- Variation de la maquette par locale FR/EN : non. Géométrie identique, labels traduits.
- Export de la maquette en image (download) : non. Possible feature future.
- Maquette dans l'email envoyé au prospect : non. Email reste texte.
- Maquette dans le dashboard admin / Telegram : non.

## 9. Bundle & performance

- TresJS + Cientos + Rapier : ~150kb gzip total estimé.
- Dynamic import : chargés uniquement quand `BriefMaquette3D` mount. Pas sur `/`, `/work`, `/about`, `/contact`.
- Skeleton SVG ~2kb inline pendant chargement.
- Une seule instance de `RapierWorld` par session navigateur.
- Geometry instancing pour les pièces récurrentes (anneaux du cylinder ContextPiece).
- Pas de texture, pas de PBR — wireframe = pipeline minimal.

## 10. Migration

Aucune. Pas de migration server, pas de changement de schema, pas de changement DB. Tout est additif côté frontend.

## 11. Référence des choix écartés (pour mémoire)

- Métaphore "table de cartes" (B) : déjà vu ailleurs, accessible mais pas signifiant.
- Métaphore "champ de forces" (D) : joli mais vide de sens.
- Layout plein écran 3D (A) : risque ergonomique trop élevé.
- Layout 3D ambient en fond (D) : décoratif, faible impact.
- Style low-poly chaleureux : sympa mais moins "ingénieur" que blueprint.
- Style PBR matériaux réalistes : lourd, skeuomorphique, mauvaise vibe.
- Manipulation continue à chaque step : friction sans valeur.
- Vanilla Three.js au lieu de TresJS : plomberie inutile dans un contexte Vue.
