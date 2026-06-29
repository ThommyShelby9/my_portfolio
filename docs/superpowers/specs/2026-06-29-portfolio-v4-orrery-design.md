# Portfolio v4 « Orrery » — Design Spec

**Date** : 2026-06-29
**Auteur** : Rostel Panoumassi (avec assistance Claude)
**Statut** : Vision validée · Lot 1 prêt pour planification
**Repo** : `O:/Projets/my_portfolio`
**Socle technique** : Nuxt 3 / Vue 3 conservé ; nouvelle couche WebGL (Three.js)

---

## 1. Contexte et objectifs

### 1.1 Situation actuelle

La v3 (`v3-redesign`) est un portfolio éditorial soigné — direction « quiet premium × engineer brutalist », hero serif italique (Newsreader), format « revue » (`Numéro 03 · Vol. III`), liens magnétiques, GSAP, une constellation 3D dans le hero. Techniquement propre, mais l'utilisateur la juge **trop « template »** : belle, mais sans signature qu'on reconnaît au premier regard.

### 1.2 Objectif

Refonte totale orientée **signature visuelle unique + expérience mémorable**, tout en restant **crédible** pour des décideurs fintech/B2B et des recruteurs tech (« audacieux mais crédible »). On préserve le contenu (11 case studies, funnel `/brief`, bilingue FR/EN) et la stack Nuxt ; on réinvente l'enveloppe et on ajoute une couche de rendu WebGL comme sous-système de premier plan.

### 1.3 Décisions de cadrage (validées)

- **Motivation** : sortir du « template », viser une identité reconnaissable.
- **Curseur** : audacieux mais crédible (le « waouh » sert le sérieux).
- **Périmètre** : look + UX + couche technique de rendu. Contenu et serveur `/brief` préservés.
- **Direction** : spatiale / WebGL.
- **Modèle d'immersion** : **A — Atmosphère + moments 3D** (contenu lisible en scroll classique, posé sur une couche WebGL vivante ; la 3D enveloppe, ne bloque jamais).
- **Matière de l'espace** : **Orbital × Flux** — cosmos profond dont la matière est une aurore/plasma vivante.
- **Mise en espace du travail** : **β — Orrery** (les projets orbitent un cœur ; ordonné, narratif, hypnotique).
- **Stack** : **garder Nuxt**, bâtir la couche WebGL en Three.js (TresJS optionnel ; brut + shaders GLSL pour les scènes lourdes).

### 1.4 Critères de succès

- Identité reconnaissable en < 5 s, distincte de tout template.
- Un décideur non-tech comprend l'offre et atteint `/brief` sans friction.
- Le contenu reste 100 % lisible et indexable **sans** WebGL.
- Lighthouse > 90 sur les pages publiques ; `prefers-reduced-motion` et absence de WebGL pleinement gérés.
- Site bilingue FR (défaut) / EN préservé ; funnel `/brief` sans régression.

---

## 2. Vision « north star » (lots 1 → 5)

### 2.1 Concept

Le portfolio est un **système vivant**. Un espace cosmique indigo/violet dont la matière est une aurore qui respire. Chacun des 11 projets est un **corps lumineux généré à partir de ses vraies données** — donc beau *et* informatif. Sur `/work`, ces corps **orbitent un cœur** (Rostel / sa pratique) façon orrery : on lit la trajectoire avant de cliquer.

### 2.2 Direction artistique (canon)

- **Palette (sombre uniquement au lancement)** : encre/indigo profonds (`#070612`, `#120f2e`), corps lumineux blanc-violet ; flux d'accents modulés par secteur (émeraude `#19c98c` → indigo `#7a5cf0` → magenta `#ff5aaa`). **Accent UI principal : violet lumineux `#9b86ff`** (rupture nette avec le cyan v3).
- **Mode sombre uniquement** au lancement (un cosmos est sombre ; light mode différé, non prioritaire).
- **Typographie** : **Bricolage Grotesque** (titres) + **JetBrains Mono** (signatures, data, légendes) + **Manrope** (corps). **Le serif éditorial (Newsreader) est abandonné.**

