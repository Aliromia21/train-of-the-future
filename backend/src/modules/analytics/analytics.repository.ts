import { getPool, sql } from '../../shared/database/connection';

export interface DailyStats {
  date: string;
  totalActiveTrains: number;
  avgUptimePercent: number;
  avgSpeed: number;
  totalAlerts: number;
  wifiDisconnections: number;
  passengersServed: number;
}

export interface FleetSummary {
  totalTrains: number;
  onlineTrains: number;
  offlineTrains: number;
  maintenanceTrains: number;
  inactiveTrains: number;
}

export class AnalyticsRepository {
  async getDailyStats(date: string): Promise<DailyStats | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('date', sql.Date, date)
      .query<DailyStats>(`
        SELECT
          CONVERT(VARCHAR, date, 23) AS date,
          total_active_trains AS totalActiveTrains,
          avg_uptime_percent  AS avgUptimePercent,
          avg_speed           AS avgSpeed,
          total_alerts        AS totalAlerts,
          wifi_disconnections AS wifiDisconnections,
          passengers_served   AS passengersServed
        FROM daily_stats
        WHERE date = @date
      `);
    return result.recordset[0] ?? null;
  }

  async getFleetSummary(): Promise<FleetSummary> {
    const pool = await getPool();
    const result = await pool.request().query<FleetSummary>(`
      SELECT
        COUNT(*)                                    AS totalTrains,
        SUM(CASE WHEN status = 'ONLINE'      THEN 1 ELSE 0 END) AS onlineTrains,
        SUM(CASE WHEN status = 'OFFLINE'     THEN 1 ELSE 0 END) AS offlineTrains,
        SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenanceTrains,
        SUM(CASE WHEN status = 'INACTIVE'    THEN 1 ELSE 0 END) AS inactiveTrains
      FROM trains
    `);
    return result.recordset[0];
  }
}