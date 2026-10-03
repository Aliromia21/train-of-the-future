import { getPool, sql } from '../../shared/database/connection';
import { AlertEntity, AlertSeverity, AlertType } from '../../shared/types';

export class OpenAlertExistsError extends Error {
  constructor() {
    super('An open alert already exists for this train and type');
    this.name = 'OpenAlertExistsError';
  }
}

export interface NewAlertRow {
  train_id: number;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
}

export interface AlertListFilter {
  trainId?: number;
  status: 'open' | 'resolved' | 'all';
}

const ALERT_COLUMNS = `
  id, train_id, type, severity, message, is_resolved, created_at, resolved_at
`;

function mapRow(row: Record<string, unknown>): AlertEntity {
  return {
    id: row.id as number,
    train_id: row.train_id as number,
    type: row.type as AlertType,
    severity: row.severity as AlertSeverity,
    message: row.message as string,
    is_resolved: Boolean(row.is_resolved),
    created_at: row.created_at as Date,
    resolved_at: (row.resolved_at as Date | null) ?? null,
  };
}

function isDuplicateKey(err: unknown): boolean {
  const error = err as { number?: number; originalError?: { number?: number } };
  const number = error.number ?? error.originalError?.number;
  return number === 2601 || number === 2627;
}

/**
 * Returns the unresolved alert for a train and type, if one exists.
 */
export async function findOpen(trainId: number, type: AlertType): Promise<AlertEntity | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('train_id', sql.Int, trainId)
    .input('type', sql.NVarChar(30), type)
    .query(`
      SELECT TOP 1 ${ALERT_COLUMNS}
      FROM alerts
      WHERE train_id = @train_id AND type = @type AND is_resolved = 0
    `);

  const row = result.recordset[0] as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

/**
 * Inserts a new alert. Throws OpenAlertExistsError when the open-alert
 * unique index rejects a second unresolved row for the same train and type.
 */
export async function insert(input: NewAlertRow): Promise<AlertEntity> {
  const pool = await getPool();

  try {
    const result = await pool
      .request()
      .input('train_id', sql.Int, input.train_id)
      .input('type', sql.NVarChar(30), input.type)
      .input('severity', sql.NVarChar(10), input.severity)
      .input('message', sql.NVarChar(500), input.message)
      .query(`
        INSERT INTO alerts (train_id, type, severity, message)
        OUTPUT
          INSERTED.id,
          INSERTED.train_id,
          INSERTED.type,
          INSERTED.severity,
          INSERTED.message,
          INSERTED.is_resolved,
          INSERTED.created_at,
          INSERTED.resolved_at
        VALUES (@train_id, @type, @severity, @message)
      `);

    return mapRow(result.recordset[0] as Record<string, unknown>);
  } catch (err) {
    if (isDuplicateKey(err)) {
      throw new OpenAlertExistsError();
    }
    throw err;
  }
}

/**
 * Retrieves one alert by primary key.
 */
export async function findById(id: number): Promise<AlertEntity | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT ${ALERT_COLUMNS}
      FROM alerts
      WHERE id = @id
    `);

  const row = result.recordset[0] as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

/**
 * Lists alerts, optionally limited to one train and one resolution state.
 */
export async function findMany(filter: AlertListFilter): Promise<AlertEntity[]> {
  const pool = await getPool();
  const request = pool.request();
  const clauses: string[] = [];

  if (filter.status === 'open') {
    clauses.push('is_resolved = 0');
  } else if (filter.status === 'resolved') {
    clauses.push('is_resolved = 1');
  }

  if (filter.trainId !== undefined) {
    request.input('train_id', sql.Int, filter.trainId);
    clauses.push('train_id = @train_id');
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await request.query(`
    SELECT ${ALERT_COLUMNS}
    FROM alerts
    ${where}
    ORDER BY created_at DESC
  `);

  return (result.recordset as Record<string, unknown>[]).map(mapRow);
}

/**
 * Marks an unresolved alert as resolved. Returns null when no open row matched.
 */
export async function markResolved(id: number): Promise<AlertEntity | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE alerts
      SET is_resolved = 1, resolved_at = GETDATE()
      OUTPUT
        INSERTED.id,
        INSERTED.train_id,
        INSERTED.type,
        INSERTED.severity,
        INSERTED.message,
        INSERTED.is_resolved,
        INSERTED.created_at,
        INSERTED.resolved_at
      WHERE id = @id AND is_resolved = 0
    `);

  const row = result.recordset[0] as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}
