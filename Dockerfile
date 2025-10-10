# Simplified single-stage build for Divergent Flow API
FROM node:20-bookworm-slim

# Install security updates
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies and build
RUN npm install && npm run build

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs apiuser

# Change ownership of the app directory
RUN chown -R apiuser:nodejs /app

# Switch to non-root user
USER apiuser

# Expose port 3001 (internal container port)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the API server
CMD ["node", "packages/div-flo-api/dist/server.js"]