# VizCo — product phase roadmap

VizCo is an InsureTech **AI insurance information broker**.

It connects AI vendors (insurable products), insurance underwriters (price / sell / service policies), and insured end-users (observed usage). Marketplace comes later. Initially, **underwriters buy VizCo SaaS** for policy-use monitoring and trusted claims evidence — without integrating to every AI vendor.

## Phase overview

| Phase | Name | Outcome |
| --- | --- | --- |
| 0 | Foundation | Dual portals, auth, roles, Postgres |
| 1 | Pre-qualify | Versioned AI products + evidence → VizCo qualification |
| 2 | Policy terms | Monitorable terms (usage caps, version, insured party) |
| 3 | Observation | Usage stream + out-of-policy events for underwriters |
| 4 | Claims evidence | Trusted runtime/environment pack at claim time |
| 5 | Marketplace | Data flywheel → multi-party AI insurance marketplace |

## Phase 0 — Foundation (current)

**Goal:** Authenticated dual-portal shell.

**In scope**

- Auth / session
- Roles: `vendor`, `underwriter` (`insured_org` entity reserved, no portal yet)
- Routes: `/vendor/*`, `/underwriter/*`
- Postgres: orgs, users, role membership
- Light enterprise UI shell + style guide

**Exit criteria:** A vendor user and an underwriter user can sign in and only see their portal.

## Later phases (summary)

- **1** — Answer “Is ACME qualified?” with questionnaire + evidence for versioned products
- **2** — Encode what in-policy means before live traffic
- **3** — Single observation layer; OOP for over-use / wrong version / term breach
- **4** — Claims investigation evidence packs
- **5** — Broker becomes marketplace

## Working rules

- Complete and document one phase before detailing the next
- Two distinct portals from day one
- Modular monolith until observation volume forces a split
