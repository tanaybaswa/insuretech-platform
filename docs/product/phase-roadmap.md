# VizCo platform — phase roadmap

## Working thesis (aligned with CTO vision)

**VizCo is an InsureTech AI information broker.**

It connects:

- **AI vendors** that want to sell *insurable* AI products
- **Insurance underwriters** that need to price, sell, service, and monitor policies on those products
- **Insured end-users** (e.g. a hospital) whose AI product usage must stay in-policy

**We are not a marketplace first.** Marketplace is the future position once VizCo is indispensable as the shared evidence and monitoring layer. Initially, **underwriters buy VizCo SaaS** to monitor policy terms of use and obtain trusted claims evidence — without integrating their backend to every AI vendor.

```mermaid
flowchart TB
  uw[Insurance_Underwriter]
  vizco[VizCo_Broker]
  vendor[AI_Product_Vendor]
  insured[Insured_AI_Product_Users]

  uw -->|"Buys_VizCo_SaaS_Defines_policy_terms"| vizco
  vendor -->|"Registers_products_Credentials_Monitoring_hooks"| vizco
  insured -->|"AI_product_runtime_observation"| vizco
  vizco -->|"Qualification_In_policy_status_OOP_events_Claims_evidence"| uw
```

### The blocker VizCo exists to remove

AI products are not physical assets — they are **decisions** by particular models in particular environments. Underwriters struggle to:

1. Know a vendor/product is **qualified** for a deal
2. Know insured parties **stayed within policy limits** (e.g. 1000 MRI uses)
3. Know the insured used the **covered product version** (v2 not v1)
4. Know whether **other terms** were breached (e.g. IT system failure)
5. Get **trusted environment evidence** when a claim is filed

VizCo answers those with pre-qualification + a **single observation stream** per underwriter across many vendors.

### Commercial framing (for phase prioritization)

| Who | Role early | Role later |
|---|---|---|
| Underwriter | **Paying customer** — monitoring + claims evidence | Still primary buyer; marketplace participant |
| AI vendor | Supplies products, credentials, monitoring integration | Marketplace supplier of pre-connected insurable products |
| Insured end-user | Observed subject (may not need a full portal early) | Possibly self-serve policy/status views |
| VizCo | Broker of qualification, usage evidence, claims context | Indispensable marketplace / info brokerage |

### Product surfaces

- **Vendor portal** — register insurable products, qualify, connect monitoring
- **Underwriter portal** — see qualified products, policies, live use, OOP events, claims evidence
- **Insured-user surface** — deferred until monitoring is real; model the entity earlier if needed

---

## Principles for every phase

- Climb the CTO ladder in order: **qualify → bind terms → observe use → claims evidence → marketplace**
- Two distinct portals from day one (Vendor vs Underwriter)
- One vertical slice per phase; complete and document before detailing the next
- Prefer **versioned AI products** as the atomic unit (not vague “deployments” only)
- Design observation around **monitorable policy terms**, not generic telemetry dump
- Stay a modular monolith until observation volume forces a split
- Complete **one phase at a time**

---

## Phase overview

| Phase | Name | Status | Outcome |
| --- | --- | --- | --- |
| 0 | Foundation | Done | Dual portals, auth, roles, Postgres |
| 1 | Pre-qualify | Done | Versioned AI products + evidence → VizCo qualification |
| 2 | Policy terms | Next | Monitorable terms (usage caps, version, insured party) |
| 3 | Observation | Planned | Usage stream + out-of-policy events for underwriters |
| 4 | Claims evidence | Planned | Trusted runtime/environment pack at claim time |
| 5 | Marketplace | Planned | Data flywheel → multi-party AI insurance marketplace |

---

## Phase 0 — Foundation (platform shell)

**Status: Done.**

Authenticated dual-portal shell: auth/session, roles `vendor` / `underwriter`, routes `/vendor/*` and `/underwriter/*`, Postgres orgs/users/memberships.

**Exit criteria met:** Vendor and underwriter users sign in and only see their portal.

---

## Phase 1 — Pre-qualify vendors and versioned AI products

**Status: Done.** See [phase-1-qualification.md](./phase-1-qualification.md).

