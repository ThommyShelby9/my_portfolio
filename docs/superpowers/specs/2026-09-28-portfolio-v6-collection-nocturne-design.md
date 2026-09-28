# Portfolio v6 « Collection · Nocturne » : Design Spec

**Date** : 2026-09-28
**Auteur** : Rostel Panoumassi (avec assistance Claude)
**Statut** : direction et architecture validées en brainstorming, spec en relecture
**Repo** : `O:/Projets/my_portfolio`, nouvelle branche `v6`, reconstruction complète (aucun code Nuxt conservé)
**Maquette de référence** : `.superpowers/brainstorm/2023-1790585654/content/nocturne-home-v2.html` (accueil haute fidélité validé)

---

## 1. Contexte et objectif

Les versions v3 (WebGL), v4 (Orrery) et v5 (Manifeste / trou noir, jamais mergée) cherchaient le spectacle. La v6 repart de zéro, avec un nouveau framework et une nouvelle direction artistique, et **un seul objectif : convaincre un recruteur international**.

- **Cible prioritaire** : recruteurs et hiring managers internationaux (Europe, Amérique du Nord), qui passent 30 à 90 secondes sur le site, parfois via un résumeur IA.
- **Postes visés** : Senior **ou** Lead. Le site doit prouver les deux : il code encore sérieusement, et il mène des équipes.
- **Faits propriétaire (source : Rostel)** : **6 ans d'expérience, dont 3 comme tech lead.** Poste actuel : Head of Engineering & Innovation, KPS Groupe, Cotonou (UTC+1). Ces faits priment sur `profile.md` (export LinkedIn qui sous-estime le parcours).
- **Langues** : anglais par défaut, français en seconde langue.
- **Preuves disponibles** : sites en ligne, captures produits, GitHub public. Pas d'articles ni d'ADR écrits.

**Critère de succès** : en moins de 60 secondes, un recruteur sait qui est Rostel, à quel niveau il travaille, sur quoi, peut vérifier par lui-même (liens en ligne, GitHub) et sait comment le contacter ou télécharger son CV.

## 2. Règles non négociables (propriétaire)

Elles s'appliquent à chaque composant, chaque texte et chaque maquette. Toute violation est un bug.

1. Le site ne doit **pas avoir l'air « vibecodé »** (template IA).
2. **Jamais de dégradé violet.** **Pas de bouton en forme de pilule** (rayon max 2 px).
3. **Pas de faux avis, pas de fausses métriques, pas de faux compteur de clients.** Seuls les chiffres réels et sourcés (voir §6.2).
4. **Pas de hero au texte vague** : l'accroche dit concrètement qui, quoi, pour qui.
5. **Pas d'emoji en guise d'icône** : icônes SVG uniquement.
6. **Pas de tiret long (—)** dans les textes du site (EN et FR).
7. **Pas d'animation de scroll exagérée. Aucune animation liée au curseur** (pas de curseur custom, d'effet magnétique ou d'élément qui suit la souris).
8. **Jamais de photo générée par IA.** Seule la vraie photo de Rostel (`public/images/profile.jpg`).
9. **Obligatoires** : favicon complet, page de politique de confidentialité, page de CGU, aucun tag « made with AI » ou « built with [builder] ».
10. **Confidentialité client** : aucun chiffre privé d'un client (effectifs, nombre d'entreprises gérées, etc.). Le client de TadagbeRhPlus reste anonymisé (« HR consulting firm, Benin »).

## 3. Direction artistique : « Collection · Nocturne »

### 3.1 Concept

Le portfolio est **un musée, la nuit**. Chaque projet est une **œuvre** accrochée dans une salle sombre, éclairée par un **spot**, et accompagnée d'un **cartel** (la fiche d'une œuvre au musée). Le cartel correspond exactement à ce que cherche un recruteur : quoi, quand, avec quoi, quel rôle, quelle preuve. La contrainte recruteur devient le concept.

Le vocabulaire du site suit la métaphore sans la surjouer : *Collection* (projets), *Curator* (à propos), *Wall label* (encart de faits), *Room I* (salle des pièces maîtresses), *Catalogue* (vue tableau), *la réserve* (terminal).

### 3.2 Tokens

