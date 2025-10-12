
# --- Build Stage ---
FROM node:20-bookworm-slim AS build

RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy root and all workspace package.json files
COPY package*.json ./
COPY packages/div-flo-api/package*.json ./packages/div-flo-api/
COPY packages/div-flo-core/package*.json ./packages/div-flo-core/
COPY packages/div-flo-models/package*.json ./packages/div-flo-models/

# Install all deps and build all packages
  RUN npm install
  COPY . .
  # Build workspaces in dependency order
  RUN npm run build --workspace=@div-flo/models && npm run build --workspace=@div-flo/core && npm run build --workspace=@div-flo/api

# --- Production Stage ---
FROM node:20-bookworm-slim

RUN groupadd -r nodejs && useradd -r -g nodejs apiuser
WORKDIR /app

 # Copy built dist and package.json for all packages
COPY --from=build /build/packages/div-flo-api/dist ./packages/div-flo-api/dist
COPY --from=build /build/packages/div-flo-api/package.json ./packages/div-flo-api/package.json
COPY --from=build /build/packages/div-flo-core/dist ./packages/div-flo-core/dist
COPY --from=build /build/packages/div-flo-core/package.json ./packages/div-flo-core/package.json
COPY --from=build /build/packages/div-flo-models/dist ./packages/div-flo-models/dist
COPY --from=build /build/packages/div-flo-models/package.json ./packages/div-flo-models/package.json
COPY --from=build /build/package.json ./package.json

# Copy lockfile if present (for npm ci)

# Copy root .env file for API config
COPY --from=build /build/package-lock.json ./package-lock.json

# Install only production deps (resolves workspaces)
RUN npm install --production

RUN mkdir -p /var/log/divergent-flow && chown -R apiuser:nodejs /var/log/divergent-flow
RUN chown -R apiuser:nodejs /app
USER apiuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"
# Start the API server
CMD ["node", "/app/packages/div-flo-api/dist/server.js"]