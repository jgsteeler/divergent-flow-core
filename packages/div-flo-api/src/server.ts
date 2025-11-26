// Centralized env loading from monorepo root (no package-level .env files)
import './loadEnv';

// External dependencies
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

// Internal modules
import { configureDI, container } from './container';
import { swaggerSpec } from './swagger';
import { requestLogger, responseLogger, errorLogger, logger } from './middleware/logger';

// Controllers
import type { VersionController as VCType } from './controllers/VersionController';
import type { CaptureController as CCType } from './controllers/CaptureController';
import type { UserController as UCType } from './controllers/UserController';

// Auth
import { AuthProvider } from './auth/AuthProvider';
import { createAuthMiddleware } from './auth/authMiddleware';

let VersionController: typeof VCType;
let CaptureController: typeof CCType;
let UserController: typeof UCType;

if (process.env.NODE_ENV === 'production' || process.env.RUN_FROM_DIST === 'true') {
  VersionController = require('../dist/src/controllers/VersionController.js').VersionController as typeof VCType;
  CaptureController = require('../dist/src/controllers/CaptureController.js').CaptureController as typeof CCType;
  UserController = require('../dist/src/controllers/UserController.js').UserController as typeof UCType;
} else {
  VersionController = require('./controllers/VersionController').VersionController as typeof VCType;
  CaptureController = require('./controllers/CaptureController').CaptureController as typeof CCType;
  UserController = require('./controllers/UserController').UserController as typeof UCType;
}

// Configure dependency injection
configureDI();

// DI-resolved controller instances
const versionController = container.resolve(VersionController);
const captureController = container.resolve(CaptureController);
const userController = container.resolve(UserController);

// Auth
const authProvider = container.resolve<AuthProvider>('AuthProvider');
const authMiddleware = createAuthMiddleware(authProvider);

// Express app setup
const app = express();
const port = process.env.PORT || 3001;

// Debug: log the CORS_ORIGINS env var at startup
logger.info('[CORS] process.env.CORS_ORIGINS', { origins: process.env.CORS_ORIGINS });

// Enable CORS for local dev, UI, and Docker
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: function (origin, callback) {
    // Log the incoming origin and allowed origins for debugging
    logger.info('[CORS] Incoming Origin', { origin });
    logger.info('[CORS] Allowed Origins', { allowedOrigins });
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow exact matches or simple wildcard like *.netlify.app
    let allow = false;
    if (allowedOrigins.includes(origin)) {
      allow = true;
    } else {
      try {
        const originUrl = new URL(origin);
        const host = originUrl.hostname;
        for (const item of allowedOrigins) {
          if (item.startsWith('*.')) {
            const suffix = item.slice(2);
            if (host === suffix || host.endsWith('.' + suffix)) {
              allow = true;
              break;
            }
          }
        }
      } catch {}
    }
    
    if (allow) {
      return callback(null, true);
    } else {
      logger.warn('[CORS] Blocked Origin', { origin });
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));

// Logging middleware (order matters!)
app.use(requestLogger);
app.use(responseLogger);

app.use(express.json());

// Swagger UI (disabled by default in production unless explicitly enabled)
const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production';
if (enableSwagger) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Serve OpenAPI JSON spec at /openapi.json (not under /api-docs to avoid Swagger UI shadowing)
  app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// Root route - in non-prod, redirect to Swagger; in prod, show a minimal status
app.get('/', (req, res) => {
  if (enableSwagger) {
    return res.redirect('/api-docs');
  }
  return res.status(200).json({ service: 'divergent-flow-api', status: 'ok' });
});

// API Routes
app.use('/v1/version', versionController.getRouter());
app.use('/v1/capture', authMiddleware, captureController.getRouter());
app.use('/v1/user', authMiddleware, userController.getRouter());

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

// Alias for k8s/Cloudflare/Gateway convention consistency
/**
 * @swagger
 * /healthz:
 *   get:
 *     summary: Health check (alias)
 *     description: Alias route for health status, equivalent to /health
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'divergent-flow-api' });
});

// Error logging middleware (must be after routes)
app.use(errorLogger);

app.listen(port, () => {
  const isDocker = process.env.DOCKER === 'true';
  const externalPort = process.env.EXTERNAL_PORT || (port === 3001 ? 8080 : port);

  // Console output for immediate visibility
  console.log(`🚀 Divergent Flow API server running on port ${port}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`LOG_LEVEL: ${process.env.LOG_LEVEL}`);
  console.log(`CORS_ORIGINS: ${process.env.CORS_ORIGINS}`);
  console.log(`LOG_DIR: ${process.env.LOG_DIR}`);

  if (isDocker) {
    console.log(`📦 Docker container - Internal port: ${port}, External port: ${externalPort}`);
    console.log(`🔗 Access externally at:`);
    console.log(`   Health check: http://localhost:${externalPort}/healthz`);
    console.log(`   Version endpoint: http://localhost:${externalPort}/version`);
    console.log(`   API documentation: http://localhost:${externalPort}/api-docs`);
  } else {
    console.log(`💻 Local development:`);
    console.log(`   Health check: http://localhost:${port}/healthz`);
    console.log(`   Version endpoint: http://localhost:${port}/version`);
    console.log(`   API documentation: http://localhost:${port}/api-docs`);
  }

  logger.info('Server startup complete - Ready to handle requests');
});