| Token | Valeur | Usage |
|---|---|---|
| `--wall` | `#0e0d0c` | fond (noir chaud, jamais `#000`) |
| `--wall-2` | `#141210` | fond des murs d'accrochage, cartes |
| `--wall-3` | `#1b1916` | survols, champs de formulaire |
| `--ivory` | `#ece6da` | texte principal |
| `--muted` | `#a39b8e` | texte secondaire |
| `--faint` | `#8a8276` | libellés, n° d'inventaire (5.1:1 sur `--wall`, 4.9:1 sur `--wall-2` ; remplace le `#6f685e` de la maquette, à 3.5:1) |
| `--gold` | `#e3bd74` | **seul accent** : lumière, preuves, eyebrow, focus |
| `--live` | `#8fc79a` | statut « Live » uniquement |
| `--line` | `#2c2823` | filets, bordures |

Thème **sombre uniquement** (pas de bascule clair/sombre).

### 3.3 Typographie (auto-hébergée via Fontsource, aucun appel à Google Fonts)

- **Cormorant Garamond** (500/600, italique) : titres, noms d'œuvres, citations.
- **Schibsted Grotesk** (400/500/600) : texte courant, UI, cartels.
- **IBM Plex Mono** (400/500) : numéros d'inventaire, eyebrows, en-têtes de tableau.

### 3.4 Lumière et mouvement

- **Spot** : quand une œuvre entre dans le viewport (IntersectionObserver, seuil 0.35), son cône de lumière passe de 18 % à 100 % d'opacité et la capture de `brightness(.42)` à `brightness(1)`, en 1.1 s ease-out, **une seule fois**. Aucun déplacement, aucune transformation.
- **Transitions de page** : View Transitions d'Astro, fondu ≤ 250 ms.
- Survols : couleur et soulignement uniquement.
- `prefers-reduced-motion: reduce` ou absence de JS : tout est allumé d'emblée, aucune transition.
- **Interdits** : parallaxe, pin de section, scroll-jacking, texte qui se découpe ou monte, compteurs animés, effets curseur.

### 3.5 Composants signature

