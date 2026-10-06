---
title: Le Centre
summary: "Une proposition de refonte pour un lieu culturel béninois, appuyée sur un audit mesuré du site actuel : un agenda unifié, une collection lisible et un site léger sur mobile."
year: 2026
role: "Audit, conception et développement, en solo"
team: "Solo"
coauthors: []
sector: "Culture, musée"
stack: [Vue 3, TypeScript, Vite, WebGL, Docker, Nginx]
genes: [product, innovation]
status: concept
featured: null
order: 2
images:
  - { src: /work/lecentre/01.webp, alt: "Page d’accueil de la proposition Le Centre", kind: public }
  - { src: /work/lecentre/02.webp, alt: "Page collection de la proposition Le Centre", kind: public }
proofs: []
seoDescription: "Proposition de refonte non commandée pour l’Espace Culturel Le Centre : audit du site actuel, agenda unifié, collection indexable, Vue 3 et WebGL."
---

Proposition de refonte non commandée, réalisée pour montrer ce que Le Centre pourrait devenir.

## Les enjeux

L’Espace Culturel Le Centre, à Lobozounkpa (Abomey-Calavi), abrite un musée consacré à la récade, programme du cinéma, des rencontres, des arts vivants, et accueille des résidences d’artistes. Son [site actuel](https://lecentre-benin.com) ne rend pas justice à ce lieu.

J’ai commencé par un audit, relevé et mesuré. Les photographies sont servies sans compression ni redimensionnement, si bien qu’une seule visite de l’accueil pèse lourd sur un forfait mobile. Le HTML contient deux versions complètes du site, l’une pour ordinateur et l’autre pour mobile, et le navigateur télécharge les deux. Le zoom est bloqué sur mobile. La programmation est éclatée en neuf rubriques, sans agenda. Les notices de la collection sont enfermées dans une visionneuse, invisibles pour Google et pour les lecteurs d’écran. Et il n’y a pas de version anglaise, alors que le lieu reçoit des résidences internationales.

La maquette reprend le contenu réel du site actuel (textes, notices, programmation, photographies) pour montrer ce qu’il devient avec un autre traitement.

## Fonctionnalités clés

- **Un agenda unifié** : les neuf rubriques deviennent des filtres sur un seul flux, groupé par mois, avec les événements à venir et passés. Une résidence de plusieurs semaines est signalée « En cours » au lieu d’être traitée comme un rendez-vous daté.
- **Une page par récade**, avec le nom en fon comme titre, la traduction française et une fiche structurée : origine, matériaux, atelier, dimensions, datation.
- **Une traversée du musée** en cinq stations, dans laquelle les photographies se dissolvent l’une dans l’autre.
- **Un logo animé** et des transitions entre les pages, désactivés quand l’utilisateur demande moins de mouvement.

## Contraintes et décisions

- **Les mêmes photographies, au bon poids.** Chaque image est recompressée et redimensionnée à sa taille d’affichage réelle, chargée en différé, avec ses dimensions déclarées pour éviter les sauts de mise en page. Seule l’image principale est chargée en priorité.
- **Pas de bibliothèque d’animation.** Un observateur d’intersection partagé et quelques animations CSS font ce qu’une bibliothèque ferait pour un poids bien supérieur. L’état par défaut est visible : si le JavaScript ne s’exécute pas, rien ne disparaît.
- **Du WebGL écrit à la main pour la traversée.** Un seul shader de fragment gère la dissolution entre deux photographies, le liseré de transition, la lumière et le grain. Le module n’est téléchargé qu’au moment où l’on entre dans le musée, pour ne rien coûter aux autres visiteurs.
- **La collection comme contenu.** Sortir les notices de la visionneuse les rend indexables, lisibles par un lecteur d’écran et partageables, pièce par pièce.

## Résultat

Une maquette fonctionnelle, construite seul à partir du contenu existant, qui montre à l’équipe du lieu un site plus léger, plus lisible et plus fidèle à sa collection. Un catalogue complet demanderait une campagne photographique et un travail de notices avec le responsable des collections.
