import { alertEngine, AlertEvent } from './alert.engine';
import { OfflineRule, WifiRule, SpeedRule } from './alert.rules';
import { realtimeService } from '../realtime/realtime.service';

// Register all rules
alertEngine.registerRule(OfflineRule);
alertEngine.registerRule(WifiRule);
alertEngine.registerRule(SpeedRule);

// Observer: broadcasting the alert via WebSocket
alertEngine.on('alert', (alert: AlertEvent) => {
  console.log(`Alert [${alert.severity}] Train ${alert.trainId}: ${alert.message}`);
  realtimeService.broadcast({
    type: 'ALERT',
    payload: alert,
    timestamp: new Date().toISOString(),
  });
});

export { alertEngine };