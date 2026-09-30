---
title: CCNS Bénin
summary: "Le site d’un réseau catholique de centres de santé au Bénin, refait pour qu’un patient trouve le bon centre, son adresse et son numéro, même en 3G."
year: 2024
duration: "8 semaines"
role: "Full-stack, architecture et contenu"
coauthors: []
client: "Commission Catholique Nationale pour la Santé (CCNS)"
sector: "Santé, institutionnel"
stack: [Vue 3, TypeScript, Vite, Tailwind CSS]
status: live
liveUrl: https://ccnsbenin.vercel.app
featured: null
order: 15
images:
  - { src: /work/ccns/01.webp, alt: "Site de la CCNS", kind: public }
  - { src: /work/ccns/02.webp, alt: "Page d’accueil en ligne", kind: public }
proofs:
  - { text: "+240 % de trafic organique en six mois", source: "confirmé par Rostel (spec v6, section 6.3)" }
  - { text: "Score SEO Lighthouse de 100", source: "confirmé par Rostel (spec v6, section 6.3)" }
seoDescription: "Refonte du site de la CCNS Bénin en Vue 3 et Vite : accessibilité d’abord, pages rapides sur mobile, données structurées pour chaque centre de santé."
---

## Les enjeux

La CCNS fédère les centres de santé catholiques du Bénin. Son ancien site se résumait à une page d’accueil, un PDF de présentation et quelques adresses e-mail : invisible sur Google, illisible sur mobile, et sans aucun moyen pour un patient de trouver le centre le plus proche.

Le mandat était simple à énoncer : qu’un patient qui cherche un centre de santé à Cotonou tombe sur le bon centre, en tête des résultats, et voie tout de suite comment s’y rendre et qui appeler.

## Fonctionnalités clés

- **Une page par centre**, avec adresse, téléphone et présentation, pour les huit centres du réseau.
- **Une carte interactive** dont les marqueurs mènent à chaque centre.
- **Les actualités et les statistiques** du réseau, et une page de contact.
- **Des images servies au bon format et à la bonne taille**, en AVIF et WebP avec repli JPEG.

## Contraintes et décisions

- **L’accessibilité avant l’esthétique.** WCAG 2 niveau AA dès la première itération : contrastes vérifiés, navigation complète au clavier, focus visible partout. Cette contrainte a imposé une typographie lisible et une hiérarchie claire, et le design en est sorti plus soigné que si l’on était parti d’une maquette.
- **La performance comme levier de référencement.** Un patient en 3G dans une zone rurale ne revient pas si la page met huit secondes à s’afficher, et Google récompense la vitesse. Pas de rendu serveur : le contenu change peu, donc le site est généré statiquement et déployé sur Vercel. Pas de bibliothèque d’interface tierce non plus, un système de design minimal écrit à la main garde le JavaScript léger.
- **Des données structurées pour chaque centre.** Chaque page de centre porte un balisage Schema.org de type MedicalOrganization. C’est ce qui aide Google à comprendre qu’il s’agit d’un établissement de santé, avec une adresse et un téléphone, et à l’afficher comme tel.
- **Un contenu écrit avec les soignants.** J’ai animé deux ateliers de rédaction avec les directeurs de centres. Ils décrivent leur centre mieux qu’aucun rédacteur extérieur.

## Résultat

Le trafic organique a progressé de +240 % en six mois, et le site obtient un score SEO Lighthouse de 100. Il reste utilisable sur les téléphones modestes de certains soignants en zone rurale. La leçon tient en une phrase : pour un site institutionnel, un patient qui ouvre la page d’un centre depuis WhatsApp doit voir le numéro et l’adresse en moins d’une seconde. Tout le reste en découle.
