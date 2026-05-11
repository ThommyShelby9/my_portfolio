# Analyse des projets

> Document généré le 2026-05-11 — Synthèse de chaque projet à partir des manifestes, README, routes et arborescence.

---

## 1. Bilal Sekou Portfolio

**Dossier :** `O:\Projets\bilalsekou`

### Description
Site portfolio / vitrine de **Sekou Bilal**, Digital Marketer et stratège en communication, accompagnant les entreprises en Afrique et à l'international. Le site intègre également la **vente d'un e-book** avec paiement en ligne via Kkiapay.

### Stack technique
- **Framework :** Nuxt 3 (`^3.17.4`) + Vue 3
- **Langage :** TypeScript (strict)
- **Style :** TailwindCSS 3 + plugins (`forms`, `typography`, `aspect-ratio`)
- **State management :** Pinia
- **i18n :** `@nuxtjs/i18n` (FR par défaut, EN)
- **Validation :** VeeValidate + Zod
- **Icônes :** `nuxt-icon`
- **Paiement :** Kkiapay (`kkiapay` JS SDK)
- **Email :** Nodemailer (SMTP Gmail par défaut)
- **Server :** Nitro preset `node-server`

### Pages & composants
- **Pages :** `index.vue` (one-page portfolio), `ebook/index.vue`, `ebook/success.vue`
- **Sections home :** Hero, About, Experience, Skills, Contact
- **E-book :** Form, Popup, PromoSection, PaymentButton, SuccessMessage
- **API server (`server/api/`) :** `contact.ts`, `newsletter.ts`, `health.ts`, et sous `ebook/` : `submit`, `verify`, `update-transaction`, `webhook`, `count`

### Fonctionnalités principales
- Portfolio one-page : Hero, À propos, Expériences, Compétences, Contact
- Mode sombre par défaut (`htmlAttrs.class: 'dark'`)
- Système bilingue (FR/EN) avec stratégie `prefix_except_default`
- **Vente d'e-book** avec prix régulier (11 500 FCFA) et prix promo (7 800 FCFA), limite des réductions configurable
- Tunnel de paiement Kkiapay (mode sandbox configurable) + webhook + vérification transaction + comptage
- Formulaire de contact + newsletter (notifications email via SMTP)
- Toast notifications (`vue-toast-notification`)

---

## 2. CCNS Bénin

**Dossier :** Pas de dossier source autonome dans `O:\Projets` — projet livré, métadonnées dans `my_portfolio/content/fr/work/ccns.md` (case study du portfolio Rostel).
**URL live :** https://ccnsbenin.vercel.app/

### Description
Site institutionnel pour la **Conférence des Centres de Santé (CCNS)** — réseau de centres de santé catholiques au Bénin. Refonte complète menée en 2025 sur 8 semaines (1 dev + 1 PO), couvrant contenu et infrastructure.

### Stack technique (d'après le case study)
- **Frontend :** Vue 3 + Vite
- **CSS :** TailwindCSS
- **CMS :** Strapi (headless)

### Fonctionnalités principales
- Site institutionnel (présentation du réseau, missions, actualités)
- Documentation des 8 centres de santé
- Accessibilité prioritaire
- SEO optimisé (Lighthouse 100/100)

### Résultats annoncés
- +240 % de trafic organique sur 6 mois
- 8/8 centres documentés
- 100 % de score SEO Lighthouse

---

## 3. LeConsultant

**Dossier :** `O:\Projets\consultant\leconsultant`
**URL prod :** beninconsultant.drwintech.com

### Description
Plateforme B2B d'**annonces d'appels d'offres** et de **services aux entreprises** (inscriptions personnes physiques/morales, alertes appels d'offres, formations, services). Inclut un module d'abonnement payant et des notifications par email.

