# divergent-flow-core

[![CI](https://github.com/jgsteeler/divergent-flow-core/actions/workflows/ci.yml/badge.svg)](https://github.com/jgsteeler/divergent-flow-core/actions/workflows/ci.yml)
[![Core Staging Deploy](https://github.com/jgsteeler/divergent-flow-core/actions/workflows/core-staging-deploy.yml/badge.svg)](https://github.com/jgsteeler/divergent-flow-core/actions/workflows/core-staging-deploy.yml)

Core business logic and API services for Divergent Flow — ADHD-optimized productivity system.

> **📋 CI/CD**: This repository follows GitHub Flow. See [GITHUB_FLOW.md](GITHUB_FLOW.md) for details on our automated deployment pipeline.

## Local Development (without Docker)

This project is optimized for running locally without Docker during development. The Dockerfile is kept for CI/CD image builds and deployments; docker-compose files are intentionally ignored.


### Prerequisites

- Node.js 20.x (same as CI)
- npm 10+ (comes with Node 20)
- PostgreSQL 15 running locally (Homebrew or your preferred install)
- Redis (local for dev, Fly.io for staging/prod)
- macOS/zsh examples below

Optional: Docker Desktop if you personally run containers locally. Any docker-compose files you create will be ignored by git.

### 1) Environment setup (centralized at repo root)

```bash
cp .env.example .env.local
```


Edit `.env.local` at the monorepo root and set at minimum:

```dotenv
DATABASE_URL=postgresql://divergent:divergentpw@localhost:5432/div-flo-data-dev
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=development
```

Notes:

- `DATABASE_URL` should point to your local Postgres instance/db.
- `REDIS_URL` should point to your local Redis instance for dev, or Fly.io/Upstash for staging/prod.
- If you use a different user/db, update the URL accordingly.
## Environment Variables & Secrets

The following environment variables and secrets are required for different environments:

| Name         | Description                                 | Local Example / Source                |
|--------------|---------------------------------------------|---------------------------------------|
| DATABASE_URL | PostgreSQL connection string                 | `postgresql://...`                    |
| REDIS_URL    | Redis connection string                      | `redis://localhost:6379`              |
| OIDC_ISSUER_URL | OIDC/Auth0 issuer URL                     | `https://dev-...us.auth0.com/`        |
| OIDC_AUDIENCE   | OIDC client audience                      | `web-app`                             |
| CORS_ORIGINS | Allowed CORS origins (comma-separated)       | `http://localhost:5173,...`           |
| APP_BASE_URL | Base URL of the app                          | `http://localhost:3001`               |
| ENABLE_SWAGGER | Enable Swagger UI (true/false)             | `true`                                |

Secrets for staging/prod are managed via GitHub Actions and Fly.io. See [SECRETS.md](SECRETS.md) for details.
## Redis Cache Integration

The core API now uses Redis for caching user provisioning and other operations. You must have Redis running locally for development, and configure the correct `REDIS_URL` for staging and production (see above).

- For local dev: install Redis via Homebrew (`brew install redis`) and start with `brew services start redis`.
- For staging/prod: use Fly.io Redis add-on and set the `REDIS_URL` secret.

See [SECRETS.md](SECRETS.md) for more info.
## Auth0/OIDC Migration

The project has migrated to Auth0/OIDC for authentication and user provisioning. Ensure your environment variables and secrets reflect the new OIDC settings. See [SECRETS.md](SECRETS.md) for required values.

**Breaking change:** User IDs are now mapped via OIDC provider IDs; ensure all integrations use the correct mapping logic.

### 2) Install dependencies

Monorepo workspaces are used; install from the repo root:

```bash
npm install
```

### 3) Generate Prisma client

```bash
npx prisma generate --schema=packages/div-flo-models/prisma/schema.prisma
```

If you manage migrations locally, you can also run (optional):

```bash
# Optional: apply/create local dev migrations
npx prisma migrate dev --schema=packages/div-flo-models/prisma/schema.prisma
```

### 4) Run the API in dev mode

```bash
npm run dev
```

This starts `packages/div-flo-api` with nodemon. Ensure your local Postgres is running and accessible via `DATABASE_URL`.

### 5) Common scripts

```bash
# Type-check and build all packages
npm run build

# Run tests across workspaces
npm test

# Clean build artifacts
npm run clean
```

### Local API endpoints (defaults)

- Health: [http://localhost:3001/health](http://localhost:3001/health)
- Version: [http://localhost:3001/version](http://localhost:3001/version)
- API Docs (if enabled): [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

If you override `PORT` in `.env.local`, adjust the URLs accordingly.

## CI/CD and Docker

This repository follows **GitHub Flow** with automated CI/CD. See [GITHUB_FLOW.md](GITHUB_FLOW.md) for complete workflow documentation.

Quick overview:
- **PR to main** → Automatic staging deployment for preview
- **Merge to main** → Release Please creates release PR
- **Merge release PR** → Manual approval → Production deployment

Technical details:
- CI runs Node 20 and a Postgres service; no docker-compose is used in pipelines.
- The provided `Dockerfile` is for building deployable images in CI/CD.
- docker-compose files are intentionally not tracked; create your own local compose if you prefer containers for development.
- Environment files live only at the monorepo root. Packages do not carry their own `.env` files. The API loads env from the root automatically in development via a small loader.

### Environment loading behavior

- Priority when running locally: `.env.local` → `.env.{NODE_ENV}` → `.env`
- You can force a specific file by setting `ENV_FILE` (relative to repo root or absolute)
- In Docker/containers (`DOCKER=true`), env files are not auto-loaded; pass env at runtime instead.

## Architecture

- `@div-flo/models` — Shared interfaces, DTOs, Prisma schema and client
- `@div-flo/core` — Business logic and services
- `@div-flo/api` — REST API and controllers

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is dual-licensed. The core functionalities are released under the **GNU Affero General Public License v3.0 (AGPLv3)**. This ensures that any modifications or services built upon the open-source core remain open and accessible to the community. For details, see the [LICENSE](LICENSE) file.

For commercial use-cases, such as integration into proprietary software or for use in a commercial SaaS offering without the copyleft requirements of the AGPLv3, a **commercial license** is available. Please contact the project maintainers for more information on obtaining a commercial license.