**Goal:** Answer *“How did the underwriter know ACME could be qualified for this deal?”*

Shared `QualificationCase` for each product version: SOC-like questionnaire, evidence uploads, underwriter review (start review / qualify / needs info). Vendor and underwriter portals render the same record.

**Exit criteria met:** Underwriter can open a submitted case and see identical status, answers, and evidence; qualification updates are visible to the vendor on that same record.

---

## Phase 2 — Policy terms model (what VizCo will observe)

**Goal:** Make policies **machine-monitorable** before streaming events. Encode the contract VizCo will enforce.

**Deliverables:**

- Link an underwriter **policy** to a specific **vendor + product + version**
- Associate an **insured party** (e.g. hospital) with that policy
- Capture monitorable terms, starting with the CTO examples:
  - Allowed product version(s)
  - Usage / exposure caps (e.g. 1000 MRI readings)
  - Other term hooks as extensible fields (IT health requirements, environment constraints) — partner-defined, not infinite custom code
- Underwriter UI: create/view policies and terms
- Vendor UI: see which products are bound to policies (read-mostly)

**Out of scope:** Real-time ingestion at scale; automated claims

**Exit criteria:** For a sample policy, VizCo can state *what would count as in-policy vs out-of-policy* before any live traffic.

---

## Phase 3 — Observation stream and out-of-policy detection

**Goal:** Deliver the CTO core product: VizCo as **single center of contact and evidence** for policy use monitoring.

**Deliverables:**

- Vendor-facing **monitoring integration** that emits observation events from insured AI product runtimes
- Ingest and store: usage events, product version in use, agreed environment/term signals
- Evaluate against Phase 2 terms → **in-policy** vs **out-of-policy** events
- **Underwriter aggregation view** across all vendors they service — without per-vendor UW integrations
- Vendor view: integration health, recent events for their products
- Alerting for OOP (in-app first)

**Exit criteria:** Underwriter sees live/near-live use for a bound policy and receives OOP events for over-use and wrong version without integrating to the vendor directly.

---

## Phase 4 — Claims evidence partner

**Goal:** When an insured party files a claim, VizCo provides the **trusted environment and runtime context** for investigation.

**Deliverables:**

- Claim case linked to policy + insured party + product version
- Evidence pack at/around claim time: observation history, OOP history, captured runtime/environment/IT status
- Underwriter claims review surface (evidence first — not full claims adjudication/payment)

**Exit criteria:** For a simulated claim, underwriter can pull a VizCo evidence pack that answers “what was running, under what terms, and what signals existed at claim time?”

---

## Phase 5 — Data flywheel and marketplace

**Goal:** Become indispensable brokerage, then the **AI insurance marketplace**.

**Deliverables:**

- Aggregate performance / loss / OOP stats across AI product classes
- Multi-underwriter / multi-vendor discovery of **pre-connected insurable products**
- Policy offer flow through VizCo

**Exit criteria:** An underwriter can discover and bind a pre-connected vendor product through VizCo; vendors see commercial pull from being on the network.

---

## Phase map vs CTO blocker questions

| Question | Phase that answers it |
|---|---|
| How did UW know ACME was qualified? | Phase 1 |
| How did UW know usage stayed in-policy? | Phase 2 (terms) + Phase 3 (observation) |
| How did UW know v2 not v1 was used? | Phase 2 + Phase 3 |
| How did UW know other terms were not breached? | Phase 2 (term schema) + Phase 3 (signals) |
| How did UW get environment evidence at claim time? | Phase 4 |
| How does VizCo become the marketplace? | Phase 5 |

---

## Explicitly deferred (do not pull forward)

- Full automated risk / pricing engine
- Generic code scanning or red-team product as the wedge
- Per-vendor integrations built by each underwriter (anti-goal — VizCo replaces this)
- Full claims adjudication and payment
- Consumer-style app store UX
- Heavy microservices split before Phase 3 volume requires it
- Deep insured-end-user portal before observation exists

---

## How we work from here

1. This document is the **master phase list** and durable source of truth
2. Next: **only expand + build Phase 2**
3. Do not detail Phase 3+ until the prior phase is complete and documented
