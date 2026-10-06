# Portfolio Redesign — Design Spec

**Date** : 2026-04-26
**Auteur** : Rostel Panoumassi (avec assistance Claude)
**Statut** : Validé pour planification d'implémentation
**Branche cible** : `v3-redesign`
**Repo** : `O:/Projets/my_portfolio`

---

## 1. Contexte et objectifs

### 1.1 Situation actuelle

Le portfolio existant (`rostel-terminal-os`, Vue 3 + Vite SPA) est conçu comme une expérience "Terminal OS" complète (boot sequence, commandes, panels, achievements, easter eggs, 4 thèmes). Très impressionnant techniquement mais inaccessible pour les visiteurs non-techniques. Le portfolio ne convertit pas car la première interaction demandée est de taper `help` dans un terminal.

### 1.2 Objectif

Construire un nouveau site portfolio orienté **conversion client** :
- Accessible immédiatement aux décideurs non-techniques (DRH, dirigeants PME)
- Suffisamment rigoureux pour impressionner les profils techniques (CTO, recruteurs, freelances seniors)
- Préserver intégralement le terminal existant comme easter egg sous `/terminal`

### 1.3 Audiences cibles (par priorité)

1. **Clients freelance internationaux** (Europe, US, plateformes type Malt/Toptal, contacts directs)
2. **Recruteurs tech** (lead/CTO, postes salariés)
3. (Tertiaire) Dirigeants PME locales, partenaires business — doivent rester possibles mais pas prioritaires

### 1.4 Action principale visée (CTA)

1. **Primaire** : Envoyer un brief de projet structuré (formulaire `/brief`)
2. **Secondaire** : Réserver un appel découverte (Calendly)
3. **Tertiaire** : Télécharger CV, lire les case studies, contact direct — accessibles mais discrets

### 1.5 Critères de succès

- Visiteur non-tech comprend l'offre en moins de 30 secondes
- Visiteur tech reconnaît la rigueur sans avoir besoin de chercher
- Le terminal existant reste 100 % fonctionnel (régression zéro) sous `/terminal`
- Lighthouse > 95 sur toutes les pages publiques
- Site bilingue FR (par défaut) / EN, switch manuel persistant

---

## 2. Direction visuelle

### 2.1 Synthèse retenue : "Quiet First, dark mode"

Mix 70 % Quiet Premium × 30 % Engineer Brutalist. Atmosphère type Stripe Press dark / Vercel marketing / Linear dark mode. Le calme domine ; le mono signe la rigueur en signature discrète.

**Mood :**
- Fond encre profonde (chaud, pas clinique)
- Texte ivoire confortable en long
- Serif éditorial en headlines + sans-serif système en body
- Mono comme signature : nav links, CTA primaire, méta-données
- Aucune animation flashy au load — fade-up très lent (1.2s, easing doux)
- Indicateur disponibilité vert discret

### 2.2 Thèmes (auto + toggle manuel)

Le mode est détecté par `prefers-color-scheme` au premier chargement, puis l'utilisateur peut basculer manuellement (préférence persistée en cookie). **Les deux thèmes doivent être designés dès la V1** ; le dark est canonique, le light est l'équivalent jour cohérent.

### 2.3 Représentation des projets sans screenshots

Contrainte client : les écrans des projets ne peuvent pas être montrés (NDA, projets internes KPS).

**Traitement retenu : pure typographie** (style Stripe Press / Penguin Press). Les cards de case studies et les hero des pages `/work/[slug]` reposent uniquement sur :
- Kicker éditorial (`ISSUE 03 · FINTECH B2B · 2024`)
- Titre serif fort (le projet en une phrase humaine)
- Petit indicateur de stack en mono (`Django · Spring · PostgreSQL`)
- Une phrase de résultat chiffré

Aucun placeholder visuel. Aucune photo de stock générique.

---

## 3. Architecture des pages (Information Architecture)

### 3.1 Arborescence

```
/                          Home (hero + 3 case studies vedettes + approche + CTA brief)
/work                      Index des case studies (grille filtrable)
/work/[slug]               Case study détaillé
/about                     Long-form : parcours, approche, photo, valeurs, stack
/brief                     Formulaire 4 étapes (CTA principal)
/contact                   Coordonnées + Calendly + LinkedIn (CTA secondaire)
/terminal                  Easter egg — UI terminal préservée (client-only)
/cv.pdf                    CV statique téléchargeable
```

