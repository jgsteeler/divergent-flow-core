# Archive Notice

**Status:** 🗄️ ARCHIVED - This repository is no longer actively maintained.

**Date:** December 2025

## Why This Repository Was Archived

This repository (`jgsteeler/divergent-flow-core`) along with its companion projects (`divergent-flow-cli` and `divergent-flow-ui`) represented an over-engineered solution that became too complex for an MVP stage product. While the codebase contains valuable learning and solid architectural patterns, it's time to refocus on delivering value rather than learning new technologies.

### The Problem

As the maintainer, I realized I was caught in a common trap:
- **ADHD-driven complexity**: Adding features and technologies to learn them, not because the product needed them
- **Over-engineering**: Building a full TypeScript monorepo with Prisma, dependency injection (tsyringe), and complex CI/CD before validating the core product idea
- **Analysis paralysis**: Spending more time architecting than shipping a working product
- **Lost focus**: The goal was to build a monetizable productivity tool, not a technology showcase

### The Solution: Starting Fresh with divergent-flow-mvp

A new MVP has been created using:
- **Spark AI**: Rapid prototyping tool for building the initial React app
- **JSON storage**: Simple data persistence to validate the product concept
- **Focus on value**: Getting a working product into users' hands quickly

## Reference Value

This archived codebase serves as a reference implementation for:
- **TypeScript monorepo patterns** with npm workspaces
- **Prisma ORM integration** with PostgreSQL
- **Dependency injection** using tsyringe
- **RESTful API design** with OpenAPI/Swagger
- **GitHub Flow CI/CD** with automated deployments
- **Integration testing** with Jest and test databases

## Future Architecture (Post-MVP)

Once the MVP proves the product concept and generates revenue, the plan is to:

1. **Phase 1 (Current)**: React-based MVP with JSON storage
   - Focus: Validate product-market fit
   - Timeline: Until monetization begins

2. **Phase 2 (Future)**: Professional architecture
   - **Frontend**: Migrate MVP React app into a production-ready SPA
   - **Backend**: Build .NET Core API (not TypeScript/Node.js)
   - **Gateway**: API gateway for security and routing
   - **Reference**: Use this archived codebase for patterns and lessons learned

### Why .NET Core for the Future?

While this repository used Node.js/TypeScript, the future backend will be .NET Core for:
- Enterprise-grade performance and scalability
- Strong typing and mature ecosystem
- Better hiring pool for long-term maintenance
- Personal preference and professional expertise

## Related Repositories

The following repositories are also archived as part of this transition:

- **divergent-flow-core** (this repo): Core business logic and API services
- **divergent-flow-cli**: Command-line interface tools
- **divergent-flow-ui**: User interface components

## New Project

👉 **Active Development:** [jgsteeler/divergent-flow-mvp](https://github.com/jgsteeler/divergent-flow-mvp)

The new MVP repository is where all active development is happening. Join us there!

## License

This archived code remains available under its original dual-license:
- **AGPLv3** for open-source use
- **Commercial license** available for proprietary integration

## Contact

For questions about this archived code or the new MVP project:
- GitHub Issues: [divergent-flow-mvp](https://github.com/jgsteeler/divergent-flow-mvp/issues)
- Maintainer: [@jgsteeler](https://github.com/jgsteeler)

---

**Remember**: Perfect is the enemy of shipped. Ship early, iterate based on real feedback, and only then invest in architectural complexity.
