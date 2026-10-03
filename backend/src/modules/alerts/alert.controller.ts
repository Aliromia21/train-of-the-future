import { Request, Response, NextFunction } from 'express';
import { listAlerts, resolveAlert } from './alert.service';
import { alertIdParamSchema, listAlertsQuerySchema } from './alert.schema';
import { realtimeService } from '../realtime/realtime.service';

/**
 * Handles GET /api/alerts — returns alerts filtered by status and train.
 */
export async function getAlerts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const filter = listAlertsQuerySchema.parse(req.query);
    const alerts = await listAlerts(filter);

    res.status(200).json({
      success: true,
      data: alerts,
      message: 'Alerts retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles PATCH /api/alerts/:id/resolve — closes an open alert.
 */
export async function resolveAlertById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = alertIdParamSchema.parse(req.params);
    const alert = await resolveAlert(id);

    realtimeService.broadcast({
      type: 'ALERT_RESOLVED',
      payload: alert,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully',
    });
  } catch (error) {
    next(error);
  }
}
