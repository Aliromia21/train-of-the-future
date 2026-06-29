import { Router, Request, Response, NextFunction } from 'express';
import { TelemetryService } from './telemetry.service';
import { telemetrySchema } from './telemetry.validator';

const router = Router();
const service = new TelemetryService();

/**
 * @openapi
 * /telemetry:
 *   post:
 *     tags: [Telemetry]
 *     summary: Receive telemetry from a train
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [train_id, speed, latitude, longitude, wifi_status, connected_passengers, signal_strength, heading, idempotency_key]
 *             properties:
 *               train_id:
 *                 type: integer
 *               speed:
 *                 type: integer
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               wifi_status:
 *                 type: string
 *                 enum: [GOOD, DEGRADED, OFFLINE, UNKNOWN]
 *               connected_passengers:
 *                 type: integer
 *               signal_strength:
 *                 type: integer
 *               heading:
 *                 type: number
 *               idempotency_key:
 *                 type: string
 *     responses:
 *       202:
 *         description: Telemetry accepted
 *       400:
 *         description: Validation error
 *       404:
 *         description: Train not found
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = telemetrySchema.parse(req.body);
    await service.processTelemetry(data);
    res.status(202).json({ success: true, message: 'Telemetry accepted' });
  } catch (err) {
    next(err);
  }
});

export default router;