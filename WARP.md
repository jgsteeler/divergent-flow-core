# Divergent Flow Core - Warp Instructions

## Project Overview

Backend API and business logic services for the Divergent Flow ADHD-optimized productivity system.

## Architecture

- **Workspace**: Monorepo with npm workspaces
- **Packages**:
  - `@div-flo/models` - Shared interfaces and DTOs
  - `@div-flo/core` - Business logic and services
  - `@div-flo/api` - REST API and controllers

## Quick Development Setup

### Environment Configuration (root-only env)

```bash
# Create a local env file at the repo root
cp .env.example .env.local
# Edit .env.local with your preferences
```

### Available Environments

- **Local Development** (`.env.local` at repo root) - No Docker, debug logging
- **Container/Runtime**: pass env at runtime; do not rely on package-level files
- **CI/CD**: env provided by pipeline; Dockerfile used for builds

### Development Commands

```bash
# Install dependencies
npm install

# Development mode (no Docker)
npm run dev

# Build all packages
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Clean build artifacts
npm run clean
```

## Docker Development

### Docker Commands

```bash
# Build and start all services
npm run docker:up

# Production mode
npm run docker:up:prod

# Development mode
npm run docker:up:dev

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Clean rebuild
npm run docker:build
```

### Docker Environments

- **Production**: `divergent-flow-api` service
- **Development**: `div-flo-api-dev` service with hot reload

## API Endpoints

- **Health Check**: `http://localhost:8080/health`
- **Version Info**: `http://localhost:8080/version`  
- **API Documentation**: `http://localhost:8080/api-docs`
- **OpenAPI Spec**: `http://localhost:8080/openapi.json`

## Testing

```bash
# Run all tests
npm test

# Run tests in specific workspace
npm test --workspace=packages/div-flo-api
```

## Release Process

This repo uses GitHub Release Please to manage versioning and releases for the root and each package.

### How it works

- Conventional commits drive version bumps and CHANGELOG entries.
- On changes to `main`, Release Please opens/updates a release PR per component (see `release-please-config.json`).
- Merging a release PR creates a GitHub Release and tags; packages can be published by CI steps as needed.

### Developer workflow

1. Develop on a feature branch; use conventional commits (feat:, fix:, chore:, docs:, etc.).
2. Open a PR into `main`; CI runs tests.
3. After merge, Release Please will open/refresh a release PR.
4. Review the generated CHANGELOG and version in the release PR; merge it when ready.

## Package Development

### Adding New Packages

1. Create new package in `packages/` directory
2. Add to workspace in root `package.json`
3. Update `@div-flo/*` dependencies as needed
4. Add build/test scripts

### Inter-Package Dependencies

Use workspace references:

```json
{
  "dependencies": {
    "@div-flo/models": "workspace:*",
    "@div-flo/core": "workspace:*"
  }
}
```

## Common Issues & Solutions

### Port 8080 Already in Use

```bash
# Find process using port
lsof -i :8080

# Kill process if safe
kill -9 <PID>
```

### Docker Issues

```bash
# Clean restart
npm run docker:down
docker system prune -f
npm run docker:build
npm run docker:up
```

### Workspace Dependencies

```bash
# Reinstall all workspace dependencies
npm run clean
npm install

# Rebuild all packages
npm run build
```

### Database Issues (if using Prisma)

Check packages with `migration_lock.toml` for database setup.

## Development Standards

- **Node.js**: >= 18.0.0
- **TypeScript**: ^5.9.3
- **Testing**: Jest with ts-jest
- **API Documentation**: OpenAPI/Swagger
- **Environment**: dotenv for configuration
- **Containerization**: Docker Compose with multi-environment support

## Git Flow Integration

```bash
# Start new feature
git flow feature start api-enhancement

# Development workflow
npm run dev  # Make changes
npm test     # Verify tests pass
npm run lint # Check code style

# Finish feature
git flow feature finish api-enhancement

# Create a release is handled by Release Please via PRs; no local release commands needed.
```

## Monitoring & Debugging

- **Health Endpoint**: Monitor service status
- **Logs**: Use `npm run docker:logs` for containerized debugging
- **Development**: Use `npm run dev` with debugger attachment