Routes EN miroir via `@nuxtjs/i18n` strategy `prefix_except_default` :
- `/` → FR (sans préfixe)
- `/en`, `/en/work`, `/en/work/[slug]`, etc.

### 3.2 Navigation header

```
Rostel Panoumassi          Travaux  Approche  Notes  ● dispo Q3 2026   FR | EN  [Démarrer un brief]
```

- Logo : nom complet en serif italique
- Liens : mono, espacement large
- Indicateur disponibilité : point vert + texte mono lowercase
- Sélecteur langue : pill discret
- CTA principal toujours visible à droite

### 3.3 Détection langue

- Cookie `i18n_redirected` → préférence utilisateur (priorité 1)
- Header `Accept-Language` à la première visite (`fr-*` → FR, autres → EN)
- Switch manuel toujours accessible dans le header (persiste cookie)

---

## 4. Anatomie des pages

### 4.1 Home (`/`)

Ordre des blocs au scroll :

1. **Hero** — nav, headline serif 2 lignes, sub 1-2 lignes, CTA primaire `Démarrer un projet → /brief`, CTA secondaire `Lire mon approche → /about`, méta-row bas (`v4.5 · cotonou, BJ · 12 produits livrés`)
2. **Featured Work** — kicker `Travaux récents`, 3 cards typographiques empilées (pas grille 3-col), footer du bloc `→ Voir tous les travaux`
3. **Approche en 3 points** — `01. Cadrage rigoureux avant code` / `02. Livraisons hebdo, jamais de surprise` / `03. Documentation et passation soignées` (formulations à affiner avec le client)
4. **CTA final** — bloc plein écran calme, `Un projet en tête ? Décrivez-le en 5 minutes.` + bouton `Démarrer un brief` + email direct
5. **Footer** — colonnes Navigation / Contact / Social / Légal + mention `Made in Cotonou · 2026` + easter egg `$ ./terminal` cliquable

Blocs **explicitement supprimés en V1** :
- Bandeau logos clients (refus de montrer les marques)
- Bloc témoignage (pas de citations signables disponibles)

### 4.2 Index travaux (`/work`)

Grille de toutes les études disponibles, filtrable par tag (secteur, stack, année). Chaque entrée utilise le même traitement typographique que les cards de la home.

### 4.3 Case study (`/work/[slug]`)

```
Header           [← Tous les travaux]   [FR | EN]
                 ISSUE 03 — FINTECH B2B — 2024   ●● 6 / 7

Hero typo        Titre principal (serif, 2 lignes)
                 Sous-titre éditorial (1 phrase contextuelle)

Méta-data        Bandeau mono 6 lignes :
                 CLIENT / SECTEUR / RÔLE / ÉQUIPE / DURÉE / STACK

Résultats        3 chiffres clés en exergue (gros chiffres + label court)

Corps            Long-form Markdown/MDX :
                 ## Le contexte
                 ## Ce qu'on m'a demandé
                 ## L'approche
                 ## Décisions techniques notables (snippets code optionnels, max 1-2)
                 ## Ce qui a marché, ce qui n'a pas marché
                 ## Le take-away

Passation        "Voilà le projet. Un projet similaire en tête ?"
                 [→ Démarrer un brief]   [→ Étude suivante]

Footer réduit
```

**Honnêteté éditoriale** : la section "ce qui n'a pas marché" est obligatoire — c'est le différenciateur premium.

**Si moins de 3 chiffres défendables disponibles** pour un projet : tomber à 2 chiffres + 1 qualitatif (`100% sans coupure`, `équipe en autonomie après 4 semaines`).

### 4.4 About (`/about`)

```
Hero court       "Bonjour. Je suis Rostel."
                 Long-form 2-3 phrases présentation
                 Portrait pro à droite (~340px, sobre, pas d'effet)

Disponibilité    ● DISPO Q3 2026 — 2 missions / trimestre maximum
                 Cadrage gratuit · Premier livrable < 14 jours · 
                 Pas de mission < 4 semaines

Comment je       Long-form, 4-6 paragraphes :
travaille        ## Ma règle n°1 : un projet, une décision claire par jour
                 ## Ce que je ne fais pas (liste de 4 refus)
                 ## Ma stack par défaut

Parcours         Timeline mono compacte (année — entreprise — rôle)

Formation        Très court (2-3 lignes)

Hors du code     1-2 paragraphes humains, authentiques

CTA              [→ Démarrer un brief]  [→ télécharger CV]  [→ LinkedIn]
```

