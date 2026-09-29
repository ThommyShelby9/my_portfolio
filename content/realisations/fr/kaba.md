---
title: Kaba
summary: "Des cagnottes en ligne partagées sur WhatsApp et payées en Mobile Money, avec des versements au fil des dons et une preuve publique que l’argent sort."
year: 2026
role: "Conception et développement, en solo"
team: "Solo"
coauthors: []
client: "Orisum Groupe"
sector: "Cagnottes en ligne, paiement mobile"
stack: [Vue 3, TypeScript, Vite, Pinia, Express 5, MongoDB, Mongoose, FedaPay, Firebase, Cloudinary, Joi, Jest]
status: private
featured: null
order: 11
images: []
proofs: []
seoDescription: "Kaba, la cagnotte de l’Afrique : Vue 3, Express 5, MongoDB et FedaPay. Dons en Mobile Money, versements continus, vérification d’identité, traçabilité."
---

## Les enjeux

Un mariage, des funérailles, une naissance, des frais médicaux : en Afrique de l’Ouest, on se cotise souvent, et la collecte passe par WhatsApp et le Mobile Money. Ce qui manque, c’est la confiance. Le donateur ne sait pas si l’argent arrive, ni quand.

Kaba, « la cagnotte de l’Afrique », répond à cela : créer une cagnotte en ligne, la partager sur WhatsApp, recevoir les dons en Mobile Money, et montrer publiquement que les fonds sont reversés. Je l’ai conçu et développé seul, front-end et back-end.

## Fonctionnalités clés

- **La cagnotte** : catégorie (mariage, anniversaire, funérailles, naissance, médical, projet), objectif, photos, actualités publiées par le créateur pour les donateurs.
- **Le don en Mobile Money** via FedaPay.
- **Le partage sur WhatsApp** avec un aperçu propre : image, titre et description générés côté serveur pour chaque cagnotte.
- **La vérification du créateur** par pièce d’identité, examinée avant approbation.
- **Le signalement** d’une cagnotte suspecte et une console d’administration pour traiter vérifications et signalements.
- **Les notifications** et les statistiques de la cagnotte pour son créateur.

## Contraintes et décisions

- **Verser au fil des dons, rattraper les échecs.** Le versement vers l’opérateur du bénéficiaire part dès qu’un don est approuvé. Une tâche planifiée repasse régulièrement, et au redémarrage du serveur, pour reprendre les virements qu’un appel FedaPay en échec, un redéploiement ou une coupure réseau ont laissés en attente.
- **Une traçabilité publique sans montants.** Chaque cagnotte affiche le nombre de dons confirmés, le nombre de dons déjà reversés et le délai médian de versement. Pas de sommes : elles permettraient de recalculer la commission, qui n’a pas sa place dans la vue du donateur. Le nombre et le délai suffisent à établir la confiance.
- **Ne garder les pièces d’identité que le temps nécessaire.** Conformément au Code du numérique béninois, les pièces justificatives sont effacées une fois la décision rendue et le délai de contestation passé. Seule la trace de la décision est conservée.
- **Les aperçus de partage rendus côté serveur.** WhatsApp n’exécute pas de JavaScript pour construire un aperçu. Les balises Open Graph de chaque cagnotte sont donc produites par l’API, et testées.

## Résultat

Kaba n’a pas encore d’adresse publique. Le produit est complet de bout en bout : parcours du donateur, parcours du créateur, console d’administration, et un système de design dédié, « Chaleur ». Les chemins sensibles (authentification, paiement, versements, vérification, traçabilité, aperçus de partage) sont couverts par des tests automatisés.
