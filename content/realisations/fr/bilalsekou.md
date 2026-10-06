---
title: Bilal Sékou
summary: "Le site d’un stratège en communication, avec la vente d’un e-book payé en Mobile Money et livré automatiquement par e-mail après vérification serveur."
year: 2025
duration: "4 semaines"
role: "Conception et développement, en solo"
team: "Solo"
coauthors: []
client: "Bilal Sékou, stratège en communication"
sector: "Site personnel, vente d’e-book"
stack: [Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Pinia, Zod, Kkiapay, Nodemailer]
genes: [product, engineering]
status: private
featured: null
order: 16
images:
  - { src: /work/bilalsekou/01.webp, alt: "Portfolio de Bilal Sékou", kind: public }
proofs: []
seoDescription: "Site de Bilal Sékou avec vente d’e-book : Nuxt 3, TypeScript et Kkiapay. Paiement Mobile Money, vérification serveur, livraison automatique par e-mail."
---

## Les enjeux

Bilal Sékou est stratège en communication et accompagne des entreprises africaines à l’international. Il lui fallait deux choses dans un seul site : une vitrine qui rende son expertise crédible, et un tunnel de vente pour l’e-book qu’il commercialise, avec un tarif promotionnel activable.

Pas de Stripe : sa clientèle paie en Mobile Money, et Kkiapay est la norme dans la région.

## Fonctionnalités clés

- **Une vitrine sur une seule page** : présentation, expériences, compétences, contact.
- **Une page dédiée à l’e-book**, avec le tunnel d’achat et une page de remerciement.
- **Le paiement Mobile Money** dans la fenêtre native du SDK Kkiapay.
- **La livraison automatique** du PDF par e-mail une fois le paiement confirmé.
- **Des codes promotionnels** avec un nombre d’utilisations limité.
- **Un site bilingue**, français à la racine et anglais sous `/en/`, en thème sombre par défaut.

## Contraintes et décisions

- **Rien n’est vérifié côté client.** Le navigateur reçoit le retour de Kkiapay, mais c’est le serveur qui interroge l’API Kkiapay pour confirmer la transaction avant toute livraison. Un retour de paiement falsifié dans le navigateur ne livre rien.
- **Trois étapes séparées : soumettre, vérifier, livrer.** La transaction est créée en attente et validée par Zod, puis vérifiée côté serveur, puis le webhook livre le PDF. Cette séparation écarte la double livraison comme la livraison sans paiement.
- **Dédupliquer les webhooks.** Kkiapay renvoie parfois le même webhook quand son premier appel expire. J’ai ajouté une déduplication par identifiant de transaction : un acheteur reçoit son e-book une fois, pas deux.
- **Le rendu serveur pour être trouvé.** Bilal est cherché par son nom : Nuxt 3 en rendu serveur, avec les pages publiques prérendues, donne à Google une page complète.

## Résultat

Le site a été livré en quatre semaines. La répartition de l’effort dit l’essentiel : une journée sur le design, trois jours sur le tunnel d’achat. Sur un projet qui a l’air petit, la vraie complexité est dans la mécanique de paiement.
