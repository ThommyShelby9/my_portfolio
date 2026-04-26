---
slug: tadagberhplus
title: Une plateforme RH pour piloter 100+ entreprises
kicker: Issue 02 · SaaS RH · 2023
excerpt: Centralisation de la gestion RH multi-entreprises pour un cabinet de conseil régional.
year: 2023
order: 2
featured: true
client: Cabinet de conseil RH
sector: SaaS / Ressources humaines
role: Backend Lead · Architecture · Livraison
team: 3 devs · 1 PO
duration: 4 mois
stack:
  - Spring Boot
  - PostgreSQL
  - Vue 3
  - TailwindCSS
results:
  - value: "100+"
    label: Entreprises gérées
  - value: "770+"
    label: Employés tracés
  - value: "85 %"
    label: Réduction des saisies manuelles
seoDescription: TadagbeRhPlus — plateforme SaaS multi-tenants pour la gestion RH de 100+ entreprises clientes.
---

## Le contexte

> _À enrichir._

Le cabinet gérait la paie et les contrats de plus de 100 entreprises clientes via Excel partagé et Google Drive. Aucune visibilité agrégée, aucune sécurité réelle, et un risque légal croissant.

## Ce qu'on m'a demandé

> _À enrichir._

Une plateforme web multi-tenants où chaque entreprise voit ses propres données, le cabinet voit tout, et les workflows de congés / contrats sont automatisés.

## L'approche

> _À enrichir._

Spring Boot pour la robustesse de l'authentification multi-rôle, Vue 3 pour la rapidité d'itération sur l'UI, PostgreSQL avec row-level security pour le multi-tenancy.

## Décisions techniques notables

> _À enrichir._

- Row-level security côté DB plutôt que filtrage applicatif : aucun risque de fuite si un endpoint manque un check.
- Génération de PDF (contrats, fiches de paie) côté serveur via une queue dédiée — pour ne pas bloquer les requêtes synchrones.

## Ce qui a marché, ce qui n'a pas marché

> _À enrichir._

## Le take-away

> _À enrichir._