**Posture validée** : la section "Ce que je ne fais pas" est un signal premium fort — sera maintenue.

**À écrire par le client** : le bloc "Hors du code" demande un angle authentique (mentorat, lecture, sport, side project). À fournir avant la phase 11.

### 4.5 Brief (`/brief`)

Formulaire 4 étapes, sauvegarde locale entre étapes (`localStorage`).

**Étape 1 / 4 — Le projet** (60s) :
- Type de besoin (5 options radio)
- Description en une phrase (textarea)

**Étape 2 / 4 — Le contexte** (90s) :
- État actuel (6 options radio)
- Taille équipe client (4 options + 3 checkboxes ressources internes)
- Note libre optionnelle

**Étape 3 / 4 — Le cadre** (60s) :
- Échéance (4 options radio)
- Budget en EUR (6 fourchettes incluant `Pas encore défini`)
- Note d'aide : `Indication, pas un engagement.`

**Étape 4 / 4 — Qui es-tu ?** (45s) :
- Prénom + Nom (requis)
- Email (requis, validation Zod email)
- Entreprise (optionnel)
- Site web (optionnel)
- Source (select, optionnel)
- Checkbox "Préfère un appel d'abord" (déclenche redirection Calendly post-submission)
- Cloudflare Turnstile widget

**Confirmation** : route dédiée `/brief/confirmation` (pas un overlay inline) pour permettre le partage / refresh sans re-soumettre.
- Message : `Brief reçu. Tu auras une réponse personnalisée sous 48h ouvrées.`
- Promesse explicite : `Si je ne suis pas le bon match, je te le dirai dans le même mail — et je te recommanderai quelqu'un si je peux.`
- Liens secondaires : voir case studies, email direct en cas d'urgence
- Param query optionnel `?call=1` si l'utilisateur a coché "préfère un appel" → déclenche redirection Calendly après 3s ou bouton explicite

### 4.6 Contact (`/contact`)

Page courte : email direct, LinkedIn, Calendly embed ou lien externe, info géographique (Cotonou, fuseau horaire).

### 4.7 Terminal (`/terminal`)

Page client-only qui monte le composant racine de l'ancienne SPA. Aucun layout site (pas de header/footer du nouveau site). Le terminal s'affiche en plein écran, fonctionnement identique à l'ancien portfolio.

Accès :
- URL directe `/terminal`
- Lien `$ ./terminal` discret en footer
- Séquence clavier secrète depuis n'importe quelle page (à définir : par défaut `r-o-s-t-e-l` tapé en aveugle)
- Cmd+K ouvre une command palette qui propose entre autres `Ouvrir le terminal`

---

## 5. Système visuel (design tokens)

### 5.1 Typographie

| Rôle | Famille | Notes |
|------|---------|-------|
| Display (titres) | **Fraunces** (variable, gratuit, italique signature) | Self-hosted via `@nuxt/fonts` |
| Body | **Inter** (variable) avec fallback `-apple-system, BlinkMacSystemFont, sans-serif` | Self-hosted |
| Mono | **JetBrains Mono** (gardé du portfolio actuel) | Self-hosted |

**Échelle** (rem, base 16px) :

| Token | Taille | Line-height | Letter-spacing | Usage |
|-------|--------|-------------|----------------|-------|
| `display-1` | 4.5 | 1.05 | -0.03em | Hero h1 home |
| `display-2` | 3.5 | 1.08 | -0.02em | Page hero h1 |
| `h1` | 2.5 | 1.15 | -0.02em | Section heading |
| `h2` | 1.875 | 1.2 | -0.01em | Sub-section |
| `h3` | 1.375 | 1.3 | normal | Card titles |
| `body-l` | 1.125 | 1.65 | normal | Lead paragraphs |
| `body` | 1.0 | 1.65 | normal | Texte courant |
| `body-s` | 0.875 | 1.55 | normal | Annotations |
| `mono-s` | 0.75 | 1.5 | normal | Méta, tags |

### 5.2 Couleurs — Dark (par défaut)

```
--bg              #0a0a0c          encre chaude
--bg-raised       #111114          cards, surfaces
--bg-overlay      #18181c          modals, popovers
--text            #e8e6e1          ivoire chaud
--text-mute       #a8a59f          secondary
--text-soft       #5a5852          captions, méta
--border          #1f1f22
--border-strong   #2a2a2e
--accent          #00fff7          cyan (signature gardée)
--accent-soft     rgba(0,255,247,.18)
--available       #5fb37a          vert dispo
--error           #f56565
--success         #5fb37a
```

