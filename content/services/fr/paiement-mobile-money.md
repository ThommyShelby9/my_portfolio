---
title: "Intégration de paiements et Mobile Money"
metaTitle: "Intégration Mobile Money (FedaPay, Kkiapay, PayPlus) : développeur · Rostel Panoumassi"
seoDescription: "J’intègre le paiement Mobile Money dans vos sites et applications : FedaPay, Kkiapay, PayPlus, abonnements, portefeuilles, retraits, avec vérification côté serveur."
summary: "Encaisser en Mobile Money, gérer des abonnements, verser de l’argent à vos utilisateurs : j’intègre FedaPay, Kkiapay ou PayPlus de façon sécurisée, avec une vérification de chaque paiement côté serveur."
order: 4
related: [kaba, whatspay, leconsultant, bilalsekou]
faq:
  - q: "Quel agrégateur choisir : FedaPay, Kkiapay ou PayPlus ?"
    a: "J’ai intégré les trois. Le choix dépend des pays et des opérateurs que vous visez, des frais, des délais de reversement et des fonctions dont vous avez besoin, comme les retraits vers les utilisateurs. Je vous aide à comparer avant de coder."
  - q: "Comment être sûr qu’un paiement a vraiment eu lieu ?"
    a: "Je ne fais jamais confiance au navigateur : chaque paiement est confirmé par un webhook signé et vérifié côté serveur auprès de l’agrégateur avant de livrer quoi que ce soit."
  - q: "Peut-on verser de l’argent aux utilisateurs ?"
    a: "Oui. Sur WhatsPay, les diffuseurs disposent d’un portefeuille et retirent leurs gains en Mobile Money ; sur Kaba, les versements suivent les dons au fil de l’eau."
  - q: "Gérez-vous les abonnements ?"
    a: "Oui : LeConsultant fonctionnait par abonnement payé en Mobile Money, avec accès aux appels d’offres selon la formule choisie."
---

En Afrique de l’Ouest, un produit qui ne prend pas le Mobile Money se prive de la plupart de ses clients. J’intègre les paiements comme une partie critique du produit : chaque transaction est vérifiée, tracée, et l’utilisateur sait toujours où en est son argent.

## Ce que je livre

- **L’encaissement** : paiement Mobile Money et carte via FedaPay, Kkiapay ou PayPlus, sur le web et le mobile.
- **La vérification côté serveur** : webhooks signés, contrôle de chaque transaction auprès de l’agrégateur, protection contre les doubles paiements.
- **Les abonnements** et les accès qui en dépendent.
- **Les portefeuilles et les retraits** : soldes des utilisateurs, demandes de retrait, versements en Mobile Money.
- **La livraison automatique** : un produit numérique envoyé par e-mail dès que le paiement est confirmé.
- **Le suivi** : tableau de bord des transactions, rapprochement, exports pour la comptabilité.

## Des paiements déjà intégrés

**Kaba** : des cagnottes en ligne partagées sur WhatsApp et payées en Mobile Money via FedaPay, avec des versements au fil des dons et une preuve publique que l’argent sort.

**WhatsPay** : des annonceurs rémunèrent des diffuseurs qui relaient leurs campagnes sur WhatsApp, avec liens suivis, portefeuilles et retraits en Mobile Money via PayPlus.

**LeConsultant** : une plateforme d’abonnement aux appels d’offres publics du Bénin, payée avec Kkiapay et PayPlus.

**Bilal Sékou** : la vente d’un e-book payé avec Kkiapay et livré automatiquement par e-mail après vérification serveur.

## Technologies

FedaPay, Kkiapay, PayPlus, webhooks signés, Laravel, Node.js et Express, Nuxt, Vue 3, files d’attente Redis et RabbitMQ.