### 2.3 Système de corps (génératif, déterministe)

Chaque projet → un corps procédural dont la forme est **déterministe** (seed = `slug`), donc stable d'une visite à l'autre (cohérence, SEO, perf), avec micro-variation temporelle du seul mouvement.

| Donnée (frontmatter) | Trait visuel du corps |
|---|---|
| `sector` | teinte de base |
| ampleur (`results`, `team`, `duration`) | taille / masse |
| `duration` | nombre/épaisseur des anneaux |
| pile (`stack`) | éclat / turbulence de surface |

### 2.4 Parcours (IA préservée, ré-habillée)

- **/** : hero sur une vue *calme* de l'orrery en fond (rotation lente, profondeur floue) + tagline ; puis sections en scroll classique (featured work, approche, lab/now, CTA → `/brief`).
- **/work** : **pic d'immersion** — orrery plein écran interactif. Hover = éclat + label + 1 stat ; clic = plongée caméra → case study. **Liste DOM réelle en parallèle** (SEO + accessibilité).
- **/work/[slug]** : le corps du projet devient le hero, puis le contenu `.md` existant en lecture classique ; sortie = « handoff » vers le projet suivant de l'orbite.
- **/about · /brief · /contact · /legal · /privacy** : ré-habillées dans la DA. `/brief` (Mongo + email + Telegram) **préservé**. `/terminal` conservé en easter egg.

### 2.5 Architecture technique cible

- `<SpaceCanvas>` **client-only, monté une seule fois** dans le layout (persiste entre les routes), `position: fixed` derrière le contenu.
- **Store de scène** (Pinia) exposant `mode` (`ambient | orrery | focus`) piloté par la route, `prefers-reduced-motion`, et la capacité WebGL.
- **Shaders GLSL** custom (fond aurore + corps émissifs) ; module `contenu → paramètres de corps`.
- Le DOM/contenu reste **SSR/SSG** : le WebGL est une **amélioration progressive**.
- Réutilise les composables existants `useWebGLCapability`, `useReducedMotion`, `useTheme` ; i18n ; `@nuxt/content` ; serveur `/brief` ; SEO/sitemap.

### 2.6 Découpage en lots

1. **Fondations DA + moteur WebGL** ← *spec détaillé ci-dessous, premier lot à implémenter*
2. **Système de corps génératifs** (mapping data→corps, rendu d'un corps, légende)
3. **/work Orrery** (scène interactive, navigation, transitions caméra, fallback)
4. **/work/[slug] + autres pages** ré-habillées
5. **/brief** ré-habillé + polish perf/a11y final

Chaque lot suivra son propre cycle **spec → plan → implémentation**.

---

## 3. Lot 1 — Fondations DA + moteur WebGL (spec détaillé)

### 3.1 But

Poser (a) le **nouveau système visuel** (palette dark-only, typographie, tokens) et (b) le **moteur WebGL persistant** rendant le **fond aurore ambiant**, intégrés sur la page d'accueil, avec **tous les fallbacks**. Pas encore de corps de projet (Lot 2), pas d'orrery (Lot 3) : on prouve que « l'espace existe, respire, et la home se pose dessus ».

### 3.2 Périmètre (in / out)

**Dans le périmètre**
- Tokens de thème + typographie (dark-only).
- Composant `<SpaceCanvas>` client-only persistant + store de scène (mode `ambient`).
- Shader de fond aurore (plasma/nébuleuse qui respire).
- Fallbacks : sans WebGL et `prefers-reduced-motion` → fond gradient statique cohérent.
- Ré-habillage **minimal** du hero `/` posé sur l'espace (preuve d'intégration).
- Garde-fous perf/a11y + tests.

**Hors périmètre (lots suivants)**
- Corps de projet génératifs, légende, mapping data complet.
- Orrery `/work`, transitions caméra, pages case studies.
- Refonte du funnel `/brief`, du reste des pages, light mode.

### 3.3 Architecture & unités (Lot 1)

