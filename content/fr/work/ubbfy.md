---
slug: ubbfy
title: Une suite ERP complète avec pointage géolocalisé
kicker: Issue 02 · ERP · Web + Mobile · 2025–2026
excerpt: Stocks, projets, RH, CRM, helpdesk, documents — plus une app Flutter de pointage géolocalisé. Une refonte multi-app à partir d'un legacy mono.
year: 2026
order: 2
featured: true
client: Ubbfy
sector: ERP · SIRH · Multi-tenant
role: Lead Engineering · Architecture · Refonte
team: 4 devs · 1 mobile (Flutter) · 1 ops
duration: 8 mois (refonte en cours)
stack:
  - Django 5
  - DRF
  - PostgreSQL
  - Redis
  - Vue 3
  - PrimeVue
  - Flutter
  - Channels
results:
  - value: "20"
    label: Apps Django métiers
  - value: "16"
    label: Modules frontend
  - value: "Web + PWA + Flutter"
    label: Trois clients, une API
cover: /images/ubbfy.png
seoDescription: Refonte Ubbfy — suite ERP complète Django 5 + DRF + Vue 3 + PrimeVue + Flutter (pointage géolocalisé). Channels, Celery, S3, WeasyPrint, FCM.
---

## Le contexte

Ubbfy était un Odoo en bout de souffle — un Django monolithique de cinq ans, des templates serveur, peu de tests, et une dette qui empêchait d'ajouter le moindre module sans casser trois autres. Côté business : pointage de présence, stocks, RH, projets, helpdesk — tout vivait dans le même monolithe.

Le mandat : refondre en gardant l'existant en production, basculer module par module, et livrer en parallèle une **app mobile Flutter de pointage géolocalisé** pour les sites distants.

## L'approche

Une seule règle : **l'API Django est l'unique source de vérité.** Web, PWA, mobile Expo, mobile Flutter — quatre clients consomment la même API DRF. Pas de logique métier dans le client.

J'ai posé l'architecture en trois couches :

1. **Backend Django 5 + DRF + Channels** — REST classique pour la lecture, WebSocket (Channels + Redis) pour les notifications temps réel, Celery (Redis broker) pour les tâches longues (génération PDF WeasyPrint, exports Excel, imports).
2. **Frontend Vue 3 + PrimeVue 4.5 + Tailwind 4** — refonte web, 16 modules métier (analytics, attendance, billing, campaigns, companies, contacts, dashboard, documents, employees, hardware, payroll, recruitment, settings, statistics, support, teams). Tanstack Table pour les listes lourdes, Leaflet pour la carto, ApexCharts pour les graphiques.
3. **Flutter (Dart 3.9)** — `ubbfypresence`, app de pointage : géoloc avec rayon configurable autour du site, prise de photo facultative pour validation, notifications FCM, mode offline avec sync différée.

## Décisions techniques notables

- **PostgreSQL via psycopg 3.** Migration depuis SQLite en respect des types JSONB pour les workflows custom et les paramètres entreprise.
- **Channels 4 + Daphne + channels-redis** pour les notifications push web + l'écran de présence temps réel (affiche qui pointe en direct).
- **drf-spectacular** pour OpenAPI — le contrat d'API est versionné, les clients Vue et Flutter consomment le schéma généré.
- **django-storages + boto3** vers MinIO/S3 — documents, photos de présence, exports Excel.
- **WeasyPrint 62** pour les bulletins de paie et les contrats — meilleur que wkhtmltopdf sur les polices et la mise en page CSS Grid.
- **pywebpush** (Web Push standard) côté web, **firebase-admin (FCM)** côté Flutter, **Twilio** en SMS de secours.
- **django-redis** pour le cache, **django-celery-beat** pour les jobs périodiques (rapports quotidiens, fermeture mensuelle paie, relances factures).
- **Sentry SDK** sur le back et le mobile — corrélation par `user_id` pour reproduire un incident côté Flutter en regardant la trace côté Django.

## L'app mobile Flutter

Le défi du pointage : un employé d'usine ne peut pas se permettre 3 secondes d'attente quand il prend son poste à 6h du matin.

- **Géolocalisation native + cache GPS.** L'app retient les coordonnées du site validé la veille pour démarrer instantanément.
- **Validation offline.** Si pas de réseau, on stocke en `flutter_secure_storage`, sync au retour de connectivité (`connectivity_plus`).
- **device_info_plus** pour binder un compte à un appareil — pas de pointage croisé entre collègues.
- **flutter_local_notifications** pour rappels de pause, fin de poste.
- **Provider** pour le state, **Dio + pretty_dio_logger** pour les appels API, **flutter_svg** pour les illustrations.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** Le strangler pattern : chaque module refondu débranche le module legacy correspondant via un feature flag par entreprise. Aucune migration big-bang, on bascule entreprise par entreprise, et on garde un rollback en un clic.

**Pas marché.** La première version du Flutter consommait l'API REST avec une couche cache maison. À 50 utilisateurs simultanés sur le même site, on saturait. J'ai dû passer sur un endpoint dédié `/api/attendance/checkin-batch/` avec déduplication serveur et acceptation différée.

## Le take-away

Une refonte ERP réussit ou échoue à un seul endroit : la **lisibilité du back-office**. Si les administrateurs du client (RH, comptables, ops) n'arrivent pas à faire leur travail avec la nouvelle interface dans les deux premières semaines, le projet est mort politiquement, quelle que soit la qualité technique en dessous.

J'ai passé un mois à co-concevoir les écrans admin avec le RH du client. C'est probablement le mois le plus rentable du projet.
