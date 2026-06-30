import { AnalyticsRepository, DailyStats, FleetSummary } from './analytics.repository';
import { AppError } from '../../shared/middleware/errorHandler';

const repository = new AnalyticsRepository();

export class AnalyticsService {
  async getDailyReport(date: string): Promise<DailyStats> {
    const stats = await repository.getDailyStats(date);
    if (!stats) {
      throw new AppError(404, `No data found for date ${date}`);
    }
    return stats;
  }

  async getFleetSummary(): Promise<FleetSummary> {
    return repository.getFleetSummary();
  }
}