# GitHub Flow CI/CD

This repository follows GitHub Flow with automated CI/CD pipelines.

## Workflow Overview

```
Feature Branch → PR to main → Staging Deploy → Merge → Release PR → Production Deploy
      ↓              ↓              ↓              ↓         ↓             ↓
   CI Tests    Staging Deploy   Preview      Release    Approval      Production
```

## 1. Feature Development

When you push a non-main branch:

- **CI Workflow** automatically runs
  - Builds the code
  - Runs all tests
  - Uses PostgreSQL service for integration tests

## 2. Pull Request to Main

When you create or update a PR to `main`:

- **CI Workflow** runs on the PR branch
- **Staging Deploy Workflow** automatically deploys the PR branch to staging
  - Deploys to: `divergent-flow-core-staging.fly.dev`
  - Each PR gets its own staging deployment
  - Performs health checks after deployment
  - Provides a preview of the changes before merging

## 3. Merge to Main

When a PR is merged to `main`:

- **Release Please Workflow** runs automatically
  - Analyzes conventional commits since last release
  - Creates or updates a release PR
  - Updates CHANGELOG and version numbers
  - Release PR branch name: `release-please--main--<package>`

## 4. Production Deployment

When a **Release Please PR** is merged to `main`:

- **Fly Deploy Workflow** runs automatically
  - Requires manual approval via GitHub Environment protection
  - Only deploys if the PR branch starts with `release-please--`
  - Deploys to: `divergent-flow-core.fly.dev`
  - Sets production database and Redis secrets
  - Performs health checks after deployment
  - Provides deployment summary

### Setting Up Environment Protection

To enable manual approval for production deployments:

1. Go to repository Settings → Environments
2. Create or edit the `production` environment
3. Enable "Required reviewers"
4. Add team members who can approve deployments
5. Optionally set deployment branch rules

## Workflow Files

- `.github/workflows/ci.yml` - Runs tests on all branches
- `.github/workflows/core-staging-deploy.yml` - Deploys PRs to staging
- `.github/workflows/fly-deploy.yml` - Deploys releases to production
- `.github/workflows/release-please.yml` - Creates release PRs
- `.github/workflows/conventional-pr-title.yml` - Validates PR titles

## Example Flow

1. **Create feature branch**
   ```bash
   git checkout -b feat/new-feature
   git push origin feat/new-feature
   ```
   → CI runs tests ✅

2. **Create PR to main**
   ```
   Open PR: feat/new-feature → main
   ```
   → CI runs tests ✅
   → Staging deploys to preview environment ✅

3. **Merge PR**
   ```
   Merge feat/new-feature → main
   ```
   → Release Please creates/updates release PR ✅

4. **Merge Release PR**
   ```
   Merge release-please--main--div-flo-core → main
   ```
   → Awaits manual approval 🚦
   → Deploys to production ✅

## Secrets Required

### Staging
- `FLY_STAGING_TOKEN` - Fly.io API token for staging app
- `STAGING_DATABASE_URL` - PostgreSQL connection string
- `STAGING_REDIS_URL` - Redis connection string

### Production
- `FLY_API_TOKEN` - Fly.io API token for production app
- `PROD_DATABASE_URL` - PostgreSQL connection string
- `PROD_REDIS_URL` - Redis connection string

## Benefits

- ✅ **Safe deployments**: Every change is tested and previewed before production
- ✅ **Automated releases**: Version bumps and changelogs are automated
- ✅ **Manual control**: Production deployments require approval
- ✅ **Clear history**: All releases are tagged and documented
- ✅ **Fast feedback**: See your changes in staging immediately
