---
title: IT-Opportunities-Tracker
summary: "Une plateforme de veille du marché IT : collecte automatisée d’offres de missions, entrepôt de données et tableau de bord, avec un rapprochement des profils de consultants prévu."
year: 2025
role: "Contribution à l’ingénierie"
coauthors: []
sector: "Veille du marché IT, données"
stack: [Python, Selenium, PostgreSQL, Django 5, DRF, Docker, YAML]
status: private
featured: null
order: 6
images: []
proofs: []
seoDescription: "IT-Opportunities-Tracker : pipeline Python et Selenium de collecte d’offres IT, entrepôt PostgreSQL, tableau de bord Django et DRF."
---

## Les enjeux

Pour une société de conseil, savoir quelles technologies le marché demande, et où, conditionne la prospection comme la formation des consultants. Ces informations existent, mais éparpillées sur des plateformes d’offres qui ne se ressemblent pas.

IT-Opportunities-Tracker automatise cette veille : collecter les offres de missions IT, les nettoyer, les centraliser, en tirer des tendances et les rapprocher des profils de consultants.

## Fonctionnalités clés

- **La collecte automatisée** d’offres sur des plateformes comme Free-Work et Welcome to the Jungle.
- **Un pipeline en étapes** : collecte, nettoyage, enrichissement, contrôle, chargement.
- **La détection des technologies** citées dans chaque offre, à partir d’une liste de mots-clés configurable.
- **Un entrepôt de données PostgreSQL** : profils de consultants, offres rapprochées, historique des candidatures.
- **Un tableau de bord** de tendances, servi par Django et DRF.

## Contraintes et décisions

- **Des étapes séparées et traçables.** Chaque exécution du pipeline est enregistrée en base. Quand une source change de structure, on sait quelle étape a échoué et sur quelle exécution.
- **La configuration plutôt que le code.** Les sources et les mots-clés de technologies vivent dans des fichiers YAML. Suivre une nouvelle technologie revient à ajouter une ligne, pas à modifier le code.
- **Un entrepôt découpé en schémas.** Données brutes, entrepôt analytique, tables techniques et journaux vivent dans des schémas distincts. Les données brutes ne polluent jamais l’analyse.
- **Une collecte reproductible.** Le collecteur tourne dans une image Docker qui embarque Python et Chrome : le même environnement en local et en production.

## Résultat

La plateforme est privée. Cette page décrit ce qu’elle fait et comment elle est construite ; le moteur de rapprochement avec les consultants fait partie de la feuille de route.
