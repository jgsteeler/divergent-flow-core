# Secret Management for Divergent Flow

This document explains how to manage secrets for the Divergent Flow application across different environments.

## Overview

The application uses a hybrid approach for configuration:

**Secrets (Fly.io secrets - sensitive):**

- `DATABASE_URL` - PostgreSQL database connection string

**Environment Variables (fly.toml - non-sensitive):**

- `OIDC_ISSUER_URL` - OIDC provider issuer URL
- `OIDC_AUDIENCE` - OIDC client audience
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)
- `APP_BASE_URL` - Base URL of the application
- `ENABLE_SWAGGER` - Whether to enable Swagger UI

## Automated Management (Recommended)

### GitHub Actions

Secrets are automatically managed through GitHub Actions workflows:

- **Staging**: `core-staging-deploy.yml` (triggers on `develop` branch pushes)
- **Production**: `fly-deploy.yml` (triggers on `main` branch pushes)

The workflows read secrets from GitHub repository secrets and set them on Fly.io before deployment.

### Required GitHub Secrets

Set these in your GitHub repository settings under "Secrets and variables" > "Actions":

#### Staging Secrets

- `STAGING_DATABASE_URL`
- `FLY_STAGING_TOKEN` (Fly.io API token for staging)

#### Production Secrets

- `PROD_DATABASE_URL`
- `FLY_API_TOKEN` (Fly.io API token for production)

**Note:** Other configuration values (OIDC, CORS, etc.) are set as environment variables in the `fly.toml` files and don't need to be secrets.

## Manual Management

### Using the Management Script

A helper script is available at `scripts/manage-secrets.sh`:

```bash
# Set staging secrets (requires environment variables to be set)
export STAGING_DATABASE_URL="postgresql://..."
export STAGING_OIDC_ISSUER_URL="https://..."
# ... set other variables
./scripts/manage-secrets.sh staging set

# List current staging secrets
./scripts/manage-secrets.sh staging list

# Validate staging secrets are set
./scripts/manage-secrets.sh staging validate

# Same commands work for production
./scripts/manage-secrets.sh prod set
./scripts/manage-secrets.sh prod list
./scripts/manage-secrets.sh prod validate
```

### Direct Fly.io Commands

You can also manage secrets directly using flyctl:

```bash
# Set a secret for staging
flyctl secrets set DATABASE_URL="your-database-url" -a divergent-flow-core-staging

# List secrets
flyctl secrets list -a divergent-flow-core-staging

# Unset a secret
flyctl secrets unset DATABASE_URL -a divergent-flow-core-staging
```

## Environment-Specific Values

### Staging

- **Database**: Neon staging database
- **OIDC**: Keycloak staging realm
- **CORS**: `https://divflow-staging.netlify.app,*.netlify.app,http://localhost:5173`
- **Base URL**: `https://divergent-flow-core-staging.fly.dev`

### Production

- **Database**: Neon production database
- **OIDC**: Keycloak production realm
- **CORS**: Production frontend URLs
- **Base URL**: `https://divergent-flow-core.fly.dev`

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use different secrets** for staging and production
3. **Rotate secrets regularly** using the management script
4. **Limit access** to GitHub secrets to trusted maintainers
5. **Use environment-specific values** - never share secrets between environments

## Troubleshooting

### Secrets not updating

- Check that GitHub Actions has permission to access the secrets
- Verify the secret names match exactly (case-sensitive)
- Check the Fly.io app name is correct

### Deployment fails

- Ensure all required secrets are set before deployment
- Check that the Fly.io API tokens have the correct permissions
- Verify the secret values are valid (e.g., valid database URLs)

### CORS issues

- Verify `CORS_ORIGINS` includes all required frontend URLs
- Check that the URLs don't have trailing slashes
- Use `*.netlify.app` for wildcard matching on Netlify subdomains
