import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: 3000,
    nodeEnv: 'development',
  },
  database: {
  host: '127.0.0.1',
  port: 1433,
  name: 'master',
  user: 'sa',
  password: 'Train2026db',
},
  ws: {
    port: 3001,
  },
} as const;