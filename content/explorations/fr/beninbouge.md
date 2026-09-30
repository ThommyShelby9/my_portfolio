---
title: Bénin Bouge
summary: "Une proposition de refonte pour un média numérique béninois : un récit éditorial immersif, une carte interactive des départements et un aperçu soigné pour chaque article partagé."
year: 2026
role: "Conception et développement front-end, en solo"
team: "Solo"
coauthors: []
sector: "Média numérique"
stack: [Vue 3, TypeScript, Vite, vite-ssg, Pinia, GSAP, Tailwind CSS, Vitest, Docker, Nginx]
status: concept
featured: null
order: 1
images:
  - { src: /work/beninbouge/01.webp, alt: "Page d’article de la proposition Bénin Bouge", kind: public }
  - { src: /work/beninbouge/02.webp, alt: "Grille d’actualités de la page d’accueil", kind: public }
  - { src: /work/beninbouge/03.webp, alt: "Carte interactive des départements du Bénin, Borgou en surbrillance", kind: public }
proofs: []
seoDescription: "Proposition de refonte non commandée du média Bénin Bouge : Vue 3, prérendu statique par page, carte interactive des départements, animations GSAP."
---

Proposition de refonte non commandée, réalisée pour montrer ce que Bénin Bouge pourrait devenir.

## Les enjeux

Bénin Bouge raconte le Bénin qui avance : technologie, culture, économie, sport, société. Son [site actuel](https://beninbouge.com) repose sur un thème WordPress générique, qui ne donne ni l’ampleur ni le rythme qu’un tel sujet appelle.

Deux objectifs pour cette proposition : une lecture qui ressemble à un magazine plutôt qu’à un blog, et des articles qui s’affichent correctement quand on les partage, parce que c’est par WhatsApp et LinkedIn qu’ils circulent.

## Fonctionnalités clés

- **Une page d’accueil éditoriale** : récit à la une, sujets du moment, bandeau d’actualités, inscription à la newsletter.
- **Une carte interactive des départements**, avec un panneau qui présente les projets et événements de chaque territoire.
- **Une frise par catégorie** : technologie, culture, économie, sport, société.
- **La page d’article**, avec barre de progression de lecture et articles liés.
- **Des pages par rubrique, par région et par talent**, et une recherche dans le navigateur.
- **Une entrée en matière animée** au chargement, avec GSAP.

## Contraintes et décisions

- **Un prérendu statique par page.** Les robots de WhatsApp, LinkedIn ou Slack n’exécutent pas de JavaScript : une application monopage leur montre une coquille vide. Avec vite-ssg, chaque article est généré en HTML complet, avec son titre, sa description et son image de partage.
- **Les métadonnées comme logique testée.** Titres, liens canoniques, balises Open Graph et données structurées JSON-LD sont produits par des fonctions dédiées, couvertes par des tests unitaires, plutôt que dispersés dans les composants.
- **Des images et un serveur pensés pour le mobile.** Des scripts optimisent les images, génèrent le plan du site et les images de partage ; Nginx compresse et met en cache.
- **Un contenu fictif, assumé.** Articles, talents et régions viennent de données de démonstration : la proposition montre une forme, pas une ligne éditoriale.

## Résultat

Une maquette fonctionnelle complète, construite seul, qui montre à la rédaction ce que le média pourrait devenir : une lecture de magazine, une carte qui donne envie d’explorer le pays, et des articles qui se partagent proprement.
