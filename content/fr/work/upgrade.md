---
slug: upgrade
title: Un aimant à prospects déguisé en test de niveau
kicker: Issue 01 · Lead generation · 2026
excerpt: "Vitrine, test de niveau CEFR, back-office et moteur de relance. Un mois, trois exécutables en production — avec une règle qui a tout arbitré : le test est un moyen, pas la fin."
year: 2026
order: 1
featured: true
client: UPGRADE! Afrique
sector: Éducation · Lead generation
role: Solo · Architecture · Développement · Déploiement
team: 1 développeur · assistance IA
duration: 1 mois (16 juin — 13 juillet 2026)
stack:
  - Next.js 15
  - React 19
  - TypeScript
  - MongoDB
  - Turborepo
  - Resend
  - Meta CAPI
  - Docker
results:
  - value: "203"
    label: Commits en un mois
  - value: "23 625"
    label: Lignes TypeScript, 272 fichiers
  - value: "3"
    label: Exécutables en production
cover: /images/upgrade.png
seoDescription: UPGRADE! Afrique — vitrine, test de niveau CEFR, back-office et moteur de relance. Monorepo Next.js 15 / React 19 / MongoDB, trois exécutables livrés en production en un mois.
---

## Le contexte

**Le test est un moyen, pas la fin.** Tout le projet découle de cette phrase.

Le produit n'est pas un outil d'évaluation académique. C'est un aimant à prospects : il capte l'email de professionnels et les relance vers la formation « Learn & Speak English ». Deux objectifs, dans cet ordre — **capter l'email**, puis **orienter vers le bon niveau**. Le test doit inspirer confiance, parce que la cible est exigeante. Mais il reste un moyen : quand une décision oppose l'élégance du test et la captation, la captation gagne.

La cible : des professionnels au Bénin, majoritairement sur mobile, avec un réseau variable. D'où une règle qui a tenu tout le projet — **la performance est une fonctionnalité de conversion**. Un premier chargement lent, c'est un visiteur perdu avant même d'avoir vu le formulaire. C'est ce qui a justifié de refuser des choix techniques séduisants mais lourds.

## Ce qu'on m'a demandé

Livrer, en un mois et en production : un site vitrine, un test de niveau crédible, un back-office éditable par l'équipe, et un moteur de relance automatique. Seul.

## L'approche

Tout est pensé comme une **chaîne de conversion**, et chaque maillon est vérifiable :

1. **Le visiteur passe le test.** 13 questions, score calculé côté serveur — jamais côté client.
2. **Le résultat est verrouillé.** Pas de score sans coordonnées réelles ni consentement explicite.
3. **Révélation et orientation.** Niveau CEFR, formation recommandée, prise de contact WhatsApp.
4. **Relance automatique.** Une séquence d'emails paramétrable, qui s'arrête dès que le lead réagit.
5. **Conversion marquée à la main.** La formation se paie en présentiel.

Ce dernier maillon est une contrainte métier, pas une paresse technique : il n'y a pas de paiement en ligne, donc pas de webhook de paiement. Prétendre mesurer la conversion automatiquement aurait produit un chiffre inventé.

Côté machine : un monorepo pnpm + Turborepo. La séparation n'est pas cosmétique — chaque exécutable répond à une contrainte précise.

| Exécutable | Rôle | Pourquoi séparé |
|---|---|---|
| **web** | Vitrine et test (Next.js 15, React 19) | La seule surface publique. |
| **admin** | Back-office | Application distincte, pour que son code ne parte jamais dans le bundle public. |
| **worker** | Ordonnanceur de relances | Un route handler Next est éphémère : il ne peut pas tenir un planificateur. |
| **elearning** | Plateforme de cours | Hors production : socle et lecteur faits, vidéo à venir. |

Le socle partagé tient en quatre paquets : `@repo/db` (Mongoose, 16 modèles typés, source unique), `@repo/config` (env validée par Zod), `@repo/email` (Resend + gabarits react-email), `@repo/ui`.

## Décisions techniques notables

