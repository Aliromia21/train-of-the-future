import { getPool, sql } from '../../shared/database/connection';
import { TelemetryInput } from './telemetry.validator';

export class TelemetryRepository {
  async upsertCurrentState(data: TelemetryInput): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('train_id', sql.Int, data.train_id)
      .input('speed', sql.Int, data.speed)
      .input('latitude', sql.Decimal(9, 6), data.latitude)
      .input('longitude', sql.Decimal(9, 6), data.longitude)
      .input('wifi_status', sql.NVarChar(20), data.wifi_status)
      .input('connected_passengers', sql.Int, data.connected_passengers)
      .input('signal_strength', sql.Int, data.signal_strength)
      .input('heading', sql.Decimal(5, 2), data.heading)
      .query(`
        MERGE train_telemetry AS target
        USING (SELECT
          @train_id AS train_id,
          @speed AS speed,
          @latitude AS latitude,
          @longitude AS longitude,
          @wifi_status AS wifi_status,
          @connected_passengers AS connected_passengers,
          @signal_strength AS signal_strength,
          @heading AS heading
        ) AS source ON target.train_id = source.train_id
        WHEN MATCHED THEN UPDATE SET
          speed                = source.speed,
          latitude             = source.latitude,
          longitude            = source.longitude,
          wifi_status          = source.wifi_status,
          connected_passengers = source.connected_passengers,
          signal_strength      = source.signal_strength,
          heading              = source.heading,
          updated_at           = GETDATE()
        WHEN NOT MATCHED THEN INSERT
          (train_id, speed, latitude, longitude, wifi_status, connected_passengers, signal_strength, heading)
        VALUES
          (source.train_id, source.speed, source.latitude, source.longitude,
           source.wifi_status, source.connected_passengers, source.signal_strength, source.heading);
      `);
  }

  async appendLog(data: TelemetryInput): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('train_id', sql.Int, data.train_id)
      .input('speed', sql.Int, data.speed)
      .input('latitude', sql.Decimal(9, 6), data.latitude)
      .input('longitude', sql.Decimal(9, 6), data.longitude)
      .input('wifi_status', sql.NVarChar(20), data.wifi_status)
      .input('connected_passengers', sql.Int, data.connected_passengers)
      .input('signal_strength', sql.Int, data.signal_strength)
      .query(`
        INSERT INTO telemetry_log
          (train_id, speed, latitude, longitude, wifi_status, connected_passengers, signal_strength)
        VALUES
          (@train_id, @speed, @latitude, @longitude, @wifi_status, @connected_passengers, @signal_strength)
      `);
  }
}