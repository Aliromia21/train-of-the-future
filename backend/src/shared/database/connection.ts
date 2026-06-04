import sql from 'mssql';

const poolConfig: sql.config = {
  server: 'localhost',
  port: 1433,
  database: 'master',
  user: 'sa',
  password: 'Train2026db',
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