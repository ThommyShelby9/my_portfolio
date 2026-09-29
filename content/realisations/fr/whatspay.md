---
title: WhatsPay
summary: "Une plateforme où des annonceurs rémunèrent des diffuseurs qui relaient leurs campagnes sur WhatsApp, avec liens suivis, portefeuilles et retraits en Mobile Money."
year: 2025
duration: "5 mois"
role: "Architecture et back-end"
coauthors: []
client: WhatsPay
sector: "Marketing d’influence, Afrique de l’Ouest"
stack: [Laravel 12, PHP 8.2, PostgreSQL, Redis, RabbitMQ, WaSender API, PayPlus]
status: live
liveUrl: https://whatspay.africa
featured: null
order: 10
images:
  - { src: /work/whatspay/01.webp, alt: "Site WhatsPay", kind: public }
  - { src: /work/whatspay/02.webp, alt: "Page d’accueil en ligne", kind: public }
proofs: []
seoDescription: "WhatsPay, marketing d’influence sur WhatsApp : Laravel 12, RabbitMQ, WaSender API et PayPlus. Liens suivis, portefeuilles, commissions, retraits."
---

## Les enjeux

En Afrique de l’Ouest, WhatsApp n’est pas un canal parmi d’autres : c’est là que circule une grande partie du contenu commercial. WhatsPay formalise cette réalité. Un annonceur crée une campagne, des diffuseurs la relaient dans leurs statuts et leurs groupes, et chacun est rémunéré selon les clics qu’il a générés.

Trois exigences tiraient dans des sens opposés : sécuriser l’argent dans les deux sens (dépôts des annonceurs, retraits des diffuseurs), compter chaque clic sans cookie ni empreinte du navigateur, et tenir la diffusion simultanée de nombreux messages, qu’une application Laravel ne peut pas absorber de façon synchrone. Mon rôle : l’architecture et le back-end.

## Fonctionnalités clés

- **Trois espaces** : annonceur, diffuseur et administration, avec validation des campagnes par l’administration avant diffusion.
- **La diffusion WhatsApp** via l’API officielle d’un prestataire (WaSender), jamais par une intégration non officielle qui ferait bannir les comptes.
- **Le lien suivi** : chaque diffuseur reçoit un lien court ; un clic est enregistré puis redirige vers la cible.
- **Le portefeuille** : chaque clic crédite le diffuseur, chaque retrait le débite, avec historique des transactions.
- **Les paiements** en Mobile Money par PayPlus, en francs CFA.
- **La double authentification TOTP**, obligatoire pour les annonceurs (qui chargent de l’argent) et les administrateurs.
- **Les exports Excel** des clics, paiements et commissions pour l’administration.

## Contraintes et décisions

- **Tout ce qui touche WhatsApp est asynchrone.** Chaque affectation d’une campagne à un diffuseur devient un message dans une file RabbitMQ, traité par des workers dédiés. RabbitMQ plutôt que Redis pour la file : il donne un contrôle fin sur les accusés de réception, les reprises et les files de rejet. L’annonceur voit « diffusion en cours », la file absorbe, le prestataire encaisse à son rythme.
- **Un lien anonyme par conception.** Le lien suivi n’utilise ni cookie ni empreinte du navigateur. Le diffuseur sait combien de personnes ont cliqué sur son relais, pas qui.
- **Protéger le seul endpoint exposé.** La route de suivi est la cible naturelle d’un abus. Elle limite le débit par adresse IP, écarte les identifiants inconnus sans toucher la base, et crédite le portefeuille en tâche de fond, avec une déduplication par lien, adresse et jour. La redirection reste immédiate.
- **Le portefeuille comme source de vérité.** Tout mouvement d’argent passe par lui et laisse une trace. Une incohérence déclenche une entrée d’audit et bloque les retraits jusqu’à une vérification manuelle. Les tests (Pest, PHPUnit) couvrent en priorité les transitions de statut des campagnes et le calcul des commissions, là où une erreur coûte de l’argent réel.

## Résultat

La plateforme est en ligne sur whatspay.africa. Un point a demandé plus de travail que prévu : les retraits PayPlus prennent 24 à 48 heures, un délai que la documentation de l’API ne mentionnait pas. Il a fallu ajouter un statut « paiement en attente » visible par le diffuseur et une procédure de relance manuelle au-delà de 72 heures.
