---
slug: leconsultant
title: Une plateforme d'appels d'offres B2B
kicker: Issue 07 · Laravel · B2B · 2023–2024
excerpt: Centraliser les appels d'offres publics du Bénin, ajouter des abonnements, des alertes par catégorie et un module de formations.
year: 2024
order: 7
featured: false
client: LeConsultant
sector: B2B · Marchés publics
role: Full-stack Developer
team: 2 devs · 1 PO
duration: 17 mois (août 2023 — déc. 2024)
stack:
  - Laravel 8
  - PHP 8.2
  - Livewire 2
  - MySQL
  - Kkiapay
  - PayPlus
cover: /images/leconsultant.png
results:
  - value: "PP / Kkiapay"
    label: Deux passerelles de paiement intégrées
  - value: "13"
    label: Modules métier livrés
  - value: "PDF + QR"
    label: Justificatifs d'abonnement signés
seoDescription: LeConsultant — plateforme d'annonces d'appels d'offres au Bénin. Laravel 8 + Livewire, abonnements payants, alertes par catégorie, intégrations Kkiapay et PayPlus.
---

## Le contexte

Les appels d'offres publics du Bénin sortent dans des PDF officiels difficiles à parser, publiés sur trois sites institutionnels avec des conventions de nommage différentes. Un consultant B2B qui rate un appel d'offres parce qu'il l'a vu trois jours trop tard, c'est un mois de chiffre d'affaires en moins.

LeConsultant voulait être le **flux unique** d'appels d'offres pour les PME béninoises et ouest-africaines, avec un modèle d'abonnement mensuel et des alertes par catégorie.

## Ce qu'on m'a demandé

Maintenir et faire évoluer la plateforme existante (Laravel 8 + Livewire), ajouter un module d'abonnement payant, intégrer deux passerelles de paiement (Kkiapay et PayPlus), et industrialiser le système d'alertes.

## L'approche

- **Garder Laravel 8.** Pas de migration framework — la plateforme tourne, les bugs sont rares, et upgrader vers 11 aurait coûté un mois pour gagner zéro feature visible.
- **Livewire 2 pour le back-office.** Forms d'admin avec validation côté serveur, sans une ligne de JavaScript. Les rédacteurs (qui ne sont pas devs) éditent les offres sans qu'on touche au front.
- **Deux passerelles de paiement en parallèle.** Kkiapay est mature en zone CFA mais ne couvre pas tous les pays, PayPlus complète la couverture. Chaque transaction passe par un `PaymentCallback` unique, l'intégration se réduit à deux drivers qui implémentent la même interface.

## Décisions techniques notables

- **Laravel Fortify + Sanctum** — Fortify pour la mécanique d'auth (login/register/reset), Sanctum pour les tokens API mobile.
- **Webpack Mix + TailwindCSS** côté assets. Pas de Vite (Laravel 8 ne supporte pas natif), Mix suffit.
- **Barryvdh DomPDF** pour générer les justificatifs d'abonnement, avec QR code de vérification (`simplesoftwareio/simple-qrcode`). Le client scanne, on valide l'authenticité du PDF côté serveur.
- **jcobhams/newsapi + serpapi/google-search-results-php** pour enrichir les pages de service avec de l'actualité contextuelle automatique.
- **fruitcake/laravel-cors** pour ouvrir l'API mobile sans exposer l'admin.
- **Alertes** : tâche planifiée nocturne qui parcourt les offres nouvelles, matche par catégorie/type/zone géographique avec les préférences abonnées, et déclenche un mail (Blade templates dans `emails/`).
- **laravel-lang/lang** pour le bilingue FR/EN.
- **Module ticket support** pour gérer les questions des abonnés sans sortir de la plateforme.
- **Modèles métier riches** : `Abonnement`, `Pack`, `PaymentCallback`, `Offre`, `Categorie`, `Direction`, `Autorite`, `Formation`, `Alerte`, `Ticket`, `Type`, `PageService`, `User`.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** Le double paiement Kkiapay + PayPlus. Un abonné qui rate son paiement sur Kkiapay (échec MTN Mobile Money fréquent) retombe sur PayPlus dans la même session — zéro abandon de panier sur 6 mois.

**Pas marché.** Le matching des offres aux abonnés est fait par regex sur titre + description, ce qui rate les variations d'écriture ("CNHB" vs "Centre National des Œuvres Universitaires" pour des marchés universitaires). On a documenté ça comme dette pour une v2 qui passerait par un index Elasticsearch — pas implémenté en mission.

## Le take-away

Sur un Laravel mature, **Livewire est le meilleur compromis** pour la productivité d'équipe : zéro JavaScript à écrire, validation cohérente côté serveur, forms complexes en deux fichiers. Pour un produit B2B où le back-office représente 60 % du code, c'est imbattable.

Le frontend Vue/React n'a du sens que côté usager final — pas côté admin.
