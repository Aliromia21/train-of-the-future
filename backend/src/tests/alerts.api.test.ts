import request from 'supertest';
import app from '../app';
import * as alertService from '../modules/alerts/alert.service';
import { AppError } from '../shared/middleware/errorHandler';

jest.mock('../modules/alerts/alert.service', () => ({
  record: jest.fn(),
  listAlerts: jest.fn(),
  resolveAlert: jest.fn(),
}));

const alert = {
  id: 7,
  trainId: 1,
  type: 'OFFLINE',
  severity: 'HIGH',
  message: 'Train 1 is offline — no signal detected',
  isResolved: false,
  createdAt: '2026-06-01T10:00:00.000Z',
  resolvedAt: null,
};

describe('Alerts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alerts', () => {
    it('returns open alerts by default', async () => {
      (alertService.listAlerts as jest.Mock).mockResolvedValue([alert]);

      const res = await request(app).get('/api/alerts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([alert]);
      expect(alertService.listAlerts).toHaveBeenCalledWith({ status: 'open' });
    });

    it('forwards status and trainId filters', async () => {
      (alertService.listAlerts as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/alerts?status=resolved&trainId=2');

      expect(res.status).toBe(200);
      expect(alertService.listAlerts).toHaveBeenCalledWith({ status: 'resolved', trainId: 2 });
    });

    it('400 when status is invalid', async () => {
      const res = await request(app).get('/api/alerts?status=closed');

      expect(res.status).toBe(400);
      expect(alertService.listAlerts).not.toHaveBeenCalled();
    });

    it('400 when trainId is not a positive integer', async () => {
      const res = await request(app).get('/api/alerts?trainId=0');

      expect(res.status).toBe(400);
      expect(alertService.listAlerts).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/alerts/:id/resolve', () => {
    it('resolves an open alert', async () => {
      (alertService.resolveAlert as jest.Mock).mockResolvedValue({
        ...alert,
        isResolved: true,
        resolvedAt: '2026-06-01T10:05:00.000Z',
      });

      const res = await request(app).patch('/api/alerts/7/resolve');

      expect(res.status).toBe(200);
      expect(res.body.data.isResolved).toBe(true);
      expect(alertService.resolveAlert).toHaveBeenCalledWith(7);
    });

    it('400 when id is invalid', async () => {
      const res = await request(app).patch('/api/alerts/abc/resolve');

      expect(res.status).toBe(400);
      expect(alertService.resolveAlert).not.toHaveBeenCalled();
    });

    it('404 when the alert does not exist', async () => {
      (alertService.resolveAlert as jest.Mock).mockRejectedValue(
        new AppError(404, 'Alert with id 99 not found'),
      );

      const res = await request(app).patch('/api/alerts/99/resolve');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Alert with id 99 not found');
    });

    it('409 when the alert is already resolved', async () => {
      (alertService.resolveAlert as jest.Mock).mockRejectedValue(
        new AppError(409, 'Alert with id 7 is already resolved'),
      );

      const res = await request(app).patch('/api/alerts/7/resolve');

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Alert with id 7 is already resolved');
    });
  });
});
