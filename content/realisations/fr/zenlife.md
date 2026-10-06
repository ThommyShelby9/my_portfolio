---
title: ZenLife
summary: "Une application du quotidien qui réunit planning, budget, messagerie entre amis et rappels, sur le web et sur mobile. Conçue et développée seul."
year: 2025
role: "Conception et développement, en solo"
team: "Solo"
coauthors: []
client: "Produit personnel"
sector: "Bien-être, organisation personnelle"
stack: [Vue 3, TypeScript, Pinia, Tailwind CSS, Capacitor, Spring Boot, Java 17, PostgreSQL, Flyway, Redis, WebSocket, Firebase]
genes: [product, engineering, architecture]
status: archived
featured: 3
order: 3
images:
  - { src: /work/zenlife/01.webp, alt: "Tableau de bord ZenLife sur ordinateur", kind: interior }
  - { src: /work/zenlife/02.webp, alt: "Tableau de bord ZenLife en thème sombre", kind: interior }
  - { src: /work/zenlife/03.webp, alt: "Résumé des finances dans ZenLife, thème sombre", kind: interior }
  - { src: /work/zenlife/04.webp, alt: "Planificateur de la journée dans ZenLife", kind: interior }
  - { src: /work/zenlife/05.webp, alt: "Pensées positives dans ZenLife", kind: interior }
  - { src: /work/zenlife/06.webp, alt: "Tableau de bord ZenLife sur mobile", kind: interior }
proofs:
  - { text: "1 200+ utilisateurs actifs en six mois", source: "confirmé par Rostel le 2026-09-28" }
seoDescription: "ZenLife : planning, budget, messagerie et rappels dans une seule application. Vue 3 et Capacitor, API Spring Boot, PostgreSQL, Redis, WebSocket."
---

## Les enjeux

Organiser sa journée, suivre ses dépenses, garder le contact avec ses proches, penser à boire de l’eau : d’ordinaire, cela fait quatre applications qui ne se parlent pas. ZenLife les réunit dans un seul espace, sur ordinateur comme sur téléphone, en thème clair ou sombre.

L’idée qui tient le produit : rapprocher ces données pour que chacun voie ce que ses journées montrent. Par exemple, la part de tâches terminées les jours où l’on boit assez, ou l’humeur les jours où le planning est tenu. Sans comparaison avec personne, et sans prétendre expliquer.

C’est mon produit : je l’ai conçu, développé et déployé seul, API comprise.

## Fonctionnalités clés

- **Le planning du jour** : tâches avec horaire et priorité, progression de la journée, et une courte réflexion du soir avec l’humeur du jour.
- **Les finances** : budget du mois, dépenses par catégorie, résumé mensuel.
- **La messagerie entre amis**, avec notes vocales et pièces jointes, gestion des amitiés et de la visibilité du profil.
- **Les pensées positives et le suivi de l’hydratation**, avec des rappels en notification (Web Push sur le web, FCM sur mobile).
- **La connexion Google**, l’export des données et la suppression du compte, disponibles depuis l’application.
- **Des applications Android et iOS** construites à partir du même code Vue, grâce à Capacitor.

## Contraintes et décisions

- **Une API séparée et documentée.** J’ai séparé le client Vue de l’API Spring Boot, décrite en OpenAPI. Le schéma PostgreSQL n’évolue que par migrations Flyway, jamais à la main. Le même contrat sert le web et les applications mobiles, ce qui évite de maintenir deux back-ends.
- **Le temps réel seulement là où il sert.** La messagerie passe par WebSocket (STOMP) et Redis ; tout le reste reste en REST, plus simple à tester et à mettre en cache.
- **Une configuration qui refuse de démarrer sans ses secrets.** Plutôt que de tourner avec une valeur par défaut dangereuse, l’API s’arrête au démarrage si une clé manque. Une erreur de déploiement se voit tout de suite, pas chez un utilisateur.
- **Les deux thèmes testés comme une fonctionnalité.** Des tests Playwright de bout en bout et de régression visuelle capturent les vues en clair et en sombre, et les couleurs passent par des jetons de design documentés. Un thème sombre se casse facilement et sans bruit ; les captures rendent la casse visible.

## Résultat

ZenLife a atteint plus de 1 200 utilisateurs actifs en six mois. L’application n’est plus en ligne ; elle est présentée par ses captures.
