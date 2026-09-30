---
title: Ubbfy
summary: "Refondre un ERP complet autour d’une seule API Django, servie au web, à une PWA et à une application Flutter de pointage géolocalisé."
year: 2026
duration: "8 mois, refonte en cours"
role: "Lead engineer, refonte et architecture"
team: "4 développeurs, 1 développeur mobile, 1 ops"
coauthors: []
client: Ubbfy
sector: "ERP, RH, multi-entreprises"
stack: [Django 5, DRF, PostgreSQL, Redis, Channels, Celery, Vue 3, PrimeVue, Flutter]
status: live
liveUrl: https://app.ubbfy.com
featured: 1
order: 1
images:
  - { src: /work/ubbfy/01.webp, alt: "Tableau de bord de la plateforme Ubbfy", kind: interior }
  - { src: /work/ubbfy/02.webp, alt: "Page de connexion d’Ubbfy", kind: public }
proofs:
  - { text: "20 applications Django derrière une seule API", source: "compté dans le dépôt ubbfy (contenu v5)" }
seoDescription: "Refonte d’Ubbfy : un ERP multi-entreprises en Django 5, DRF et Vue 3, avec une application Flutter de pointage géolocalisé qui fonctionne hors ligne."
---

## Les enjeux

Ubbfy tournait sur un monolithe Django vieux de cinq ans : des templates rendus côté serveur, peu de tests, et une dette telle qu’ajouter un module en cassait d’autres. Pointage, stocks, RH, projets, helpdesk : tout vivait dans le même code.

Le mandat tenait en trois lignes. Refondre sans arrêter la production. Basculer module par module. Livrer en parallèle une application mobile de pointage géolocalisé pour les sites distants, où un employé qui prend son poste à 6 h ne peut pas attendre que l’application se décide.

## Fonctionnalités clés

- **Un back-office web** en Vue 3 et PrimeVue, découpé en 16 modules métier : employés, paie, recrutement, facturation, documents, support, statistiques, entre autres. TanStack Table pour les listes lourdes, Leaflet pour les cartes, ApexCharts pour les graphiques.
- **Le pointage géolocalisé** avec l’application Flutter `ubbfypresence` : rayon configurable autour du site, photo facultative, démarrage immédiat grâce aux coordonnées du site gardées en cache, et un compte lié à un appareil pour empêcher le pointage croisé entre collègues.
- **Le mode hors ligne** : sans réseau, le pointage est stocké de façon chiffrée sur le téléphone, puis synchronisé au retour de la connexion.
- **Un écran de présence en temps réel**, qui montre qui pointe au moment où il pointe.
- **Les documents** : bulletins de paie et contrats générés en PDF, exports Excel, stockage compatible S3.
- **Les notifications** : Web Push dans le navigateur, FCM sur mobile, SMS en secours.

## Contraintes et décisions

- **Une seule API comme source de vérité.** J’ai posé une règle dès le départ : aucune logique métier dans les clients. Le web, la PWA et l’application Flutter consomment la même API DRF, dont le contrat OpenAPI est généré par drf-spectacular. Une règle métier change à un seul endroit, et les trois clients suivent.
- **Le strangler pattern plutôt qu’une bascule d’un bloc.** Chaque module refondu débranche son équivalent historique grâce à un feature flag par entreprise. On migre entreprise par entreprise, avec un retour arrière en un clic. C’est plus lent sur le papier, mais aucune paie n’est jamais mise en jeu par une migration.
- **Un endpoint de pointage par lots.** La première version Flutter appelait l’API REST avec une couche de cache maison. À 50 utilisateurs simultanés sur un même site, elle saturait. J’ai remplacé cet appel par un endpoint dédié, `/api/attendance/checkin-batch/`, avec déduplication côté serveur et acceptation différée.
- **Les tâches longues hors de la requête.** Génération des PDF (WeasyPrint), exports et imports passent par Celery ; les travaux périodiques (rapports quotidiens, clôture mensuelle de la paie, relances de factures) par django-celery-beat. Le temps réel passe par Channels et Redis. Sentry suit le back-end et le mobile, corrélés par utilisateur, pour reproduire un incident Flutter à partir de la trace Django.

## Résultat

La plateforme est en production sur app.ubbfy.com et la refonte continue, module par module. 20 applications Django servent désormais trois clients depuis une seule API.

Le mois le plus utile du projet n’a pas été technique : je l’ai passé à concevoir les écrans d’administration avec le responsable RH du client. Une refonte d’ERP se gagne d’abord sur la lisibilité du back-office. Si les RH, les comptables et les opérations n’arrivent pas à travailler avec la nouvelle interface dans les deux premières semaines, la qualité du code en dessous ne sauve rien.
