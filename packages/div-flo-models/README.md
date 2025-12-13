# @div-flo/models

> **🗄️ ARCHIVED** - This package is part of an archived repository. See [../../ARCHIVE.md](../../ARCHIVE.md) for details.
> 
> **Active development:** [divergent-flow-mvp](https://github.com/jgsteeler/divergent-flow-mvp)

Shared DTOs, interfaces, and Prisma schema/client for Divergent Flow.

## Environment

- Env files live only at the monorepo root (e.g., `.env.local`).
- Prisma CLI commands should be run from the monorepo root so `DATABASE_URL` is picked up.

## Common commands (from repo root)

```bash
# Generate Prisma client
npx prisma generate --schema=packages/div-flo-models/prisma/schema.prisma

# Optional: apply local dev migrations
npx prisma migrate dev --schema=packages/div-flo-models/prisma/schema.prisma
```

## Notes

- Do not add `.env` files to this package (they’re ignored).
- In Docker, pass env at runtime; do not rely on package-level files.
