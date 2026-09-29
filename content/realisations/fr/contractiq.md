---
title: ContractIQ
summary: "Un SaaS B2B qui lit les contrats avec l’IA, en extrait les risques et les échéances, et prévient avant chaque renouvellement. Co-développé avec Jérémie Zitti."
year: 2026
role: "Co-auteur, ingénierie full-stack"
coauthors: [Jérémie Zitti]
client: "Produit indépendant"
sector: "SaaS B2B, gestion des contrats"
stack: [Next.js 15, React 19, TypeScript, MongoDB, Mongoose, NextAuth, Gemini, OpenAI, FedaPay, Resend, MinIO, Sentry, Vitest, Playwright, Docker]
status: private
featured: 2
order: 2
images:
  - { src: /work/contractiq/01.webp, alt: "Fiche contrat avec les risques détectés par l’IA", kind: interior }
  - { src: /work/contractiq/02.webp, alt: "Centre de commande des contrats", kind: interior }
  - { src: /work/contractiq/03.webp, alt: "Analyse IA d’un contrat", kind: interior }
  - { src: /work/contractiq/04.webp, alt: "Score de santé du portefeuille de contrats", kind: interior }
  - { src: /work/contractiq/05.webp, alt: "Liste des contrats à risque", kind: interior }
  - { src: /work/contractiq/06.webp, alt: "Champs extraits automatiquement d’une facture", kind: interior }
  - { src: /work/contractiq/07.webp, alt: "Détection des abonnements fantômes", kind: interior }
  - { src: /work/contractiq/08.webp, alt: "Page publique de signature", kind: public }
proofs:
  - { text: "52 modèles Mongoose, environ 213 routes API, 44 fichiers de tests unitaires", source: "compté dans le dépôt contractiq" }
seoDescription: "ContractIQ, SaaS d’analyse de contrats par IA (Next.js 15, MongoDB, Gemini avec repli OpenAI, FedaPay), co-développé avec Jérémie Zitti."
---

## Les enjeux

Dans beaucoup d’entreprises, les contrats dorment dans des dossiers partagés. Personne ne sait quelle clause pénalise, quel abonnement se renouvelle tacitement le mois suivant, ni quelle facture ne correspond plus à rien. ContractIQ part de ce constat : on dépose un contrat (PDF, DOC ou DOCX) et on obtient les parties, les dates, les obligations et les clauses à risque, puis on est prévenu avant l’échéance.

Je l’ai conçu et développé avec Jérémie Zitti, à deux, entre fin 2025 et mi-2026. Le premier marché visé est l’Afrique de l’Ouest : prix en XOF et en EUR, paiement par FedaPay.

## Fonctionnalités clés

- **L’extraction par IA** : parties, dates, obligations et clauses, chacune avec un niveau de risque.
- **L’analyse de risque** : un score de santé du portefeuille, une liste des contrats à risque et un assistant de renégociation.
- **Les alertes de renouvellement** par e-mail, envoyées par une tâche planifiée quotidienne à 60, 30 et 7 jours de l’échéance.
- **Les factures** : import avec extraction automatique des champs, modèles, génération.
- **Les abonnements fantômes** : détection des abonnements encore payés qui ne servent plus.
- **La signature électronique**, avec une page publique de signature et un partage sécurisé par lien qui expire.
- **La facturation multi-organisation** avec FedaPay : organisations, invitations, rôles et limites par formule.
- **Une API publique** (`/api/v1`) avec clés d’API, documentation OpenAPI et webhooks sortants signés en HMAC.

## Contraintes et décisions

- **Une couche IA indépendante du fournisseur.** Gemini 2.5 Flash est le modèle principal, OpenAI prend le relais en cas d’échec, et un mode simulé sert aux tests. Nous avons imposé le même contrat aux deux fournisseurs : une réponse en JSON strict, validée avant d’être enregistrée. Changer de modèle ne touche pas le reste du produit, et les tests ne dépendent d’aucune clé d’API.
- **Des modules facturables plutôt que des formules figées.** Chaque fonctionnalité (factures, signature, abonnements, etc.) est un module qu’une organisation active et paie, vérifié côté serveur à chaque appel. C’est plus de travail au départ, mais le client paie exactement ce qu’il utilise, et ajouter un module ne demande pas de refaire la grille tarifaire.
- **Des organisations multi-locataires, avec journal d’audit.** Chaque requête passe par un contexte d’authentification qui résout l’organisation et le rôle, et les actions d’administration sont tracées. C’est ce qui permet d’ouvrir le produit à des équipes, pas seulement à des personnes seules.
- **Des webhooks de paiement idempotents.** Chaque événement FedaPay traité est enregistré : reçu deux fois, il n’est appliqué qu’une fois. Une abstraction de passerelle de paiement garde Stripe possible sans réécrire le tunnel d’achat.

## Résultat

Le produit n’est pas public : il est présenté ici par des captures, sur des données fictives. Le dépôt compte 52 modèles Mongoose, environ 213 routes API et 44 fichiers de tests unitaires, complétés par des scénarios Playwright. L’application se construit en image Docker et se déploie sur Coolify.
