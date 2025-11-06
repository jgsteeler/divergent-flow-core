# Copilot Instructions for Divergent Flow Core Monorepo

## Core Principles
- **Always ask before acting**: Never proceed beyond the explicit user request. Propose your plan, get approval, then execute.
- **One thing at a time**: Complete the current task, then pause and ask for next steps.

## Architecture Overview
- **Monorepo**: Managed with npm workspaces (`packages/*`).
  - `div-flo-core`: Business logic, data access, and service layer.
  - `div-flo-models`: Shared TypeScript interfaces, DTOs, and Prisma schema.
  - `div-flo-api`: REST API and controllers (OpenAPI-driven).
- **Note**: `div-flo-cli` and `div-flo-ui` are separate repositories, not part of this monorepo.
- **Data Layer**: Prisma ORM, Postgres DB. Schema lives in `div-flo-models/prisma/schema.prisma`.
- **Dependency Injection**: Uses `tsyringe` throughout core for testability and modularity.
- **Testing**: Jest with global setup/teardown scripts to create and destroy a temp Postgres DB for integration tests. All tests run via `npm test` at the monorepo root.

## Developer Workflows
- **Setup**: Copy `.env.example` to `.env.local` at the repo root and customize. Env files live only at the root; packages do not carry their own `.env` files.
- **Build**: `npm run build` (at root) builds all packages.
- **Test**: `npm test` (at root) runs all workspace tests, including integration tests with a real Postgres DB.
- **CI/CD**: GitHub Actions pipeline runs all workspace tests on every push, spins up Postgres, and runs `npx prisma generate` before tests.

## Project Conventions
- **Prisma Client**: Always generate with `npx prisma generate --schema=packages/div-flo-models/prisma/schema.prisma` after schema changes.
- **Type Imports**: Import types from `@prisma/client` only after generating the client.
- **Json Fields**: Use plain `null` for JSON fields in tests; do not rely on `Prisma.JsonNull` unless confirmed in the generated client.

## Examples
- **Integration Test DB Setup**: See `jest-global-setup.js` and `jest-global-teardown.js` in `div-flo-core`.
