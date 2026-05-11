---
slug: freelanceclub
title: An end-to-end umbrella-company platform
kicker: Issue 01 · SaaS B2B · 2025–2026
excerpt: Mission → contract → timesheet → invoice → payslip → payment. One single journey for freelancers and companies, with AI CV parsing and built-in video calls.
year: 2026
order: 1
featured: true
client: Freelance Club
sector: SaaS · Umbrella company
role: Lead Engineering · Architecture · Backend
team: 3 devs · 1 PO · 1 designer
duration: 10 months (in progress)
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
    label: Backend domain models
  - value: "11"
    label: Business modules shipped
  - value: "Swagger"
    label: API documented end-to-end
cover: /images/freelanceclub.png
seoDescription: Freelance Club — full umbrella-company platform. Node/Express + MongoDB, Vue 3, Stripe, AI CV parsing, Socket.io, Bull queues. Private beta in September 2026.
---

## The context

Umbrella-company employment stays opaque to most freelancers — sign a paper contract, wait for a payslip PDF at month-end, and pray in between that your missions are declared right. **Freelance Club** wanted to break that loop: a platform where the freelancer sees, in real time, where their contract, timesheet, invoice and payment stand.

The challenge was not "performance" — it was modelling a domain where each step (mission, contract, timesheet, invoice, payslip) is both independent and tied together by a coherent lifecycle.

## What I was asked

Design the backend and frontend architecture, hire a small team, ship a private beta with a full journey: a freelancer signs a digital contract, submits a timesheet, watches the company validate it, generates an invoice, receives a payslip and a Stripe payout — without ever leaving the platform.

## The approach

Three principles I enforced from day one:

1. **Domain first, code second.** Before any code, I wrote out the list of 38 business entities (User, Freelance, Company, Mission, Contract, Timesheet, Invoice, Payslip, Expense, VideoCall, Workflow, Gamification, KYCVerification, AuditLog, etc.). Each with its Zod schema, Mongoose model, and state transitions.
2. **Workflows are config-driven**, not code-driven. A mission going from `pending` to `signed` triggers notifications, an email, a calendar event — all defined in a `Workflow` collection editable from the back-office without a deploy.
3. **Everything goes through the queue**, never through the user request. PDF generation, email sending, push notifications, Stripe webhooks — Bull + Redis, automatic retry, deduplication by idempotency key.

## Notable technical decisions

- **Node 22 + Express 5 + strict TypeScript.** No Nest, no heavyweight framework: Express with a layered architecture `route → controller → service → repository`. Readable, debuggable, no magic.
- **MongoDB + Mongoose 9.** The domain is relational enough that Postgres was suggested; I held on Mongo because 80% of access patterns are by `userId` or `missionId`, and embedded documents save us JOINs on entities that change together (e.g. `Contract.signatures[]`).
- **Redis for cache, Bull for queues.** 2-min cache on mission search, 5-min on freelancers, 1-hour on admin stats. Dedicated queues: `email`, `pdf`, `notification`, `webhook-stripe`.
- **Stripe Connect + custom accounts** for freelancer payouts.
- **Affinda** for automatic CV parsing — 80% of the freelance profile filled from a single PDF upload.
- **Anthropic SDK** for freelancer ↔ mission matching: a daily batch re-scores active pairs based on JD and portfolio.
- **Socket.io** for mission chat, real-time notifications and **native 1:1 video calls** (signaling only — peer-to-peer, no SFU, enough for 30-min interviews).
- **MinIO** as self-hosted S3 for signed contracts, CVs, invoices, payslips. Server-side encryption, 5-min pre-signed URLs.
- **PDFKit + ExcelJS** in-house, with pyHanko signatures — no third-party signing service.
- **JWT + rotating refresh token + TOTP 2FA.** No sessions, no cookies. Refresh tokens stored with immediate revocation.
- **Strict rate-limiting** on sensitive routes: 5 auth attempts / 15 min, 3 password resets / hour, 60 messages / minute. Helmet + xss-clean + Zod everywhere.
- **Swagger** at `/api-docs` — frontend doesn't lose an hour a day asking for schemas.
- **Tests**: Jest + mongodb-memory-server + supertest. 60% coverage on services, 100% on contract state transitions.

## What worked, what didn't

**Worked.** Splitting modules by business use case (mission, contract, timesheet, invoice, payslip) instead of by technical layer let the frontend ship module by module — each one demoable independently.

**Didn't.** Stripe Connect in CFA zone was an administrative nightmare — between ID checks, unsupported Wave/Moov bank accounts, and KYC requirements, we shipped a fallback PayPlus (Africa payments) in parallel. Two payment flows, twice the integration tests.

## Take-away

A living B2B platform is not a graph of REST APIs — it is a graph of **business states**. If you don't explicitly name transitions (a contract may go `draft → sent → signed → executing → closed`, but not in random order), you end up coding them everywhere, in duplicate, with bugs surfacing six months later from combinations nobody had imagined.

On Freelance Club, I saved three months by laying down that state grammar before the first line of code.
