import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
export const config = {
  server: {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 1433,
    name: process.env.DB_NAME || 'TrainOfTheFuture',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
  },
  ws: {
    port: Number(process.env.WS_PORT) || 3001,
  },
} as const;
