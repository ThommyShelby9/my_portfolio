---
title: EasyToWork
summary: "Trois marques du groupe KPS servies par un seul front-end Vue 3 et un back-end Laravel minimal, avec un simulateur de salaire qui produit son PDF dans le navigateur."
year: 2025
duration: "3 mois"
role: "Lead engineer, architecture"
team: "2 développeurs, 1 designer"
coauthors: []
client: "KPS Groupe (interne)"
sector: "RH, formation, sites vitrines"
stack: [Laravel 12, Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, jsPDF, Nginx]
status: live
liveUrl: https://easytowork.fr
featured: null
order: 13
images:
  - { src: /work/easytowork/01.webp, alt: "Site Easy To Work", kind: public }
  - { src: /work/easytowork/02.webp, alt: "Page d’accueil en ligne", kind: public }
proofs: []
seoDescription: "EasyToWork, plateforme multi-marques du groupe KPS : back-end Laravel 12 et front-end Vue 3, formations, candidatures et simulateur de salaire."
---

## Les enjeux

Le groupe KPS porte trois marques : KPS Groupe, KPS Analytics et EasyToWork. Elles avaient trois sites séparés, trois formulaires de contact dont les messages n’arrivaient chez personne, et trois équipes éditoriales qui se marchaient dessus.

L’objectif : un seul back-end d’envoi d’e-mails utilisé par les trois sites, et un seul front-end Vue 3 qui sert chaque marque selon l’adresse.

## Fonctionnalités clés

- **Un thème par marque** (palette, logo, typographie), choisi selon le sous-domaine ou le chemin.
- **Des formulaires qui aboutissent** : contact par marque, candidature avec CV en pièce jointe, inscription et désinscription à la newsletter.
- **Un simulateur de salaire** : conversion du brut en net selon le barème CNSS et l’impôt sur le revenu au Bénin, détail des cotisations, puis téléchargement du résultat en PDF.
- **Une sauvegarde facultative** de la simulation, sur consentement, pour une prise de contact commerciale.

## Contraintes et décisions

- **Un back-end réduit au strict nécessaire.** Deux modèles (contacts et newsletter), une dizaine de routes d’API typées par destination, qui valident, mettent en forme et envoient. Pas de base lourde, pas de logique métier inutile : il y a peu de choses à maintenir, donc peu de choses à casser.
- **Le calcul de salaire dans le navigateur.** Les paramètres du barème sont versionnés par année dans un fichier statique, le calcul et le PDF (jsPDF) se font côté client. L’utilisateur repart avec sa simulation sans aller-retour serveur.
- **Le CORS géré par Nginx.** Les en-têtes sont posés une seule fois, dans la configuration du serveur, pas dans un middleware applicatif. Cela évite les en-têtes dupliqués et les réponses incohérentes entre les routes.
- **Pas de rendu serveur.** Un build Vite statique servi par Nginx derrière Cloudflare, avec un prérendu des pages importantes pour le référencement.

## Résultat

Le site est en ligne sur easytowork.fr, et le back-end demande très peu de maintenance depuis sa mise en service. Une limite assumée : le système de thèmes reste rigide. Ajouter une quatrième marque demande de toucher plusieurs endroits du code, ce qui convient pour trois marques stables mais ne conviendrait pas à un produit en marque blanche.
