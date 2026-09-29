---
title: Najayna Experts
summary: "Un audit du site d’une agence immobilière d’Abidjan, suivi de trois propositions visuelles qui portent le même contenu, le même argumentaire et les mêmes biens."
year: 2026
role: "Audit, conception et développement, en solo"
team: "Solo"
coauthors: []
sector: "Immobilier"
stack: [Next.js 16, HTML, CSS, JavaScript, Docker, Nginx]
status: concept
featured: null
order: 3
images:
  - { src: /work/najaexperts/01.webp, alt: "Proposition A, page d’accueil", kind: public }
  - { src: /work/najaexperts/02.webp, alt: "Proposition B, page d’accueil", kind: public }
  - { src: /work/najaexperts/03.webp, alt: "Proposition C, page d’accueil", kind: public }
proofs: []
proposal: pitched
seoDescription: "Proposition de refonte pour Najayna Experts, agence immobilière à Abidjan : audit détaillé du site actuel et trois directions visuelles."
---

Proposition de refonte, réalisée à l’initiative de Rostel puis présentée à l’agence.

## Les enjeux

Najayna Experts est une agence abidjanaise aux métiers multiples : location et vente, gestion locative, résidences meublées, construction, décoration, entretien. Ses visiteurs arrivent surtout sur téléphone, depuis WhatsApp, les réseaux sociaux ou Google, et décident en quelques secondes si un bien mérite un appel.

Le [site actuel](https://najaynaexperts.ci) ne leur permet pas de décider. Avant de dessiner quoi que ce soit, j’ai écrit un audit externe : 44 constats, chacun avec sa preuve, classés en crédibilité du contenu, catalogue, conversion et technique. Il en ressort un site qui montre mal les biens, n’affiche aucun prix et ne transforme pas un visiteur en contact.

## Fonctionnalités clés

- **Trois directions visuelles**, chacune défendue par écrit avec ce qu’elle apporte et ce qu’elle coûte : A, le tableau de clés ; B, la maison ; C, l’acier brossé.
- **Le même contenu dans les trois** : les mêmes dix-sept biens, le même argumentaire, pour que la comparaison porte sur la forme.
- **Un catalogue qui permet de décider** : prix, surface, disponibilité et photographies sur chaque bien.
- **Un contact direct** : une conversation WhatsApp pré-remplie au sujet du bien consulté.
- **Un sélecteur de direction artistique** : huit pistes appliquées au même écran réel, pour trancher vite.

## Contraintes et décisions

- **L’audit avant la maquette.** Chaque choix de la refonte répond à un constat documenté. La proposition ne dit pas « c’est plus beau », elle dit ce qui ne marche pas et comment chaque écran le corrige.
- **Les couleurs viennent du logo.** Le noir, le laiton et les gris acier sont relevés dans le fichier vectoriel de l’agence. La refonte prolonge une identité existante au lieu d’en imposer une nouvelle.
- **Rien chargé chez un tiers.** Les polices sont embarquées avec le site. Le site actuel appelle ses polices en HTTP depuis une page HTTPS, le navigateur bloque la requête et la police n’arrive jamais.
- **Le téléphone d’abord, et le vrai séparé de l’exemple.** Les trois propositions sont conçues pour le mobile. Un bandeau rappelle sur chaque page que les prix, surfaces et disponibilités sont des valeurs d’exemple ; les photographies, les noms de biens et les coordonnées sont authentiques. Un document liste ce qu’il faudra obtenir de l’agence avant une mise en ligne.

## Résultat

L’audit et les trois directions ont été remis à l’agence, servis côte à côte par une application Next.js. L’agence a retenu la direction C, l’acier brossé. Le travail montre une méthode autant qu’un visuel : constater, prouver, puis proposer.