- **Le quiz est générique.** Rien n'est codé « anglais » en dur : un quiz est une entité réutilisable, avec ses propres paliers de niveau et sa recommandation. À peine plus cher à construire, réutilisable pour une autre campagne sans réécriture.
- **Le claim atomique est obligatoire.** Le worker réserve chaque envoi par un `findOneAndUpdate` qui fait passer le job de « en attente » à « en cours » en une seule opération. Sans ça, deux passages simultanés envoient le même email deux fois au même lead — le genre de défaut qui ne se voit qu'une fois chez le client.
- **Le contenu est éditable par surcharge.** Chaque page a un défaut écrit dans le code, qu'une surcharge en base vient recouvrir. L'équipe édite sans déploiement.
- **Aucun secret côté client.** Vérifié, pas supposé : le jeton de l'API Conversions a été traqué par un build avec un jeton leurre, absent des fichiers envoyés au navigateur.
- **Le signal publicitaire est doublé.** Pixel navigateur *et* API Conversions côté serveur, pour rattraper les 20 à 40 % bloqués par les bloqueurs et iOS.

Dépendances externes : MongoDB · Resend (envoi + webhooks, jamais de SMTP maison) · Brevo (CRM) · Cloudinary · Meta (pixel + CAPI) · Google Analytics · Coolify (déploiement Docker).

## Ce qui a marché, ce qui n'a pas marché

**Marché.** Le découpage en exécutables. Chacun a une raison d'exister qu'on peut défendre en une phrase, et le worker n'aurait jamais tenu dans un route handler.

**Pas marché — et c'est la partie utile.** Quatre incidents ont coûté du temps réel, et aucun n'était visible depuis le code seul :

- **Un lead obtenu avec un faux numéro.** `84654694` est passé : un format béninois à 8 chiffres, abandonné depuis la renumérotation de 2022. Deux erreurs de conception — la première version validait le Bénin seul alors que la cible est multipays, et la bibliothèque de référence acceptait encore l'ancien format. C'est un test qui l'a révélé, pas une relecture. *Capter sans valider, c'est capter du vide : un lead injoignable coûte le prix de son acquisition et ne rapporte rien.* Désormais 18 pays, validation serveur, numéro stocké au format international.
- **Un bouton invisible mais cliquable.** Une animation partant d'une opacité nulle la posait sur toutes ses cibles dès sa création, pas au démarrage de chaque étape. Interrompue, elle laissait le bouton transparent et fonctionnel. Impossible à reproduire en isolation. *Quand on ne reproduit pas, on arrête de deviner et on supprime la possibilité :* ce bouton n'anime plus jamais son opacité. Un correctif qu'on ne peut pas expliquer n'est pas un correctif.
- **Les deux domaines injoignables après un déploiement.** Cause réelle : aucune. Le site était debout ; les domaines étaient passés derrière Cloudflare et le cache DNS local pointait encore vers l'ancienne adresse. Deux diagnostics faux avant le bon — le conteneur accusé, puis l'hébergement. *Vérifier la couche avant d'accuser le code :* une commande vers l'adresse réelle du serveur aurait tranché en trente secondes.
- **Le pixel publicitaire ne signalait aucun lead.** Il n'envoyait que « page vue ». Meta voyait passer des visiteurs et ignorait qui devenait un prospect : l'algorithme ne pouvait pas optimiser, et le coût par lead était incalculable — exactement ce pour quoi le pixel existe. Découvert en répondant à une question sur autre chose, pas par une alerte. *Un signal métier absent ne déclenche rien.*

Et un cinquième, sur la carte des pays : une projection calculée par formule linéaire, fondamentalement fausse, que chaque correction déplaçait. Ce qui a marché : une capture automatisée avec une grille superposée, puis un calage à l'œil, pays par pays — un zoom serré sur la côte a révélé un pays dans l'eau que le rendu global cachait. *Pour tout ce qui est spatial, on mesure, on ne calcule pas.*

## Le take-away

Un mois, seul, trois exécutables en production : ça n'a tenu que parce qu'une phrase arbitrait chaque décision. « Le test est un moyen, pas la fin » a tranché le choix de la stack (rien de lourd sur un mobile béninois), le verrouillage du résultat, la généricité du quiz, et jusqu'à l'aveu qu'on ne mesure pas la conversion finale.

L'autre leçon est moins flatteuse : les défauts qui ont coûté le plus cher n'étaient pas dans le code. Un numéro invalide, un cache DNS, un pixel qui n'envoie que la moitié du signal — aucun ne fait planter un build. Ils se voient en mesurant le résultat réel, pas en relisant le diff.
