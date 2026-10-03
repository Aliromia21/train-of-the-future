import { alertEngine, AlertEvent } from './alert.engine';
import { OfflineRule, WifiRule, SpeedRule } from './alert.rules';
import { record } from './alert.service';
import { realtimeService } from '../realtime/realtime.service';

// Register all rules
alertEngine.registerRule(OfflineRule);
alertEngine.registerRule(WifiRule);
alertEngine.registerRule(SpeedRule);

// Persist first. Duplicates are dropped so the dashboard is not flooded.
alertEngine.on('alert', (alert: AlertEvent) => {
  void persistAndBroadcast(alert);
});

async function persistAndBroadcast(alert: AlertEvent): Promise<void> {
  const saved = await record(alert);
  if (!saved) {
    return;
  }

  console.log(`Alert [${saved.severity}] Train ${saved.trainId}: ${saved.message}`);
  realtimeService.broadcast({
    type: 'ALERT',
    payload: saved,
    timestamp: saved.createdAt,
  });
}

export { alertEngine };