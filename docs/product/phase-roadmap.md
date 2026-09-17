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

## Phase 0 — Foundation

**Done.** Auth, roles, `/vendor` and `/underwriter` shells, Postgres orgs/users.

## Phase 1 — Pre-qualify (current)

**Goal:** Shared qualification case for versioned AI products.

**In scope**

- `AiProduct` / `AiProductVersion` / `QualificationCase`
- Seeded SOC-like questionnaire + answers
- Evidence upload (local disk + DB metadata)
- Underwriter review: start review / qualify / needs info
- Shared case view across portals

See [phase-1-qualification.md](./phase-1-qualification.md).

**Exit criteria:** Underwriter can open a vendor’s submitted case and see the same status, answers, and evidence; qualification status updates are visible to the vendor on that same record.

## Later phases (summary)

- **2** — Encode what in-policy means before live traffic
- **3** — Single observation layer; OOP for over-use / wrong version / term breach
- **4** — Claims investigation evidence packs
- **5** — Broker becomes marketplace

## Working rules

- Complete and document one phase before detailing the next
- Two distinct portals from day one
- Modular monolith until observation volume forces a split
