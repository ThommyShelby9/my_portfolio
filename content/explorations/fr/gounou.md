---
title: Gounou
summary: "Une proposition de site pour une marque de chocolat fabriqué au Bénin : un récit au défilement où la cabosse s’ouvre et devient tablette, de la fève béninoise à la commande sur WhatsApp."
year: 2026
role: "Conception, direction des visuels et développement, en solo"
team: "Solo"
coauthors: []
sector: "Agroalimentaire, chocolat"
stack: [JavaScript, Vite, GSAP, ScrollTrigger, Lenis, Canvas, Three.js, Docker, Nginx]
genes: [product, innovation]
status: concept
featured: null
order: 0
images:
  - { src: /work/gounou/01.webp, alt: "Accueil de la proposition Gounou : la cabosse de cacao et le titre « Le Bénin a du cacao »", kind: public }
  - { src: /work/gounou/02.webp, alt: "La tablette qui se casse au défilement, « Ça craque. C’est Gounou. »", kind: public }
  - { src: /work/gounou/03.webp, alt: "La gamme : tablette noire, pâte à tartiner cacao et cajou, barre et coffret", kind: public }
proofs: []
seoDescription: "Proposition de site non commandée pour Gounou, chocolat fabriqué au Bénin : récit au défilement, séquence d’images pilotée par le scroll, GSAP et Lenis."
---

Proposition de site non commandée, réalisée pour montrer ce que Gounou pourrait devenir.

[Voir la démonstration](https://gounou.rostelmissimawu.com)

## Les enjeux

Gounou fabrique au Bénin un chocolat qui va de la fève à la tablette, jusqu’à une tablette noire vendue en Europe, et une pâte à tartiner cacao et cajou. Son ancien site ne répond plus : une marque qui veut exporter n’a donc plus de vitrine.

L’idée tient en une image : le visiteur fait défiler la page, et la cabosse s’ouvre, les fèves s’envolent, la tablette se forme puis se casse. Le produit raconte son histoire avant le moindre paragraphe.

## Fonctionnalités clés

- **Une séquence au défilement** : une courte vidéo découpée en images, rejouée sur un canvas au rythme du scroll, avec les titres calés sur les moments clés (l’ouverture, les fèves, la cassure).
- **De la fève à la tablette** : la cabosse, le séchage au soleil, la torréfaction, l’atelier, en sections qui se « développent » à l’apparition.
- **La gamme** en cartes, dans un carrousel piloté par le défilement.
- **Une carte isométrique de Cotonou** avec des repères de points de vente, et la commande sur WhatsApp.

## Contraintes et décisions

- **Visuels illustratifs, annoncés comme tels.** Les photographies et la vidéo du héros sont générées par IA pour la démonstration ; le vrai site utiliserait les photos de la marque. Une mention le précise en pied de page.
- **Une séquence qui reste légère.** Une centaine d’images WebP, préchargées progressivement : les premières d’abord, le reste en arrière-plan, avec une image fixe de repli sur les connexions lentes et quand l’utilisateur demande moins de mouvement.
- **Pas de saut de mise en page.** Chaque image a ses dimensions déclarées, plusieurs tailles et un chargement différé.

## Résultat

Une démonstration en ligne, en français et en anglais, construite seul en une journée à partir de l’histoire publique de la marque, pour lui montrer une vitrine à la hauteur de son produit. Le vrai site demanderait une séance photo des produits et la liste réelle des points de vente.
