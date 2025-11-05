# divergent-flow-core

Core business logic and API services for Divergent Flow - ADHD-optimized productivity system

## Quick Start

### Environment Setup

1. **Automated setup**: Run `./setup-env.sh` and select your environment
2. **Manual setup**: Copy `.env.example` to `.env` and customize

### Available Environments

- **Local Development** (`.env.local`) - No Docker, debug logging
- **Local Production** (`.env`) - Docker, "eat the dog food" testing
- **CI/CD Environments** (`.env.dev`, `.env.staging`, `.env.prod`) - Pipeline deployments

### Running the Application

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Local development (no Docker)
npm run dev

# Docker deployment
docker-compose up
```

### API Endpoints

- Health: `http://localhost:8080/health`
- Version: `http://localhost:8080/version`
- Documentation: `http://localhost:8080/api-docs`

## Architecture

- **@div-flo/models** - Shared interfaces and DTOs
- **@div-flo/core** - Business logic and services
- **@div-flo/api** - REST API and controllers

## License

This project is dual-licensed. The core functionalities are released under the **GNU Affero General Public License v3.0 (AGPLv3)**. This ensures that any modifications or services built upon the open-source core remain open and accessible to the community. For details, see the [LICENSE](LICENSE) file.

For commercial use-cases, such as integration into proprietary software or for use in a commercial SaaS offering without the copyleft requirements of the AGPLv3, a **commercial license** is available. Please contact the project maintainers for more information on obtaining a commercial license.