### 5.3 Couleurs — Light

```
--bg              #faf8f4          ivoire papier
--bg-raised       #f3f0e9
--bg-overlay      #ffffff
--text            #1a1a1a
--text-mute       #555555
--text-soft       #8a8682
--border          #e8e3d8
--border-strong   #d4cdbb
--accent          #0891b2          cyan plus sombre (contraste WCAG AA)
--accent-soft     rgba(8,145,178,.12)
--available       #2a7a4a
--error           #c53030
--success         #2a7a4a
```

### 5.4 Espacements

Échelle 4px de base (Tailwind par défaut). Section paddings : `96px` (compacte) / `128px` (standard) / `160px` (importante). Container max : `1200px`. Reading max : `720px` (case studies, about).

### 5.5 Motion (GSAP)

Principes :
- Aucune animation flashy. Tout < 800ms, easing doux (`power2.out`)
- Hero : fade-up très lent (1.2s) au load, `opacity: 0→1`, `translateY: 12px→0`
- Sections au scroll : fade-up en stagger, 60ms entre items, déclenché par ScrollTrigger
- Hover : transitions Tailwind 150-200ms (CSS, pas GSAP)
- Boutons : `scale: 1.0 → 0.98` au press, sans bounce
- Page transitions : crossfade 200ms (Nuxt page transition)
- **Reduced motion** : si `prefers-reduced-motion: reduce`, GSAP timeline killée, transitions Tailwind passent en `none` ou < 50ms

### 5.6 Interactions signature

- **Cmd+K (ou Ctrl+K)** : command palette → naviguer entre pages, ouvrir `/terminal`, switch langue, switch thème
- **Easter egg footer** : `$ ./terminal` cliquable
- **Séquence clavier secrète** : taper `r-o-s-t-e-l` en aveugle depuis n'importe quelle page → redirige vers `/terminal`
- **Curseur custom** : reporté à V2 (pour ne pas alourdir la première impression)

---

## 6. Architecture technique

### 6.1 Stack

| Couche | Choix | Notes |
|--------|-------|-------|
| Framework | **Nuxt 3** (SSR/SSG) | File-based routing, SEO automatique |
| Contenu | **@nuxt/content v3** | Case studies en Markdown/MDX |
| i18n | **@nuxtjs/i18n v9** | FR par défaut + EN switch |
| Styling | **Tailwind CSS v3** + tokens CSS variables | Themes light/dark |
| Animations | **GSAP** (gardé) + ScrollTrigger | |
| State | **Pinia** (gardé) | Utilisé surtout pour le terminal easter egg |
| Composables | **@vueuse/core** + **@vueuse/nuxt** | |
| Polices | **@nuxt/fonts** | Self-hosted Fraunces, Inter, JetBrains Mono |
| Images | **@nuxt/image** | Optimisation auto WebP/AVIF |
| Sécurité | **nuxt-security** | CSP, headers durcis |
| SEO | **@nuxtjs/seo** + sitemap + robots | |
| Validation | **Zod** | Schemas formulaire et API |
| Email | **Nodemailer** | SMTP `noreply.rostelmissimawu.com` |
| DB | **MongoDB** + **Mongoose** | Conteneur Coolify en prod, instance locale en dev |
| Anti-spam | **Cloudflare Turnstile** | Gratuit, sans CAPTCHA visible |
| Notifications | **Telegram Bot API** | Notif réception brief |
| Analytics | **Umami** (self-hosted) | Privacy-first, RGPD-safe |
| Monitoring | (V2) **Sentry** | Erreurs prod |
| Tests | **Vitest** (unit) + **Playwright** (E2E) | |
| Build/deploy | **Dockerfile** multi-stage + **Coolify** | Prod uniquement, pas de Docker en dev |

### 6.2 Structure projet

