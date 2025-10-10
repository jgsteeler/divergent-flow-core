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
    version: '0.1.0',
    description: 'ADHD-optimized productivity system API',
  },
  servers: getServerConfig(),
};

const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, 'controllers', '*.ts'),
    path.join(__dirname, 'server.ts')
  ], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options);