import { alertEngine, AlertEvent } from '../modules/alerts/alert.engine';
import { OfflineRule, WifiRule, SpeedRule } from '../modules/alerts/alert.rules';

describe('Alert Engine — Unit Tests', () => {
  beforeEach(() => {
    // Removing all the listeners before each test
    alertEngine.removeAllListeners('alert');
  });

  describe('OfflineRule', () => {
    it('fires OFFLINE alert when wifi is OFFLINE and signal is 0', () => {
      const result = OfflineRule.evaluate({
        train_id: 1,
        speed: 0,
        wifi_status: 'OFFLINE',
        signal_strength: 0,
        connected_passengers: 0,
      });
      expect(result).not.toBeNull();
      expect(result?.type).toBe('OFFLINE');
      expect(result?.severity).toBe('HIGH');
      expect(result?.trainId).toBe(1);
    });

    it('does not fire when wifi is GOOD', () => {
      const result = OfflineRule.evaluate({
        train_id: 1,
        speed: 100,
        wifi_status: 'GOOD',
        signal_strength: 80,
        connected_passengers: 100,
      });
      expect(result).toBeNull();
    });
  });

  describe('WifiRule', () => {
    it('fires WIFI_DEGRADED when signal below 50', () => {
      const result = WifiRule.evaluate({
        train_id: 2,
        speed: 120,
        wifi_status: 'DEGRADED',
        signal_strength: 30,
        connected_passengers: 50,
      });
      expect(result).not.toBeNull();
      expect(result?.type).toBe('WIFI_DEGRADED');
      expect(result?.severity).toBe('MEDIUM');
    });

    it('does not fire when signal is above 50', () => {
      const result = WifiRule.evaluate({
        train_id: 2,
        speed: 120,
        wifi_status: 'DEGRADED',
        signal_strength: 60,
        connected_passengers: 50,
      });
      expect(result).toBeNull();
    });
  });

  describe('SpeedRule', () => {
    it('fires SPEED_VIOLATION when speed exceeds 300', () => {
      const result = SpeedRule.evaluate({
        train_id: 3,
        speed: 350,
        wifi_status: 'GOOD',
        signal_strength: 80,
        connected_passengers: 200,
      });
      expect(result).not.toBeNull();
      expect(result?.type).toBe('SPEED_VIOLATION');
      expect(result?.severity).toBe('CRITICAL');
    });

    it('does not fire when speed is within limit', () => {
      const result = SpeedRule.evaluate({
        train_id: 3,
        speed: 250,
        wifi_status: 'GOOD',
        signal_strength: 80,
        connected_passengers: 200,
      });
      expect(result).toBeNull();
    });
  });

  describe('AlertEngine — Observer', () => {
    it('emits alert event when rule fires', (done) => {
      alertEngine.registerRule(SpeedRule);

      alertEngine.on('alert', (alert: AlertEvent) => {
        expect(alert.type).toBe('SPEED_VIOLATION');
        expect(alert.trainId).toBe(5);
        done();
      });

      alertEngine.evaluate({
        train_id: 5,
        speed: 400,
        wifi_status: 'GOOD',
        signal_strength: 80,
        connected_passengers: 100,
      });
    });

    it('does not emit when no rules fire', () => {
      const mockListener = jest.fn();
      alertEngine.on('alert', mockListener);

      alertEngine.evaluate({
        train_id: 5,
        speed: 100,
        wifi_status: 'GOOD',
        signal_strength: 80,
        connected_passengers: 100,
      });

      expect(mockListener).not.toHaveBeenCalled();
    });
  });
});