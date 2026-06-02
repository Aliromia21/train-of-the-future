import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '1433', 10),
    name: process.env.DB_NAME ?? 'TrainOfTheFuture',
    user: process.env.DB_USER ?? 'sa',
    password: process.env.DB_PASSWORD ?? 'TrainPass123!',
  },
  ws: {
    port: parseInt(process.env.WS_PORT ?? '3001', 10),
  },
} as const;
