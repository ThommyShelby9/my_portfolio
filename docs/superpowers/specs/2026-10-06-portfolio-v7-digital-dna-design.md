# Portfolio v7 « Digital DNA » : Design Spec

**Date** : 2026-10-06
**Auteur** : Rostel Panoumassi (avec assistance Claude)
**Statut** : concept, direction visuelle, parcours et architecture validés en brainstorming ; spec en relecture
**Remplace** : la présentation de `2026-09-29-portfolio-v6-visionary-engineer-design.md` (Obsidian & Champagne, sculpture Möbius). **Le fond de la v6 est conservé** (§5.1) ; ses sections sur les formulaires, les données, le contenu et le SEO restent valables sauf mention contraire ici.
**Source du concept** : `new.md` (version du 2026-10-06 : concepts immersifs, synthèse « ROSTEL // DIGITAL SYSTEMS » + « Digital DNA »).
**Maquettes validées** : `.superpowers/brainstorm/1688-1791292688/content/direction-visuelle-v3.html` (direction **B · Instrument**) et `parcours.html` (6 scènes).
**Repo** : `O:/Projets/my_portfolio`, branche **`v7`** créée depuis `v6` (HEAD `3a5a39a`). `main` et le site en ligne ne changent qu’à la mise en production (§9).

---

## 1. Contexte et objectif

Le 2026-10-06, Rostel abandonne la présentation « Visionary Engineer » pour une expérience **beaucoup plus immersive et différente**, tirée de `new.md` : **Digital DNA + séquence Architect**. Une hélice d’ADN en particules, en temps réel, sert de colonne vertébrale au site. Ses « gènes » expliquent la façon dont Rostel conçoit les produits, et chaque projet est présenté comme une expression de cet ADN.

- **Cible : des clients** (entreprises, organisations, porteurs de projet) qui cherchent quelqu’un pour concevoir et livrer un produit numérique.
- **Langues** : français par défaut, anglais en seconde langue (`/en`).
- **Faits propriétaire** : 6 ans d’expérience, dont 3 comme tech lead ; Head of Engineering & Innovation chez KPS Groupe, Cotonou (UTC+1).
- **Message** : « Je ne fais pas simplement du code. Je conçois, construis, déploie et fais évoluer des systèmes numériques. »

**Critères de succès**
1. Un client comprend le niveau de Rostel avant d’avoir lu un CV : en moins d’une minute il sait ce que Rostel construit, voit trois produits réels et peut lancer un brief.
2. L’expérience est mémorable (scène 3D signature, transitions pilotées par le scroll) **sans** retarder l’accès au contenu.
3. Le site reste rapide en 4G et lisible en 3G au Bénin, entièrement lisible sans la 3D (SEO, accessibilité, sans JavaScript).

## 2. Règles non négociables (propriétaire)

Toute violation est un bug. Elles reprennent la v6 (§2 de la spec v6) :

1. Pas d’apparence « vibecodée ».
2. **Jamais de violet ni de dégradé violet.** Pas de bouton pilule (rayon ≤ 2 px sur tous les contrôles).
3. Pas de faux avis, fausses métriques, faux compteurs **ni faux statuts** (« SYSTEM ONLINE », « DEPLOYED », barres de chargement factices).
4. Pas de hero au texte vague : le premier écran dit concrètement **quoi** et **pour qui** (§4.1, scène 00).
5. Pas d’emoji en guise d’icône (SVG uniquement).
6. Pas de tiret long (—) dans les textes du site, FR et EN.
7. Pas de curseur personnalisé, pas d’élément qui suit la souris, pas d’effet magnétique.
8. Jamais de photo générée par IA. L’hélice est calculée en temps réel.
9. Obligatoires : favicon complet, politique de confidentialité, CGU, aucun tag « made with AI ».
10. Confidentialité client (TadagbeRhPlus anonymisé, aucun chiffre privé de client).
11. Honnêteté d’attribution (ContractIQ avec Jérémie Zitti ; explorations présentées comme propositions ; jamais Skilluv ; jamais de dépôt privé personnel).

**Assouplissements pour cette direction** (prolongent ceux de la v6) :
- animations **pilotées par le scroll très présentes** (états de l’hélice, transitions de scènes) ;
- l’hélice peut **s’incliner légèrement selon le pointeur** sur ordinateur (inclinaison de quelques degrés, aucun élément ne suit le curseur) ;
- **tout est désactivé sous `prefers-reduced-motion: reduce`** (hélice figée, fondus simples). Restent interdits : scroll hijacking (le scroll natif n’est jamais intercepté), intro ou écran « ENTER », chargement factice, animation qui retarde l’accès au contenu.

**Écarté de `new.md`** : écran « SYSTEM STATUS 100 % » et bouton « [ ENTER SYSTEM ] », barres de compétences (scène 05 de `new.md`), statuts de mission, curseur « pointeur système », terminal partout, accent violet ou néon, projets inconnus (Albumia, Rythmia).

## 3. Direction artistique « Instrument »

### 3.1 Principe

Un instrument de mesure scientifique haut de gamme : graphite chaud, lumière ivoire, un seul signal orange, typographie grotesque en capitales pour les titres, mono pour les mesures et libellés. Registre : **scientifique + technologique + architectural + premium**. Ni cyberpunk, ni hacker, ni gaming.

### 3.2 Couleurs

| Token | Valeur | Usage | Contraste sur `--graphite` |
|---|---|---|---|
| `--graphite` | `#121211` | fond | |
| `--graphite-2` | `#1A1A18` | surfaces, cartes | |
| `--ivory` | `#EDEAE4` | texte principal, particules, bouton primaire | ≈ 15.5:1 |
| `--signal` | `#FF5A1F` | **seul accent** : gènes actifs, numéros de scène, focus, survol, liens d’action | ≈ 6.0:1 |
| `--muted` | `#A8A59E` | texte secondaire | ≈ 7.6:1 |
| `--faint` | `#8B8984` | libellés, métadonnées | ≈ 5.4:1 |
| `--line` | `#2A2A27` | filets, bordures (jamais pour du texte) | |
| `--edge` | `#6B6964` | bordures de contrôles (WCAG 1.4.11) | ≈ 3.5:1 |

Les contrastes sont vérifiés par un test unitaire (calcul WCAG) au Lot 1. Aucune autre teinte saturée n’est autorisée ; le vérificateur des règles signale toute couleur saturée autre que `--signal` dans le CSS construit (tolérance pour les gris).

### 3.3 Typographie (`next/font/google`, auto-hébergée)

- **Archivo** (variable) : titres en capitales, graisse 800, interlettrage serré (−0.02 à −0.03 em) ; texte courant en 400.
- **IBM Plex Mono** : eyebrows, numéros de scène (« 01 · SÉQUENÇAGE »), gènes, métadonnées, terminal.
- Chiffres tabulaires pour les périodes et mesures.

### 3.4 L’hélice (scène signature)

- Double hélice faite de **particules** (≈ 20 000 sur ordinateur, ≈ 6 000 sur mobile ou appareil modeste), barreaux (paires de bases) en lignes fines, particules libres qui dérivent.
- Particules ivoire ; **orange signal** réservé aux paires et brins actifs.
- **Six états** (§4.1) calculés sur le GPU : chaque particule possède une position cible par état ; le shader interpole entre deux états consécutifs selon une valeur de progression unique.
- Légère respiration permanente (bruit), rotation lente ; inclinaison au pointeur sur ordinateur (§2).
- **Image fixe** (`public/dna/helix-{desktop,mobile}.webp`, produite par un script de capture comme le poster v6) affichée pendant le chargement, sans WebGL, en cas d’erreur et sous mouvement réduit.

### 3.5 Signature ADN d’un projet

Chaque projet a une **signature** : une forme déterministe calculée à partir de ses gènes (§6.1), par exemple un anneau à lobes dont chaque lobe correspond à un gène. Elle est rendue :
- en **particules** dans la scène 03 de l’accueil (brins qui se détachent de l’hélice) ;
- en **SVG statique** (même fonction pure) sur les cartes, l’en-tête de l’étude de cas et l’image de partage `next/og`.

### 3.6 Mouvement

- Le scroll natif pilote une progression continue ; GSAP ScrollTrigger (`scrub`) la traduit en uniforme du shader. Aucune section n’est épinglée au point de bloquer le scroll plus d’un écran.
- Les textes apparaissent par fondu et léger décalage (IntersectionObserver, comme la v6) ; le titre du hero est visible dès le premier rendu (CSS uniquement).
- Transitions de page ≤ 300 ms.

### 3.7 Composants signature

- **Paire de gènes** : deux libellés mono reliés par un filet, bouton « Séquencer » (`aria-expanded`) qui déplie les preuves.
- **Couche de construction** : étape numérotée (Idée, Architecture, Développement, Infrastructure, Production) avec une phrase.
- **Carte projet** : signature SVG, nom, rôle, gènes, capture, chiffres confirmés uniquement, lien vers l’étude de cas.
- **Boutons** rectangulaires (≤ 2 px), primaire ivoire sur graphite, secondaire filet ; focus orange signal.

## 4. Plan du site

Identique à la v6 (§4 de la spec v6) : `/`, `/realisations` (`/en/work`), `/realisations/[slug]`, `/explorations` (titre affiché « Laboratoire » / « Lab »), `/a-propos`, `/brief` + merci, `/contact` + merci, `/cv`, `/terminal`, `/confidentialite`, `/cgu`, 404. Les chemins et slugs ne changent pas.

### 4.1 Accueil (6 scènes, une seule scène 3D persistante)

| Scène | État de l’hélice | Contenu HTML |
|---|---|---|
| **00 · Formation** | des particules dispersées se rassemblent en double hélice | eyebrow « Rostel Panoumassi · Ingénierie de produits numériques · Cotonou » ; **h1** « L’ingénierie est dans l’ADN. » ; **lede concret obligatoire** dans le premier écran : ce que Rostel conçoit et livre, pour qui (plateformes SaaS, paiement, gestion ; de l’architecture à la production), son rôle chez KPS Groupe, 6 ans dont 3 comme tech lead ; boutons « Parler d’un projet » (brief) et « Voir les réalisations » |
| **01 · Séquençage** | la caméra longe l’hélice ; la paire active passe en orange | trois paires : **Engineering ↔ Product**, **Architecture ↔ Innovation**, **DevOps ↔ Leadership** ; une phrase par paire et des **preuves réelles** (§6.2) ; bouton « Séquencer » par paire |
| **02 · Construction** | l’hélice se déroule et ses particules s’empilent en 5 couches | séquence Architect : Idée → Architecture → Développement → Infrastructure → Production, une phrase par étape (remplace la méthode v6) |
| **03 · Expression** | des brins se détachent et forment la signature de chaque projet mis en avant | Ubbfy, ContractIQ (avec Jérémie Zitti), ZenLife : carte projet (§3.7) ; lien vers `/realisations` |
| **04 · Laboratoire** | des particules quittent l’hélice et forment de petites structures | les 4 explorations, chacune avec son badge de proposition (non commandée / présentée au client) ; lien vers le laboratoire |
| **05 · Stabilisation** | l’hélice ralentit et se stabilise | « Prêt à construire. » ; bouton brief, email, LinkedIn, GitHub ; réponse sous 48 heures |

- Chaque section porte `data-dna-scene="<id>"` ; la scène expose `data-dna-state` et `data-dna-ready` pour les tests.
- Sans 3D, les six sections sont complètes et lisibles ; l’image fixe de l’hélice reste en fond de la scène 00.

### 4.2 Autres pages

- **Pas de WebGL hors de l’accueil** (performance) : une hélice **SVG statique** discrète en fond d’en-tête relie les pages au même univers.
- **Étude de cas** : structure v6 inchangée (§4.2 de la spec v6), en-tête avec la signature SVG du projet et ses gènes.
- **Réalisations / Laboratoire** : cartes projet avec signature SVG ; le laboratoire garde les badges de proposition.
- **À propos, CV (écran), brief, contact, terminal, légal, 404** : même contenu et comportement qu’en v6, nouvelle DA. Le CV imprimé et ses PDF gardent leur mise en page sobre noir sur blanc ; la teinte d’accent imprimée devient un orange foncé lisible (contraste ≥ 4.5:1 sur blanc).

## 5. Architecture technique

### 5.1 Ce qui est conservé de la v6

Socle Next.js 16 / React 19 / next-intl / Tailwind 4 / pnpm / standalone ; moteur de contenu (Markdown + Zod + garde-fou métriques) et les 42 fiches ; 47 captures `public/work/` ; `src/lib/profile/cv-data.ts`, page CV et PDF (`pnpm cv:pdf`) ; formulaires brief et contact (Server Actions, Firestore puis SMTP, anti-spam, limiteur) ; compteur `/api/hit` ; pages légales ; terminal ; SEO (sitemap, robots, JSON-LD, `pageMetadata`) ; en-têtes de sécurité, 404 globale, confiance Cloudflare ; Dockerfile et `/api/health` ; suites de tests et vérificateur de règles.

### 5.2 Ce qui est remplacé

Tokens et polices (§3.2, §3.3) ; en-tête, pied de page et menu mobile ; toutes les sections de l’accueil ; mises en page des autres pages ; sculpture Möbius (`src/components/sculpture/*`, `src/lib/sculpture/*`, posters) remplacée par la scène ADN ; images OG (nouvelle palette + signature).

### 5.3 Scène ADN

- `src/lib/dna/` : **fonctions pures** testées unitairement : points de l’hélice, positions cibles des six états, couches de construction, signatures de projet à partir des gènes, générateur pseudo-aléatoire à graine (rendu déterministe).
- `src/components/dna/` : `DnaStage` (image fixe, détection WebGL, frontière d’erreur, `data-*`), `DnaCanvas` (R3F, `points` + `ShaderMaterial` maison, attributs de positions par état précalculés dans des `Float32Array`), `DnaTrajectory` (GSAP ScrollTrigger, chargé avec le chunk 3D).
- Chargement : `next/dynamic` (`ssr: false`) après `requestIdleCallback` ; **three, R3F et GSAP hors du JavaScript initial**.
- `dpr` plafonné (2 ordinateur, 1.5 mobile) ; nombre de particules selon `hardwareConcurrency`, largeur d’écran et `saveData` ; rendu suspendu hors écran ou onglet masqué.
- Interaction « Séquencer » : boutons natifs dans le HTML ; ils fonctionnent sans 3D (dépliage des preuves) et, avec 3D, mettent la paire en focus dans la scène.

### 5.4 Données nouvelles

- **Gènes** : identifiants `engineering`, `product`, `architecture`, `innovation`, `devops`, `leadership` ; libellés FR/EN dans un module typé `src/lib/dna/genes.ts` (avec la phrase et les preuves de chaque paire, §6.2).
- **Schéma de contenu** : champ `genes: Gene[]` (2 à 4 éléments, sans doublon) obligatoire sur chaque réalisation et exploration ; même valeur en FR et EN (test de parité).

### 5.5 Performance et budget

- Élément LCP : le h1 du hero (< 2.5 s en 4G simulée, mobile, CPU ×4).
- JavaScript initial de `/` ≤ **160 Ko gzip** (test existant) ; la scène 3D est un chunk séparé.
- Lighthouse ≥ 90 performance, ≥ 95 accessibilité / bonnes pratiques / SEO sur l’accueil et une étude de cas (si l’outil est disponible ; sinon test LCP Playwright).

### 5.6 Déploiement

Inchangé (Dockerfile, standalone, `/api/health`), cible Coolify existante : application `vcmrvvzg6fv0lbkqbsfcoeb5` (projet « KPS WEBSITE »), branche `main`, domaine `rostelmissimawu.com` derrière **Cloudflare**. Variables : `NEXT_PUBLIC_SITE_URL`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`, SMTP existants (`SMTP_HOST/PORT/USER/PASS`, `SMTP_FROM`, `NOTIFICATION_EMAIL`, pris en charge par des alias de `MAIL_FROM` / `MAIL_TO`), `TRUST_CF_CONNECTING_IP` (confiance par défaut).

## 6. Contenu

### 6.1 Gènes des projets

Attribués à partir de ce que chaque fiche décrit déjà (rôle, décisions techniques, stack), 2 à 4 par projet, **soumis à la validation de Rostel** (liste dans le rapport du lot concerné). Exemple : Ubbfy = engineering, product, architecture, devops.

### 6.2 Preuves des paires de gènes

Phrases courtes, **uniquement à partir de faits déjà vérifiés** (fiches projets, `cv-data`, profil) : par exemple DevOps = Docker et Coolify sur ses projets en production, CI ; Leadership = encadrement des équipes et mise en place des méthodes Agile/DevOps chez KPS Groupe ; Architecture = refonte d’Ubbfy autour d’une API Django unique. Aucun chiffre nouveau.

### 6.3 Textes

- h1 : « L’ingénierie est dans l’ADN. » / « Engineering is in the DNA. »
- Lede, phrases des paires, étapes de construction, scène 05 : rédigés en FR puis EN, relus par Rostel.
- Garde-fou métriques et règles de la v6 inchangés (§6.3 de la spec v6).

## 7. Qualité

- WCAG 2.2 AA : lien d’évitement, focus visible orange, navigation clavier complète, scène 3D décorative (`aria-hidden`), boutons « Séquencer » accessibles, formulaires inchangés.
- Sans JavaScript : contenu complet, image fixe, formulaires fonctionnels.
- Mouvement réduit : hélice figée, aucun mouvement lié au scroll.
- 360 px sans débordement.

## 8. Tests

- **Vitest** : fonctions pures `src/lib/dna/*` (bornes, déterminisme, nombre de points par état, signatures distinctes pour des gènes distincts) ; contrastes des tokens ; schéma `genes` et parité FR/EN ; tests v6 adaptés.
- **Playwright + axe** : accueil FR/EN (6 scènes présentes, `data-dna-state` change au scroll quand WebGL est disponible, image fixe sans WebGL et sous mouvement réduit), boutons « Séquencer » au clavier, toutes les pages v6 (adaptées), 360 px.
- **Vérificateur des règles** : règles v6 + « orange signal seul accent saturé » + absence de texte « SYSTEM STATUS », « ENTER SYSTEM ».
- La suite e2e complète doit passer en un seul passage, deux fois de suite (le défaut de timeouts mobiles constaté en v6 est corrigé à la racine au Lot 4).

## 9. Branche, lots et mise en production

- Branche `v7` depuis `v6`. Quatre lots, chacun avec son plan et ses revues :
  1. **Fondations et scène ADN** : tokens, polices, chrome, vérificateur mis à jour, `src/lib/dna`, scène 3D et image fixe, scène 00 de l’accueil.
  2. **Accueil** : scènes 01 à 05, gènes (données + schéma + attribution), signatures de projet (particules et SVG).
  3. **Autres pages** : réalisations, étude de cas, laboratoire, à propos, CV écran et impression, brief, contact, terminal, légal, 404, images OG.
  4. **Finitions et mise en production** : performance, accessibilité, stabilisation e2e, reliquats v6 (§10), revue finale, fusion `v7` → `main`, déploiement Coolify (variables, push de `main`, déploiement par l’API, vérification du site en ligne).
- La suppression de la présentation v6 (Möbius, champagne) se fait au fil des lots ; aucun code mort ne reste à la fin du Lot 4.

## 10. Reliquats et questions pour Rostel

**Reliquats techniques v6 à traiter au Lot 4** : finitions du terminal (garde de bundle sur toutes les pages, qualificatifs honnêtes dans `ls`/`explorations`, années depuis `OWNER`, zone de sortie focalisable, autofocus seulement avec pointeur fin, tests négatifs `open`, placeholder de chargement) ; libellé accessible du sélecteur de langue (WCAG 2.5.3) ; alias SMTP ; garde « PDF à jour » du CV.

**Étapes propriétaire (bloquées par les permissions de l’outil)** : `firebase deploy --only firestore:rules,firestore:indexes --project rostel-portfolio-v6` ; activation du TTL `expireAt` (`gcloud firestore fields ttls update expireAt --collection-group=submissions --enable-ttl --project=rostel-portfolio-v6`) ; vérifier que la collection `submissions` réelle est vide ; garder Bot Fight Mode Cloudflare désactivé (sinon cookie `__cf_bm`) et restreindre l’origine aux IP Cloudflare.

**Questions** : validation des gènes par projet ; textes FR/EN ; région Firestore (`nam5`, États-Unis) ou recréation en `eur3` ; nom de l’hébergeur du VPS pour la politique de confidentialité ; formalités APDP ; niveau d’anglais pour le CV ; années avant 2023 dans le parcours ; captures contenant des tirets longs ou des noms (mariette, procom, najaexperts, bilalsekou) ; emoji ampoule dans une capture ContractIQ ; affirmations de la capture « 08-pricing » ; rôles exacts sur Freelance Club, Orinsu et IT-Opportunities-Tracker.

## 11. Hors périmètre

Blog, CMS, thème clair, témoignages, son, curseur personnalisé, écran d’entrée, mode jeu, ville 3D, interface « OS », newsletter, GA4, bannière de cookies.
