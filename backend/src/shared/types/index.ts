// ─── Enums ────────────────────────────────────────────────────────
export type TrainStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'INACTIVE';
export type WifiStatus = 'GOOD' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 'OFFLINE' | 'WIFI_DEGRADED' | 'SPEED_VIOLATION' | 'DELAY';

// ─── Database Entities (snake_case — mirrors DB columns) ──────────
export interface TrainEntity {
  id: number;
  train_number: string;
  name: string;
  line: string;
  max_speed: number;
  status: TrainStatus;
  created_at: Date;
}

export interface TelemetryEntity {
  train_id: number;
  speed: number;
  latitude: number;
  longitude: number;
  wifi_status: WifiStatus;
  connected_passengers: number;
  signal_strength: number;
  heading: number;
  updated_at: Date;
}

export interface AlertEntity {
  id: number;
  train_id: number;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  is_resolved: boolean;
  created_at: Date;
  resolved_at: Date | null;
}

// ─── DTOs (camelCase — what the API returns) ──────────────────────
export interface TrainDTO {
  id: number;
  trainNumber: string;
  name: string;
  line: string;
  maxSpeed: number;
  status: TrainStatus;
  createdAt: string;
}

export interface TelemetryDTO {
  trainId: number;
  speed: number;
  latitude: number;
  longitude: number;
  wifiStatus: WifiStatus;
  connectedPassengers: number;
  signalStrength: number;
  heading: number;
  updatedAt: string;
}

export interface AlertDTO {
  id: number;
  trainId: number;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

// ─── WebSocket event shapes ────────────────────────────────────────
export interface WsEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}
