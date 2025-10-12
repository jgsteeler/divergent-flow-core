import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { configureDI, container } from './container';
import { VersionController } from './controllers/VersionController';
import { swaggerSpec } from './swagger';
import { requestLogger, responseLogger, errorLogger, logger } from './middleware/logger';

// Configure dependency injection
configureDI();

const app = express();
const port = process.env.PORT || 3001;


// Enable CORS for local dev, UI, and Docker
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));

// Logging middleware (order matters!)
app.use(requestLogger);
app.use(responseLogger);

app.use(express.json());

// Swagger UI


// Serve OpenAPI JSON spec at /openapi.json (not under /api-docs to avoid Swagger UI shadowing)
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Resolve controllers from DI container
const versionController = container.resolve(VersionController);

// Root route - redirect to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// API Routes
app.use('/version', versionController.getRouter());

// Health check (kept in server.ts as it's infrastructure)
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the API
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 service:
 *                   type: string
 *                   example: "divergent-flow-api"
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'divergent-flow-api' });
});

// Error logging middleware (must be after routes)
app.use(errorLogger);

app.listen(port, () => {
  const isDocker = process.env.DOCKER === 'true';
  const externalPort = process.env.EXTERNAL_PORT || (port === 3001 ? 8080 : port);
  
  logger.info('🚀 Divergent Flow API server started', {
    port,
    isDocker,
    externalPort,
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  });
  
  // Console output for immediate visibility
  console.log(`🚀 Divergent Flow API server running on port ${port}`);
  
  if (isDocker) {
    console.log(`📦 Docker container - Internal port: ${port}, External port: ${externalPort}`);
    console.log(`🔗 Access externally at:`);
    console.log(`   Health check: http://localhost:${externalPort}/health`);
    console.log(`   Version endpoint: http://localhost:${externalPort}/version`);
    console.log(`   API documentation: http://localhost:${externalPort}/api-docs`);
  } else {
    console.log(`💻 Local development:`);
    console.log(`   Health check: http://localhost:${port}/health`);
    console.log(`   Version endpoint: http://localhost:${port}/version`);
    console.log(`   API documentation: http://localhost:${port}/api-docs`);
  }
  
  logger.info('Server startup complete - Ready to handle requests');
});