#!/bin/bash

# Divergent Flow Environment Setup Script

echo "🚀 Setting up Divergent Flow development environment..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backup created as .env.backup"
    cp .env .env.backup
fi

# Prompt for environment type
echo ""
echo "Select your environment preset:"
echo "1) Local Development (no Docker, debug logging)"
echo "2) Local Production (Docker, 'eat the dog food')" 
echo "3) Custom (copy template and edit manually)"

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        # Create local development config inline
        cat > .env << 'EOF'
# Local Development Environment
NODE_ENV=development
DOCKER=false
PORT=3001
LOG_LEVEL=debug
LOG_DIR=./logs
API_VERSION=dev-local
EOF
        echo "✅ Local development environment configured"
        echo "   Run with: npm run dev"
        ;;
    2)
        # Create local production config inline  
        cat > .env << 'EOF'
# Local Production Environment ("eat the dog food")
NODE_ENV=localProd
DOCKER=true
PORT=3001
EXTERNAL_PORT=8080
LOG_LEVEL=info
LOG_DIR=/var/log/divergent-flow
API_VERSION=0.1.2
EOF
        echo "✅ Local production environment configured"
        echo "   Run with: docker-compose up"
        ;;
    3)
        cp .env.example .env
        echo "✅ Template copied to .env - please customize before use"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🔧 Next steps:"
echo "   1. Review .env file settings"
echo "   2. Run 'npm install' if not done already"
echo "   3. Run 'npm run build' to build the project"
echo "   4. Start with Docker: 'docker-compose up' or Local: 'npm run dev'"

echo ""
echo "📝 Environment reference:"
echo "   .env.example  - Template with all options and documentation"
echo ""
echo "💡 For CI/CD environments, create .env.dev, .env.staging, .env.prod as needed"