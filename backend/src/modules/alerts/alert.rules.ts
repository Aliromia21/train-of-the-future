import { AlertRule, TelemetryData, AlertEvent } from './alert.engine';

export const OfflineRule: AlertRule = {
  name: 'OFFLINE',
  evaluate(data: TelemetryData): AlertEvent | null {
    if (data.wifi_status === 'OFFLINE' && data.signal_strength === 0) {
      return {
        trainId: data.train_id,
        type: 'OFFLINE',
        severity: 'HIGH',
        message: `Train ${data.train_id} is offline — no signal detected`,
      };
    }
    return null;
  },
};

export const WifiRule: AlertRule = {
  name: 'WIFI_DEGRADED',
  evaluate(data: TelemetryData): AlertEvent | null {
    if (data.wifi_status === 'DEGRADED' && data.signal_strength < 50) {
      return {
        trainId: data.train_id,
        type: 'WIFI_DEGRADED',
        severity: 'MEDIUM',
        message: `Train ${data.train_id} WiFi degraded — signal strength ${data.signal_strength}%`,
      };
    }
    return null;
  },
};

export const SpeedRule: AlertRule = {
  name: 'SPEED_VIOLATION',
  evaluate(data: TelemetryData): AlertEvent | null {
    if (data.speed > 300) {
      return {
        trainId: data.train_id,
        type: 'SPEED_VIOLATION',
        severity: 'CRITICAL',
        message: `Train ${data.train_id} speed violation — ${data.speed} km/h exceeds limit`,
      };
    }
    return null;
  },
};