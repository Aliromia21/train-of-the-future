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

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    const batches = migrationSQL
      .split(/^\s*GO\s*$/im)
      .map((batch) => batch.trim())
      .filter((batch) => batch.length > 0);

    for (const batch of batches) {
      await pool.request().query(batch);
    }

    console.log(`✓ Migration ${file} complete`);
  }
  await closePool();
}

runMigration().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});