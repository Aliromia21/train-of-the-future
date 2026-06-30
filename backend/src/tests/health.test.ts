import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('GET /api/health → 200 + status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});