---
title: Freelance Club
summary: "Une plateforme de portage salarial qui suit tout le parcours d’un freelance : mission, contrat, feuille de temps, facture, bulletin de paie et paiement."
year: 2026
role: "Contribution à l’ingénierie"
coauthors: []
client: "Freelance Club (KPS Groupe)"
sector: "SaaS, portage salarial"
stack: [Node.js, Express 5, TypeScript, MongoDB, Mongoose, Redis, Bull, Socket.io, MinIO, Swagger, Vue 3, Pinia, Jest]
status: live
liveUrl: https://freelanceclubs.com
featured: null
order: 4
images:
  - { src: /work/freelanceclub/01.webp, alt: "Site Freelance Club", kind: public }
proofs: []
seoDescription: "Freelance Club, plateforme de portage salarial : API Node.js, Express 5 et MongoDB, interface Vue 3, analyse de CV par IA, messagerie et appels vidéo."
---

## Les enjeux

Pour un freelance, le portage salarial reste souvent une mécanique opaque : un contrat papier, une feuille de paie en PDF en fin de mois, et entre les deux, peu de visibilité sur ce qui a été déclaré. Freelance Club veut rendre ce parcours lisible : le freelance voit où en sont son contrat, sa feuille de temps, sa facture et son paiement.

La difficulté n’est pas la charge. C’est le domaine : chaque étape (mission, contrat, feuille de temps, facture, bulletin de paie) doit vivre de façon indépendante tout en restant reliée aux autres par un cycle de vie cohérent.

## Fonctionnalités clés

- **Le parcours complet** : un freelance signe un contrat numérique, soumet sa feuille de temps, l’entreprise la valide, la facture est générée, puis le bulletin de paie et le paiement suivent, sans quitter la plateforme.
- **L’analyse de CV** : un CV en PDF ou DOCX pré-remplit le profil du freelance.
- **Le rapprochement entre freelances et missions**, recalculé par une tâche planifiée à l’aide d’un modèle de langage.
- **La collaboration de mission** : messagerie, tâches, fichiers, calendrier, notifications en temps réel et appels vidéo en pair à pair.
- **Les documents** : contrats, factures et bulletins générés en PDF, exports Excel, stockage sur MinIO avec des liens d’accès temporaires.
- **La sécurité des comptes** : jetons de rafraîchissement renouvelés à chaque usage et révocables, double authentification TOTP, limitation du débit sur les routes sensibles.

## Contraintes et décisions

- **Le domaine avant le code.** Le modèle compte 38 entités métier, chacune avec son schéma de validation et ses transitions d’état explicites. Un contrat ne peut pas passer de brouillon à clôturé en sautant la signature : la règle est écrite une fois, pas dispersée dans l’interface.
- **Des workflows pilotés par la configuration.** Ce qui se passe quand une mission change d’état (notification, e-mail, événement de calendrier) est décrit dans une collection que l’administration peut modifier sans déploiement.
- **Tout ce qui est lent passe par une file.** Génération de PDF, envoi d’e-mails, notifications et webhooks passent par Bull et Redis, avec des files séparées par domaine, des reprises automatiques et une clé d’idempotence contre les doublons.
- **Un Express en couches plutôt qu’un framework lourd.** Route, contrôleur, service, dépôt : une architecture simple à lire et à déboguer. L’API est documentée en Swagger pour que l’équipe front-end n’ait pas à deviner les schémas.

## Résultat

La plateforme est en ligne sur freelanceclubs.com. Chaque étape du parcours peut être démontrée seule, ce qui a permis de livrer l’interface module par module.
