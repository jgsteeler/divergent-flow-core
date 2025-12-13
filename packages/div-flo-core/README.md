# @div-flo/core

> **🗄️ ARCHIVED** - This package is part of an archived repository. See [../../ARCHIVE.md](../../ARCHIVE.md) for details.
> 
> **Active development:** [divergent-flow-mvp](https://github.com/jgsteeler/divergent-flow-mvp)

Business logic and services for Divergent Flow (monorepo package).

## Environment

- Env files live only at the monorepo root (e.g., `.env.local`).
- This package imports a small loader to make those env vars available when executed in dev/test contexts.

## Usage

This package is consumed by `@div-flo/api` and other workspaces. Build and test from the monorepo root:

```bash
npm run build
npm test
```

## Notes

- Do not add `.env` files to this package (they’re ignored).
- In Docker, pass env at runtime; the loader doesn’t implicitly read files in containers.
