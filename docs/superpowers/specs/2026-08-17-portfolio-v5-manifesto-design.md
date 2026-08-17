# Portfolio v5 — « Manifeste » (cinématique sombre) — Design Spec

**Date** : 2026-08-17
**Auteur** : Rostel Panoumassi (avec assistance Claude)
**Statut** : Direction validée (via prototypes) · prête pour planification
**Repo** : `O:/Projets/my_portfolio` · socle Nuxt 3 conservé

---

## 1. Contexte & objectif

La v4 « Orrery » (cosmique/WebGL) a été **rejetée après l'avoir vue en vrai** : trop « gadget », ne ressemble pas au propriétaire. On la remplace intégralement.

Nouvelle direction, validée par une série de prototypes animés : un **manifeste cinématique sombre**, inspiré du langage de Christopher Nolan / *Interstellar* — **émotion et gravité, pas d'effet**. L'accueil est un **scroll dirigé comme un film** qui raconte la thèse (« du logiciel qui tient · pour les équipes qui n'ont pas le droit à l'erreur ») et révèle le travail comme des preuves. Doit rester **crédible pour un décideur fintech/B2B**.

**On préserve** : Nuxt, le contenu (12 case studies FR/EN), le funnel `/brief` (Mongo + email + Telegram), i18n FR/EN, SEO, l'IA des pages. **On réinvente** toute l'enveloppe visuelle et l'expérience.

## 2. Le concept

L'accueil est un **manifeste en une descente** : le site tient un discours, révélé au scroll, avec une **atmosphère de film** (lumière, patience, grain, contraste chaud/froid). L'émerveillement vient de la **lumière et du silence**, **jamais d'objets 3D** (c'était l'erreur de la v4). Les pages internes prolongent le même registre sombre-filmique, en plus calme et lisible.

## 3. Système visuel (canon)

- **Palette** (sombre uniquement) : encre chaude `#060607`/`#0a0a0b`, ivoire chaud `#f3efe6`, une **lumière ambre unique** `#e8b25a` (la teinte Gargantua), un **bleu froid** `#7fa8d8` réservé aux moments de bascule.
- **Cadre film** : letterbox (barres haut/bas), vignette qui respire, **grain de pellicule animé**, léger **flicker de projecteur**.
- **Gargantua** : un **trou noir stylisé** (sphère sombre + disque d'accrétion chaud qui s'enroule au-dessus/au-dessous par lentille + point chaud + bloom + étoiles ténues) — **rendu CSS/SVG, pas WebGL**, pièce maîtresse du **hero uniquement** ; il défile et s'efface (« on contemple Gargantua puis on poursuit »). Ailleurs : halo chaud discret + poussières flottantes.
- **Dramaturgie chaud → froid** : la scène « Ce qui casse » **bascule dans le bleu froid** (horizon, accents, barre de progression) ; le retour à l'invitation revient au chaud.
- **Typographie** (on **abandonne Poppins**) : **grotesque neutre** (Inter / Neue-Haas-like) pour titres + UI ; **serif fin** (Georgia-like) pour la lecture longue (case studies) ; **monospace** (IBM Plex / JetBrains) pour données, labels, HUD, numéros.
- **Motion** : révélations **lentes et monumentales** (le texte monte, sort du flou, se pose), pilotées par IntersectionObserver, easing soft-out. **Respecte `prefers-reduced-motion`** (tout statique si activé).
- **HUD filmique** : timecode qui défile, barre de progression, bouton **« aller aux travaux »** (le client pressé saute la bobine).

## 4. Le son (fonctionnalité optionnelle)

- Une **ambiance cinématique procédurale** (Web Audio : drone grave + nappes d'orgue qui enflent + le « tic-tac » d'*Interstellar*), **synthétisée** — évoque Zimmer **sans copier la B.O.** (le vrai soundtrack est sous copyright : jamais embarqué).
- **Désactivée par défaut**, derrière un bouton **« activer le son »** (l'autoplay est bloqué par les navigateurs et hostile). **Mute persistant** (préférence mémorisée). Aucun son ne démarre sans geste explicite de l'utilisateur.

## 5. Structure de l'accueil (les scènes du manifeste)

Hero (Gargantua + « Du logiciel qui tient. ») → **Le crédo** (principes en cartons-titres, sourcés par de vrais incidents) → **La méthode** (cadrage / hebdo / passation) → **Les preuves** (case studies phares en bobine) → **Ce qui casse** (l'honnêteté, bascule froide) → **Invitation** (→ /brief) → **Footer**.
Tout le texte existe dans le **DOM (SSR)** ; la motion est une amélioration progressive.

## 6. Pages internes (même registre, plus calme)

- **/work** — index des 12 études : liste sombre-cinématique (numérotée, typographique, lisible). *Pas le « ledger » rejeté* : un index filmique.
- **/work/[slug]** — étude de cas : mise en page de lecture sombre, corps en serif, résultats + incidents mis en valeur ; hero filmique par projet (kicker + titre) ; **sans screenshot**, porté par la typo (contrainte existante).
- **/about · /contact · /legal · /privacy** — traitement sombre-filmique, calme.
- **/brief** — funnel **préservé** (serveur intact), ré-habillé sombre. `/terminal` conservé en easter egg.

## 7. Ce qu'on retire (gros nettoyage)

Toute la **couche WebGL cosmique de la v4** : `space/` (engine, orrery, bodies, shaders, quality), `components/space/` (`SpaceCanvas`), `components/work/WorkOrrery`, `ProjectBody`, les tests e2e associés (`work-orrery`, `space-fallback`), les tokens cosmiques, **Poppins**. Nouvelle palette + typo.

## 8. Non négociables

- Tout le **contenu rend + passe l'a11y sans JS/motion** (SSR) ; la cinématique est une surcouche.
- `prefers-reduced-motion` → aucune animation, tout statique et lisible.
- **Son off par défaut** + mute facile et mémorisé.
- **Performance** : Gargantua + atmosphère doivent être **légers (CSS, pas de jank)** ; budget Lighthouse > 90 ; pause des animations hors-écran/onglet caché.
- **Contraste AA** partout ; letterbox/HUD n'obstruent pas le contenu au clavier.
- Bilingue FR (défaut) / EN préservé ; `/brief` sans régression.

## 9. Découpage en lots (chacun spec→plan→impl ou plan→impl)

1. **Fondations** : retrait de la couche WebGL v4 ; tokens sombre-filmique + système typo (grotesque/serif/mono) ; primitives « cadre film » (letterbox, vignette, grain, flicker) + atmosphère (halo, poussières) ; composant **Gargantua** (CSS/SVG).
2. **Accueil manifeste** : l'expérience de scroll (scènes, révélations, chaud→froid, HUD, timecode, skip).
3. **Son** : ambiance procédurale opt-in + mute persistant + garde-fous.
4. **/work** (index) + **/work/[slug]** (étude de cas) en registre sombre-cinématique.
5. **about / contact / brief / legal / privacy** ré-habillées + polish perf/a11y final.

Chaque lot produit un site fonctionnel et testable ; le contenu reste intact tout du long.
