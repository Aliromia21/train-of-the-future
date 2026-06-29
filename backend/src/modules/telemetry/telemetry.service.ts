import { TelemetryRepository } from './telemetry.repository';
import { TelemetryInput } from './telemetry.validator';

const repository = new TelemetryRepository();

export class TelemetryService {
  async processTelemetry(data: TelemetryInput): Promise<void> {
    // 1. Update current state (UPSERT)
    await repository.upsertCurrentState(data);
    // 2. Append to history log (INSERT)
    await repository.appendLog(data);
  }
}