```
my_portfolio/
├─ nuxt.config.ts
├─ Dockerfile                       # prod uniquement
├─ .env.example
├─ app.vue
├─ assets/
│   ├─ fonts/                       # Fraunces, Inter, JetBrains Mono
│   └─ css/main.css                 # tokens, base, reset
├─ components/
│   ├─ site/                        # SiteHeader, SiteFooter, Hero, FeaturedWork, ApproachBlock, CtaBlock
│   ├─ work/                        # CaseStudyCard, CaseStudyHero, CaseStudyMeta, CaseStudyResults
│   ├─ brief/                       # BriefForm, BriefStep[1-4]*, BriefConfirmation
│   ├─ ui/                          # Button, Input, Select, ThemeToggle, LangToggle, CommandPalette
│   └─ terminal/                    # ANCIENNE UI INTÉGRALE migrée ici
├─ composables/
│   ├─ useBriefForm.ts              # gestion étapes + localStorage
│   ├─ useTheme.ts                  # auto + toggle
│   ├─ useCommandPalette.ts         # Cmd+K
│   └─ useSecretSequence.ts         # séquence clavier easter egg
├─ content/
│   ├─ work/
│   │   ├─ banque-regionale.md      # case study FR
│   │   ├─ banque-regionale.en.md   # case study EN
│   │   └─ …
│   └─ pages/
│       ├─ about.fr.md
│       └─ about.en.md
├─ i18n/
│   └─ locales/
│       ├─ fr.json
│       └─ en.json
├─ pages/
│   ├─ index.vue                    # /
│   ├─ work/
│   │   ├─ index.vue                # /work
│   │   └─ [slug].vue               # /work/[slug]
│   ├─ about.vue
│   ├─ brief.vue
│   ├─ contact.vue
│   └─ terminal.vue                 # easter egg, client-only
├─ server/
│   ├─ api/
│   │   ├─ brief.post.ts            # POST → Zod → Mongo → SMTP → Telegram
│   │   └─ health.get.ts            # healthcheck Coolify
│   ├─ middleware/
│   │   └─ rate-limit.ts            # 5 submissions/heure/IP sur /api/brief
│   └─ utils/
│       ├─ mongo.ts                 # connection lazy mongoose
│       ├─ mailer.ts                # nodemailer SMTP
│       ├─ telegram.ts              # notif optionnelle
│       └─ schemas/brief.ts         # Zod schema partagé client/serveur
├─ stores/                          # Pinia stores (terminal, etc.)
├─ public/
│   ├─ images/                      # visuels statiques (gardés)
│   ├─ cv.pdf                       # CV téléchargeable
│   ├─ favicon.svg
│   └─ og/                          # OG images statiques
├─ tests/
│   ├─ e2e/                         # Playwright (flow brief, navigation)
│   └─ unit/                        # Vitest (composables, utils)
├─ legacy/
│   └─ terminal-spa/                # ancien code Vue 3 SPA, archivé pendant migration
└─ types/
```

### 6.3 Schema MongoDB — collection `briefs`

```typescript
{
  _id: ObjectId,
  createdAt: Date,
  // Step 1
  projectType: 'new' | 'revamp' | 'audit' | 'spot' | 'unsure',
  pitch: string,                    // max 500 chars
  // Step 2
  currentState: 'idea' | 'design' | 'inProgressBlocked' | 'mvpInProd' | 'existingRevamp' | 'auditOnly',
  teamSize: 'solo' | '2-5' | '6-15' | '15+',
  hasTechTeam: boolean,
  hasDesigner: boolean,
  hasProductOwner: boolean,
  notes: string | null,
  // Step 3
  deadline: '<1m' | '1-3m' | '3-6m' | 'flexible',
  budget: '<5k' | '5-15k' | '15-40k' | '40-100k' | '100k+' | 'undefined',
  // Step 4
  firstName: string,
  lastName: string,
  email: string,                    // validé email
  company: string | null,
  website: string | null,
  source: string | null,
  prefersCall: boolean,
  // Server-side
  ip: string,                       // pour rate limit + détection abus
  userAgent: string,
  locale: 'fr' | 'en',
  turnstileVerified: boolean,
  notifiedAt: Date | null
}
```

### 6.4 Flux de soumission `/api/brief`

