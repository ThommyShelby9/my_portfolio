---
slug: planus
title: Le site corporate d'un cabinet IT panafricain
kicker: Issue 10 · Corporate · 2025
excerpt: Vitrine + back-office complet pour Planus Analytics — gestion contenu, recrutement, articles, ressources, candidatures, utilisateurs avec 2FA.
year: 2025
order: 10
featured: false
client: Planus Analytics
sector: Corporate · Conseil IT
role: Full-stack · Front lead
team: 2 devs
duration: 6 semaines
stack:
  - Vue 3
  - Vite
  - Pinia
  - Bootstrap 5
  - TailwindCSS
  - Chart.js
cover: /images/planus.png
results:
  - value: "2FA"
    label: Auth admin avec deuxième facteur
  - value: "11"
    label: Vues admin métier
  - value: "Carte"
    label: Zone d'intervention Afrique avec jsvectormap
seoDescription: Planus Analytics — site corporate + back-office Vue 3 + Bootstrap 5 + TailwindCSS. Recrutement, blog, ressources, partenaires, candidatures.
---

## Le contexte

Planus Analytics est un cabinet de **conseil IT, intégration et transformation digitale en Afrique**. Avant la refonte : un WordPress vitrine qui ne reflétait plus la maturité du cabinet, et un suivi des candidatures dans un Trello partagé. Le mandat : un site corporate qui pose le ton, **et un back-office d'administration intégré** pour ne plus dépendre d'outils externes pour le recrutement.

## L'approche

Une SPA Vue 3 unique qui contient le site public **et** l'admin protégé. Pas de séparation backend/frontend pour le moment — la donnée vit dans un backend Laravel partagé (existant), l'app frontend consomme cette API.

Côté UI, j'ai assumé un **mix Bootstrap 5 + TailwindCSS** — Bootstrap pour les composants admin denses (tables, modals, forms) qui livrent vite, Tailwind pour le vitrine où l'identité visuelle compte.

## Décisions techniques notables

- **Vue 3.5 + Vue Router 4.5** sur un build Vite (variante `rolldown-vite`) — significativement plus rapide en dev sur ce projet.
- **Pinia 3** pour le state, **axios + JWT** dans les stores pour l'auth.
- **2FA TOTP** à l'admin via `TwoFactorVerification.vue` — le compte admin ne se logue jamais sans deuxième facteur.
- **Chart.js 4 + jsvectormap** pour le dashboard admin — graphes de candidatures par mois, carte d'Afrique avec zones d'intervention cliquables.
- **VeeValidate + Yup** sur les forms (candidatures, contact, login admin).
- **AOS** pour les animations scroll côté vitrine — léger, suffisant pour ce type de site.
- **dayjs** partout au lieu de moment — quand 200 KB de gain comptent.
- **Lint dual Oxlint + ESLint** — Oxlint rapide pour le hot-reload, ESLint complet en pre-commit.
- **TypeScript ~5.8 + vue-tsc 3** strict.
- **Deploy Nixpacks** (`nixpacks.toml`) sur Coolify — pas de Dockerfile à maintenir.

## Le back-office admin

Le client voulait pouvoir tout faire depuis l'admin, sans nous appeler. J'ai livré 11 vues métier :

- **Dashboard** — KPIs candidatures + trafic + carte d'intervention
- **Articles** — CRUD blog avec éditeur riche
- **Jobs** — CRUD offres d'emploi
- **Applications + ApplicationDetails** — candidatures reçues avec timeline d'échanges
- **Resources** — bibliothèque de ressources téléchargeables
- **Partners** — gestion des logos et liens partenaires
- **Users** — gestion des comptes admin
- **Profile** — paramètres personnels (2FA, mot de passe, préférences)
- **Auth** — Login, ForgotPassword, ResetPassword, TwoFactorVerification

Chaque vue suit le même squelette : table TanStack-like, modal de création/édition, soft-delete, audit.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** Le mix Bootstrap + Tailwind sur le même projet. Contre-intuitif sur le papier, parfaitement complémentaire en pratique : Bootstrap encaisse les forms admin sans qu'on écrive une ligne, Tailwind donne la liberté nécessaire au vitrine.

**Pas marché.** L'intégration Express en dépendance prod (pour `vite preview` server) a déstabilisé Nixpacks au premier build. Trois reverts plus tard, on a basculé sur un `vite build` + Nginx managé.

## Le take-away

Pour un cabinet de conseil, le **back-office d'administration EST le produit interne**. La vitrine ne fait pas vendre — c'est l'efficacité avec laquelle l'équipe traite ses candidatures et publie ses contenus qui change le quotidien.

J'ai passé 70 % du temps sur l'admin et 30 % sur la vitrine. Le client a confirmé la pondération en interview de fin de mission.
