# @div-flo/api

REST API for Divergent Flow (monorepo package).

## Local development

- Env files live only at the monorepo root (e.g., `.env.local`).
- This package automatically loads env from the root via `src/loadEnv.ts`.

Quick start (from repo root):

```bash
npm install
npx prisma generate --schema=packages/div-flo-models/prisma/schema.prisma
npm run dev
```

Default endpoints:
 
- Health: [http://localhost:3001/health](http://localhost:3001/health)
- Version: [http://localhost:3001/version](http://localhost:3001/version)
- API docs: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

## Notes

- Do not add `.env` files inside this package (they’re ignored).
- In Docker, env files are not auto-loaded; pass env at runtime or set `ENV_FILE` explicitly.
