# VizCo web app

Next.js frontend + API for the VizCo AI insurance information broker.

## Phase 0

Dual portals (Vendor / Underwriter), credential auth, Postgres-backed orgs and
memberships.

## Phase 1

Shared qualification for versioned AI products: questionnaire, evidence upload,
underwriter review. See [`docs/product/phase-1-qualification.md`](../docs/product/phase-1-qualification.md).

## Setup

```bash
# Postgres must be running; then:
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open http://localhost:3000 (or Cloud Agent forwarded port 3000).

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Vendor | `vendor@acme.ai` | `password123` |
| Underwriter | `underwriter@harborins.com` | `password123` |

### Phase 1 demo path

1. Sign in as vendor → AI products → New product
2. Complete questionnaire, upload a file, Submit
3. Sign out → underwriter → Qualifications → open case → Start review → Qualify

