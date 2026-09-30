---
title: Upgrade Afrique
summary: "Un test de niveau d’anglais conçu comme un outil d’acquisition : site vitrine, test, back-office et relances automatiques, livrés en production en un mois."
year: 2026
duration: "1 mois jusqu’à la mise en production"
role: "Seul, de l’architecture au déploiement"
team: "1 développeur, avec assistance IA"
coauthors: []
client: "Upgrade Afrique"
sector: "Éducation, acquisition de prospects"
stack: [Next.js 15, React 19, TypeScript, MongoDB, Mongoose, Turborepo, Resend, Meta Conversions API, Docker]
status: live
liveUrl: https://upgrade-afrique.com
featured: null
order: 12
images:
  - { src: /work/upgrade/01.webp, alt: "Site Upgrade Afrique", kind: public }
  - { src: /work/upgrade/02.webp, alt: "Page d’accueil en ligne", kind: public }
proofs: []
seoDescription: "Upgrade Afrique : vitrine, test de niveau d’anglais, back-office et moteur de relance. Monorepo Next.js 15, React 19 et MongoDB, livré en un mois."
---

## Les enjeux

Une phrase a tranché toutes les décisions du projet : le test est un moyen, pas une fin.

Le produit n’est pas un outil d’évaluation académique. Il capte l’adresse e-mail de professionnels, puis les oriente vers la formation « Learn & Speak English ». Deux objectifs, dans cet ordre : capter le contact, puis recommander le bon niveau. Le test doit inspirer confiance, car la cible est exigeante ; mais quand l’élégance du test et la captation s’opposent, la captation l’emporte.

La cible, ce sont des professionnels au Bénin, surtout sur mobile, avec un réseau variable. D’où une règle tenue jusqu’au bout : la performance fait partie de la conversion. Un premier chargement lent, c’est un visiteur perdu avant d’avoir vu le formulaire.

## Fonctionnalités clés

- **Le test** : 13 questions, score calculé côté serveur, jamais dans le navigateur.
- **Le résultat verrouillé** : pas de score sans coordonnées réelles et consentement explicite, puis niveau CECRL, formation recommandée et prise de contact WhatsApp.
- **Les relances automatiques** : une séquence d’e-mails paramétrable, qui s’arrête dès que le prospect réagit.
- **Le back-office** : prospects, contenus éditables sans déploiement, conversion marquée à la main (la formation se paie en présentiel, il n’existe donc aucun signal de paiement à mesurer).
- **Le suivi publicitaire** : pixel dans le navigateur et API Conversions côté serveur, pour que les prospects arrivent jusqu’aux campagnes.

## Contraintes et décisions

- **Trois exécutables, chacun avec une raison d’exister.** Un monorepo pnpm et Turborepo : `web` pour la vitrine et le test, seule surface publique ; `admin` pour le back-office, dans une application séparée pour que son code n’arrive jamais dans le bundle public ; `worker` pour l’ordonnanceur de relances, parce qu’un route handler Next.js est éphémère et ne peut pas porter un planificateur. Le socle partagé tient en quelques paquets : modèles Mongoose typés, configuration validée par Zod, gabarits d’e-mails.
- **Un quiz générique.** Rien n’est codé « anglais » en dur : un quiz est une entité réutilisable, avec ses paliers et sa recommandation. À peine plus cher à construire, et réutilisable pour une autre campagne sans réécriture.
- **Une réservation atomique des envois.** Le worker réserve chaque e-mail par une seule opération qui le fait passer de « en attente » à « en cours ». Sans cela, deux passages simultanés envoient deux fois le même message au même prospect, le genre de défaut qu’on ne voit qu’une fois chez le client.
- **Aucun secret dans le navigateur, vérifié.** Le jeton de l’API Conversions a été cherché dans un build contenant un jeton leurre : il n’apparaît dans aucun fichier envoyé au navigateur.

## Résultat

La vitrine, le test, le back-office et le moteur de relance sont en production sur upgrade-afrique.com depuis le premier mois. Les défauts qui ont coûté le plus cher n’étaient pas dans le code. Un prospect a été enregistré avec un numéro à l’ancien format béninois, abandonné depuis la renumérotation de 2022 : la validation couvre désormais 18 pays, côté serveur, et le numéro est stocké au format international. Le pixel publicitaire n’envoyait que des pages vues, pas les prospects, ce qui empêchait toute optimisation des campagnes. Aucun de ces problèmes ne fait échouer un build ; ils se voient en mesurant le résultat réel, pas en relisant le code.
