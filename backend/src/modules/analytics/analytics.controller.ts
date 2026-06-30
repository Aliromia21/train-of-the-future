import { Router, Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

const router = Router();
const service = new AnalyticsService();

/**
 * @openapi
 * /reports/daily:
 *   get:
 *     tags: [Analytics]
 *     summary: Get daily fleet statistics
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-06-30'
 *     responses:
 *       200:
 *         description: Daily statistics
 *       404:
 *         description: No data for this date
 */
router.get('/daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ error: 'date query parameter is required' });
      return;
    }
    const stats = await service.getDailyReport(date);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /analytics/fleet:
 *   get:
 *     tags: [Analytics]
 *     summary: Get current fleet summary
 *     responses:
 *       200:
 *         description: Fleet summary
 */
router.get('/fleet', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await service.getFleetSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

export default router;