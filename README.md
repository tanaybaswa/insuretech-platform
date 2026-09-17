# insuretech-platform

Platform codebase for insurance technology services.

## Status

Next.js app shell is under `web/`. Broader product architecture, Python
services, and Azure infrastructure will be planned and added next.

## Local / Cloud Agent

```bash
cd web
npm install
npm run dev
```

App listens on `http://0.0.0.0:3000`. In a Cloud Agent session, open the
**Forwarded Ports** menu and forward port `3000` to preview it.
