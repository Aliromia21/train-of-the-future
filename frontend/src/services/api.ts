import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export interface Train {
  id: number;
  trainNumber: string;
  name: string;
  line: string;
  maxSpeed: number;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'INACTIVE';
  createdAt: string;
}

export const trainsApi = {
  getAll: () => api.get<{ success: boolean; data: Train[] }>('/trains'),
  getById: (id: number) => api.get<{ success: boolean; data: Train }>(`/trains/${id}`),
};

export default api;