---
title: LeConsultant
summary: "Une plateforme d’abonnement qui centralise les appels d’offres publics du Bénin, avec alertes par catégorie, formations et paiement en Mobile Money."
year: 2024
duration: "17 mois"
role: "Développeur full-stack"
team: "2 développeurs, 1 product owner"
coauthors: []
client: LeConsultant
sector: "B2B, marchés publics"
stack: [Laravel 8, PHP 8.2, Livewire 2, MySQL, Fortify, DomPDF, Kkiapay, PayPlus]
status: archived
featured: null
order: 8
images:
  - { src: /work/leconsultant/01.webp, alt: "Site Le Consultant", kind: public }
proofs: []
seoDescription: "LeConsultant, appels d’offres publics au Bénin : Laravel 8 et Livewire, abonnements payants, alertes par catégorie, paiements Kkiapay et PayPlus."
---

## Les enjeux

Au Bénin, les appels d’offres publics paraissent dans des PDF officiels, sur plusieurs sites institutionnels qui ne nomment pas les choses de la même façon. Pour un cabinet de conseil ou une PME, voir un appel d’offres trois jours trop tard, c’est un marché perdu.

LeConsultant veut être le point d’entrée unique : un flux d’appels d’offres (référence, autorité contractante, dates de publication, d’ouverture et d’expiration), un abonnement, et des alertes selon les catégories qui intéressent chaque abonné. J’ai maintenu et fait évoluer la plateforme existante pendant 17 mois.

## Fonctionnalités clés

- **Le catalogue d’appels d’offres**, classé par catégorie, type, autorité contractante et zone.
- **Les abonnements payants** par formules, avec contrôle d’accès et expiration automatique.
- **Les alertes** : une tâche nocturne compare les nouvelles offres aux préférences de chaque abonné et envoie un e-mail.
- **Les justificatifs d’abonnement en PDF**, avec un QR code qui permet de vérifier leur authenticité côté serveur.
- **Les formations**, avec inscription et billets.
- **Un support par tickets** pour répondre aux abonnés sans quitter la plateforme.
- **Un site bilingue**, français et anglais.

## Contraintes et décisions

- **Rester sur Laravel 8.** La plateforme tournait et les bugs étaient rares. Passer à une version majeure plus récente aurait coûté des semaines sans une seule fonctionnalité visible pour les abonnés. Le temps est allé aux paiements et aux alertes.
- **Livewire pour le back-office.** Les formulaires d’administration sont validés côté serveur, sans JavaScript à écrire. Les rédacteurs, qui ne sont pas développeurs, publient les offres sans que l’équipe touche au front.
- **Une interface de paiement, deux pilotes.** Chaque transaction aboutit à un point de rappel unique ; Kkiapay et PayPlus sont deux implémentations de la même interface. Ajouter ou remplacer une passerelle devient un changement local, pas une refonte du tunnel d’abonnement.

## Résultat

La plateforme a servi ses abonnés avec des paiements réels en Mobile Money. Une limite est restée documentée comme dette : le rapprochement entre offres et abonnés repose sur des expressions régulières appliquées au titre et à la description, qui ratent les variantes d’écriture d’un même organisme. La piste retenue pour une version suivante était un index de recherche dédié ; elle n’a pas été réalisée pendant ma mission. La plateforme n’est plus en ligne ; elle est présentée par ses captures.
