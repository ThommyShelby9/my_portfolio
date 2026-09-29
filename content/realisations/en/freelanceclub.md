---
title: Freelance Club
summary: "An umbrella employment platform that follows a freelancer’s whole journey: assignment, contract, timesheet, invoice, payslip and payment."
year: 2026
role: "Engineering contribution"
coauthors: []
client: "Freelance Club (KPS Groupe)"
sector: "SaaS, umbrella employment"
stack: [Node.js, Express 5, TypeScript, MongoDB, Mongoose, Redis, Bull, Socket.io, MinIO, Swagger, Vue 3, Pinia, Jest]
status: live
liveUrl: https://freelanceclubs.com
featured: null
order: 4
images:
  - { src: /work/freelanceclub/01.webp, alt: "Freelance Club website", kind: public }
proofs: []
seoDescription: "Freelance Club, an umbrella employment platform: Node.js, Express 5 and MongoDB API, Vue 3 interface, AI CV parsing, messaging and video calls."
---

## The challenge

For a freelancer, umbrella employment (portage salarial in France) is often a black box: a paper contract, a PDF payslip at the end of the month, and little visibility in between on what was actually declared. Freelance Club sets out to make that journey readable: freelancers see where their contract, timesheet, invoice and payment stand.

The hard part is not load. It is the domain: each step (assignment, contract, timesheet, invoice, payslip) has to live on its own while staying tied to the others through a consistent lifecycle.

## Key features

- **The full journey**: a freelancer signs a digital contract, submits a timesheet, the client company approves it, the invoice is generated, then the payslip and the payment follow, all without leaving the platform.
- **CV parsing**: a PDF or DOCX CV pre-fills the freelancer’s profile.
- **Matching freelancers and assignments**, recomputed by a scheduled job with a language model.
- **Assignment workspace**: messaging, tasks, files, calendar, real-time notifications and peer-to-peer video calls.
- **Documents**: contracts, invoices and payslips generated as PDFs, Excel exports, storage on MinIO with short-lived access links.
- **Account security**: refresh tokens rotated on every use and revocable, TOTP two-factor authentication, rate limiting on sensitive routes.

## Constraints and decisions

- **Domain before code.** The model has 38 business entities, each with its validation schema and explicit state transitions. A contract cannot jump from draft to closed without being signed: the rule is written once, not scattered across the interface.
- **Configuration-driven workflows.** What happens when an assignment changes state (notification, email, calendar event) is described in a collection that admins can edit without a deployment.
- **Anything slow goes through a queue.** PDF generation, emails, notifications and webhooks run on Bull and Redis, with one queue per domain, automatic retries and an idempotency key against duplicates.
- **A layered Express app instead of a heavy framework.** Route, controller, service, repository: an architecture that is easy to read and to debug. The API is documented with Swagger so the front-end team never has to guess a schema.

## Outcome

The platform is live at freelanceclubs.com. Each step of the journey can be demonstrated on its own, which let the interface ship one module at a time.
