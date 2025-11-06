# divergent-flow-core

Core business logic and API services for Divergent Flow — ADHD-optimized productivity system.

## Local Development (no Docker)

This project is optimized for running locally without Docker during development. The Dockerfile is kept for CI/CD image builds and deployments; docker-compose files are intentionally ignored.

### Prerequisites

- Node.js 20.x (same as CI)
- npm 10+ (comes with Node 20)
- PostgreSQL 15 running locally (Homebrew or your preferred install)
- macOS/zsh examples below

Optional: Docker Desktop if you personally run containers locally. Any docker-compose files you create will be ignored by git.

### 1) Environment setup

```bash
cp .env.example .env.local
```

Edit `.env.local` and set at minimum:

```dotenv
DATABASE_URL=postgresql://divergent:divergentpw@localhost:5432/div-flo-data-dev
PORT=3001
NODE_ENV=development
```

Notes:

- `DATABASE_URL` should point to your local Postgres instance/db.
- If you use a different user/db, update the URL accordingly.

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

- CI runs Node 20 and a Postgres service; no docker-compose is used in pipelines.
- The provided `Dockerfile` is for building deployable images in CI/CD.
- docker-compose files are intentionally not tracked; create your own local compose if you prefer containers for development.

## Architecture

- `@div-flo/models` — Shared interfaces, DTOs, Prisma schema and client
- `@div-flo/core` — Business logic and services
- `@div-flo/api` — REST API and controllers

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is dual-licensed. The core functionalities are released under the **GNU Affero General Public License v3.0 (AGPLv3)**. This ensures that any modifications or services built upon the open-source core remain open and accessible to the community. For details, see the [LICENSE](LICENSE) file.

For commercial use-cases, such as integration into proprietary software or for use in a commercial SaaS offering without the copyleft requirements of the AGPLv3, a **commercial license** is available. Please contact the project maintainers for more information on obtaining a commercial license.
