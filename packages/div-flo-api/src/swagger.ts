import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const getServerConfig = () => {
  const isDocker = process.env.DOCKER === 'true';
  const externalPort = process.env.EXTERNAL_PORT || '8080';
  const internalPort = process.env.PORT || '3001';
  
  if (isDocker) {
    return [
      {
        url: `http://localhost:${externalPort}`,
        description: 'Docker development server (external access)',
      },
      {
        url: `http://localhost:${internalPort}`,
        description: 'Docker development server (internal)',
      },
    ];
  } else {
    return [
      {
        url: `http://localhost:${internalPort}`,
        description: 'Local development server',
      },
    ];
  }
};

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Divergent Flow API',
    version: '1',
    description: `ADHD-optimized productivity system API

## API Versioning Strategy

All API endpoints are versioned using a URL prefix (e.g., /v1/...).

- The current stable version is v1. All routes are available under /v1/.
- Breaking changes will result in a new version prefix (e.g., /v2/).
- Non-breaking, backward-compatible changes (additive, bugfix) do not increment the version.
- v1 will remain available for the lifetime of the 1.x API contract.
- Clients should always use the latest stable version prefix for new integrations.

This approach ensures clear separation of breaking changes and allows clients to migrate at their own pace.
`,
  },
  servers: getServerConfig(),
};

const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, 'controllers', '*.js'),
    path.join(__dirname, 'server.js')
  ], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options);