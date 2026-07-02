import * as TrainsService from '../modules/trains/trainService';
import * as TrainsRepository from '../modules/trains/trainRepository';

// Mocking the repository
jest.mock('../modules/trains/trainRepository');

describe('TrainsService — Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrainById', () => {
    it('returns DTO when train exists', async () => {
      (TrainsRepository.findById as jest.Mock).mockResolvedValue({
        id: 1,
        train_number: 'ICE-101',
        name: 'Hannover Express',
        line: 'Hannover–Berlin',
        max_speed: 300,
        status: 'ONLINE',
        created_at: new Date('2026-01-01'),
      });

      const result = await TrainsService.getTrainById(1);

      expect(result.trainNumber).toBe('ICE-101');
      expect(result.maxSpeed).toBe(300);
      expect(result.status).toBe('ONLINE');
    });

    it('throws 404 when train does not exist', async () => {
      (TrainsRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(TrainsService.getTrainById(999)).rejects.toThrow();
    });
  });

  describe('DTO mapping', () => {
    it('maps snake_case entity to camelCase DTO', async () => {
      (TrainsRepository.findById as jest.Mock).mockResolvedValue({
        id: 2,
        train_number: 'RE-301',
        name: 'Leine Valley',
        line: 'Hannover–Hildesheim',
        max_speed: 160,
        status: 'INACTIVE',
        created_at: new Date('2026-06-01'),
      });

      const result = await TrainsService.getTrainById(2);

      expect(result).toHaveProperty('trainNumber');
      expect(result).toHaveProperty('maxSpeed');
      expect(result).toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('train_number');
      expect(result).not.toHaveProperty('max_speed');
    });
  });

  describe('getAllTrains', () => {
    it('returns empty array when no trains exist', async () => {
      (TrainsRepository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await TrainsService.getAllTrains();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns mapped DTOs for all trains', async () => {
      (TrainsRepository.findAll as jest.Mock).mockResolvedValue([
        { id: 1, train_number: 'ICE-101', name: 'Hannover Express', line: 'Hannover–Berlin', max_speed: 300, status: 'ONLINE', created_at: new Date() },
        { id: 2, train_number: 'ICE-102', name: 'Hildesheim Flyer', line: 'Hannover–Berlin', max_speed: 300, status: 'OFFLINE', created_at: new Date() },
      ]);

      const result = await TrainsService.getAllTrains();

      expect(result).toHaveLength(2);
      expect(result[0].trainNumber).toBe('ICE-101');
      expect(result[1].trainNumber).toBe('ICE-102');
    });
  });
});