### Stack technique
- **Framework :** Laravel 8.x (PHP ^8.2)
- **Auth :** Laravel Fortify + Sanctum
- **UI :** Livewire 2 + Blade
- **PDF :** Barryvdh DomPDF
- **Alertes UI :** SweetAlert
- **QR Code :** simplesoftwareio/simple-qrcode
- **News API :** jcobhams/newsapi
- **Recherche :** serpapi/google-search-results-php
- **HTTP :** Guzzle
- **CORS :** fruitcake/laravel-cors
- **Paiements :** Kkiapay PHP + PayPlus (intégration documentée dans `PAYPLUS_INTEGRATION.md`)
- **i18n :** laravel-lang/lang
- **Build assets :** Webpack Mix + TailwindCSS

### Modules / Controllers
`Abonnement`, `Admin`, `Ajax`, `Alerte`, `Autorite`, `Categorie`, `Direction`, `Formation`, `Offre`, `Pack`, `PageService`, `PaymentCallback`, `Ticket`, `Type`, `User`, plus sous-namespace `user\` (Page, Compte, FT…).

### Fonctionnalités principales
- Inscription personnes physiques / morales (formulaires distincts)
- Catalogue d'**appels d'offres** avec filtres et recherche
- **Alertes** d'appels d'offres par catégorie/type
- **Formations** consultables
- Pages services dynamiques
- **Abonnements** payants (`AbonnementController`, `PackController`)
- Intégration **PayPlus** (paiement Afrique) + Kkiapay
- Notifications email (modèles Blade dans `emails/`, `offreNotification`)
- Génération de PDF (test view `testPDF`)
- Système de tickets support
- Back-office admin avec gestion utilisateurs/contenus

---

## 4. EasyToWork (ETW)

**Dossier :** `O:\Projets\easytowork` (sous-dossiers `etw-back` + `etw-front`)

### Description
Plateforme **services RH / formation / recrutement / simulateur** du groupe KPS (formations, simulateur salarial, postulations). Le frontend regroupe les sites du groupe (KPS Groupe, KPS Analytics, ETW) via un même backend d'envoi d'emails.

### Stack technique

**Backend (`etw-back`) — Laravel 12 :**
- PHP ^8.2, Laravel 12, Tinker
- Tests : Pest/PHPUnit 11
- Pas de DB lourde côté code (SQLite par défaut, modèles `Contact`, `Newsletter`, `User`)

**Frontend (`etw-front`) — Vue 3 + Vite :**
- Vue 3.5, Vue Router 4, Pinia 3
- Axios, jsPDF, lucide-vue-next
- TailwindCSS 3 + plugins
- TypeScript ~5.8

### Routes API backend
- `POST /send-email-kpsgroupe`
- `POST /send-email-kpsanalytics`
- `POST /send-email-ewt`
- `POST /send-email-postulation`
- `POST /simulateur` (+ OPTIONS pour CORS)
- `POST /contact`
- `POST /newsletter/subscribe` / `unsubscribe`

### Pages frontend
`HomePage`, `EasyToWorkPage`, `FormationsPage`, `SimulateurPage`, `ContactPage`, `FaqPage`

### Fonctionnalités principales
- Site vitrine multi-marques (KPS Groupe / KPS Analytics / EasyToWork)
- **Simulateur** (de salaire ou de cotisations)
- Catalogue de **formations**
- Formulaire de **postulation** avec envoi d'email
- **Contact** + **newsletter** (subscribe/unsubscribe)
- Génération PDF (`jspdf`) côté client
- CORS géré au niveau Nginx (pas de middleware Laravel)

---

## 5. Freelance Club (freelanceclub)

**Dossier :** `O:\Projets\freelance` (sous-dossiers `freelance_club_back` + `freelance-club`)

### Description
**Plateforme de portage salarial** pour freelances et entreprises. Solution end-to-end pour la gestion de missions, contrats, feuilles de temps, facturation, paie, paiements et collaboration.

### Stack technique

**Backend (`freelance_club_back`) — Node/TypeScript :**
- Express 5 + TypeScript 5.9
- **MongoDB** via Mongoose 9
- **Redis** (cache + sessions)
- Auth JWT (`jsonwebtoken`)
- Validation Zod 4
- Sécurité : Helmet, CORS, express-rate-limit, xss
- **Stockage objets :** MinIO
- **Stripe** (paiements)
- **Affinda** (parsing automatique de CV)
- **Anthropic SDK** (`@anthropic-ai/sdk`)
- **Socket.io** (temps réel, vidéo)
- Jobs : Bull (queues Redis)
- Cron : node-cron
- PDFKit + ExcelJS + csv-stringify
- i18n : i18next
- Logs : Winston
- Emails : Nodemailer
- Docs API : swagger-jsdoc + swagger-ui-express
- Tests : Jest + mongodb-memory-server + supertest

**Frontend (`freelance-club`) — Vue 3 :**
- Vue 3.5 + Vue Router 4.6 + Pinia 3
- Vite 7
- TailwindCSS 3 + Headless UI + Heroicons
- vue-i18n 9
- VueUse 14
- **Leaflet** (cartographie)
- Axios + vue-toastification
- Tests : Vitest + Playwright + Testing Library + MSW
- Scripts : génération sitemap, optimisation images (sharp)

### Modèles backend (~38)
`User`, `Freelance`, `Company`, `Mission`, `Application`, `Contract`, `ContractTemplate`, `Timesheet`, `Invoice`, `RecurringInvoice`, `Payslip`, `Expense`, `Portfolio`, `Skill`, `Match`, `Review`, `Notification`, `Message`, `MissionChat`, `MissionTask`, `MissionFile`, `MissionBoard`, `MissionActivity`, `CalendarEvent`, `VideoCall`, `Workflow`, `WorkflowExecution`, `Gamification`, `Badge`, `KYCVerification`, `EmailTemplate`, `EmailQueue`, `AuditLog`, `AccessLog`, `UserConsent`, `RefreshToken`, `SavedSearch`.

### Routes principales
`auth`, `freelance`, `company`, `mission`, `application`, `contract`, `contractTemplate`, `timesheet`, `invoice`, `recurringInvoice`, `payslip`, `expense`, `portfolio`, `skill`, `matching`, `search`, `kyc`, `verification`, `gamification`, `gdpr`, `analytics`, `notification`, `message`, `missionChat`, `missionFile`, `missionTask`, `review`, `calendar`, `videoCall`, `workflow`, `alert`, `emailTemplate`, `finance`, `file`, `health`, `admin/*`.

### Vues frontend (côté app authentifié)
`SearchPage`, `MatchesPage`, `MissionCollaborationPage`, `ContractsPage`, `ContractDetailPage`, `TimesheetsPage`, `InvoicesPage`, `InvoiceDetailPage`, `PayslipsPage`, `PayslipDetailPage`, `ExpensesPage`, `KycPage`, `VerificationPage`, `PortfolioPage`, `NotificationsPage`, `AlertsPage`, `CalendarPage`, `GamificationPage`, `SettingsPage` + sous-espaces `admin/`, `company/`, `freelance/`.

### Pages publiques
`HomePage`, `AProposPage`, `SolutionsPage`, `TarifsPage`, `EntreprisesPage`, `FreelancesPage`, `CommentCaMarchePage`, `BlogPage`, `ContactPage`, `LoginPage`, `SignupPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `VerifyEmailPage`, `ComingSoonPage`.

### Fonctionnalités principales
- Authentification JWT (register, login, refresh, verify-email, reset password, 2FA)
- Profils freelances & entreprises (avec parsing CV via Affinda)
- Publication / recherche / candidature aux missions
- Génération et signature électronique de **contrats de portage**
- **Feuilles de temps** (soumission + validation entreprise)
- **Facturation** automatique + factures récurrentes
- Bulletins de **paie** (payslips)
- **Notes de frais** (expenses)
- **Paiements Stripe**
- Messagerie interne + chat de mission + appels vidéo (Socket.io)
- KYC + vérifications + audit logs (RGPD)
- **Matching** freelances/missions
- **Gamification** (badges, scores)
- Workflows personnalisables
- Admin back-office (dashboard stats, exports Excel/CSV, logs d'audit)
- Cache Redis sur routes critiques (recherche missions 2 min, freelances 5 min, stats 1 h)
- Rate limiting strict (auth 5/15 min, reset 3/h)
- Documentation Swagger (`/api-docs`)
- Conteneurisation Docker + déploiement PM2 cluster

---

## 6. Planus Analytics (front)

**Dossier :** `O:\Projets\planus_analytics_front`

### Description
Site corporate de **Planus Analytics** — cabinet de **conseil IT, intégration et transformation digitale en Afrique** — couplé à un back-office d'administration (gestion contenu, recrutement, articles, ressources, partenaires, candidatures, utilisateurs).

### Stack technique
- **Framework :** Vue 3.5 + Vue Router 4.5
- **Build :** Vite (variante `rolldown-vite`)
- **State :** Pinia 3
- **Style :** TailwindCSS 3 + **Bootstrap 5.3** + bootstrap-icons + feather-icons + Heroicons
- **Charts :** Chart.js 4 + jsvectormap (cartes)
- **Animations :** AOS
- **Validation :** VeeValidate + Yup
- **Tables / dates :** dayjs, lodash
- **Auth/HTTP :** axios + JWT (via stores)
- **PDF :** jsPDF
- **Express :** présent comme dépendance (vraisemblablement pour `vite preview` en prod)
- **Lint :** Oxlint + ESLint + Vue plugin
- **TS :** ~5.8 + vue-tsc 3
- **Deploy :** Nixpacks (`nixpacks.toml`)

### Vues publiques
`HomePage`, `Service`, `About`, `Resource`, `Partner`, `Recruitment`, `RecruitementDetail`, `Blog`, `ArticleDetail`, `Contact`, `Formations`, `ApplicationDetails`.

### Vues admin (`views/Admin/`)
`Layout/`, `Dashboard/`, `Auth/` (Login, ForgotPassword, ResetPassword, TwoFactorVerification), `Applications/`, `Articles/`, `Jobs/`, `Partners/`, `Profile/`, `Resources/`, `Users/`.

### Fonctionnalités principales
- Site vitrine (Services, À propos, Ressources, Partenaires, Blog, Formations, Contact)
- **Espace recrutement** : liste des offres, détail d'une offre, soumission de candidature
- **Back-office admin** complet :
  - Dashboard avec graphiques (Chart.js)
  - CRUD Articles (blog)
  - CRUD Jobs (offres d'emploi)
  - Gestion Candidatures (Applications + ApplicationDetails)
  - Gestion Ressources
  - Gestion Partenaires
  - Gestion Utilisateurs
  - Profil & paramètres
- Authentification admin avec **2FA** + mot de passe oublié
- Cartographie (jsvectormap) pour zone d'intervention Afrique

---

## 7. Mariette Nobre Portfolio (dossier `experience`)

**Dossier :** `O:\Projets\experience`

### Description
**Blog moderne + portfolio professionnel** de **Mariette H. NOBRE**. Blog personnel avec admin complet (rédaction, gestion d'articles, tags, médias) + pages portfolio (CV, à propos, contact).

### Stack technique
- **Framework :** Next.js 15 (App Router) + React 19
- **Langage :** TypeScript 5.7
- **Style :** TailwindCSS 3 + `tailwindcss-animate` + Typography + shadcn/ui + Radix UI
- **DB :** MongoDB + Mongoose 8
- **Auth :** NextAuth v5 (beta) + `@auth/mongodb-adapter` (Google + GitHub OAuth + credentials avec bcryptjs)
- **Éditeur riche :** Tiptap 3 (extensions : image, link, table, text-align, highlight, color, underline, bubble menu…)
- **Upload média :** UploadThing 7
- **Formulaires :** react-hook-form + Zod + `@hookform/resolvers`
- **State / data :** TanStack Query 5
- **Animations :** Framer Motion 12
- **Email :** Nodemailer 7
- **UI extras :** `react-easy-crop`, `nprogress`, `marked`, `lucide-react`, `next-themes`, `react-intersection-observer`
- **Scripts admin :** tsx (`seed:admin`, `check:admin`, `test:password`, `diagnose:auth`)
- **Docker :** Dockerfile + DEPLOYMENT.md

### Structure
- `app/(auth)/admin/` : pages admin protégées
- `app/api/` : routes API REST
- `app/blog/`, `app/about/`, `app/contact/`, `app/page.tsx`
- `components/` : `blog/`, `editor/` (Tiptap), `comments/`, `dossier/`, `layout/`, `ui/` (shadcn)

### Fonctionnalités principales

**Public :**
- Page d'accueil avec hero
- Blog : liste, recherche, filtres, articles individuels avec rendu Markdown
- Page À propos / CV
- Formulaire de contact avec envoi d'email
- Mode clair/sombre (`next-themes`)
- SEO : `sitemap.ts`, `robots.ts`, `manifest.ts`

**Admin :**
- Dashboard avec statistiques
- CRUD complet des articles
- Éditeur Tiptap personnalisé (formatage, blocs, images drag&drop UploadThing, tables, slash commands, raccourcis clavier)
- Gestion tags avec couleurs
- Gestion médias (crop, upload)
- Système de commentaires
- Protection par rôles (admin / editor)
- 1er compte admin : `mariettenbr@gmail.com` (via `npm run seed:admin`)

**Sécurité :**
- NextAuth v5, protection routes API
- Validation Zod côté serveur, CSRF, sanitisation
- Middleware Next.js (`middleware.ts`)

---

## 8. TadagbeRhPlus (easyrhplus)

**Dossier :** `O:\Projets\tadagbe_rh_plus`
**Prod :** `/home/tadagbe/sample/easyrhplus`

### Description
**SIRH / logiciel de gestion RH et paie monolithique** Django pour le cabinet GPRHME (Bénin) — gestion des employés, managers, contrats, congés, vacances, paie/CNSS, stages, documents, services, chefs de service, etc.

### Stack technique
- **Framework :** Django 4.2 (initialement 2.2.8 d'après le README) — **Python 3.6+ historiquement**
- **DB :** MySQL (PyMySQL) — avec `django-celery-results`
- **Cache / Queues :** Redis + RabbitMQ + Celery 5.5 + django-celery-beat (APScheduler aussi)
- **Compression :** django-compressor + django-compression-middleware
- **CORS :** django-cors-headers
- **Audit :** django-auditlog
- **Email :** django-celery-email
- **PDF :** pdfkit (wkhtmltopdf — `.deb` fournis bionic/focal) + reportlab + PyPDF2 + pyHanko (signature électronique)
- **Excel / Word :** openpyxl, xlrd, python-docx, formulas
- **Calcul :** numpy, numpy-financial, pandas, num2words
- **Images :** Pillow, sorl-thumbnail, svglib
- **Statique :** whitenoise
- **QR :** qrcode
- **Sentry SDK** (monitoring d'erreurs)
- **i18n :** python-bidi, pyphen, regex
- **Front :** templates Django + JS (workers `easy_worker.js`, `blockUI.js`)

### Apps Django (modules)
`users`, `manager_profile`, `employer_profile`, `employee_profile`, `chefservices`, `contractor_profile`, `supervisor`, `confirmation`, `documents_uploads`, `vacations`, `cnss`, `internship`, `doc_generator`, `umbrella`, `dbchangelog`, `externals`, `gis`, `api`, `frontend`, `core`.

### Routes / URLs principales
- Auth : `connexion`, `deconnexion`, `mot-de-passe-oublie`, `changement-du-mot-de-passe`, `activate/<token>/`
- Admin Django : `airbus/` (URL admin renommée)
- Espaces : `<companyname>/employer/`, `<companyname>/employee/`, `manager/`, `contractor/`, `chefservices/`
- Modules : `confirmation/`, `uploads/`, `vacations/`, `internship/`, `api/`
- Calcul de jours ouvrables : `calculate_vacations_days/`, `/after/`, `/before/`
- Désactivations : `desactivate-company/`, `desactivate-user/`, `desactivate-managers/`, `delete/manager/`
- Sitemaps : `sitemaps.xml`
- Workers JS : `easy_worker.js` (déconnexion auto), `blockUI.js`
- Handlers d'erreurs : 400/403/404/500 personnalisés

### Fonctionnalités principales
- Gestion **multi-entreprises** (URL prefixée par `<companyname>`)
- Profils Employé / Employeur / Manager / Chef de service / Supervisor / Contractor
- **Calcul de congés** (jours ouvrables avant/après une date), formulaire vacances
- **CNSS** (sécurité sociale Bénin) — module dédié
- **Génération de documents** (`doc_generator`) avec templates, prévisualisation, duplication, sauvegarde
- **Paie** (PDF `PAIE.pdf` joint, formules avec `formulas`/`schedula`)
- **Stages** (`internship`)
- Confirmation de réunions
- Upload de documents + signature électronique (pyHanko)
- Worker JS pour **déconnexion synchronisée** sur tous les onglets
- Sitemaps SEO
- Conteneurisation Docker + supervisord
- Auditlog (traçabilité)
- Sentry pour monitoring

> Document d'audit interne disponible : `AUDIT_COMPLET.md`, et procédure : `PROCEDURE.md`.

---

## 9. Ubbfy

**Dossier racine :** `O:\Projets\ubbfy` (multi-sous-projets) + `O:\Projets\ubbfy-mobile-app` (Flutter racine)

### Description
**Suite ERP / SIRH complète** type Odoo : multi-module (stocks, projets, RH, CRM, helpdesk, documents, admin) avec un backend Django REST, un frontend Vue 3, une PWA dédiée et une app mobile Flutter de **pointage / présence** géolocalisée.

### Sous-projets

#### 9.1 — `ubbfy-backend-django` (API REST)
- **Django 5.1** + Django REST Framework 3.15 + django-filter
- **DB :** PostgreSQL (psycopg 3)
- **Async :** Celery 5 (Redis) + django-celery-beat + django-celery-results
- **WebSocket :** Channels 4 (Daphne) + channels-redis
- **Stockage :** django-storages (boto3 / S3) + Pillow
- **PDF :** WeasyPrint 62
- **Notifications :** pywebpush (Web Push), firebase-admin (FCM mobile), Twilio (SMS)
- **API docs :** drf-spectacular (OpenAPI/Swagger)
- **Cache :** django-redis
- **Monitoring :** sentry-sdk
- **Utils :** python-decouple, openpyxl, django-extensions

**Apps Django :**
`accounts`, `entreprises`, `employees`, `teams`, `attendance`, `leave`, `payroll`, `recruitment`, `billing`, `campaigns`, `contacts`, `documents`, `hardware`, `imports`, `notifications`, `support`, `dashboard`, `analytics`, `statistiques`, `core`.

#### 9.2 — `ubbfy-frontend-refonte` (refonte web)
- **Vue 3.5** + Vue Router 4.6 + Pinia 2 + pinia-plugin-persistedstate
- **Build :** Vite 8 (!) + TypeScript 5.9
- **UI :** **PrimeVue 4.5** + `@primevue/themes` + TailwindCSS 4 + lucide-vue-next
- **Tables :** `@tanstack/vue-table`
- **Éditeur riche :** Tiptap 2 (extensions : image, table, text-align, color, highlight, underline, placeholder)
- **Charts :** ApexCharts + vue3-apexcharts
- **Cartographie :** Leaflet
- **HTTP :** axios + axios-retry
- **Forms :** VeeValidate + Yup
- **Drag & drop :** vue-draggable-plus
- **Firebase :** firebase 12 (auth/messaging probable)
- **Dates :** date-fns 4

**Modules frontend (côté `src/modules/`) :**
`analytics`, `attendance`, `billing`, `campaigns`, `companies`, `contacts`, `dashboard`, `documents`, `employees`, `hardware`, `payroll`, `recruitment`, `settings`, `statistics`, `support`, `teams`.

#### 9.3 — `ubbfy_pwa` (PWA)
Application Vue/Vite séparée — probablement la version PWA mobile-first du produit (déploiement `nixpacks`).

#### 9.4 — `ubbfy-mobile` & `ubbfy-mobile-app` (mobile)
- `ubbfy-mobile` : projet **Expo / React Native** (`App.tsx`, `eas.json`, `app.json`)
- `ubbfy-mobile-app` (à la racine) : projet **Flutter** `ubbfypresence`

**Flutter (`ubbfypresence`) — Dart SDK ^3.9 :**
- Réseau : Dio + pretty_dio_logger
- State : Provider 6
- Stockage : flutter_secure_storage, shared_preferences
- Géoloc : geolocator
- Info appareil : device_info_plus
- PDF : pdf 3 + path_provider + open_file
- i18n : intl
- Réseau : connectivity_plus
- SVG : flutter_svg
- Permissions : permission_handler
- Notifs : flutter_local_notifications + firebase_messaging + firebase_core
- Icônes : flutter_launcher_icons

**Modules Flutter (`lib/features/`) :** `auth`, `device_management`, `notifications`, `presence_validation`.

### Fonctionnalités principales (d'après `new.md`)
- **Gestion des stocks et logistique** : multi-entrepôts, niveaux temps réel, entrées/sorties, traçabilité (lots/n° série), inventaires, seuils de réappro, transferts
- **Gestion de projets** : création, planification, allocation ressources, timesheets, coûts, facturation par projet
- **Ressources humaines (GRH)** : employés, paie, présences, congés/absences, performances, recrutement & onboarding, formation
- **CRM / Ventes** : contacts, campagnes, devis/commandes, facturation, paiements/relances, contrats, historique, service client/SAV
- **Helpdesk** : tickets (manuel/auto), attribution, catégories, priorités, statuts, historique
- **Documents** : import (PDF/Word/images), templates, versioning, archivage, prévisualisation
- **Administration & sécurité** : rôles & permissions, journal d'audit, taxes/devises/langues, workflows, multi-entreprise/multi-devise, backup/restore
- **App mobile Flutter** : pointage de présence géolocalisé, gestion appareil, notifications push (Firebase)

### Schéma multi-app
Backend Django (API + WebSocket + tâches async) ←→ Frontend Vue 3 (web refonte) + PWA Vue + App Expo + App Flutter (pointage).

---

## 10. WhatsPay

**Dossier :** `O:\Projets\whatspay`

### Description
Plateforme de **marketing d'influence via WhatsApp** : annonceurs créent des campagnes (tâches) que des influenceurs/diffuseurs relaient sur WhatsApp ; suivi des clics, paiements, portefeuilles et reversements. Inclut messagerie WhatsApp de masse pour admin.

### Stack technique
- **Framework :** Laravel 12 (PHP ^8.2)
- **Auth :** Laravel Sanctum + JWT (firebase/php-jwt)
- **WebSocket :** textalk/websocket
- **Queue :** RabbitMQ (php-amqplib + vladimir-yuldashev/laravel-queue-rabbitmq)
- **WhatsApp :** wasenderapi/wasenderapi-laravel
- **QR Code :** simplesoftwareio/simple-qrcode
- **Excel :** phpoffice/phpspreadsheet
- **Front (build) :** Vite + npm (concurrently, queue listener, pail logs)
- **Paiement :** PayPlus (config `config/payplus.php`, base_url + api_key + api_token)
- **Tests :** Pest/PHPUnit 11
- **Docker :** `docker/`, `docker_data/`, multiples `.env` (dev, docker, example)
- **DB :** sessions Laravel en BDD (table `sessions`)

### Modèles principaux
`User`, `Role`, `Right`, `Task` (campagne), `Assignment`, `Media`, `Category`, `Country`, `Locality`, `Phone`, `Phonehistory`, `Link`, `Linkcall`, `Lang`, `Occupation`, `Study`, `Contenttype`, `Plan`, `PlanSubscription`, `PaymentMethod`, `PaymentTransaction`, `Transaction`, `Wallet`.

### Controllers
- **API (`Api/`)** : `User`, `Task`, `Assignment`, `Media`, `Tracking`, `WhatsApp`
- **Web (`Web/`)** : `Auth`, `Dashboard`, `Page`, `Task`, `Assignment`, `Campaign`, `Influencer`, `Message`, `Report`, `Settings`, `User`, `Wallet`, `WhatsApp`, `PaymentCallback`
- **Web Admin (`Web/Admin/`)** : `CategoryAdmin`, `DashboardAdmin`, `FinanceAdmin`, `WhatsAppMessaging`
- **Web Influencer (`Web/Influencer/`)** : `Campaign`, `Dashboard`, `Earning`

### Routes
- `/` page d'accueil publique + pages CMS + comingsoon
- `/admin/login`, `/admin/registration/diffuseur`, `/admin/registration/annonceur`
- `/admin/verify-account`, `/admin/forgotten_password`, `/admin/password_recovery/{token}`, `/admin/twofa_auth/{token}` (**2FA**)
- `/admin/dashboard`, `/admin/myprofile`
- `/admin/tasks` + CRUD + `approve`/`reject`/`delete` campagnes
- `/admin/whatsappnumbers` + `add`, `/admin/verify-phone`
- `/admin/users_{group}` (CRUD utilisateurs par groupe)
- `/admin/client/dashboard` (annonceur)
- `/admin/categories` + CRUD admin
- `/admin/finance` + `/transactions` + validation paiements
- `/admin/whatsapp-messaging` + `send` (messaging de masse)
- `/track/{id}` (tracking de clics public)
- Routes test PayPlus, debug-session, debug-middlewares, test-login
- Routes incluses : `payment.php`, `annonceur.php`, `influencer.php`, `api.php`

### Fonctionnalités principales
- Inscription distincte **Diffuseur (influenceur)** / **Annonceur**
- Authentification + vérification compte + 2FA + mot de passe oublié
- Création/gestion de **campagnes** (tasks) par annonceurs
- **Assignations** des campagnes aux influenceurs/diffuseurs
- **Diffusion automatisée WhatsApp** (intégration WaSender API)
- Vérification téléphone + gestion numéros WhatsApp
- **Tracking des clics** sur les liens trackés (`/track/{id}`)
- **Portefeuilles (wallets)** + transactions + paiements + commissions
- Intégration **PayPlus** (paiements Afrique)
- **Messaging de masse** WhatsApp côté admin
- Back-office admin (catégories, finance, validation paiements, dashboards)
- Espace influenceur : dashboard, campagnes acceptées, gains (earnings)
- Espace annonceur : dashboard, création/suivi de campagnes
- Files de jobs RabbitMQ pour traitement asynchrone (probablement envoi WhatsApp + tracking)
- Tests/Debug : routes PayPlus ping, debug session, middlewares

---

## Récap synthétique

| Projet | Type | Stack principale | Statut |
|---|---|---|---|
| **Bilal Sekou** | Portfolio + ventes e-book | Nuxt 3 + Kkiapay | Live |
| **CCNS Bénin** | Site institutionnel santé | Vue 3 + Vite + Strapi | Live (ccnsbenin.vercel.app) — pas de source locale |
| **LeConsultant** | Appels d'offres B2B + abonnements | Laravel 8 + Livewire + Kkiapay/PayPlus | Prod (beninconsultant) |
| **EasyToWork** | Multi-marques KPS + simulateur | Laravel 12 (API mails) + Vue 3 | Actif |
| **Freelance Club** | Plateforme portage salarial complète | Node/Express/Mongo + Vue 3 + Stripe + Affinda + Anthropic | En dev (v1.0.0) |
| **Planus Analytics** | Cabinet IT + recrutement + admin | Vue 3 + Bootstrap + TailwindCSS | Front actif |
| **Mariette Nobre** (`experience`) | Blog + portfolio | Next.js 15 + MongoDB + NextAuth + Tiptap | En dev |
| **TadagbeRhPlus** | SIRH/paie multi-entreprises | Django 4 + MySQL + Celery + WeasyPrint/wkhtmltopdf | Prod monolithe |
| **Ubbfy** | Suite ERP/SIRH + pointage mobile | Django 5 + DRF + Vue 3 + PrimeVue + Flutter | Refonte en cours |
| **WhatsPay** | Marketing d'influence WhatsApp | Laravel 12 + RabbitMQ + WaSender + PayPlus | Actif |



https://bilalsekou.onrender.com/   https://freelanceclubs.com/  https://easytowork.fr/  https://ccnsbenin.vercel.app/  https://mariettehuguette.com/  https://whatspay.africa/ 