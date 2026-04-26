---
slug: banque-regionale
title: A payment platform for a regional bank
kicker: Issue 03 · Fintech B2B · 2024
excerpt: How we replaced a legacy system in six weeks without downtime for 12,000 merchants.
year: 2024
order: 1
featured: true
client: Regional bank (anonymised · NDA)
sector: Fintech / Payments
role: Lead Engineer · Architecture · Delivery
team: 4 devs · 2 ops · 1 PO
duration: 6 weeks (Mar – Apr 2024)
stack:
  - Django
  - DRF
  - PostgreSQL
  - Redis
  - Kubernetes
results:
  - value: "+180%"
    label: Volume processed in 6 months
  - value: "12,000"
    label: Merchants migrated
  - value: "99.98%"
    label: SLA held over 12 months
seoDescription: Migrating a legacy payment system to a modern platform — Django, DRF, PostgreSQL, Kubernetes. Six weeks, zero downtime.
---

## The context

> _To be expanded by Rostel — phase 11 of the migration plan._

A legacy payment system patched over eight years, weekly incidents, a team that no longer understood the code. The client wanted to migrate to a modern architecture without disrupting 12,000 active merchants.

## The ask

> _To be expanded._

Lead the rewrite end-to-end: architecture, technical choices, hiring of the small team, delivery in six weeks.

## The approach

> _To be expanded._

A progressive cohort-based switchover, a compatibility proxy to absorb old flows during the transition, and an explicit runbook for every incident scenario.

## Notable technical decisions

> _To be expanded with 1-2 code snippets if relevant._

- **Django + DRF** at the core: maturity, solid ORM, ecosystem for managing critical transactions.
- **PostgreSQL** with monthly partitioning on the transactions table — that table was the main source of slowness on the legacy.
- **Redis** for rate limits and session caching.
- **Kubernetes** on GCP, with aggressive autoscaling for end-of-month spikes.

## What worked, what didn't

**Worked:** the cohort-based switchover avoided big-bang risk. No merchant lost more than 4 minutes during their migration window.

**Didn't:** the incident runbook underestimated the duration of network incidents at the client's data centre. We had to rewrite it two weeks after go-live.

## The takeaway

> _To be expanded._

Migrating a critical system isn't about the quality of the new code — it's about the quality of the old system's exit.
