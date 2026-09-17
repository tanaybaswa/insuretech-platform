# insuretech-platform (VizCo)

AI insurance information broker — pre-qualify vendors, bind monitorable policy
terms, observe insured AI product usage, and support claims evidence.

## Docs

- [Phase roadmap](docs/product/phase-roadmap.md)
- [Style guide](docs/design/style-guide.md)

## App

The web app lives in [`web/`](web/). Phase 0: dual portals + auth + Postgres.

```bash
cd web
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Demo logins are listed in [`web/README.md`](web/README.md).
