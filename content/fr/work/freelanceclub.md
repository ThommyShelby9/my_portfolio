---
slug: freelanceclub
title: Une plateforme de portage salarial end-to-end
kicker: Issue 02 · SaaS B2B · 2025–2026
excerpt: Mission → contrat → timesheet → facture → paie → paiement. Un parcours unique pour freelances et entreprises, avec parsing CV par IA et appels vidéo intégrés.
year: 2026
order: 2
featured: true
client: Freelance Club
sector: SaaS · Portage salarial
role: Lead Engineering · Architecture · Backend
team: 3 devs · 1 PO · 1 designer
duration: 10 mois (en cours)
stack:
  - Node 22
  - Express 5
  - TypeScript
  - MongoDB
  - Redis
  - Vue 3
  - Stripe
  - Socket.io
results:
  - value: "38"
    label: Modèles métier backend
  - value: "11"
    label: Modules livrés
  - value: "Swagger"
    label: API documentée bout-en-bout
cover: /images/freelanceclub.png
seoDescription: Freelance Club — plateforme de portage salarial complète. Node/Express + MongoDB, Vue 3, Stripe, parsing CV par IA, Socket.io, Bull queues. Production en septembre 2026.
---

## Le contexte

Le portage salarial reste une mécanique opaque pour le freelance lambda : on signe un contrat papier, on attend une feuille de paie en PDF en fin de mois, et entre les deux il faut prier pour que les missions soient déclarées correctement. **Freelance Club** voulait casser cette boucle : une plateforme où le freelance voit, en temps réel, où en est son contrat, sa timesheet, sa facture et son virement.

L'enjeu n'était pas technique au sens "performance" — c'était de modéliser un domaine où chaque étape (mission, contrat, timesheet, invoice, payslip) doit être à la fois indépendante et reliée par un cycle de vie cohérent.

## Ce qu'on m'a demandé

Concevoir l'architecture backend et frontend, recruter une petite équipe, livrer une bêta privée avec un parcours complet : un freelance signe un contrat numérique, soumet sa timesheet, voit l'entreprise la valider, génère sa facture, reçoit son bulletin de paie et son virement Stripe — sans jamais quitter la plateforme.

## L'approche

J'ai imposé trois principes au démarrage :

1. **Le domaine d'abord, le code ensuite.** Avant la première ligne, j'ai écrit la liste des 38 entités métier (User, Freelance, Company, Mission, Application, Contract, Timesheet, Invoice, RecurringInvoice, Payslip, Expense, Portfolio, Skill, Match, Review, Notification, Message, MissionChat, MissionTask, MissionFile, MissionBoard, MissionActivity, CalendarEvent, VideoCall, Workflow, WorkflowExecution, Gamification, Badge, KYCVerification, EmailTemplate, EmailQueue, AuditLog, AccessLog, UserConsent, RefreshToken, SavedSearch, ContractTemplate, EmailTemplate). Chacune avec son schéma Zod, sa Mongoose model, ses transitions d'état.
2. **Les workflows sont pilotables par config**, pas par code. Une mission qui passe de `pending` à `signed` déclenche des notifications, un email, une création de calendrier — tout est défini dans une collection `Workflow` que le back-office peut éditer sans déploiement.
3. **Tout passe par la file**, jamais par la requête utilisateur. Génération PDF, envoi email, notifications push, webhooks Stripe — Bull + Redis, retry automatique, déduplication par clé idempotente.

## Décisions techniques notables

- **Node 22 + Express 5 + TypeScript strict.** Pas de Nest, pas de framework lourd : Express avec une architecture en couches `route → controller → service → repository`. Lisible, debuggable, sans surcouche magique.
- **MongoDB + Mongoose 9.** Le domaine est suffisamment relationnel pour qu'on m'ait proposé Postgres ; j'ai tenu sur Mongo parce que 80 % des accès sont par `userId` ou `missionId`, et que les sous-documents nous évitent des JOINs sur des entités qui changent ensemble (par exemple `Contract.signatures[]`).
- **Redis pour le cache + Bull pour les queues.** Cache 2 min sur la recherche de missions, 5 min sur les freelances, 1 h sur les stats admin. Queue dédiée par domaine : `email`, `pdf`, `notification`, `webhook-stripe`.
- **Stripe Connect + comptes custom** pour la rémunération des freelances — le freelance s'inscrit comme compte connecté, l'entreprise paie la facture, on prélève la commission et on virer le net.
- **Affinda** pour le parsing automatique de CV (PDF, DOCX) — on remplit le profil freelance à 80 % avec un upload.
- **Anthropic SDK** pour le matching freelance ↔ mission : un appel batch quotidien re-score les paires actives sur la base du JD et du portfolio. Caché Redis, mis à jour par job cron.
- **Socket.io** pour le chat de mission, les notifications temps réel, et les **appels vidéo natifs** (signaling, pas de SFU — peer-to-peer pour 1:1, suffisant pour des entretiens 30 min).
- **MinIO** comme S3 self-hosted : contrats signés, CVs, factures, bulletins de paie. Tout chiffré côté serveur, accès par URL pré-signée 5 min.
- **PDFKit + ExcelJS** pour la génération de documents — pas de service tiers, contrats légalement valides générés en interne avec signature pyHanko sur le serveur.
- **JWT + refresh token rotatif + 2FA TOTP.** Pas de session, pas de cookie. Refresh tokens en base avec révocation immédiate.
- **Rate limiting strict** sur les routes sensibles : 5 tentatives auth / 15 min, 3 reset password / heure, 60 messages / minute. Helmet + xss-clean + Zod sur tous les payloads.
- **Swagger (drf-spectacular équivalent : swagger-jsdoc)** sur `/api-docs` — l'équipe frontend ne perd pas une heure par jour à demander des schémas.
- **Tests** : Jest + mongodb-memory-server + supertest. 60 % de couverture sur les services métier, 100 % sur les transitions d'état contractuelles.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** Le découpage par cas d'usage métier (mission, contrat, timesheet, facture, paie) plutôt que par couche technique a permis à l'équipe frontend de livrer module par module — chaque module est démontrable indépendamment.

**Pas marché.** L'intégration Stripe Connect en zone CFA a été un calvaire administratif : entre les vérifications d'identité, les comptes bancaires Wave/Moov non reconnus, et les exigences KYC, on a dû livrer un fallback PayPlus (paiement Afrique) en parallèle. Deux flux à maintenir, deux fois plus de tests d'intégration.

## Le take-away

Une plateforme B2B vivante, ce n'est pas un graphe d'API REST — c'est un graphe d'**états métier**. Si on ne nomme pas explicitement les transitions (un contrat peut passer de `draft` à `sent` à `signed` à `executing` à `closed`, mais pas dans le désordre), on finit par les coder partout, en double, avec des bugs qui apparaissent six mois plus tard quand un utilisateur fait une combinaison qu'on n'avait pas prévue.

Sur Freelance Club, j'ai gagné trois mois en posant cette grammaire d'états avant la première ligne de code.
