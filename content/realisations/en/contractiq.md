---
title: ContractIQ
summary: "A B2B SaaS that reads contracts with AI, pulls out risks and deadlines, and warns before every renewal. Co-built with Jérémie Zitti."
year: 2026
role: "Co-author, full-stack engineering"
coauthors: [Jérémie Zitti]
client: "Independent product"
sector: "B2B SaaS, contract management"
stack: [Next.js 15, React 19, TypeScript, MongoDB, Mongoose, NextAuth, Gemini, OpenAI, FedaPay, Resend, MinIO, Sentry, Vitest, Playwright, Docker]
status: private
featured: 2
order: 2
images:
  - { src: /work/contractiq/01.webp, alt: "Contract detail with AI-detected risks", kind: interior }
  - { src: /work/contractiq/02.webp, alt: "Contract command center", kind: interior }
  - { src: /work/contractiq/03.webp, alt: "AI analysis of a contract", kind: interior }
  - { src: /work/contractiq/04.webp, alt: "Contract portfolio health score", kind: interior }
  - { src: /work/contractiq/05.webp, alt: "List of at-risk contracts", kind: interior }
  - { src: /work/contractiq/06.webp, alt: "Fields automatically extracted from an invoice", kind: interior }
  - { src: /work/contractiq/07.webp, alt: "Ghost subscription detection", kind: interior }
  - { src: /work/contractiq/08.webp, alt: "Public signature page", kind: public }
proofs:
  - { text: "52 Mongoose models, about 213 API routes, 44 unit test files", source: "compté dans le dépôt contractiq" }
seoDescription: "ContractIQ, an AI contract analysis SaaS (Next.js 15, MongoDB, Gemini with OpenAI fallback, FedaPay), co-built with Jérémie Zitti."
---

## The challenge

In many companies, contracts sit in shared folders. Nobody knows which clause carries a penalty, which subscription renews silently next month, or which invoice no longer matches anything. ContractIQ starts from there: upload a contract (PDF, DOC or DOCX), get the parties, dates, obligations and risky clauses, and get a warning before the deadline.

I designed and built it with Jérémie Zitti, the two of us, between late 2025 and mid-2026. The first target market is West Africa: prices in XOF and EUR, payments through FedaPay.

## Key features

- **AI extraction**: parties, dates, obligations and clauses, each with a risk level.
- **Risk analysis**: a portfolio health score, a list of at-risk contracts and a renegotiation assistant.
- **Renewal alerts** by email, sent by a daily scheduled job 60, 30 and 7 days before the deadline.
- **Invoices**: upload with automatic field extraction, templates, generation.
- **Ghost subscriptions**: spotting subscriptions that are still paid for but no longer used.
- **E-signature**, with a public signing page and secure sharing through expiring links.
- **Multi-organisation billing** with FedaPay: organisations, invitations, roles and per-plan limits.
- **A public API** (`/api/v1`) with API keys, OpenAPI documentation and outbound webhooks signed with HMAC.

## Constraints and decisions

- **A provider-agnostic AI layer.** Gemini 2.5 Flash is the primary model, OpenAI takes over when it fails, and a mock mode serves the tests. We held both providers to the same contract: a strict JSON answer, validated before it is stored. Switching models leaves the rest of the product untouched, and the test suite needs no API key.
- **Billable modules instead of fixed plans.** Each feature (invoices, signature, subscriptions and so on) is a module an organisation turns on and pays for, checked on the server at every call. More work up front, but customers pay for exactly what they use, and adding a module does not mean redrawing the pricing grid.
- **Multi-tenant organisations with an audit log.** Every request goes through an auth context that resolves the organisation and the role, and admin actions are logged. That is what lets the product serve teams, not just individuals.
- **Idempotent payment webhooks.** Every processed FedaPay event is recorded: received twice, it is applied once. A payment gateway abstraction keeps Stripe possible without rewriting the checkout.

## Outcome

The product is not public: it is shown here through screenshots on fictional data. The repository holds 52 Mongoose models, about 213 API routes and 44 unit test files, backed by Playwright scenarios. The app builds as a Docker image and deploys on Coolify.
