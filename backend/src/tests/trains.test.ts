import request from 'supertest';
import app from '../app';

describe('Trains API', () => {
  describe('POST /api/trains — validation', () => {
    it('400 when body is empty', async () => {
      const res = await request(app).post('/api/trains').send({});
      expect(res.status).toBe(400);
    });

    it('400 when train_number is missing', async () => {
      const res = await request(app)
        .post('/api/trains')
        .send({ name: 'Test', line: 'Hannover–Berlin' });
      expect(res.status).toBe(400);
    });

    it('400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/trains')
        .send({ train_number: 'ICE-999', line: 'Hannover–Berlin' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/telemetry — validation', () => {
    it('400 when body is empty', async () => {
      const res = await request(app).post('/api/telemetry').send({});
      expect(res.status).toBe(400);
    });

    it('400 when wifi_status is invalid', async () => {
      const res = await request(app)
        .post('/api/telemetry')
        .send({
          train_id: 1,
          speed: 100,
          latitude: 52.37,
          longitude: 9.74,
          wifi_status: 'INVALID',
          connected_passengers: 100,
          signal_strength: 80,
          heading: 90,
          idempotency_key: 'test-1',
        });
      expect(res.status).toBe(400);
    });
  });
});