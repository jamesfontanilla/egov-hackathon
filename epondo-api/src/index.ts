import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { config } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { budgetRoutes } from './routes/budget.routes.js';
import { disbursementRoutes } from './routes/disbursement.routes.js';
import { identityRoutes } from './routes/identity.routes.js';
import { compassRoutes } from './routes/compass.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { reportRoutes } from './routes/report.routes.js';
import { auditRoutes } from './routes/audit.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';

async function main() {
  const app = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'warn',
    },
  });

  // Plugins
  await app.register(cors, {
    origin: true, // Allow all origins in dev; restrict in production
    credentials: true,
  });

  await app.register(cookie);

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // API info
  app.get('/', async () => ({
    name: 'ePondo API',
    version: '1.0.0',
    description: 'Local Governance Financial Compliance & Project Tracking System',
    docs: '/api',
  }));

  // Register routes
  await app.register(authRoutes);
  await app.register(budgetRoutes);
  await app.register(disbursementRoutes);
  await app.register(identityRoutes);
  await app.register(compassRoutes);
  await app.register(aiRoutes);
  await app.register(reportRoutes);
  await app.register(auditRoutes);
  await app.register(notificationRoutes);

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: config.nodeEnv === 'development' ? error.message : 'Internal server error',
      },
    });
  });

  // Start server
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`
╔════════════════════════════════════════════════════╗
║           🇵🇭 ePondo API Server                    ║
╠════════════════════════════════════════════════════╣
║  Status:  Running                                  ║
║  Port:    ${config.port}                                   ║
║  Env:     ${config.nodeEnv.padEnd(37)}║
║  URL:     http://localhost:${config.port}                  ║
╚════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
