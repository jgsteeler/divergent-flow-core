import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Divergent Flow API',
    version: '0.1.0',
    description: 'ADHD-optimized productivity system API',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, 'controllers', '*.ts'),
    path.join(__dirname, 'server.ts')
  ], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options);