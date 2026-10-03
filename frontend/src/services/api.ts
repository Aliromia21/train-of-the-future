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

export interface Alert {
  id: number;
  trainId: number;
  type: string;
  severity: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export const trainsApi = {
  getAll: () => api.get<{ success: boolean; data: Train[] }>('/trains'),
  getById: (id: number) => api.get<{ success: boolean; data: Train }>(`/trains/${id}`),
};

export const alertsApi = {
  listOpen: () => api.get<{ success: boolean; data: Alert[] }>('/alerts', {
    params: { status: 'open' },
  }),
  resolve: (id: number) => api.patch<{ success: boolean; data: Alert }>(`/alerts/${id}/resolve`),
};

export default api;