```
Client (BriefForm.vue)
  └─ Validate Zod côté client (UX feedback)
  └─ POST /api/brief avec body + Turnstile token

Server middleware rate-limit
  └─ Vérifie IP : max 5 submissions / heure
  └─ Si dépassé : 429 Too Many Requests

Server route brief.post.ts
  ├─ Valide Zod côté serveur (jamais faire confiance au client)
  ├─ Vérifie Turnstile token (Cloudflare API)
  │   └─ Si invalide : 403 Forbidden
  ├─ Insert MongoDB (collection briefs)
  ├─ Envoie email via Nodemailer SMTP
  │   ├─ From : noreply@rostelmissimawu.com
  │   ├─ To : rmissimawu@gmail.com
  │   └─ Body : récap structuré du brief
  ├─ Notif Telegram (optionnel, si TELEGRAM_BOT_TOKEN défini)
  │   └─ Message court : "Brief reçu de [Prénom Nom] — secteur [X], budget [Y]"
  └─ 200 OK { success: true, briefId }

Client
  └─ Si 200 : redirect → /brief/confirmation (ou /brief/confirmation?call=1 si prefersCall)
  └─ Si 422 : afficher erreurs champ par champ
  └─ Si 429 : message "Trop de soumissions, réessayez dans une heure"
  └─ Si 5xx : "Une erreur s'est produite, écris-moi à rmissimawu@gmail.com"
```

### 6.5 Variables d'environnement

```
# .env (dev local)
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_TURNSTILE_SITE_KEY=…
TURNSTILE_SECRET_KEY=…
MONGODB_URI=mongodb://localhost:27017/portfolio
SMTP_HOST=mail.rostelmissimawu.com
SMTP_PORT=587
SMTP_USER=noreply@rostelmissimawu.com
SMTP_PASS=…
SMTP_FROM=noreply@rostelmissimawu.com
NOTIFICATION_EMAIL=rmissimawu@gmail.com
TELEGRAM_BOT_TOKEN=…              # optionnel
TELEGRAM_CHAT_ID=…                # optionnel
UMAMI_WEBSITE_ID=…                # injecté côté client
UMAMI_SCRIPT_URL=…
```

### 6.6 Dockerfile (prod)

Multi-stage `node:20-alpine` :

1. **Stage `deps`** : copie `package.json` + `pnpm-lock.yaml`, installe avec `pnpm install --frozen-lockfile`
2. **Stage `build`** : copie le source + `node_modules`, lance `pnpm build` (génère `.output/`)
3. **Stage `runner`** : copie uniquement `.output/`, expose port 3000, healthcheck vers `/api/health`, démarre via `node .output/server/index.mjs`

Healthcheck Docker : `wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1` toutes les 30s.

### 6.7 Coolify config

- **Build pack** : Dockerfile
- **Service Web** : repo Git connecté, build sur push de `main`, domaine `rostelmissimawu.com` (à confirmer), HTTPS auto via Let's Encrypt
- **Service MongoDB** : conteneur séparé créé dans Coolify, volume persistant, backups via cron Coolify (snapshot quotidien, rétention 7 jours)
- **ENV vars** : injectées via UI Coolify, jamais committées
- **Logs** : centralisés Coolify dashboard

### 6.8 Migration du terminal existant

Le code actuel `src/` est intégralement copié dans `components/terminal/` (et `stores/terminal.ts` + composables associés, préfixés `useTerminal*` pour éviter collisions).

`pages/terminal.vue` :

```vue
<script setup lang="ts">
definePageMeta({ layout: false })
</script>

<template>
  <ClientOnly>
    <TerminalApp />
  </ClientOnly>
</template>
```

`TerminalApp` est le composant racine de l'ancienne `App.vue`. Aucune logique modifiée : Pinia store, GSAP, useCommands, panels, achievements, konami, themes — tout fonctionne tel quel.

**Bénéfices** :
- Zéro perte de travail
- Bundle home non pollué (chunk `/terminal` chargé à la demande)
- Régression zéro garantie : le terminal reste exactement ce qu'il est aujourd'hui

---

## 7. Plan de migration (phases)

| Phase | Objet | Estim. |
|-------|-------|--------|
| 0 | Prep dépôt : branche `v3-redesign`, archive `legacy/terminal-spa/`, tag `v2-terminal-final` | 1h |
| 1 | Bootstrap Nuxt 3 + modules + `pnpm dev` fonctionnel | 1h |
| 2 | Design tokens, fonts, layout default, header/footer | 4h |
| 3 | Page Home complète avec données mockées | 8h |
| 4 | `@nuxt/content` schema + migration des 5 projets actuels en MD + pages `/work` et `/work/[slug]` | 6h |
| 5 | Pages `/about`, `/contact`, skeleton `/brief` | 4h |
| 6 | i18n FR/EN complet (UI + content) | 4h |
| 7 | Brief form complet : 4 étapes + API + Mongo + SMTP + Turnstile + Telegram | 8h |
| 8 | Migration terminal vers `/terminal` (client-only) + easter eggs | 4h |
| 9 | SEO, performance, accessibilité (Lighthouse > 95 partout) | 4h |
| 10 | Dockerfile + setup Coolify + premier déploiement | 3h |
| 11 | (Parallèle) Rédaction contenu : about FR/EN, 3 case studies FR/EN, copy approche | 6-12h |
| 12 | Cutover : merge → main, redéploiement, smoke test, tag v3.0.0 | 1h |