- **Cartel** : n° d'inventaire (mono), nom (serif), une ligne de description, lignes `Role` / `Materials`, **preuve** en or (si sourcée), liens « Read the case » + domaine en ligne (icône SVG flèche externe).
- **Mur d'accrochage** : fond `--wall-2`, capture dans un cadre noir de 6 px, ombre portée profonde, cône de lumière en `::before`.
- **Wall label** : encart bordé qui liste les faits (œuvres, en ligne aujourd'hui, matériaux, poste, ville).
- **Bascule Exposition ⇄ Catalogue** : contrôle segmenté rectangulaire (`aria-pressed`), état reflété dans l'URL (`?view=catalogue`).
- **Boutons** : rectangulaires, primaire ivoire sur fond sombre (or au survol), secondaire = lien souligné.
- **Favicon** : étiquette d'inventaire (rectangle or + œillet + « RP ») en SVG, déclinée en `.ico`, PNG 16/32/48/180/192/512, maskable et `site.webmanifest`.

## 4. Plan du site et comportement des pages

Toutes les pages existent en EN (`/…`) et FR (`/fr/…`). Le sélecteur de langue renvoie vers la même page dans l'autre langue.

| Page | Contenu et comportement |
|---|---|
| `/` Entrée | Header (marque, nav, statut « Open to Senior and Lead roles », EN/FR). Hero : eyebrow, accroche concrète (backends HR / paiements / ERP + mène l'équipe), lede avec poste, stack, disponibilité remote UTC+1, et mention **6 ans dont 3 comme tech lead**. CTA « Enter the collection » + « Download CV (PDF) ». Wall label. **Room I** : 4 pièces maîtresses en accrochage asymétrique. Catalogue complet (bascule, vue Catalogue par défaut sur l'accueil). Bloc Curator (vraie photo + phrase). Footer. |
| `/work` La Collection | Les 12 œuvres. Vue Exposition (grille de murs éclairés) ou Catalogue (tableau : n°, œuvre, année, rôle, matériaux, statut). Vue par défaut : Exposition. |
| `/work/[slug]` Une pièce | 1) grand cartel (rôle, équipe, durée, matériaux, statut, liens en ligne et GitHub) ; 2) contexte (1-2 phrases) ; 3) **ce que j'ai fait moi**, distinct de l'équipe ; 4) **2-3 décisions techniques** avec le pourquoi ; 5) galerie de captures (publiques + intérieures) éclairées ; 6) preuve sourcée si elle existe ; 7) œuvre précédente / suivante. |
| `/about` Curator | Parcours sur 6 ans, 3 ans de lead, façon de mener une équipe (andragogie comme atout), vraie photo, lien CV. |
| `/cv` | Page HTML imprimable (CSS `@media print`) générée depuis les mêmes données, + PDF téléchargeable. |
| `/contact` | Formulaire (nom, email, message, champ piège), email et LinkedIn en clair. |
| `/brief` + `/brief/confirmation` | Questionnaire projet (reprend les champs de `server/utils/schemas/brief` de l'existant), pour les missions freelance. |
| `/terminal` | « La réserve du musée » : terminal texte. Commandes : `help`, `ls works`, `open <slug>`, `cv`, `contact`, `lang en|fr`, `clear`. |
| `/privacy`, `/terms` | Rédigés pour le fonctionnement **réel** (Firestore, compteur sans cookie, SMTP, hébergement Coolify), EN + FR. |
| `404` | « This room is empty », lien vers la Collection. |

**Pièces maîtresses de Room I (ordre)** : Ubbfy, TadagbeRhPlus, Freelance Club, WhatsPay.

## 5. Architecture technique

### 5.1 Socle

- **Astro** (dernière version stable), TypeScript strict, pnpm.
- **Rendu mixte** : toutes les pages sont pré-rendues en HTML statique. Seules les routes API sont rendues à la demande (`export const prerender = false`) via **`@astrojs/node` en mode standalone**.
- **Zéro framework UI côté client.** Les rares scripts (spot, bascule, validation de formulaire, terminal) sont du TypeScript natif dans des balises `<script>` Astro.
- **i18n** : routage i18n natif d'Astro, `defaultLocale: 'en'`, `locales: ['en', 'fr']`, FR préfixé. Chaînes d'interface dans `src/i18n/{en,fr}.ts` avec un typage qui force la parité des clés.

### 5.2 Arborescence cible

```
src/
  content/
    works/{en,fr}/<slug>.mdx     # les 12 œuvres
    pages/{en,fr}/{about,privacy,terms}.mdx
    profile.yaml                 # faits partagés : CV, JSON-LD, wall label
  content.config.ts              # schémas Zod des collections
  components/                    # Cartel, Wall, WallLabel, CatalogueToggle, Header, Footer, ...
  layouts/Base.astro
  pages/                         # routes EN + [lang] pour FR
    api/{contact,brief,hit,health}.ts
  lib/                           # firestore.ts, mailer.ts, rate-limit.ts, schemas.ts, stats.ts
  i18n/{en,fr}.ts
  styles/tokens.css
public/                          # favicons, cv PDF, og par défaut
scripts/{capture.mjs,cv-pdf.mjs}
tests/{unit,e2e}/
```

### 5.3 Données et services

- **Firebase (projet dédié), Firestore uniquement côté serveur** via `firebase-admin`. Identifiants dans la variable `FIREBASE_SERVICE_ACCOUNT` (JSON encodé en base64). **Règles de sécurité Firestore : tout accès client refusé.**
- **Collection `submissions`** : `{ type: 'contact' | 'brief', locale, payload, createdAt }`. Aucune IP, aucun user-agent.
- **Collection `stats_daily/{YYYY-MM-DD}`** : compteurs incrémentés (`FieldValue.increment`) : `total`, `paths.<clé>`, `refs.<hôte>`, `countries.<CC>` (seulement si l'en-tête `CF-IPCountry` est présent). Les clés de chemin sont encodées pour être des noms de champ Firestore valides.
- **Email** : SMTP via Nodemailer (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`). Canal d'alerte vers Rostel.
- **Supprimés** : MongoDB, SQLite, Telegram, Pinia, Tres/Three, GSAP.

### 5.4 Routes API

| Route | Comportement |
|---|---|
| `POST /api/contact` et `POST /api/brief` | Accepte `application/x-www-form-urlencoded` (formulaire sans JS) et JSON. Champ piège rempli : réponse de succès factice, rien n'est stocké. Limite **5 envois / heure / IP** en mémoire (l'IP n'est jamais persistée). Validation Zod : en cas d'erreur, 422 (JSON) ou ré-affichage du formulaire avec les erreurs (sans JS). Ensuite : écriture Firestore, **puis** email. Si Firestore échoue, l'email part quand même et l'erreur est journalisée. Si l'email échoue mais que Firestore a réussi, succès (la donnée est archivée) et l'erreur est journalisée. Si les deux échouent : 503 et message invitant à écrire directement par email. Succès sans JS : redirection 303 vers la page de confirmation. |
| `POST /api/hit` | Reçoit `{ path, ref }` via `navigator.sendBeacon`. Ignore les bots (UA), les chemins hors site et les référents internes. Réponse 204, sans jamais bloquer ni échouer côté visiteur. Pas de cookie, pas d'identifiant, pas de `localStorage`. |
| `GET /api/health` | 200 `{ ok: true }` pour le healthcheck Coolify. |

### 5.5 Images

- Les captures passent par `astro:assets` : AVIF/WebP responsives, dimensions explicites, `loading="lazy"` sauf la première œuvre visible.
- **`pnpm capture`** (Playwright, Edge ou Chromium local) : capture les pages publiques de chaque œuvre en ligne en 1440×900 @2x, avec un cadrage identique, dans `src/assets/works/<slug>/`.
- **Captures intérieures** (back-office, dashboards) fournies par Rostel : 2 à 4 par pièce maîtresse, données sensibles floutées, même dossier. Chaque image a un `alt` obligatoire dans le schéma.
- **Images OG** : une par œuvre, recadrée depuis sa capture principale au build (sharp), plus une OG par défaut.

### 5.6 SEO et lisibilité par les outils d'IA

- `@astrojs/sitemap`, `hreflang` EN/FR, URL canoniques, `robots.txt`.
- JSON-LD : `Person` (nom, poste, employeur, ville, `knowsAbout`, liens sameAs GitHub/LinkedIn, expérience) sur toutes les pages, `CreativeWork` par œuvre.
- HTML sémantique strict (`article`, `dl` pour les cartels, `table` pour le catalogue).

### 5.7 Déploiement (Coolify)

- Dockerfile multi-étapes : `node:22-alpine`, `pnpm install --frozen-lockfile`, `pnpm build`, image finale avec `dist/` et les dépendances de production, `CMD node dist/server/entry.mjs`, `HEALTHCHECK` sur `/api/health`.
- Variables d'environnement définies dans Coolify : Firebase, SMTP, `PUBLIC_SITE_URL`.
- Une seule instance (le limiteur de débit en mémoire suppose une instance).

## 6. Modèle de contenu

### 6.1 Collection `works` (schéma Zod)

`slug`, `inventory` (format `RP-AAAA-NN`), `title`, `summary` (une ligne), `year`, `role`, `team?`, `duration?`, `materials[]`, `status: 'live' | 'archived' | 'private'`, `liveUrl?` (obligatoire si `live`), `githubUrl?`, `room: number | null` (ordre en Room I, `null` si hors salle), `screenshots[] { src, alt, kind: 'public' | 'interior' }` (au moins 1), `proofs[]`, `seoDescription`.

### 6.2 Garde-fou « pas de fausses métriques »

Chaque élément de `proofs[]` a la forme `{ text, source }`, où `source` est une note interne non affichée (ex. « confirmé par Rostel, 2026-09-28 » ou « compté dans le repo ubbfy, 20 apps Django »). **Un chiffre sans `source` fait échouer le build.** Un test vérifie aussi qu'aucun chiffre n'apparaît dans `summary` ou le corps MDX d'une œuvre sans figurer dans ses `proofs`.

**Preuves validées à ce jour** : CCNS (+240 % de trafic organique en 6 mois, score SEO Lighthouse 100), TadagbeRhPlus (−85 % de saisie manuelle, 3 mises à jour CNSS sans régression), ZenLife (1 200+ utilisateurs actifs en 6 mois). Les chiffres d'ingénierie comptés dans le code (ex. 38 modèles de domaine Freelance Club, 20 apps Django Ubbfy) sont admis avec la source « compté dans le repo ».

### 6.3 Statut des œuvres au 2026-09-28

En ligne (lien affiché) : Ubbfy (app.ubbfy.com), TadagbeRhPlus (tadagberhplus.com), Freelance Club (freelanceclubs.com), WhatsPay (whatspay.africa), Upgrade Afrique (upgrade-afrique.com), LeConsultant (leconsultant.bj), EasyToWork (easytowork.fr), Planus Analytics (planus-analytics.com), CCNS (ccnsbenin.vercel.app).
Hors ligne (erreur 522) : ZenLife (zenlife.kheios.com), Mariette H. Nobre (mariettehuguette.com), statut `archived` sans lien tant qu'ils ne répondent pas. Bilal Sekou : `private`.

### 6.4 Migration

Le contenu source est celui de la branche `v5-manifesto` (`content/{en,fr}/work/*.md`, déjà anonymisé). Il est réécrit dans le nouveau schéma : métadonnées mappées, résultats convertis en `proofs` sourcées ou supprimés, corps restructuré selon les sections du §4 (contexte / ce que j'ai fait / décisions / preuve). Tous les tirets longs sont retirés. Les images héritées en double (`bilal.png`, `consultant.png`, `noizet.png`, `tadagbe.png`, `inventoring.jpg`) ne sont pas reprises.

## 7. Qualité

- **Performance** : JS ≤ 15 Ko gzip par page (hors `/terminal`), LCP < 2 s en 4G simulée, Lighthouse ≥ 95 dans les 4 catégories sur `/`, `/work`, une page `/work/[slug]`.
- **Accessibilité** : WCAG 2.2 AA. Contrastes vérifiés (dont `--faint`), navigation clavier complète, focus visible (contour or), lien d'évitement, `alt` sur toutes les images, formulaires avec erreurs annoncées (`aria-live`).
- **Sans JS** : toutes les pages lisibles, œuvres allumées, formulaires fonctionnels. Seuls le terminal et la bascule de vue requièrent JS (la bascule se replie sur des liens `?view=`).

## 8. Tests

- **Vitest** : schémas de contenu (dont le garde-fou §6.2 et la parité EN/FR des œuvres et des clés i18n), limiteur de débit, encodage des clés de stats, filtre bots, validation des formulaires, logique de repli Firestore/email (services simulés).
- **Playwright** : accueil (spot, bascule, CTA CV), navigation EN ⇄ FR, page d'œuvre, formulaire contact avec et sans JS (services simulés), 404, terminal (`ls works`, `open`), et **axe** sur toutes les pages.
- **Lint des règles propriétaire** (test automatisé sur le HTML construit) : aucun `—`, aucun emoji dans les éléments d'interface, aucun `border-radius` ≥ 9999 px, aucun `linear-gradient` avec des teintes violettes, aucune mention « made with AI », présence du favicon et des pages `/privacy` et `/terms`.
- **Lighthouse CI** avec le budget du §7.

## 9. Branche et mise en production

- Création de la branche `v6` à partir de `v5-manifesto`. Le premier commit d'implémentation vide l'arborescence Nuxt et initialise Astro (l'historique reste consultable).
- Les maquettes restent dans `.superpowers/` (ignoré par git).
- La v6 n'est mise en production qu'une fois complète (toutes les pages du §4, tests verts). La branche déployée par Coolify est vérifiée avec Rostel au moment de la bascule (`main` actuel date de janvier 2025).

## 10. Ce que Rostel doit fournir

1. 2 à 4 captures intérieures par pièce maîtresse (Ubbfy, TadagbeRhPlus, Freelance Club, WhatsPay), données sensibles floutées.
2. Validation des textes : accroche, phrase du Curator, « ce que j'ai fait » et décisions techniques de chaque œuvre (brouillons rédigés par Claude à partir du contenu existant).
3. URL GitHub et LinkedIn à afficher, email de contact public.
4. Un projet Firebase + une clé de compte de service, et les identifiants SMTP (variables Coolify).
5. Statut de ZenLife et du site de Mariette (panne passagère ou archive).

## 11. Hors périmètre

Blog, CMS, thème clair, témoignages ou avis (jamais), 3D/WebGL, son, newsletter, notifications Telegram, Firebase Analytics / GA4 et toute bannière de cookies.
