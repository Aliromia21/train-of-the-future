import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './shared/middleware/errorHandler';
import { notFound } from './shared/middleware/notFound';

const app = express();

// ─── Core middleware 
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── Swagger 
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Train of the Future API',
      version: '1.0.0',
      description: 'Real-time train fleet monitoring system',
    },
    servers: [{ url: '/api', description: 'API base' }],
    tags: [
      { name: 'Trains', description: 'Fleet management' },
      { name: 'Telemetry', description: 'Train sensor data' },
      { name: 'Alerts', description: 'Fleet alerts' },
      { name: 'Analytics', description: 'Statistics and reports' },
      { name: 'Health', description: 'System health' },
    ],
  },
  apis: ['./src/modules/**/*.ts'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health check 
/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: System health check
 *     responses:
 *       200:
 *         description: System is healthy
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes (to be added in next commits) 
// app.use('/api/trains', trainsRouter);
// app.use('/api/telemetry', telemetryRouter);
// app.use('/api/alerts', alertsRouter);
// app.use('/api/reports', analyticsRouter);

// ─── Error handling 
app.use(notFound);
app.use(errorHandler);

export default app;
