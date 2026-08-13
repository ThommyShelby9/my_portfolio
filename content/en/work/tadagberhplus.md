---
slug: tadagberhplus
title: A multi-tenant HRIS for an HR consulting firm
kicker: Issue 04 · SaaS · HR · 2024–2025
excerpt: Centralising multi-tenant HR for a Benin consulting firm — payroll, leaves, social security, documents — on a happily monolithic Django.
year: 2025
order: 4
featured: true
client: HR consulting firm · Benin (confidential)
sector: SaaS · Human Resources
role: Backend Lead · Architecture · Delivery
team: 3 devs · 1 PO
duration: 11 months (Sept. 2024 — July 2025)
stack:
  - Django 4.2
  - MySQL
  - Redis
  - RabbitMQ
  - Celery
  - Vue 3
cover: /images/tadagberhplus.png
results:
  - value: "5"
    label: Critical modules rebuilt
  - value: "3"
    label: CNSS regulatory updates · 0 regressions
  - value: "85%"
    label: Reduction in manual data entry
seoDescription: TadagbeRhPlus — multi-tenant HRIS Django 4 + MySQL + Celery, payroll + CNSS + leaves + documents for an HR consulting firm in Benin.
---

## The context

The firm runs payroll and HR for dozens of SME clients in Benin. Before TadagbeRhPlus: one Excel file per client, social-security calculations done by hand, payslips emailed as PDFs, and one consultant per file becoming the **single point of failure** of the entire portfolio.

Management wanted one tool to take back control: one consultant handling dozens of files in parallel, standardised payroll templates, and e-signature for contracts.

## What I was asked

Take over a Django 2.2 platform (Python 3.6) that ran on borrowed time, modernise it without breaking production, and industrialise five critical modules: **employees, contracts, leaves, payroll, social security**.

## The approach

1. **Audit first, code second.** First two weeks: code reading, MySQL schema, and interviews with HR consultants. I wrote an `AUDIT_COMPLET.md` listing 47 risks by criticality — that document structured the roadmap.
2. **Progressive runtime migration.** Python 3.6 → 3.11 in four weeks, Django 2.2 → 4.2 by jumps (2.2 → 3.2 → 4.2) with non-regression tests at each jump.
3. **Multi-tenant by URL.** Each company lives on `<companyname>/employer/` — a middleware resolves the tenant at entry, isolates querysets downstream. No separate schemas, just a `company_id` discriminator and Django managers that filter by default.

## Notable technical decisions

- **Django 4.2 LTS + MySQL via PyMySQL.** MySQL was mandatory (10 years of business data) — Postgres migration would have cost two months for zero visible business gain.
- **Celery 5.5 + RabbitMQ + Redis** for heavy jobs: PDF payslip generation (`pdfkit` + wkhtmltopdf), email delivery (`django-celery-email`), monthly social-security recalculation.
- **django-celery-beat** for monthly payroll scheduling.
- **pyHanko** for server-side e-signatures on contracts — visible signature + crypto + timestamp.
- **django-auditlog** on all sensitive entities — each modification traced with user + JSON diff.
- **whitenoise + django-compressor** for static serving without reverse proxy.
- **JS worker for synchronised logout** (`easy_worker.js`) — when a consultant logs out from one tab, all others log out immediately via SharedWorker.
- **Sentry SDK** everywhere, **custom 400/403/404/500 handlers** that speak to the consultant.

## The social-security module — the subtle one

Benin's social-security agency changes calculation rules by decree nearly every year. I isolated the calculation in a `formulas` (`schedula`) layer with per-year parameters — when a decree drops, we add a line, not a function. Three regulatory updates in 11 months, zero regression.

## What worked, what didn't

**Worked.** The unapologetic monolith. Django 4 + MySQL + Celery on a single VPS, supervisord for resilience. At that scale, no microservices needed — and operational simplicity is gold when ops is also one of three devs.

**Didn't.** wkhtmltopdf eventually choked on some payslips (special characters in very long names). I started migrating to WeasyPrint but template rewriting was heavy — got to 70% before mission end.

## Take-away

On a mature Django monolith, the instinct is to "modernise" — go microservices, Postgres, GraphQL. 80% of the time it's wasted effort: real gains come from **deep reading of existing code**, spotting the three or four truly blocking modules, and surgically rebuilding them.

On Tadagbe, I touched 12% of the code and gained 85% user productivity. The rest, we left running.