**Total technique** : ~50-55h. **Contenu en parallèle** par le client.

---

## 8. Points en suspens (à confirmer avant ou pendant l'implémentation)

| Sujet | Notes |
|-------|-------|
| **Headline hero exact** | Versions provisoires dans la spec. À affiner par le client en V1, peut évoluer ensuite |
| **Domaine final** | Hypothèse : `rostelmissimawu.com`. À confirmer (et à pointer vers le serveur Coolify) |
| **Bloc "Hors du code"** sur `/about` | Demande un angle authentique du client (mentorat, lecture, side project, etc.) |
| **Formulations "Approche en 3 points"** | Premières versions à valider par le client |
| **Témoignages V2** | Si le client obtient des citations signables après la V1, on les ajoute en bloc 5 de la home |
| **`/notes` (blog)** | Reporté à V2. À considérer si rythme de publication soutenable |
| **Sentry monitoring** | Reporté à V2 |
| **MongoDB Atlas vs Coolify** | Tranché : conteneur Coolify avec backups cron |

---

## 9. Décisions explicitement écartées (et pourquoi)

| Option écartée | Raison |
|----------------|--------|
| Garder le terminal comme expérience principale | Inaccessible aux non-techs, ne convertit pas |
| Single-page scroll unique | URLs partageables critiques pour les case studies |
| Migration vers Astro | Stack Vue déjà maîtrisée, Nuxt offre tout ce qu'il faut |
| Rester en SPA pure (Vite) | SEO insuffisant pour cible internationale |
| Logos clients en bandeau | Refus client de montrer les marques |
| Témoignages V1 | Pas de citations signables disponibles |
| Screenshots produits dans case studies | Refus client (NDA, projets internes) |
| Photo dans hero home | Risque de prendre la place pour rien — gardée pour `/about` uniquement |
| Curseur custom V1 | Risque "site qui en fait trop" — reporté à V2 |
| Bloc témoignages anonymisés inventés | Honnêteté éditoriale prime |
| Resend pour email | Client préfère SMTP custom sur son domaine |
| Supabase pour DB | Client utilise déjà MongoDB |
| Docker en dev local | Ralentit l'itération, MongoDB local suffit |

---

## 10. Critères de validation V1

Le projet est **livrable en V1** quand toutes ces conditions sont remplies :

- [ ] Pages `/`, `/work`, au moins 2 `/work/[slug]`, `/about`, `/brief`, `/contact`, `/terminal` fonctionnent en FR
- [ ] Toutes les pages publiques disponibles aussi en EN
- [ ] Toggle thème dark/light fonctionne, persiste, respecte `prefers-color-scheme` au premier chargement
- [ ] Toggle langue fonctionne, persiste cookie
- [ ] Formulaire `/brief` complet : 4 étapes navigables, sauvegarde locale, Turnstile actif, validation Zod, soumission MongoDB OK, email SMTP reçu sur `rmissimawu@gmail.com`
- [ ] Notification Telegram reçue (si configurée)
- [ ] `/terminal` fonctionne intégralement (toutes commandes ancienne UI marchent)
- [ ] Lighthouse > 95 (Performance, Accessibility, Best Practices, SEO) sur `/`, `/work/[slug]`, `/about`, `/brief`
- [ ] Reduced-motion respecté
- [ ] Dockerfile build sans erreur, image < 200 MB
- [ ] Déployé sur Coolify, accessible en HTTPS, healthcheck OK
- [ ] Sitemap.xml + robots.txt servis
- [ ] OG images correctes pour partage social

---

## 11. Notes finales

Cette spec est le résultat d'une session de brainstorming structurée. Elle est suffisamment détaillée pour passer à la phase de planification d'implémentation (`writing-plans`) qui découpera chaque phase en tâches granulaires testables.

Le document est vivant : si une décision change pendant l'implémentation, mettre à jour cette spec et relancer le plan.
