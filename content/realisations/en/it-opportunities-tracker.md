---
title: IT-Opportunities-Tracker
summary: "An IT market intelligence platform: automated collection of contract offers, a data warehouse and a dashboard, with consultant matching planned."
year: 2025
role: "Engineering contribution"
coauthors: []
sector: "IT market intelligence, data"
stack: [Python, Selenium, PostgreSQL, Django 5, DRF, Docker, YAML]
genes: [engineering, product]
status: private
featured: null
order: 6
images: []
proofs: []
seoDescription: "IT-Opportunities-Tracker: a Python and Selenium pipeline collecting IT job offers, a PostgreSQL warehouse, a Django and DRF dashboard."
---

## The challenge

For a consulting firm, knowing which technologies the market asks for, and where, drives both business development and consultant training. The information exists, but it is scattered across job boards that look nothing alike.

IT-Opportunities-Tracker automates that watch: collect IT contract offers, clean them, centralise them, draw trends from them and match them against consultant profiles.

## Key features

- **Automated collection** of offers from platforms such as Free-Work and Welcome to the Jungle.
- **A staged pipeline**: collect, clean, enrich, check, load.
- **Technology detection** in each offer, from a configurable keyword list.
- **A PostgreSQL data warehouse**: consultant profiles, matched offers, application history.
- **A trends dashboard**, served by Django and DRF.

## Constraints and decisions

- **Separate, traceable stages.** Every pipeline run is recorded in the database. When a source changes its layout, you know which stage failed and on which run.
- **Configuration over code.** Sources and technology keywords live in YAML files. Tracking a new technology means adding a line, not changing code.
- **A warehouse split into schemas.** Raw data, the analytical warehouse, technical tables and logs live in separate schemas. Raw data never leaks into analysis.
- **Reproducible collection.** The collector runs in a Docker image that ships Python and Chrome: the same environment locally and in production.

## Outcome

The platform is private. This page describes what it does and how it is built; the consultant matching engine is on the roadmap.
