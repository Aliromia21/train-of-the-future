import { EventEmitter } from 'events';
import { AlertType, AlertSeverity } from '../../shared/types';

export interface AlertEvent {
  trainId: number;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
}

export interface AlertRule {
  name: string;
  evaluate(data: TelemetryData): AlertEvent | null;
}

export interface TelemetryData {
  train_id: number;
  speed: number;
  wifi_status: string;
  signal_strength: number;
  connected_passengers: number;
  updated_at?: Date;
}

class AlertEngine extends EventEmitter {
  private rules: AlertRule[] = [];

  registerRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  evaluate(data: TelemetryData): void {
    this.rules.forEach((rule) => {
      const alert = rule.evaluate(data);
      if (alert) {
        this.emit('alert', alert);
      }
    });
  }
}

export const alertEngine = new AlertEngine();