- **`components/space/SpaceCanvas.client.vue`** — monte le canvas une fois, `position: fixed; inset: 0; z-index: -1`. Décide à l'init : WebGL dispo ? reduced-motion ? → délègue au moteur ou affiche le fallback. Pause le `requestAnimationFrame` quand l'onglet est caché (`document.hidden`).
- **`space/engine.ts`** (importé via `~/space/engine`) — initialise Three.js (lazy-import), crée la scène ambient (plane plein écran + ShaderMaterial), gère la boucle de rendu, le redimensionnement, le plafond de DPR, et la destruction propre.
- **`space/shaders/aurora.frag` / `.vert`** (ou inline GLSL) — bruit animé lent (FBM/simplex), palette indigo→émeraude→magenta, `uTime` piloté par l'horloge.
- **`stores/space.ts`** (Pinia) — état : `mode: 'ambient'`, `enabled` (WebGL ok + non reduced-motion), `quality`. Sert de point de pilotage pour les lots suivants.
- **`assets/css/tokens.css`** (ou mise à jour de `main.css`) — variables CSS de la nouvelle palette dark-only ; `tailwind.config.ts` mis à jour pour pointer dessus.
- **`nuxt.config.ts`** — `fonts.families` : retirer Newsreader ; conserver Bricolage Grotesque, JetBrains Mono, Manrope.
- **`pages/index.vue`** (hero) — application des nouveaux tokens/typo par-dessus `<SpaceCanvas>` ambient.

### 3.4 Flux de données / contrôle

1. `default.vue` (layout) monte `<SpaceCanvas>` (client-only) une fois pour toute l'app.
2. Au montage : `useWebGLCapability()` + `useReducedMotion()` → `space.enabled`.
3. Si `enabled` : lazy-import du moteur, démarrage de la boucle ambient (shader aurore).
4. Si non : rendu d'un fond gradient CSS statique (aucun JS de rendu), le contenu reste identique.
5. Onglet caché → boucle en pause ; visible → reprise. Démontage de route → la scène persiste (canvas non détruit).

### 3.5 Fallbacks & garde-fous (non négociables)

- **Sans WebGL** → fond gradient CSS (palette aurore figée), zéro Three.js chargé.
- **`prefers-reduced-motion: reduce`** → moteur non démarré (ou `uTime` figé) → image statique.
- **SSR/SEO** : `<SpaceCanvas>` est `.client` ; le contenu de la home est rendu SSR/SSG sans dépendance au canvas.
- **Perf** : Three.js en import dynamique ; DPR plafonné (≈ 1.5–2) ; `rAF` en pause hors-écran/onglet caché ; budget visant Lighthouse > 90.

### 3.6 Tests (Lot 1)

- **Vitest** : logique du store `space` (transitions d'état, `enabled` selon capability/reduced-motion) ; helpers de décision (gating) testés sans DOM WebGL réel (capability mockée).
- **Playwright + axe** : la home rend son contenu et passe l'audit a11y **sans** WebGL ; chemin `prefers-reduced-motion` → pas d'animation, fond statique présent ; navigation clavier intacte.
- **Non-régression** : `/brief` et les routes existantes continuent de répondre (smoke test build/prerender).

### 3.7 Risques / points de vigilance

- Coût GPU du shader aurore sur mobile → prévoir un palier de qualité (résolution réduite / version simplifiée) dès le Lot 1 si besoin.
- Persistance du canvas entre routes vs cycle de vie Nuxt (montage unique dans le layout, pas dans une page).
- Cohérence des tokens : migrer proprement les variables CSS existantes pour ne pas casser les pages non encore ré-habillées.

---

## 4. Questions ouvertes (à trancher au fil des lots)

- Light mode « aube » : différé — à rouvrir après le Lot 5.
- La maquette 3D actuelle du `/brief` : la repenser dans la DA (Lot 5) ou la conserver telle quelle ?
- Détail exact du mapping `sector → teinte` (table de correspondance) : fixé au Lot 2.
