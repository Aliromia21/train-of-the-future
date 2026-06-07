import app from './app';
import { config } from './shared/config/env';
import { getPool, closePool } from './shared/database/connection';

async function bootstrap(): Promise<void> {
  // Connect to DB
   console.log('DB CONFIG:', {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
  });
  await getPool();

  // Start HTTP server
  const server = app.listen(config.server.port, () => {
    console.log(`✓ Server running on http://localhost:${config.server.port}`);
    console.log(`✓ Swagger UI at http://localhost:${config.server.port}/api/docs`);
  });

  // Graceful shutdown
  const shutdown = async (): Promise<void> => {
    console.log('\nShutting down...');
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
