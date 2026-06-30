import { TelemetryRepository } from './telemetry.repository';
import { TelemetryInput } from './telemetry.validator';
import { alertEngine } from '../alerts/alert.observer';

const repository = new TelemetryRepository();

export class TelemetryService {
  async processTelemetry(data: TelemetryInput): Promise<void> {
    // 1. Updating the current state (UPSERT)
    await repository.upsertCurrentState(data);
    // 2. Appending the history log (INSERT)
    await repository.appendLog(data);
    // 3. Evaluating the alert rules (Observer Pattern)
    alertEngine.evaluate(data);
  }
}