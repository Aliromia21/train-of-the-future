import app from './app';
import { config } from './shared/config/env';
import { getPool, closePool } from './shared/database/connection';
import { realtimeService } from './modules/realtime/realtime.service';

async function bootstrap(): Promise<void> {
  // Try DB connection 
  try {
    await getPool();
  } catch (err) {
    console.warn(' DB connection failed — starting without database');
  }

  // Start WebSocket server
  realtimeService.init(config.ws.port);

  const server = app.listen(config.server.port, () => {
    console.log(`Server running on http://localhost:${config.server.port}`);
    console.log(`Swagger UI at http://localhost:${config.server.port}/api/docs`);
    console.log(`WebSocket on ws://localhost:${config.ws.port}`);
  });

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