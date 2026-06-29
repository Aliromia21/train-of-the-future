import { z } from 'zod';

export const telemetrySchema = z.object({
  train_id: z.number().int().positive(),
  speed: z.number().int().min(0).max(400),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  wifi_status: z.enum(['GOOD', 'DEGRADED', 'OFFLINE', 'UNKNOWN']),
  connected_passengers: z.number().int().min(0),
  signal_strength: z.number().int().min(0).max(100),
  heading: z.number().min(0).max(360),
  idempotency_key: z.string().min(1).max(100),
});

export type TelemetryInput = z.infer<typeof telemetrySchema>;