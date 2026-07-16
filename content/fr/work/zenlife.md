---
slug: zenlife
title: Une app de bien-être personnel
kicker: Issue 10 · Side project · 2024
excerpt: Suivre humeur, finances et habitudes au quotidien — sur une stack Laravel + Vue + MySQL maintenue par une seule personne.
year: 2024
order: 10
featured: false
client: Produit personnel
sector: Wellness · SaaS
role: Solo · Conception · Développement
team: Solo
duration: 3 mois (août — octobre 2024)
stack:
  - Laravel 10
  - Vue 3
  - MySQL
  - TailwindCSS
cover: /images/zenlife.png
results:
  - value: "1 200+"
    label: Utilisateurs actifs en 6 mois
  - value: "3"
    label: Modules livrés (humeur, finances, habitudes)
  - value: "0 €"
    label: Coût d'infra sur 6 mois (VPS partagé)
seoDescription: ZenLife — app web personnelle pour le suivi du bien-être. Laravel + Vue + MySQL, 3 modules (humeur, finances, habitudes), maintenue solo.
---

## Le contexte

Je voulais un outil qui regarde **trois choses ensemble** : mon humeur, mes finances, et mes habitudes. Pas un Notion, pas un Excel, pas trois apps mobiles séparées — un endroit unique pour comprendre les corrélations (est-ce que je dors mal la semaine qui suit une grosse dépense ? est-ce que ma productivité chute quand je rate mes routines du matin ?).

Aucun produit ne faisait ça correctement en 2024. J'ai écrit le mien.

## L'approche

Side project — donc règles strictes :

1. **Stack que je connais par cœur.** Laravel + Vue + MySQL. Aucune chance d'apprendre quelque chose en dehors du domaine métier.
2. **Hosting gratuit ou quasi.** VPS partagé avec d'autres projets, domaine offert par Coolify, Cloudflare gratuit en CDN.
3. **Pas d'utilisateur tant que ce n'est pas pour moi.** J'ai utilisé ZenLife seul pendant deux mois avant d'ouvrir l'inscription.

## Décisions techniques notables

- **Laravel 10 + Sanctum** pour l'auth — magic link par email, pas de mot de passe à mémoriser.
- **Vue 3 + Vue Router + Pinia.** SPA simple, pas de SSR.
- **TailwindCSS** avec un design system de 30 lignes. Aucun composant tiers — chaque carte, chaque graphique est écrit à la main.
- **Chart.js** pour les graphes de tendances (mood/finance/habits dans le temps).
- **MySQL** avec trois tables principales (`mood_entries`, `transactions`, `habit_logs`) et une vue calculée `daily_summary` pour le dashboard.
- **Migrations Laravel** versionnées — j'ai cassé la prod deux fois, j'ai gagné deux fois.
- **Backup nocturne** : mysqldump + sync rclone vers Google Drive perso. Si tout brûle, je perds au pire 24 h.

## Les trois modules

**Humeur.** Une note 1–10, un mot-clé optionnel (énergie, anxiété, calme…), un commentaire libre. Affichage en heatmap mensuelle + graphique sur 90 jours.

**Finances.** Saisie rapide d'une transaction (montant, catégorie, note). Catégories personnalisables. Graphique de dépenses par catégorie + cash-flow mensuel.

**Habitudes.** Liste configurable (méditer, sport, écrire, lecture). Cochage quotidien. Streak counter. Heatmap GitHub-style sur 365 jours.

Le dashboard accueil croise les trois — c'est le seul écran intéressant.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** Le scope minimal. Trois modules, trois mois, déployé. J'ai résisté à toutes les tentations (export PDF, partage social, application mobile, intégration Apple Health) qui auraient ajouté 6 mois sans valeur réelle pour mon usage.

**Pas marché.** L'ouverture aux 1 200 utilisateurs a fait apparaître des bugs que je n'avais jamais vus seul — formats de date locaux différents, fuseaux horaires, caractères Unicode dans les notes. J'ai patché en urgence pendant deux semaines après l'ouverture.

## Le take-away

Pour un side project, **les contraintes sont la feature**. Pas de budget = pas d'AWS, pas de Stripe payant, pas de Sentry payant. C'est ce qui force à écrire 200 lignes de code utiles plutôt que 2000 lignes de glue avec dix dépendances.

Six mois plus tard, j'utilise toujours ZenLife au quotidien. C'est probablement la seule app que j'ai écrite dont je suis le premier utilisateur.
