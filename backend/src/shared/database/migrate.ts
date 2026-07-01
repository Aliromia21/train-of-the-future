import fs from 'fs';
import path from 'path';
import { getPool, closePool } from './connection';

async function runMigration(): Promise<void> {
  console.log('Running migrations...');

  const pool = await getPool();

  // Create database if not exists
  await pool.request().query(`
    IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TrainOfTheFuture')
    BEGIN
      CREATE DATABASE TrainOfTheFuture;
    END
  `);
  console.log('✓ Database TrainOfTheFuture ready');

  // Switch to TrainOfTheFuture
  await pool.request().query('USE TrainOfTheFuture');

  // Read and run migration file
  const migrationPath = path.join(__dirname, 'migrations', '001_init.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split on GO statements 
  const batches = migrationSQL
    .split(/^\s*GO\s*$/im)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  for (const batch of batches) {
    await pool.request().query(batch);
  }

  console.log('✓ Migration 001_init.sql complete');
  await closePool();
}

runMigration().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});