import { OpenAlertExistsError } from '../modules/alerts/alert.repository';
import * as alertRepository from '../modules/alerts/alert.repository';
import * as alertService from '../modules/alerts/alert.service';
import { AppError } from '../shared/middleware/errorHandler';

jest.mock('../modules/alerts/alert.repository', () => {
  const actual = jest.requireActual('../modules/alerts/alert.repository');
  return {
    ...actual,
    findOpen: jest.fn(),
    insert: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    markResolved: jest.fn(),
  };
});

const openRow = {
  id: 7,
  train_id: 1,
  type: 'OFFLINE' as const,
  severity: 'HIGH' as const,
  message: 'Train 1 is offline — no signal detected',
  is_resolved: false,
  created_at: new Date('2026-06-01T10:00:00.000Z'),
  resolved_at: null,
};

describe('Alert service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('record', () => {
    const event = {
      trainId: 1,
      type: 'OFFLINE' as const,
      severity: 'HIGH' as const,
      message: 'Train 1 is offline — no signal detected',
    };

    it('inserts and returns a DTO when no open alert exists', async () => {
      (alertRepository.findOpen as jest.Mock).mockResolvedValue(null);
      (alertRepository.insert as jest.Mock).mockResolvedValue(openRow);

      const result = await alertService.record(event);

      expect(alertRepository.insert).toHaveBeenCalledWith({
        train_id: 1,
        type: 'OFFLINE',
        severity: 'HIGH',
        message: event.message,
      });
      expect(result).toMatchObject({
        id: 7,
        trainId: 1,
        type: 'OFFLINE',
        isResolved: false,
        createdAt: '2026-06-01T10:00:00.000Z',
        resolvedAt: null,
      });
    });

    it('skips insert when an open alert of the same type already exists', async () => {
      (alertRepository.findOpen as jest.Mock).mockResolvedValue(openRow);

      const result = await alertService.record(event);

      expect(result).toBeNull();
      expect(alertRepository.insert).not.toHaveBeenCalled();
    });

    it('treats a unique-index collision as a duplicate', async () => {
      (alertRepository.findOpen as jest.Mock).mockResolvedValue(null);
      (alertRepository.insert as jest.Mock).mockRejectedValue(new OpenAlertExistsError());

      const result = await alertService.record(event);

      expect(result).toBeNull();
    });
  });

  describe('resolveAlert', () => {
    it('returns the resolved DTO', async () => {
      (alertRepository.findById as jest.Mock).mockResolvedValue(openRow);
      (alertRepository.markResolved as jest.Mock).mockResolvedValue({
        ...openRow,
        is_resolved: true,
        resolved_at: new Date('2026-06-01T10:05:00.000Z'),
      });

      const result = await alertService.resolveAlert(7);

      expect(result.isResolved).toBe(true);
      expect(result.resolvedAt).toBe('2026-06-01T10:05:00.000Z');
    });

    it('throws 404 when the alert does not exist', async () => {
      (alertRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(alertService.resolveAlert(99)).rejects.toBeInstanceOf(AppError);
      await expect(alertService.resolveAlert(99)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 409 when the alert is already resolved', async () => {
      (alertRepository.findById as jest.Mock).mockResolvedValue({
        ...openRow,
        is_resolved: true,
        resolved_at: new Date('2026-06-01T10:05:00.000Z'),
      });

      await expect(alertService.resolveAlert(7)).rejects.toMatchObject({ statusCode: 409 });
      expect(alertRepository.markResolved).not.toHaveBeenCalled();
    });
  });
});
