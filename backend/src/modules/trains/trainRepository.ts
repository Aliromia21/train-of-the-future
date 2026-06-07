import { getPool, sql } from '../../shared/database/connection';
import { TrainEntity, TrainStatus } from '../../shared/types';

/**
 * Maps a SQL Server recordset row to a TrainEntity.
 * @param row - Single row from a query result
 * @returns Typed train entity
 */
function mapRowToEntity(row: Record<string, unknown>): TrainEntity {
  return {
    id: row.id as number,
    train_number: row.train_number as string,
    name: row.name as string,
    line: row.line as string,
    max_speed: row.max_speed as number,
    status: row.status as TrainStatus,
    created_at: row.created_at as Date,
  };
}

/**
 * Retrieves all trains ordered by train number.
 * @returns All train records from the database
 */
export async function findAll(): Promise<TrainEntity[]> {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, train_number, name, line, max_speed, status, created_at
    FROM trains
    ORDER BY train_number ASC
  `);

  return result.recordset.map(mapRowToEntity);
}

/**
 * Retrieves a single train by primary key.
 * @param id - Train ID
 * @returns Train entity or null if not found
 */
export async function findById(id: number): Promise<TrainEntity | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT id, train_number, name, line, max_speed, status, created_at
      FROM trains
      WHERE id = @id
    `);

  if (result.recordset.length === 0) {
    return null;
  }

  return mapRowToEntity(result.recordset[0]);
}

/**
 * Retrieves a train by its unique train number.
 * @param trainNumber - Unique train identifier (e.g. ICE-101)
 * @returns Train entity or null if not found
 */
export async function findByTrainNumber(trainNumber: string): Promise<TrainEntity | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('train_number', sql.NVarChar(20), trainNumber)
    .query(`
      SELECT id, train_number, name, line, max_speed, status, created_at
      FROM trains
      WHERE train_number = @train_number
    `);

  if (result.recordset.length === 0) {
    return null;
  }

  return mapRowToEntity(result.recordset[0]);
}

/**
 * Inserts a new train into the database.
 * @param data - Train fields to persist
 * @returns Newly created train entity
 */
export async function create(data: {
  train_number: string;
  name: string;
  line: string;
  max_speed: number;
  status: TrainStatus;
}): Promise<TrainEntity> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('train_number', sql.NVarChar(20), data.train_number)
    .input('name', sql.NVarChar(100), data.name)
    .input('line', sql.NVarChar(50), data.line)
    .input('max_speed', sql.Int, data.max_speed)
    .input('status', sql.NVarChar(20), data.status)
    .query(`
      INSERT INTO trains (train_number, name, line, max_speed, status)
      OUTPUT INSERTED.id, INSERTED.train_number, INSERTED.name,
             INSERTED.line, INSERTED.max_speed, INSERTED.status, INSERTED.created_at
      VALUES (@train_number, @name, @line, @max_speed, @status)
    `);

  return mapRowToEntity(result.recordset[0]);
}

/**
 * Updates an existing train by primary key.
 * @param id - Train ID
 * @param data - Full set of train fields to persist
 * @returns Updated train entity or null if not found
 */
export async function update(
  id: number,
  data: {
    train_number: string;
    name: string;
    line: string;
    max_speed: number;
    status: TrainStatus;
  },
): Promise<TrainEntity | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('train_number', sql.NVarChar(20), data.train_number)
    .input('name', sql.NVarChar(100), data.name)
    .input('line', sql.NVarChar(50), data.line)
    .input('max_speed', sql.Int, data.max_speed)
    .input('status', sql.NVarChar(20), data.status)
    .query(`
      UPDATE trains
      SET train_number = @train_number,
          name = @name,
          line = @line,
          max_speed = @max_speed,
          status = @status
      OUTPUT INSERTED.id, INSERTED.train_number, INSERTED.name,
             INSERTED.line, INSERTED.max_speed, INSERTED.status, INSERTED.created_at
      WHERE id = @id
    `);

  if (result.recordset.length === 0) {
    return null;
  }

  return mapRowToEntity(result.recordset[0]);
}

/**
 * Deletes a train by primary key.
 * @param id - Train ID
 * @returns True if a row was deleted, false if not found
 */
export async function deleteById(id: number): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      DELETE FROM trains
      OUTPUT DELETED.id
      WHERE id = @id
    `);

  return result.recordset.length > 0;
}
