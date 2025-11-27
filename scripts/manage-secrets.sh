#!/bin/bash
# Secret Management Script for Divergent Flow
# This script helps manage Fly.io secrets for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if flyctl is installed
check_flyctl() {
    if ! command -v flyctl &> /dev/null; then
        print_error "flyctl is not installed. Please install it first: https://fly.io/docs/flyctl/install/"
        exit 1
    fi
}

# Set staging secrets
set_staging_secrets() {
    print_info "Setting secrets for STAGING environment..."

    # Check if required environment variables are set
    required_vars=("STAGING_DATABASE_URL")

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            print_error "Environment variable $var is not set. Please set it before running this script."
            print_info "You can set it with: export $var='your_value_here'"
            exit 1
        fi
    done

    # Set secrets
    flyctl secrets set DATABASE_URL="$STAGING_DATABASE_URL" -a divergent-flow-core-staging

    print_success "Staging secrets set successfully!"
}

# Set production secrets
set_prod_secrets() {
    print_info "Setting secrets for PRODUCTION environment..."

    # Check if required environment variables are set
    required_vars=("PROD_DATABASE_URL")

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            print_error "Environment variable $var is not set. Please set it before running this script."
            print_info "You can set it with: export $var='your_value_here'"
            exit 1
        fi
    done

    # Set secrets
    flyctl secrets set DATABASE_URL="$PROD_DATABASE_URL" -a divergent-flow-core

    print_success "Production secrets set successfully!"
}

# List secrets for an app
list_secrets() {
    local app_name=$1
    local env_name=$2

    print_info "Current secrets for $env_name ($app_name):"
    flyctl secrets list -a "$app_name"
}

# Validate secrets are set
validate_secrets() {
    local app_name=$1
    local env_name=$2

    print_info "Validating secrets for $env_name..."

    # Check if all required secrets exist
    secrets_output=$(flyctl secrets list -a "$app_name" 2>/dev/null)
    required_secrets=("DATABASE_URL")

    for secret in "${required_secrets[@]}"; do
        if echo "$secrets_output" | grep -q "$secret"; then
            print_success "$secret is set"
        else
            print_error "$secret is NOT set"
        fi
    done
}

# Main script logic
main() {
    check_flyctl

    case "${1:-help}" in
        "staging")
            case "${2:-set}" in
                "set")
                    set_staging_secrets
                    ;;
                "list")
                    list_secrets "divergent-flow-core-staging" "STAGING"
                    ;;
                "validate")
                    validate_secrets "divergent-flow-core-staging" "STAGING"
                    ;;
                *)
                    print_error "Usage: $0 staging {set|list|validate}"
                    exit 1
                    ;;
            esac
            ;;
        "prod"|"production")
            case "${2:-set}" in
                "set")
                    set_prod_secrets
                    ;;
                "list")
                    list_secrets "divergent-flow-core" "PRODUCTION"
                    ;;
                "validate")
                    validate_secrets "divergent-flow-core" "PRODUCTION"
                    ;;
                *)
                    print_error "Usage: $0 prod {set|list|validate}"
                    exit 1
                    ;;
            esac
            ;;
        "help"|"-h"|"--help")
            echo "Divergent Flow Secret Management Script"
            echo ""
            echo "Usage:"
            echo "  $0 staging {set|list|validate}  - Manage staging secrets"
            echo "  $0 prod {set|list|validate}     - Manage production secrets"
            echo ""
            echo "Commands:"
            echo "  set      - Set secrets from environment variables"
            echo "  list     - List current secrets"
            echo "  validate - Check if all required secrets are set"
            echo ""
            echo "Required environment variables for staging:"
            echo "  STAGING_DATABASE_URL"
            echo ""
            echo "Required environment variables for production:"
            echo "  PROD_DATABASE_URL"
            echo ""
            echo "Note: Other configuration (OIDC, CORS, etc.) is set via fly.toml environment variables"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"