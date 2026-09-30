---
title: TadagbeRhPlus
summary: "Moderniser sans interruption le SIRH multi-entreprises d’un cabinet de conseil RH : paie, congés, contrats et déclarations CNSS dans un seul outil."
year: 2025
duration: "11 mois"
role: "Lead back-end, architecture et livraison"
team: "3 développeurs, 1 product owner"
coauthors: []
client: "Cabinet de conseil RH, Bénin (confidentiel)"
sector: "SaaS, ressources humaines"
stack: [Django 4.2, Python 3.11, MySQL, Celery, RabbitMQ, Redis, Vue 3]
status: live
liveUrl: https://tadagberhplus.com
featured: null
order: 9
images:
  - { src: /work/tadagberhplus/01.webp, alt: "Site vitrine d’un cabinet de conseil RH, Bénin", kind: public }
  - { src: /work/tadagberhplus/02.webp, alt: "Page d’accueil en ligne", kind: public }
proofs:
  - { text: "−85 % de saisie manuelle", source: "confirmé par Rostel (spec v6, section 6.3)" }
  - { text: "3 mises à jour réglementaires CNSS sans aucune régression", source: "confirmé par Rostel (spec v6, section 6.3)" }
seoDescription: "TadagbeRhPlus : SIRH multi-entreprises en Django 4.2, MySQL et Celery pour un cabinet de conseil RH au Bénin. Paie, congés, contrats, CNSS."
---

## Les enjeux

Le cabinet gère la paie et les RH de nombreuses PME au Bénin. Avant TadagbeRhPlus : un fichier Excel par client, des cotisations CNSS calculées à la main, des bulletins de paie envoyés en PDF par e-mail, et un consultant par dossier qui devenait le seul à savoir comment tout tenait.

On m’a confié une plateforme Django 2.2 sous Python 3.6 qui ne tenait plus qu’à un fil. La mission : la moderniser sans interrompre la production, et industrialiser cinq modules critiques, les employés, les contrats, les congés, la paie et la CNSS.

## Fonctionnalités clés

- **Un espace par entreprise cliente**, pour qu’un consultant suive plusieurs dossiers en parallèle.
- **La paie** : bulletins générés en PDF et envoyés par e-mail en tâche de fond, planification mensuelle.
- **La CNSS** : calcul des cotisations selon les règles en vigueur pour l’année concernée.
- **Les contrats** signés électroniquement côté serveur (pyHanko), avec signature visible et horodatage.
- **Un journal d’audit** sur les employés, les contrats et les paies : chaque modification est tracée avec son auteur.
- **Une déconnexion synchronisée** : se déconnecter d’un onglet ferme la session dans tous les autres, utile sur les postes partagés.

## Contraintes et décisions

- **L’audit avant le code, puis la migration par paliers.** J’ai passé les deux premières semaines à lire le code et le schéma MySQL, et à interroger les consultants. Le document d’audit qui en est sorti classait 47 risques par criticité et a structuré toute la feuille de route. Ensuite, Python 3.6 vers 3.11, puis Django 2.2 vers 3.2 vers 4.2, avec des tests de non-régression à chaque palier.
- **Garder MySQL et assumer le monolithe.** Des années de données métier vivaient dans MySQL : passer à PostgreSQL aurait coûté des semaines sans gain visible pour le cabinet. Django, MySQL et Celery tournent sur un seul serveur. À cette échelle, et quand l’exploitation est assurée par l’un des trois développeurs, la simplicité vaut plus qu’une architecture en microservices.
- **Le multi-entreprises par l’URL.** Chaque entreprise a son chemin ; un middleware résout l’entreprise à l’entrée et des managers Django filtrent toutes les requêtes par défaut. Pas de schémas séparés, un seul discriminant, moins de risques d’oubli.
- **La CNSS comme paramètres, pas comme code.** Les règles de calcul changent par décret, presque chaque année. J’ai isolé le calcul dans une couche de formules paramétrées par année : quand un décret tombe, on ajoute une ligne de paramètres, on ne réécrit pas une fonction.

## Résultat

La saisie manuelle des consultants a reculé de 85 %, et la plateforme a absorbé 3 mises à jour réglementaires de la CNSS sans aucune régression. Tout n’a pas été réglé : le générateur de PDF historique butait sur certains bulletins (noms très longs, caractères spéciaux), et la migration des gabarits vers WeasyPrint n’était pas terminée à la fin de ma mission.

Sur un monolithe mature, le vrai gain vient rarement d’une réécriture. Il vient d’une lecture attentive du code existant, pour trouver les quelques modules qui bloquent vraiment et les refaire avec soin.
