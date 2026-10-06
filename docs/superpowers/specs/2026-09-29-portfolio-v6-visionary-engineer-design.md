# Portfolio v6 « The Visionary Engineer » : Design Spec

**Date** : 2026-09-29
**Auteur** : Rostel Panoumassi (avec assistance Claude)
**Statut** : direction, plan du site et architecture validés en brainstorming, spec en relecture
**Mise à jour 2026-10-06** : la présentation (DA Obsidian & Champagne, sculpture Möbius, accueil en 5 séquences) est remplacée par `2026-10-06-portfolio-v7-digital-dna-design.md`. Le fond (contenu, formulaires, données, SEO, déploiement) reste valable.
**Remplace** : `2026-09-28-portfolio-v6-collection-nocturne-design.md` (direction « Collection · Nocturne », Astro, cible recruteurs), conservée comme archive
**Source de la direction** : `new.md` (document de DA rédigé avec ChatGPT) et ses captures `image*.png`, à la racine du repo
**Prototype validé** : `.superpowers/brainstorm/288-1790671180/content/visionary-hero-v2.html` (hero + sculpture, forme B « Möbius », teinte Champagne)
**Repo** : `O:/Projets/my_portfolio`, branche `v6` (le squelette Astro y est remplacé par Next.js ; l'historique est conservé)

---

## 1. Contexte et objectif

Le 2026-09-28, le portfolio a été repensé pour des recruteurs (direction Nocturne, Astro, Lot 1 partiellement implémenté). Le 2026-09-29, Rostel a choisi une autre direction : **The Visionary Engineer**, un portfolio premium et cinématographique, à mi-chemin entre un studio numérique haut de gamme et un cabinet d'innovation.

- **Cible : des clients** (entreprises, organisations, porteurs de projet) qui cherchent quelqu'un pour **concevoir et réaliser un produit numérique**, pas un recruteur.
- **Marchés** : d'abord l'Afrique francophone et la France, puis l'international. **Français par défaut, anglais en seconde langue.**
- **Message** : Rostel ne se contente pas de développer ; il imagine le produit, structure sa conception et pilote sa réalisation.
- **Faits propriétaire** : 6 ans d'expérience, dont 3 comme tech lead ; Head of Engineering & Innovation chez KPS Groupe, Cotonou (UTC+1).

**Critère de succès** : un client comprend en moins d'une minute ce que Rostel construit, voit trois produits réels qui le prouvent, et peut lancer une demande de projet (brief) depuis n'importe quelle section.

## 2. Règles non négociables (propriétaire)

Toute violation est un bug.

1. Le site ne doit **pas avoir l'air « vibecodé »**.
2. **Jamais de dégradé violet.** **Pas de bouton en forme de pilule** (rayon max 2 px sur les boutons).
3. **Pas de faux avis, pas de fausses métriques, pas de faux compteur de clients.** Seuls les chiffres réels et sourcés (§6.3).
4. **Pas de hero au texte vague** : l'accroche dit concrètement quoi, pour qui.
5. **Pas d'emoji en guise d'icône** (SVG uniquement).
6. **Pas de tiret long (—)** dans les textes du site, FR et EN.
7. **Pas de curseur personnalisé**, pas d'élément qui suit la souris, pas d'effet magnétique.
8. **Jamais de photo générée par IA.** La sculpture est un objet 3D calculé en temps réel, pas une image générée.
9. **Obligatoires** : favicon complet, politique de confidentialité, CGU, aucun tag « made with AI » ou de constructeur de site.
10. **Confidentialité client** : aucun chiffre privé d'un client ; le client de TadagbeRhPlus reste anonymisé.
11. **Honnêteté d'attribution** : un projet co-développé nomme ses co-auteurs (ContractIQ : Jérémie Zitti) ; les propositions non commandées sont présentées comme des explorations ; Skilluv (réalisé par Jérémie Zitti) n'est jamais présenté comme un travail de Rostel ; les dépôts privés personnels (cadeaux, pages romantiques) ne sont jamais montrés.

**Assouplissements accordés pour cette direction uniquement (2026-09-29)** :
- la **sculpture 3D peut réagir subtilement au curseur** (inclinaison, ordinateur uniquement) ;
- les **animations au scroll sont permises** : apparition des titres et sections, rotation de la sculpture, parallaxe légère.
Dans les deux cas, **tout est désactivé sous `prefers-reduced-motion: reduce`**. Le scroll hijacking, les intros impossibles à passer et les animations qui retardent l'accès aux projets restent interdits.

## 3. Direction artistique

### 3.1 Principe

« Le luxe vient de la précision, de l'espace, de la lumière et de la qualité des compositions, pas de l'accumulation d'effets dorés. » Fond sombre mat, reflets métalliques chauds, typographie éditoriale, peu d'images mais grandes.

### 3.2 Couleurs « Obsidian & Champagne »

| Token | Valeur | Usage | Contraste sur `--obsidian` |
|---|---|---|---|
| `--obsidian` | `#101112` | fond | |
| `--obsidian-2` | `#161719` | surfaces, cartes | |
| `--ivory` | `#E9E5DC` | texte principal, bouton primaire | 15.0:1 |
| `--champagne` | `#BCA57B` | **seul accent** : mots clés, eyebrows, focus, survol | 7.9:1 |
| `--muted` | `#A7A49C` | texte secondaire | 7.6:1 |
| `--faint` | `#8A8C90` | libellés, métadonnées, indice de scroll | 5.6:1 |
| `--graphite` | `#55575B` | **décoratif uniquement** (filets, bordures, jamais du texte) | 2.6:1 |
| `--line` | `#26272A` | séparateurs | |

Thème sombre uniquement.

### 3.3 Typographie (via `next/font`, auto-hébergée)

- **Cormorant Garamond** (500, 600, italique 500) : titres éditoriaux, noms de projets, signature.
- **Manrope** (400, 500, 600) : navigation, texte courant, interface.
- **IBM Plex Mono** (400, 500) : métadonnées, technologies, numéros de séquence.

### 3.4 La sculpture signature

- **Forme** : anneau de **Möbius** en ruban métallique **strié** (brins parallèles), qui évoque la continuité entre l'idée et l'exécution.
- **Matière** : métal teinte **Champagne** (`#d8c196`, rugosité ~0.24, vernis), éclairage chaud principal et contre-jour froid discret, reflets issus d'un environnement généré localement (aucune texture ou HDR téléchargé).
- **Géométrie** (reprise du prototype) : courbe de base circulaire de rayon 1.9, largeur de ruban 0.95, une demi-torsion ; 6 brins parcourant deux tours (12 brins visibles) sur ordinateur, 3 brins (6 visibles) sur mobile.
- **Comportement** :
  - **hero** : occupe la moitié droite, rotation lente autonome ; inclinaison subtile selon le curseur (ordinateur uniquement, amplitude ±0.2 rad, lissée) ;
  - **au scroll** : pivote, glisse vers la droite et diminue ; **s'efface** à l'arrivée de la séquence Réalisations ; peut réapparaître comme transition avant la séquence Conversion ;
  - **mobile** : centrée au-dessus du texte, plus petite, sans réaction au toucher ;
  - **mouvement réduit, WebGL absent, ou chargement en cours** : une **image fixe** de la même sculpture (générée par script depuis la scène) est affichée à la place.
- **Chargement** : la scène est chargée **après** l'affichage du texte (import dynamique côté client, déclenché quand le navigateur est inactif). Le titre du hero reste l'élément LCP.

### 3.5 Mouvement

- Titres et blocs : apparition **une seule fois** à l'entrée dans l'écran (opacité + translation ≤ 18 px, ~0.9 s), décalage court entre éléments d'un même bloc. **Décision du 2026-09-29** : le hero apparaît en **CSS pur** au chargement (aucune dépendance au JavaScript, titre visible immédiatement pour le LCP) ; les blocs plus bas utilisent un **IntersectionObserver** natif qui pose un attribut déclenchant une transition CSS. GSAP n'est plus utilisé pour les apparitions.
- Images de projets : dévoilement par masque à l'entrée, zoom lent au survol (≤ 1.04).
- Liens : changement de contraste au survol. Boutons : léger déplacement du texte ou de la flèche au survol.
- Transitions entre pages : fondu court (≤ 300 ms).
- **Interdits** : scroll hijacking, pin qui bloque le défilement plus d'un écran, compteurs animés, effets curseur hors sculpture.

### 3.6 Composants signature

- **Monogramme « RP »** suivi d'un filet champagne (header) ; décliné en favicon (RP champagne sur obsidian), `.ico`, PNG 16/32/48/180/192/512, maskable, `site.webmanifest`.
- **Boutons** rectangulaires : primaire ivoire sur obsidian (champagne au survol), secondaire contour (bordure champagne au survol). Flèches en SVG.
- **Numéros de séquence** en mono (« 02 · Au-delà du développement »).
- **Carte de réalisation** : grande image, nom (serif), rôle (mono), défi résolu en une phrase, co-auteurs le cas échéant.
- **Bouton « Parler d'un projet »** présent dans le header sur toutes les pages et à la fin de chaque séquence de l'accueil.

## 4. Plan du site

Français à la racine, anglais sous `/en` (slugs traduits). Sélecteur de langue vers la même page dans l'autre langue.

| FR | EN | Rôle |
|---|---|---|
| `/` | `/en` | Accueil en 5 séquences (§4.1) |
| `/realisations` | `/en/work` | Tous les projets livrés : les 3 principaux en tête, puis les autres |
| `/realisations/[slug]` | `/en/work/[slug]` | Étude de cas (§4.2) |
| `/explorations` | `/en/explorations` | Propositions et études de design, présentées comme telles |
| `/a-propos` | `/en/about` | Parcours sur 6 ans, façon de travailler, vraie photo |
| `/brief` | `/en/brief` | **Conversion principale** : questionnaire projet |
| `/brief/merci` | `/en/brief/thanks` | Confirmation |
| `/contact` | `/en/contact` | Contact court |
| `/cv` | `/en/cv` | CV imprimable + PDF |
| `/terminal` | `/en/terminal` | Easter egg (commandes `help`, `ls`, `open <slug>`, `brief`, `contact`, `lang`, `clear`) |
| `/confidentialite` | `/en/privacy` | Politique de confidentialité (fonctionnement réel) |
| `/cgu` | `/en/terms` | Conditions d'utilisation |
| 404 | 404 | Même style, lien vers Réalisations |

### 4.1 Accueil

1. **Ouverture** (hero validé) :
   - eyebrow : « Ingénierie de produits numériques · Cotonou »
   - titre : « Je conçois et je livre des plateformes *SaaS, de paiement et de gestion*, de l'architecture à la production. »
   - texte : « **Rostel Panoumassi**, ingénieur produit et Head of Engineering chez KPS Groupe. Six ans d'expérience, dont trois comme tech lead. Ubbfy, ContractIQ, ZenLife : des produits en production, pas des maquettes. »
   - boutons : « Voir les réalisations », « Parler d'un projet » ; indice « Défiler pour découvrir ».
   - Version EN rédigée à partir de ce texte, relue par Rostel.
2. **Au-delà du développement** : « Je ne livre pas du code. Je livre des produits qui tiennent. » ; trois piliers **Vision** / **Architecture** / **Exécution** ; phrase signature « Les idées sont partout. *L'exécution est une discipline.* »
3. **Réalisations** : Ubbfy, ContractIQ, ZenLife (cartes §3.6), lien vers `/realisations`. La sculpture s'efface.
4. **Méthode** : 1. Découvrir, 2. Concevoir le système, 3. Construire et valider, 4. Faire évoluer (une phrase chacun, reprise de `new.md`).
5. **Conversion** : « Parlons de votre projet. » ; bouton vers `/brief`, email, LinkedIn, GitHub ; retour de la phrase signature.

### 4.2 Étude de cas

1. En-tête : nom, rôle, équipe et co-auteurs, année et durée, stack, statut (en ligne / archivé / privé), lien en ligne si disponible.
2. **Les enjeux** : le produit, pour qui, le problème.
3. **Fonctionnalités clés.**
4. **Contraintes et décisions techniques** (2 à 4, avec le pourquoi) : la part propre à Rostel.
5. **Galerie** : captures publiques et intérieures.
6. **Résultat** : uniquement s'il existe une preuve sourcée.
7. Projet précédent / suivant, puis bouton « Parler d'un projet ».

## 5. Architecture technique

### 5.1 Socle

- **Next.js 16** (App Router), **React 19**, TypeScript (version supportée par Next 16 ; ne pas monter sur TypeScript 7 sans vérifier la compatibilité), pnpm, Node 22.
- Pages **pré-rendues statiquement** (`generateStaticParams` pour les locales et les slugs). Seuls les Server Actions (brief, contact) et les route handlers (`/api/hit`, `/api/health`) s'exécutent à la demande.
- `output: 'standalone'`.
- **i18n : next-intl**, `defaultLocale: 'fr'`, `locales: ['fr', 'en']`, `localePrefix: 'as-needed'`, chemins traduits (`pathnames`). Dictionnaires `messages/{fr,en}.json` avec parité des clés vérifiée par un test.
- **Styles : Tailwind CSS 4**, tokens du §3.2 déclarés dans `@theme`.
- **Polices : `next/font/google`** (fichiers auto-hébergés au build, aucune requête vers Google à l'exécution).

### 5.2 3D et animation

- **three** + **@react-three/fiber** (pas de drei). Environnement de reflets via `RoomEnvironment` + `PMREMGenerator`.
- Composant `Sculpture` chargé par `next/dynamic` (`ssr: false`), monté après `requestIdleCallback` (repli `setTimeout`). Détection WebGL avant montage ; sinon image fixe.
- **Image fixe** `public/sculpture/mobius-{desktop,mobile}.webp` produite par `pnpm sculpture:poster` (Playwright capture la scène en mode figé).
- `dpr` plafonné (2 sur ordinateur, 1.5 sur mobile), rendu suspendu quand la sculpture est hors écran ou l'onglet masqué.
- **GSAP + ScrollTrigger** via `@gsap/react` (`useGSAP`) **uniquement pour la trajectoire de la sculpture**, chargé **avec le chunk de la sculpture** (jamais dans le JavaScript initial) ; `gsap.matchMedia()` coupe la trajectoire sous mouvement réduit. Les apparitions de texte n'utilisent pas GSAP (§3.5).

### 5.3 Contenu

- `content/realisations/{fr,en}/<slug>.mdx` et `content/explorations/{fr,en}/<slug>.mdx`.
- Chargeur maison (`fs` + frontmatter + validation **Zod**) exécuté au build ; rendu MDX côté serveur.
- Schéma d'un projet : `slug`, `kind: 'realisation' | 'exploration'`, `title`, `summary` (défi en une phrase), `year`, `duration?`, `role`, `team?`, `coauthors: string[]`, `stack: string[]`, `status: 'live' | 'archived' | 'private'`, `liveUrl?` (obligatoire si `live`), `featured: number | null` (1 à 3 pour l'accueil), `order`, `images[] { src, alt, kind: 'public' | 'interior' }` (≥ 1, `alt` obligatoire), `proofs[] { text, source }`, `seoDescription` (≤ 170 caractères).
- Un projet `exploration` ne peut pas avoir `featured` ni `status: 'live'` au nom d'un client ; sa page affiche « Proposition de refonte non commandée » (EN : « Unsolicited redesign proposal »).

### 5.4 Formulaires, données, statistiques

- **Brief et contact : Server Actions** avec `<form action>` (fonctionnent sans JavaScript ; `useActionState` ajoute les erreurs en direct).
  - Validation Zod côté serveur ; **champ piège** (rempli = succès factice, rien stocké) ; **limite 5 envois / heure / IP** en mémoire (IP jamais persistée).
  - Ordre : écriture **Firestore** (`submissions`), puis **email SMTP** (Nodemailer) à Rostel. Firestore en échec : l'email part quand même, erreur journalisée. Email en échec après Firestore réussi : succès, erreur journalisée. Les deux en échec : message invitant à écrire directement par email.
  - Succès : redirection vers `/brief/merci` (ou message de confirmation pour le contact).
  - Champs du brief : repris du schéma du brief existant (`server/utils/schemas/brief` de l'ancien projet Nuxt, consultable dans l'historique git).
- **Firestore** (projet Firebase dédié) via `firebase-admin`, uniquement côté serveur ; règles de sécurité : tout accès client refusé. Identifiants en variable `FIREBASE_SERVICE_ACCOUNT` (JSON base64).
- **Statistiques sans cookie** : `navigator.sendBeacon('/api/hit', { path, ref })` ; le serveur incrémente `stats_daily/{AAAA-MM-JJ}` (`total`, `paths.<clé>`, `refs.<hôte>`, `countries.<CC>` si l'en-tête `CF-IPCountry` existe). Bots ignorés, aucune IP ni identifiant stocké, réponse 204 sans jamais bloquer la page.
- **Supprimés** : MongoDB, SQLite, Telegram, GA4 / Firebase Analytics, toute bannière de cookies.

### 5.5 Référencement

- API `metadata` de Next, `sitemap.ts`, `robots.ts`, `hreflang` et canoniques.
- JSON-LD : `Person` (6 ans d'expérience, poste, KPS Groupe, Cotonou, `sameAs` LinkedIn et GitHub) + `ProfessionalService` sur l'accueil ; `CreativeWork` par projet.
- **Image de partage par projet** avec `next/og` (nom, rôle, monogramme, palette).

### 5.6 Déploiement

- Dockerfile multi-étapes `node:22-alpine`, build standalone, `CMD node server.js`, `HEALTHCHECK` sur `/api/health`.
- Variables Coolify : `FIREBASE_SERVICE_ACCOUNT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`, `NEXT_PUBLIC_SITE_URL` (défaut `https://rostelmissimawu.com`).
- Une seule instance (le limiteur en mémoire le suppose).

## 6. Contenu

### 6.1 Réalisations

**Mises en avant sur l'accueil (ordre)** :
1. **Ubbfy** : ERP complet avec pointage géolocalisé, refonte menée par Rostel (Django 5, DRF, PostgreSQL, Vue 3, Flutter). En ligne : app.ubbfy.com.
2. **ContractIQ** : SaaS B2B d'analyse de contrats par IA (Next.js 15, MongoDB, Gemini avec repli OpenAI, FedaPay, e-signature, multi-organisation). **Co-développé avec Jérémie Zitti.** Pas d'URL publique. Les statistiques codées en dur dans sa page d'accueil (« 500+ entreprises », etc.) **ne sont jamais reprises**.
3. **ZenLife** : application bien-être (planning, budget, chat, rappels), Spring Boot + Redis + WebSocket, Vue 3 + Capacitor, solo. zenlife.kheios.com était hors ligne (erreur 522) le 2026-09-28 : lien affiché seulement s'il répond au moment de la mise en ligne.

**Autres réalisations** (sur `/realisations`, après les 3 mises en avant, triées par année décroissante puis par champ `order`) : Freelance Club (KPS), Orinsu, IT-Opportunities-Tracker, MonCarnet (moncarnet.kheios.com), LeConsultant (leconsultant.bj), TadagbeRhPlus (tadagberhplus.com), WhatsPay (whatspay.africa), Kaba, Upgrade Afrique / test d'anglais (upgrade-afrique.com), EasyToWork (easytowork.fr), Planus Analytics (planus-analytics.com), CCNS Bénin (ccnsbenin.vercel.app). Rostel a confirmé avoir travaillé sur Freelance Club, Orinsu et IT-Opportunities-Tracker ; son rôle exact y est à préciser (aucun commit ne lui est attribué dans ces dépôts d'organisation).

Inventaire détaillé des dépôts (stack, volumes, contributeurs) : `.superpowers/inventory/github-personal.md` et `github-orgs.md` (ignorés par git).

### 6.2 Explorations

Bénin Bouge (refonte non sollicitée du média beninbouge.com, carte interactive du Bénin, pré-rendu des aperçus de partage), Le Centre, Naja Experts, Procom. **Les portraits de personnalités politiques du prototype Bénin Bouge (Talon, Wadagni, Wallace) et la carte issue d'une image de stock ne sont jamais montrés.**

### 6.3 Garde-fou « pas de fausses métriques »

- Chaque élément de `proofs[]` porte une `source` interne non affichée. **Un chiffre sans source fait échouer le build.**
- Un test parcourt `summary` et le corps MDX de chaque projet et signale tout nombre de type métrique (pourcentage, signe, suffixe « + », valeur ≥ 100 hors année) absent des preuves du projet. Les versions (« Laravel 12 », « PHP 8.2 ») et les années ne sont pas des métriques. (Logique déjà écrite et testée côté Astro dans `src/content/metrics.ts`, à transposer.)
- **Preuves confirmées par Rostel** : CCNS (+240 % de trafic organique en 6 mois, score SEO Lighthouse 100), TadagbeRhPlus (−85 % de saisie manuelle, 3 mises à jour CNSS sans régression), ZenLife (1 200+ utilisateurs actifs en 6 mois). Les volumes comptés dans le code (ex. 52 modèles et ~213 routes API pour ContractIQ) sont admis avec la source « compté dans le dépôt ».

## 7. Qualité

- **Performance** : le titre du hero est l'élément LCP (< 2.5 s en 4G simulée) ; la scène 3D ne bloque ni le premier rendu ni l'interaction ; JavaScript initial hors scène 3D ≤ 160 Ko gzip (révisé le 2026-09-29 : le socle Next + React + next-intl pèse à lui seul ~135 Ko ; GSAP est sorti du JavaScript initial) ; Lighthouse ≥ 90 en performance et ≥ 95 en accessibilité, bonnes pratiques et SEO sur l'accueil et une étude de cas.
- **Accessibilité** : WCAG 2.2 AA. Lien d'évitement, focus visible (contour champagne), navigation clavier complète, `alt` partout, la sculpture est décorative (`aria-hidden`), formulaires avec erreurs annoncées.
- **Sans JavaScript** : contenu entièrement lisible, image fixe à la place de la sculpture, formulaires fonctionnels.
- **Mouvement réduit** : aucune animation, image fixe.

## 8. Tests

- **Vitest** : schéma de contenu et garde-fou métriques (sur tout le contenu réel), parité des messages FR/EN, limiteur, encodage des clés de statistiques, filtre bots, logique de repli Firestore/email des actions (services simulés).
- **Playwright + axe** : accueil FR et EN, bascule de langue sur une page profonde, étude de cas, explorations (mention « proposition non commandée »), brief avec et sans JS, contact, 404, terminal, mouvement réduit (image fixe, aucune animation), 360 px sans débordement.
- **Vérificateur des règles propriétaire** sur le HTML et le CSS construits : aucun `—`, aucun emoji d'interface, aucun `border-radius` de pilule sur les boutons, aucun dégradé violet, aucun `cursor:` personnalisé en image (`cursor: url(...)`), aucune mention « made with AI », favicon présent, pages confidentialité et CGU présentes.

## 9. Branche et mise en production

- Branche `v6` : le premier lot remplace le squelette Astro par Next.js.
- Le plan `docs/superpowers/plans/2026-09-28-portfolio-v6-lot1-foundations.md` (Astro) est abandonné ; son espace de travail `.superpowers/sdd/…lot1-foundations/` est supprimé une fois ce plan remplacé.
- Mise en production uniquement quand tout le site du §4 est prêt et testé ; la branche déployée par Coolify est vérifiée avec Rostel au moment de la bascule.

## 10. Ce que Rostel doit fournir

1. **ContractIQ** : captures (le dépôt n'en contient aucune ; il faut lancer l'application localement avec MongoDB, une clé Gemini et `db:seed`, ou fournir des captures existantes) ; accord de Jérémie Zitti pour la mention de co-auteur.
2. **ZenLife** : remise en ligne ou confirmation qu'on l'affiche sans lien ; captures.
3. **Ubbfy** et autres réalisations : captures intérieures (back-office, tableaux de bord), données sensibles floutées.
4. **Freelance Club, Orinsu, IT-Opportunities-Tracker** : rôle exact, période, ce qui a été construit.
5. Validation des textes (accroche FR et EN, études de cas) rédigés à partir du contenu existant.
6. Projet Firebase + clé de compte de service ; identifiants SMTP.

**Hors code mais urgent** : changer les secrets exposés dans des dépôts (identifiants MongoDB en clair dans le README de `N01zet_backend`, `.env` versionnés dont `orinsu_back/.env.production`, clé `creati.pem` dans `api_creati`).

## 11. Hors périmètre

Blog, CMS, thème clair, témoignages ou avis (jamais), son, curseur personnalisé, newsletter, Telegram, GA4 et bannière de cookies, présentation de Skilluv comme travail de Rostel.
