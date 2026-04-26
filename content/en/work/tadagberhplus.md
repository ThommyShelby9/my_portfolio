---
slug: tadagberhplus
title: An HR platform managing 100+ companies
kicker: Issue 02 · HR SaaS · 2023
excerpt: Centralising multi-company HR management for a regional consulting firm.
year: 2023
order: 2
featured: true
client: HR consulting firm
sector: SaaS / Human Resources
role: Backend Lead · Architecture · Delivery
team: 3 devs · 1 PO
duration: 4 months
stack:
  - Spring Boot
  - PostgreSQL
  - Vue 3
  - TailwindCSS
results:
  - value: "100+"
    label: Companies managed
  - value: "770+"
    label: Employees tracked
  - value: "85%"
    label: Reduction in manual data entry
seoDescription: TadagbeRhPlus — multi-tenant SaaS platform for HR management across 100+ client companies.
---

## The context

> _To be expanded._

The firm handled payroll and contracts for over 100 client companies through shared Excel files and Google Drive. No aggregate visibility, no real security, and a growing legal risk.

## The ask

> _To be expanded._

A multi-tenant web platform where each company sees only its own data, the firm sees everything, and leave / contract workflows are automated.

## The approach

> _To be expanded._

Spring Boot for the robustness of multi-role authentication, Vue 3 for fast UI iteration, PostgreSQL with row-level security for multi-tenancy.

## Notable technical decisions

> _To be expanded._

- Row-level security at the DB layer rather than application-side filtering: no risk of leaks if an endpoint misses a check.
- PDF generation (contracts, payslips) on the server through a dedicated queue — to avoid blocking synchronous requests.

## What worked, what didn't

> _To be expanded._

## The takeaway

> _To be expanded._
