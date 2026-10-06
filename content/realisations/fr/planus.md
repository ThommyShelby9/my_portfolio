---
title: Planus Analytics
summary: "Le site d’un cabinet de conseil IT panafricain et son back-office intégré : articles, offres d’emploi, candidatures, ressources et comptes protégés par double authentification."
year: 2025
duration: "6 semaines"
role: "Full-stack, lead front-end"
team: "2 développeurs"
coauthors: []
client: "Planus Analytics"
sector: "Conseil IT, site institutionnel"
stack: [Vue 3, TypeScript, Vite, Pinia, Bootstrap 5, Tailwind CSS, Chart.js]
genes: [engineering, product]
status: live
liveUrl: https://planus-analytics.com
featured: null
order: 14
images:
  - { src: /work/planus/01.webp, alt: "Site Planus Analytics", kind: public }
proofs: []
seoDescription: "Planus Analytics : site institutionnel et back-office en Vue 3, Bootstrap 5 et Tailwind CSS. Recrutement, blog, ressources, partenaires, double authentification."
---

## Les enjeux

Planus Analytics est un cabinet de conseil IT, d’intégration et de transformation numérique en Afrique. Avant la refonte, un site WordPress qui ne reflétait plus la maturité du cabinet, et des candidatures suivies dans un tableau Trello partagé.

Le mandat : un site institutionnel qui donne le ton, et un back-office intégré pour que l’équipe gère ses contenus et son recrutement sans outil externe.

## Fonctionnalités clés

- **Le site public** : présentation des offres, blog, offres d’emploi, ressources téléchargeables, partenaires, et une carte d’Afrique des zones d’intervention.
- **Un tableau de bord** : candidatures par mois, trafic, carte interactive.
- **La gestion des candidatures**, avec le détail de chaque dossier et l’historique des échanges.
- **La publication** : articles avec éditeur riche, offres d’emploi, ressources, logos et liens des partenaires.
- **Les comptes d’administration** protégés par une double authentification TOTP obligatoire, avec gestion du profil et du mot de passe.

## Contraintes et décisions

- **Une seule application pour le site et l’administration.** Une SPA Vue 3 contient les pages publiques et l’espace protégé ; les données viennent de l’API d’un back-end Laravel déjà en place. Pas de nouveau serveur à maintenir pour un besoin qui n’en demandait pas.
- **Bootstrap et Tailwind, chacun à sa place.** Bootstrap 5 pour les écrans d’administration denses (tableaux, fenêtres modales, formulaires) qui doivent sortir vite ; Tailwind pour la partie publique, où l’identité visuelle compte. Contre-intuitif sur le papier, complémentaire en pratique.
- **Un squelette commun à toutes les vues d’administration.** Onze vues métier suivent le même modèle : tableau, fenêtre de création et d’édition, suppression réversible. L’équipe apprend un écran et les connaît tous.
- **Une double authentification non négociable.** Aucun compte d’administration ne se connecte sans second facteur : le back-office donne accès aux candidatures, donc à des données personnelles.

## Résultat

Le site est en ligne sur planus-analytics.com. Une leçon de déploiement : dépendre d’un serveur de prévisualisation en production a fait échouer les premiers builds sur la plateforme d’hébergement. Le site est désormais servi comme un build statique derrière Nginx, plus simple et plus stable. Pour un cabinet de conseil, c’est le back-office qui change le quotidien : l’essentiel du temps de développement lui a été consacré.
