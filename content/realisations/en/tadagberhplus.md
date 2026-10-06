---
title: TadagbeRhPlus
summary: "Modernising, without downtime, the multi-company HR platform of an HR consulting firm: payroll, leave, contracts and social security filings in one tool."
year: 2025
duration: "11 months"
role: "Back-end lead, architecture and delivery"
team: "3 developers, 1 product owner"
coauthors: []
client: "HR consulting firm, Benin (confidential)"
sector: "SaaS, human resources"
stack: [Django 4.2, Python 3.11, MySQL, Celery, RabbitMQ, Redis, Vue 3]
genes: [architecture, engineering, devops, leadership]
status: live
liveUrl: https://tadagberhplus.com
featured: null
order: 9
images:
  - { src: /work/tadagberhplus/01.webp, alt: "Showcase site of an HR consulting firm, Benin", kind: public }
  - { src: /work/tadagberhplus/02.webp, alt: "Live home page", kind: public }
proofs:
  - { text: "−85% manual data entry", source: "confirmé par Rostel (spec v6, section 6.3)" }
  - { text: "3 CNSS regulatory updates with no regressions", source: "confirmé par Rostel (spec v6, section 6.3)" }
seoDescription: "TadagbeRhPlus: a multi-company HR platform on Django 4.2, MySQL and Celery for an HR consulting firm in Benin. Payroll, leave, contracts, CNSS."
---

## The challenge

The firm runs payroll and HR for many small and mid-sized companies in Benin. Before TadagbeRhPlus: one Excel file per client, social security contributions (CNSS) worked out by hand, payslips emailed as PDFs, and one consultant per client who ended up being the only person who knew how it all held together.

I was handed a Django 2.2 platform on Python 3.6 that was running on borrowed time. The job: modernise it without stopping production, and industrialise five critical modules, namely employees, contracts, leave, payroll and CNSS.

## Key features

- **One workspace per client company**, so a consultant can follow several clients in parallel.
- **Payroll**: payslips generated as PDFs and emailed in the background, on a monthly schedule.
- **CNSS**: contributions calculated with the rules in force for the year concerned.
- **Contracts** e-signed on the server (pyHanko), with a visible signature and a timestamp.
- **An audit log** on employees, contracts and payroll: every change is recorded with its author.
- **Synchronised logout**: signing out of one tab ends the session in every other tab, which matters on shared computers.

## Constraints and decisions

- **Audit before code, then upgrade in steps.** I spent the first two weeks reading the code and the MySQL schema and interviewing the consultants. The resulting audit ranked 47 risks by severity and shaped the whole roadmap. Then Python 3.6 to 3.11, and Django 2.2 to 3.2 to 4.2, with regression tests at every step.
- **Keep MySQL and own the monolith.** Years of business data lived in MySQL; moving to PostgreSQL would have cost weeks with nothing the firm could see. Django, MySQL and Celery run on a single server. At this scale, with operations handled by one of the three developers, simplicity is worth more than microservices.
- **Multi-company through the URL.** Each company has its own path; a middleware resolves the company on the way in and Django managers filter every query by default. No separate schemas, one discriminator, fewer ways to forget a filter.
- **CNSS rules as parameters, not code.** Contribution rules change by decree, almost every year. I isolated the calculation in a formula layer parameterised by year: when a decree comes out, we add a row of parameters instead of rewriting a function.

## Outcome

Manual data entry for the consultants dropped by 85%, and the platform went through 3 CNSS regulatory updates with no regressions. Not everything was solved: the legacy PDF generator choked on some payslips (very long names, special characters), and moving the templates to WeasyPrint was still unfinished when my assignment ended.

On a mature monolith, the real gain rarely comes from a rewrite. It comes from reading the existing code closely, finding the few modules that truly block people, and rebuilding those with care.
