---
title: MonCarnet
summary: "Un carnet de santé familial qui parle, relié au centre de santé : rendez-vous, suivi de grossesse, alertes de danger et tournées des relais communautaires hors ligne."
year: 2026
duration: "2 jours"
role: "Conception et développement, en solo"
team: "Solo"
coauthors: []
sector: "Santé numérique, santé maternelle et infantile"
stack: [Next.js 16, React 19, PostgreSQL, Drizzle ORM, Zod, Tailwind CSS 4, Vitest, PWA]
status: live
liveUrl: https://moncarnet.kheios.com
featured: null
order: 7
images:
  - { src: /work/moncarnet/01.webp, alt: "Page d’accueil de MonCarnet", kind: public }
  - { src: /work/moncarnet/02.webp, alt: "Tableau de bord soignant avec alerte, données fictives", kind: interior }
  - { src: /work/moncarnet/03.webp, alt: "Accueil mobile d’une femme enceinte, données fictives", kind: interior }
  - { src: /work/moncarnet/04.webp, alt: "Carnet de vaccination et tension sur mobile, données fictives", kind: interior }
  - { src: /work/moncarnet/05.webp, alt: "Vue de pilotage nationale, données fictives", kind: interior }
proofs: []
seoDescription: "MonCarnet, carnet de santé familial pour le Challenge e-Santé Bénin : Next.js 16, PostgreSQL et Drizzle, application installable qui fonctionne hors ligne."
---

## Les enjeux

MonCarnet est une plateforme de suivi des patients conçue pour le Challenge e-Santé Bénin. Trois réalités ont guidé chaque écran : un même téléphone sert souvent à toute une famille, tout le monde ne lit pas, et le réseau n’est pas toujours là.

Le produit relie les deux côtés du soin. Pour les familles, un carnet sur téléphone qui dit une chose à la fois et qui s’écoute. Pour le centre de santé, une vue du jour qui fait remonter en premier ce qui ne peut pas attendre.

## Fonctionnalités clés

- **Le carnet familial** : les carnets de toute la famille sur un seul téléphone, vaccins et consultations tamponnés comme sur le carnet papier, courbe de tension, médicaments du jour.
- **Les rendez-vous en quatre étapes**, avec les places restantes, une liste d’attente quand le jour est complet, et un numéro de passage en salle d’attente pris depuis le téléphone.
- **Le suivi de grossesse**, la préparation de la naissance, puis la déclaration de naissance par la sage-femme : le carnet du bébé apparaît alors dans la famille.
- **L’alerte de signe de danger** : envoyée par la patiente, elle s’affiche en tête du poste soignant avec un compte à rebours de 15 minutes et un seul soignant pour la prendre en charge.
- **Les rappels en cascade** : WhatsApp, puis SMS, puis appel vocal, puis le relais communautaire, selon ce que chaque personne possède et accepte.
- **La pharmacie** : ordonnance délivrée à partir d’un code, suivi des ruptures de stock.
- **Les tournées des relais communautaires** et le pilotage par zone, avec exports.

## Contraintes et décisions

- **Le hors ligne d’abord.** Les relais travaillent là où le réseau manque : leurs saisies attendent sur l’appareil dans une file de synchronisation. Une alerte envoyée sans réseau le dit clairement, affiche le numéro du centre, puis repart seule au retour de la connexion, sans doublon. L’application s’installe comme une PWA.
- **Un carnet qui parle.** Tout peut s’écouter dans sa langue, et l’accueil ne montre qu’une action à la fois (« Ce soir, 1 comprimé »). C’est ce qui rend le carnet utilisable par ceux qui ne lisent pas.
- **Des rappels au contenu neutre.** Un rappel donne la date, le lieu et « vaccin » ou « rendez-vous », jamais la maladie : un téléphone se partage. Une personne malentendante n’est jamais appelée, elle reçoit un message écrit puis la visite du relais.
- **Une démonstration honnête.** Les canaux de rappel sont simulés (un faux téléphone montre ce que chaque personne recevrait), les seuils de risque sont présentés comme indicatifs, et toutes les données visibles sont fictives.

## Résultat

MonCarnet est en ligne sur moncarnet.kheios.com, avec une présentation de bout en bout et des comptes de démonstration accessibles en un clic. Je l’ai construit seul en deux jours, de la recherche sur les usages au Bénin et les plateformes existantes jusqu’au déploiement, avec un dossier de présentation pour le jury.
