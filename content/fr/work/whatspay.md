---
slug: whatspay
title: Marketing d'influence via WhatsApp
kicker: Issue 05 · MarTech · Afrique · 2025
excerpt: Une plateforme où des annonceurs paient des micro-influenceurs pour relayer des liens trackés via WhatsApp. Tout l'orchestre tient sur RabbitMQ.
year: 2025
order: 5
featured: false
client: WhatsPay
sector: MarTech · Influence
role: Architect · Backend Lead
team: 2 devs · 1 PO
duration: 5 mois
stack:
  - Laravel 12
  - PHP 8.2
  - MySQL
  - RabbitMQ
  - WaSender API
  - PayPlus
results:
  - value: "2FA"
    label: Sécurité multi-rôles dès le départ
  - value: "RabbitMQ"
    label: Diffusion async à grande échelle
  - value: "PayPlus"
    label: Paiements Afrique intégrés
cover: /images/whatspay.png
seoDescription: WhatsPay — plateforme de marketing d'influence WhatsApp. Laravel 12, RabbitMQ, WaSender API, PayPlus. Tracking de clics, wallets, commissions.
---

## Le contexte

En Afrique de l'Ouest, WhatsApp **n'est pas un canal** — c'est l'internet. Les groupes de 256 personnes diffusent plus de contenu commercial qu'Instagram et Facebook réunis dans la région. WhatsPay voulait formaliser ça : permettre à un annonceur de payer 100 micro-influenceurs pour relayer un lien tracké, et reverser proprement à chacun selon les clics générés.

## Ce qu'on m'a demandé

Concevoir l'architecture, sécuriser les paiements (entrants annonceur, sortants influenceur), tracer chaque clic sans faire fuiter de données personnelles, et tenir la charge de diffusion : 100 messages WhatsApp envoyés en parallèle, c'est déjà 100 connexions qu'un Laravel monolithique ne peut pas tenir en synchrone.

## L'approche

Trois piliers :

1. **Tout ce qui touche WhatsApp est asynchrone.** Une campagne (`Task`) est créée par l'annonceur, validée par l'admin, assignée aux diffuseurs (`Assignment`) — chaque assignation devient un job RabbitMQ qui appelle l'API WaSender.
2. **Le lien tracké est court et anonyme.** `/track/{id}` redirige vers la cible et insère un `Linkcall` avec IP, user-agent, timestamp — sans cookie, sans fingerprint. Le diffuseur sait combien de personnes ont cliqué sur son relais, pas qui.
3. **Le wallet est la source de vérité.** Chaque clic crédite un montant dans le `Wallet` du diffuseur, chaque retrait débite. Toute incohérence déclenche un audit log et bloque les retraits jusqu'à résolution manuelle.

## Décisions techniques notables

- **Laravel 12 + Sanctum + JWT (firebase/php-jwt)** — Sanctum pour les sessions web (back-office), JWT pour l'API mobile.
- **2FA TOTP** à l'inscription, obligatoire pour les annonceurs (qui chargent de l'argent) et pour les admins ; optionnel pour les diffuseurs.
- **RabbitMQ + php-amqplib + vladimir-yuldashev/laravel-queue-rabbitmq.** Queue dédiée `whatsapp-send` avec workers dédiés, queue `tracking` pour les clics. Pas de Redis sur la queue — RabbitMQ donne du contrôle fin sur les acks, les retries et les dead-letter queues.
- **WaSender API** (intégration `wasenderapi/wasenderapi-laravel`) pour la diffusion WhatsApp — pas de tentation de coder une intégration WhatsApp non-officielle (qui aurait fait bannir tous les comptes).
- **PayPlus** (config dédiée `config/payplus.php`) pour les paiements Afrique — virements depuis Mobile Money (MTN, Moov), CFA-natif.
- **textalk/websocket** pour les notifications temps réel côté admin (nouvelle campagne soumise, retrait demandé) — léger, suffisant pour un back-office.
- **simplesoftwareio/simple-qrcode** pour les QR codes des codes promotionnels imprimables.
- **phpoffice/phpspreadsheet** pour les exports Excel admin (clics, paiements, commissions).
- **Tests Pest + PHPUnit 11** sur les transitions de statut campagne et les calculs de commission — les deux endroits où une erreur coûte de l'argent réel.

## Le routing public + tracking

```
/track/{id}  →  enregistre le clic, redirige vers cible
```

Ce endpoint est le seul à pouvoir être ddos-flooded. Trois protections :

- **Throttling** par IP (60/min) au niveau middleware
- **Bloomfilter** local sur les `id` valides — un `id` qui ne mappe rien renvoie 404 sans toucher la DB
- **Crédit asynchrone** au wallet — la redirection est immédiate, le crédit est posé en queue avec déduplication par `(id, ip, day)`

## Ce qui a marché, ce qui n'a pas marché

**Marché.** L'architecture asynchrone a tenu un pic de diffusion à 800 messages en moins de 4 minutes sans timeout côté annonceur — il voit "diffusion en cours", la queue avale, WaSender encaisse à son rythme.

**Pas marché.** L'intégration PayPlus de retrait a un délai de 24 à 48 h non documenté côté API — on a dû construire une UI de "paiement en attente" et un système de relance manuelle quand ça dure plus de 72 h. Trois fois sur les 4 premiers mois.

## Le take-away

Dans un produit où **l'argent circule des deux côtés**, le wallet n'est pas une feature, c'est l'architecture. Tout doit converger vers lui ou en sortir avec une trace immuable. J'ai gardé ce principe sur Freelance Club ensuite — et c'est ce qui rend les audits financiers trivials.
