# Docker Setup Resume - Divergent Flow API

## Current Status (October 6, 2025)

Working on getting Docker environment running for divergent-flow API. The foundation is complete but Docker build is failing due to npm workspace dependency sync issues.

## What's Already Complete ✅

- **Core Architecture**: .NET-style DI with tsyringe, 3-package workspace (@div-flo/models, @div-flo/core, @div-flo/api)
- **API Functionality**: Express server with Swagger UI, dynamic version endpoint reading from package.json
- **Git Flow**: main/develop branches, standard-version for releases
- **Docker Files Created**: Dockerfile, docker-compose.yml, .dockerignore, npm scripts

## Current Problem 🔄

Docker build fails with npm workspace dependency version sync errors:

```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync
npm error Missing: @div-flo/models@0.1.1 from lock file
```

## Files Ready for Docker

- **Location**: `/Users/jack/code/gsc/gscprod/divergent-flow/divergent-flow-core/`
- **Dockerfile**: Multi-stage build (node:20-slim → node:20-bookworm-slim)
- **docker-compose.yml**: Port mapping 8080:3001, health checks
- **Package Scripts**: `npm run docker:dev`, `docker:build`, `docker:up`

## API Works Locally

The API runs perfectly with `npm start` from packages/div-flo-api/:

- Health: <http://localhost:3001/health>
- Version: <http://localhost:3001/version> (returns dynamic 0.1.1)
- Swagger: <http://localhost:3001/api-docs>

## Goal for Tomorrow

Get Docker container running with API accessible at <http://localhost:8080/version>

## Quick Solutions to Try

### Option 1: Simplify Dockerfile (Recommended)

Replace multi-stage build complexity with single-stage approach:

```dockerfile
FROM node:20-bookworm-slim
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "packages/div-flo-api/dist/server.js"]
```

### Option 2: Fix Workspace Dependencies

1. Delete all package-lock.json files
2. Run `npm install` from root
3. Ensure all workspace packages use `*` for internal deps

### Option 3: Skip npm ci in Docker

Change Dockerfile to use `npm install` everywhere instead of `npm ci`

## Commands to Resume

```bash
# Navigate to project
cd /Users/jack/code/gsc/gscprod/divergent-flow/divergent-flow-core

# Try current setup
npm run docker:dev

# If fails, try simplified Dockerfile
# Then: docker-compose build --no-cache
```

## Next Steps After Docker Success

1. **CLI Setup** - Create divergent-flow-cli that calls API version endpoint
2. **UI Setup** - Create divergent-flow-ui that displays version from API  
3. **VS Code Workspace** - Multi-repo workspace configuration

## Architecture Context

This is the foundation for an ADHD-optimized productivity system with clean separation:

- **Models**: Interface contracts (VersionInfo, IVersionService, IVersionRepository)
- **Core**: Business logic and repositories (VersionService, VersionRepository)  
- **API**: Express server with Swagger, DI container, controllers

The version endpoint demonstrates the full stack working together with proper dependency injection.
