---
title: Orinsu
summary: "Une plateforme de réservation et de cartes d’accès pour des événements, des restaurants et des offres touristiques, avec validation des QR codes sur place, même hors ligne."
year: 2025
role: "Contribution à l’ingénierie"
coauthors: []
sector: "Événements, restauration, tourisme"
stack: [Node.js, Express 5, TypeScript, MongoDB, Mongoose, Redis, Cloudinary, Swagger, Jest, Vue 3, Pinia, Tailwind CSS, React Native]
genes: [engineering, product]
status: private
featured: null
order: 5
images: []
proofs: []
seoDescription: "Orinsu : réservations, cartes d’accès et validation par QR code pour événements, restaurants et tourisme. API Express 5 et MongoDB, Vue 3, React Native."
---

## Les enjeux

Orinsu réunit trois univers qui vendent tous un accès : des événements, des restaurants et des offres touristiques. Le client réserve, paie et reçoit un billet, une commande ou une carte ; sur place, une équipe doit vérifier ce droit d’accès rapidement, y compris quand le réseau est faible.

Autour de ce cœur gravitent des promoteurs, qui publient leurs offres et souscrivent à un abonnement, et des équipes de validation rattachées à chaque lieu.

## Fonctionnalités clés

- **Le catalogue** : événements, restaurants, offres touristiques.
- **Les réservations et les cartes** d’accès, avec abonnements.
- **Les paiements** par carte bancaire (Stripe) et par Mobile Money.
- **L’espace promoteur**, avec son propre abonnement.
- **La validation sur place** par QR code, depuis une application mobile destinée au personnel, avec une file d’attente hors ligne.
- **Les notifications push**, les communications et les rapports d’activité.
- **Une interface bilingue**, français et anglais.

## Contraintes et décisions

- **Une seule API pour le public et le personnel.** Le site Vue 3 et l’application de validation React Native consomment la même API Express, découpée en modules (événements, restaurants, tourisme, réservations, cartes, paiements, promoteurs, validation, abonnements, rapports) et documentée en Swagger.
- **Une validation qui ne dépend pas du réseau.** Les contrôles faits sans connexion sont enregistrés sur l’appareil puis synchronisés. Le contrôle à l’entrée ne s’arrête pas quand le réseau tombe.
- **Redis et un planificateur pour ce qui ne doit pas bloquer la requête**, et Cloudinary pour les médias, afin que l’API reste légère.

## Résultat

Le produit n’est pas accessible publiquement. Cette page décrit ce qu’il fait et comment il est construit.
