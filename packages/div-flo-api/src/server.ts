import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { configureDI, container } from './container';
import { VersionController } from './controllers/VersionController';
import { swaggerSpec } from './swagger';

// Configure dependency injection
configureDI();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Swagger UI
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

app.listen(port, () => {
  console.log(`Divergent Flow API server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Version endpoint: http://localhost:${port}/version`);
  console.log(`API documentation: http://localhost:${port}/api-docs`);
});