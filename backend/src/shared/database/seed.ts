import { getPool, closePool, sql } from './connection';
import { TrainStatus } from '../types';

/** Shape of a single train row used for seeding. */
interface SeedTrain {
  trainNumber: string;
  name: string;
  line: string;
  maxSpeed: number;
  status: TrainStatus;
}

/**
 * Realistic German fleet data for local development and testing.
 * Covers ICE, IC, and RE services with mixed operational statuses.
 */
const SEED_TRAINS: SeedTrain[] = [
  {
    trainNumber: 'ICE-101',
    name: 'Hannover Express',
    line: 'Hannover–Berlin',
    maxSpeed: 300,
    status: 'ONLINE',
  },
  {
    trainNumber: 'ICE-102',
    name: 'Hildesheim Flyer',
    line: 'Hannover–Berlin',
    maxSpeed: 300,
    status: 'ONLINE',
  },
  {
    trainNumber: 'ICE-103',
    name: 'Braunschweig Arrow',
    line: 'Hannover–Berlin',
    maxSpeed: 300,
    status: 'OFFLINE',
  },
  {
    trainNumber: 'IC-201',
    name: 'Niedersachsen Link',
    line: 'Hannover–Braunschweig',
    maxSpeed: 200,
    status: 'MAINTENANCE',
  },
  {
    trainNumber: 'IC-202',
    name: 'Wolfsburg Shuttle',
    line: 'Hannover–Wolfsburg',
    maxSpeed: 200,
    status: 'ONLINE',
  },
  {
    trainNumber: 'ICE-781',
    name: 'Hanseaten Express',
    line: 'Hamburg–München',
    maxSpeed: 320,
    status: 'ONLINE',
  },
  {
    trainNumber: 'ICE-882',
    name: 'Alpen Link',
    line: 'Hamburg–München',
    maxSpeed: 300,
    status: 'OFFLINE',
  },
  {
    trainNumber: 'RE-301',
    name: 'Leine Valley',
    line: 'Hannover–Hildesheim',
    maxSpeed: 160,
    status: 'INACTIVE',
  },
  {
    trainNumber: 'RE-302',
    name: 'Harz Connect',
    line: 'Hildesheim–Magdeburg',
    maxSpeed: 160,
    status: 'MAINTENANCE',
  },
  {
    trainNumber: 'RE-401',
    name: 'Ruhr-Schnell',
    line: 'Köln–Dortmund',
    maxSpeed: 160,
    status: 'ONLINE',
  },
];

/**
 * Checks whether a train with the given number already exists in the database.
 * @param trainNumber - Unique train identifier (e.g. ICE-101)
 * @returns True if the train is already present
 */
async function trainExists(trainNumber: string): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('train_number', sql.NVarChar(20), trainNumber)
    .query(`
      SELECT 1 AS found
      FROM trains
      WHERE train_number = @train_number
    `);

  return result.recordset.length > 0;
}

/**
 * Inserts a single train record using parameterized SQL.
 * @param train - Train data to persist
 */
async function insertTrain(train: SeedTrain): Promise<void> {
  const pool = await getPool();
  await pool
    .request()
    .input('train_number', sql.NVarChar(20), train.trainNumber)
    .input('name', sql.NVarChar(100), train.name)
    .input('line', sql.NVarChar(50), train.line)
    .input('max_speed', sql.Int, train.maxSpeed)
    .input('status', sql.NVarChar(20), train.status)
    .query(`
      INSERT INTO trains (train_number, name, line, max_speed, status)
      VALUES (@train_number, @name, @line, @max_speed, @status)
    `);
}

/**
 * Seeds the trains table with realistic test data.
 * Skips rows that already exist to keep the script idempotent.
 */
async function runSeed(): Promise<void> {
  console.log('Seeding trains...');

  let inserted = 0;
  let skipped = 0;

  for (const train of SEED_TRAINS) {
    if (await trainExists(train.trainNumber)) {
      console.log(`  ⊘ Skipped ${train.trainNumber} (already exists)`);
      skipped += 1;
      continue;
    }

    await insertTrain(train);
    console.log(`  ✓ Inserted ${train.trainNumber} — ${train.name} [${train.status}]`);
    inserted += 1;
  }

  console.log(`\nSeed complete: ${inserted} inserted, ${skipped} skipped`);
  await closePool();
}

runSeed().catch((err: Error) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
