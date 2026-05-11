---
slug: bilalsekou
title: Un portfolio one-page avec vente d'e-book intégrée
kicker: Issue 07 · Nuxt · E-commerce light · 2025
excerpt: Le site vitrine de Bilal Sekou, stratège en communication — avec tunnel de paiement Kkiapay, codes promo, et bascule sandbox/production.
year: 2025
order: 7
featured: false
client: Sekou Bilal — Digital Marketer
sector: Portfolio · E-book
role: Solo · Conception · Développement
team: Solo
duration: 4 semaines
stack:
  - Nuxt 3
  - Vue 3
  - TypeScript
  - TailwindCSS
  - Kkiapay
  - Nodemailer
cover: /images/bilal_portfolio.png
results:
  - value: "FCFA 7 800"
    label: Tarif promo, configurable via env
  - value: "100 %"
    label: Mobile-first, dark mode natif
  - value: "Webhook"
    label: Vérification de transaction + relance
seoDescription: Portfolio Bilal Sekou avec vente d'e-book — Nuxt 3, Vue 3, TypeScript, Kkiapay, paiements automatiques, webhook + vérification + comptage transactions.
---

## Le contexte

Bilal Sekou est stratège en communication et accompagne des entreprises africaines à l'international. Il avait besoin de **deux choses dans un seul site** : une vitrine credibilisant son expertise, et un tunnel de vente pour un e-book qu'il commercialise à 11 500 FCFA (ou 7 800 FCFA en période promo).

Pas de Stripe — la clientèle paie en Mobile Money, Kkiapay est la norme régionale.

## L'approche

Un site **one-page** pour la vitrine (hero, expériences, compétences, contact) + une route dédiée `/ebook` pour le tunnel d'achat. SEO bilingue FR/EN. Mode sombre par défaut.

## Décisions techniques notables

- **Nuxt 3 + Vue 3 + TypeScript strict.** SSR pour le SEO (Bilal est cherché par son nom), prerendering des pages publiques.
- **Pinia** pour le state du panier (un seul produit mais avec promo configurable).
- **VeeValidate + Zod** sur tous les formulaires — contact, newsletter, achat e-book.
- **Kkiapay JS SDK** intégré côté client pour le tunnel de paiement — popup native du SDK, callback côté Vue.
- **Server API Nitro** (`server/api/`) pour les endpoints sensibles :
  - `POST /api/contact` — formulaire de contact
  - `POST /api/newsletter` — inscription newsletter
  - `POST /api/ebook/submit` — pré-création de transaction
  - `GET /api/ebook/verify` — vérification de transaction côté serveur (jamais faire confiance au client)
  - `POST /api/ebook/webhook` — webhook Kkiapay (livraison automatique du PDF par email)
  - `POST /api/ebook/update-transaction` — mise à jour de statut
  - `GET /api/ebook/count` — comptage live (limite de codes promo)
- **Nodemailer + SMTP Gmail** pour l'envoi de l'e-book en pièce jointe après paiement validé.
- **`@nuxtjs/i18n`** stratégie `prefix_except_default` (FR = racine, EN = `/en/`).
- **vue-toast-notification** pour les confirmations d'achat / erreurs.
- **Mode sandbox configurable** via `.env` — bascule Kkiapay sandbox/prod sans rebuild.

## Le tunnel de paiement (point critique)

```
[ Form ]
   → POST /api/ebook/submit  (validation Zod, création transaction "pending")
   → Kkiapay SDK popup       (paiement Mobile Money)
   → callback success        (frontend)
   → GET /api/ebook/verify   (côté serveur, vérifie auprès de Kkiapay)
   → si OK → /api/ebook/webhook livre le PDF par email
   → /ebook/success          (page de remerciement)
```

La règle d'or : **rien n'est vérifié côté client**. Le frontend reçoit le callback Kkiapay, mais c'est le serveur qui appelle l'API Kkiapay pour confirmer la transaction avant de livrer.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** La séparation `submit` / `verify` / `webhook` a évité tout risque de double-livraison ou de livraison fantôme. Trois mois après lancement, zéro litige sur les 200+ achats.

**Pas marché.** Le webhook Kkiapay arrive parfois deux fois pour la même transaction (retry automatique de leur côté en cas de timeout réseau). J'ai dû ajouter une déduplication par `transaction_id` en base.

## Le take-away

Sur un projet "petit" comme un portfolio + e-book, **la vraie complexité** n'est pas dans le design ou le contenu : c'est dans la mécanique de paiement. J'ai passé une journée sur le design et trois sur le tunnel d'achat — c'est la bonne proportion.
