---
slug: banque-regionale
title: Une plateforme de paiement pour une banque régionale
kicker: Issue 03 · Fintech B2B · 2024
excerpt: Comment nous avons remplacé un système legacy en six semaines, sans coupure pour 12 000 commerces.
year: 2024
order: 1
featured: true
client: Banque régionale (anonymisé · NDA)
sector: Fintech / Paiement
role: Lead Engineer · Architecture · Livraison
team: 4 devs · 2 ops · 1 PO
duration: 6 semaines (Mar – Avr 2024)
stack:
  - Django
  - DRF
  - PostgreSQL
  - Redis
  - Kubernetes
results:
  - value: "+180 %"
    label: Volume traité en 6 mois
  - value: "12 000"
    label: Commerces migrés
  - value: "99,98 %"
    label: SLA tenu sur 12 mois
seoDescription: Migration d'un système de paiement legacy vers une plateforme moderne — Django, DRF, PostgreSQL, Kubernetes. Six semaines, zéro coupure.
---

## Le contexte

> _Section à enrichir par Rostel — phase 11 du plan de migration._

Un système de paiement legacy bricolé sur huit ans, des incidents hebdomadaires, une équipe qui ne comprenait plus le code. Le client voulait migrer vers une architecture moderne sans interrompre 12 000 commerces actifs.

## Ce qu'on m'a demandé

> _À enrichir._

Conduire la refonte de bout en bout : architecture, choix techniques, recrutement de l'équipe restreinte, livraison en six semaines.

## L'approche

> _À enrichir._

Une bascule progressive par cohortes de commerces, un proxy de compatibilité pour absorber les anciens flux pendant la transition, et un runbook explicite pour chaque scénario d'incident.

## Décisions techniques notables

> _À enrichir avec 1-2 snippets si pertinent._

- **Django + DRF** au cœur : maturité, ORM solide, écosystème pour gérer les transactions critiques.
- **PostgreSQL** avec partitioning par mois sur la table des transactions — la table était la principale source de lenteurs sur le legacy.
- **Redis** pour les rate-limits et le cache de session.
- **Kubernetes** sur GCP, avec autoscaling agressif sur les pics de fin de mois.

## Ce qui a marché, ce qui n'a pas marché

> _Honnêteté éditoriale — partie obligatoire du template._

**Marché :** la bascule par cohortes a évité l'effet big-bang. Aucun commerce n'a perdu plus de 4 minutes pendant sa fenêtre de migration.

**Pas marché :** le runbook d'incident a sous-estimé la durée des incidents réseau du datacenter du client. On a dû le réécrire deux semaines après le go-live.

## Le take-away

> _À enrichir._

Pour migrer un système critique, ce qui compte n'est pas la qualité du code neuf, c'est la qualité de la sortie de l'ancien.
