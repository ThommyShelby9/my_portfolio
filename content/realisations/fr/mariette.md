---
title: Mariette H. Nobre
summary: "Un blog et portfolio dont la propriétaire garde le contrôle complet, avec un éditeur d’articles sur mesure pensé pour écrire sans apprendre un nouvel outil."
year: 2026
duration: "5 semaines"
role: "Full-stack, architecture"
team: "Solo"
coauthors: []
client: "Mariette H. Nobre, professionnelle indépendante"
sector: "Blog, portfolio"
stack: [Next.js 15, React 19, TypeScript, MongoDB, Mongoose, NextAuth v5, Tiptap, UploadThing, TanStack Query]
status: archived
featured: null
order: 17
images:
  - { src: /work/mariette/01.webp, alt: "Portfolio de Mariette", kind: public }
proofs: []
seoDescription: "Blog et portfolio de Mariette H. Nobre : Next.js 15, MongoDB, NextAuth v5, éditeur Tiptap sur mesure et médias UploadThing."
---

## Les enjeux

Mariette voulait un blog qui lui appartienne, pas une page sur une plateforme de publication tierce, et un portfolio que ses prospects consultent sans friction. Une contrainte a guidé le reste : elle devait pouvoir écrire un article comme elle écrit dans ses notes, sans apprendre un nouvel outil.

## Fonctionnalités clés

- **Le blog** : articles, étiquettes, commentaires, rendu soigné et référencement complet.
- **L’éditeur d’articles** : images par glisser-déposer, collage ou bouton, liens, tableaux, alignement, surlignage, couleurs, menu contextuel et commandes rapides par barre oblique.
- **Les médias** : envoi vers UploadThing, recadrage des images de profil et de couverture.
- **L’administration** protégée par connexion Google, GitHub ou identifiants.
- **Le formulaire de contact**, le thème clair ou sombre automatique, le plan du site, le fichier robots et le manifeste générés par l’application.

## Contraintes et décisions

- **L’App Router de Next.js, sans compromis.** Rendu serveur pour le référencement, composants client uniquement là où il y a de l’interaction. Le contenu public arrive complet dans le HTML.
- **MongoDB pour un domaine simple.** Articles, étiquettes, commentaires, utilisateurs : un modèle documentaire suffit, sans la charge d’une base relationnelle.
- **Réécrire l’extension d’image de l’éditeur.** La première version reprenait l’extension d’image par défaut de Tiptap : le glisser-déposer ne marchait pas dans tous les cas et le redimensionnement n’existait pas. J’ai écrit une extension dédiée qui accepte le glisser-déposer, le collage et le bouton, envoie l’image en arrière-plan en affichant un squelette, et permet le redimensionnement par poignées. Deux semaines de travail, mais c’est ce qui rend l’administration réellement utilisable.
- **Figer la version de NextAuth.** NextAuth v5 était encore en bêta et chaque mise à jour mineure cassait quelque chose. J’ai figé une version bêta précise de NextAuth v5 et ajouté des scripts de diagnostic de l’authentification pour la production.

## Résultat

Le site a été livré en cinq semaines. Il n’est plus en ligne ; il est présenté par ses captures. La leçon : pour un blog personnel, l’éditeur est la partie la moins visible du public et celle qui décide si l’on écrit vraiment. C’est là que le temps a été investi.
