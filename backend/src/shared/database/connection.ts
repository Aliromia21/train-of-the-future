import sql from 'mssql';
import { config } from '../config/env';

const poolConfig: sql.config = {
  server: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(poolConfig).connect();
    console.log('✓ Connected to SQL Server');

    // Pool Monitor — zeigen wir hier die aktive Verbindungen
    setInterval(() => {
      if (pool) {
        console.log(`[Pool] size=${pool.size} available=${pool.available} pending=${pool.pending}`);
      }
    }, 10000);
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('✓ SQL Server connection closed');
  }
}

export { sql };