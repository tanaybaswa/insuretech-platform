# VizCo web app

Next.js frontend + API for the VizCo AI insurance information broker.

## Phase 0

Dual portals (Vendor / Underwriter), credential auth, Postgres-backed orgs and
memberships. See [`docs/product/phase-roadmap.md`](../docs/product/phase-roadmap.md)
and [`docs/design/style-guide.md`](../docs/design/style-guide.md).

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
