import { TelemetryRepository } from './telemetry.repository';
import { TelemetryInput } from './telemetry.validator';
import { alertEngine } from '../alerts/alert.observer';
import { getPool, sql } from '../../shared/database/connection';

const repository = new TelemetryRepository();

export class TelemetryService {
  async processTelemetry(data: TelemetryInput): Promise<void> {
    // 1. Update current state (UPSERT)
    await repository.upsertCurrentState(data);
    // 2. Append to history log (INSERT)
    await repository.appendLog(data);
    // 3. Update train status to ONLINE
    await this.updateTrainStatus(data.train_id);
    // 4. Evaluate alert rules (Observer Pattern)
    alertEngine.evaluate(data);
  }

  private async updateTrainStatus(trainId: number): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, trainId)
      .query(`UPDATE trains SET status = 'ONLINE' WHERE id = @id`);
  }
}