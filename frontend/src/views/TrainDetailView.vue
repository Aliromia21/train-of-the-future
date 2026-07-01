<template>
  <div class="detail">
    <div class="detail-header">
      <button class="back-btn" @click="router.back()">← Back</button>
      <div class="train-info">
        <h1>{{ train?.trainNumber ?? '...' }}</h1>
        <span class="status-badge" :class="`status-${train?.status.toLowerCase()}`">
          {{ train?.status }}
        </span>
      </div>
    </div>

    <div v-if="!train" class="state-message">Loading...</div>

    <div v-else class="detail-grid">
      <!-- Info Card -->
      <div class="detail-card">
        <h3>Train Info</h3>
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">{{ train.name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Line</span>
          <span class="info-value">{{ train.line }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Max Speed</span>
          <span class="info-value">{{ train.maxSpeed }} km/h</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value">{{ train.status }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Created</span>
          <span class="info-value">{{ formatDate(train.createdAt) }}</span>
        </div>
      </div>

      <!-- Speed Chart -->
      <div class="detail-card">
        <h3>Speed History (last hour)</h3>
        <canvas ref="speedChartRef"></canvas>
      </div>

      <!-- WiFi Chart -->
      <div class="detail-card">
        <h3>Signal Strength (last hour)</h3>
        <canvas ref="wifiChartRef"></canvas>
      </div>

      <!-- Event Log -->
      <div class="detail-card">
        <h3>Event Log</h3>
        <div class="event-list">
          <div v-for="event in events" :key="event.time" class="event-item">
            <span class="event-time">{{ event.time }}</span>
            <span class="event-desc">{{ event.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, LineController } from 'chart.js';
import type { Train } from '../services/api';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, LineController);

const route = useRoute();
const router = useRouter();
const speedChartRef = ref<HTMLCanvasElement | null>(null);
const wifiChartRef = ref<HTMLCanvasElement | null>(null);

// Mock trains
const mockTrains: Train[] = [
  { id: 1, trainNumber: 'ICE-101', name: 'Hannover Express', line: 'Hannover–Berlin', maxSpeed: 300, status: 'ONLINE', createdAt: new Date().toISOString() },
  { id: 2, trainNumber: 'ICE-102', name: 'Hildesheim Flyer', line: 'Hannover–Berlin', maxSpeed: 300, status: 'OFFLINE', createdAt: new Date().toISOString() },
  { id: 3, trainNumber: 'IC-201', name: 'Niedersachsen Link', line: 'Hannover–Braunschweig', maxSpeed: 200, status: 'MAINTENANCE', createdAt: new Date().toISOString() },
  { id: 4, trainNumber: 'RE-301', name: 'Leine Valley', line: 'Hannover–Hildesheim', maxSpeed: 160, status: 'INACTIVE', createdAt: new Date().toISOString() },
];

const train = ref<Train | null>(null);

const events = ref([
  { time: '00:58', description: 'Telemetry received — speed 187 km/h' },
  { time: '00:53', description: 'WiFi signal degraded — 45%' },
  { time: '00:48', description: 'Entered tunnel zone' },
  { time: '00:43', description: 'Departed Hannover Hbf' },
  { time: '00:38', description: 'Telemetry received — speed 220 km/h' },
]);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE');
}

function generateTimeLabels(): string[] {
  const labels = [];
  for (let i = 59; i >= 0; i -= 5) {
    labels.push(`-${i}min`);
  }
  return labels;
}

function generateSpeedData(): number[] {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 150);
}

function generateWifiData(): number[] {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 40);
}

onMounted(() => {
  const id = Number(route.params.id);
  train.value = mockTrains.find((t) => t.id === id) ?? mockTrains[0];

  const labels = generateTimeLabels();

  if (speedChartRef.value) {
    new Chart(speedChartRef.value, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Speed (km/h)',
          data: generateSpeedData(),
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        plugins: { legend: { labels: { color: '#f1f5f9' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2d47' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2d47' } },
        },
      },
    });
  }

  if (wifiChartRef.value) {
    new Chart(wifiChartRef.value, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Signal Strength (%)',
          data: generateWifiData(),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        plugins: { legend: { labels: { color: '#f1f5f9' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2d47' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2d47' }, min: 0, max: 100 },
        },
      },
    });
  }
});
</script>

<style scoped>
.detail { padding: 2rem; }
.detail-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.back-btn {
  background: var(--surface-700);
  color: var(--text-muted);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}
.back-btn:hover { color: var(--text-primary); }
.train-info { display: flex; align-items: center; gap: 1rem; }
h1 { margin: 0; font-size: 1.5rem; color: var(--accent-cyan); }
.status-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}
.status-online      { background: var(--status-online-bg); color: var(--status-online-text); }
.status-offline     { background: var(--status-offline-bg); color: var(--status-offline-text); }
.status-maintenance { background: var(--status-maintenance-bg); color: var(--status-maintenance-text); }
.status-inactive    { background: var(--status-inactive-bg); color: var(--status-inactive-text); }
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.detail-card {
  background: var(--surface-800);
  border: 1px solid var(--surface-700);
  border-radius: 12px;
  padding: 1.5rem;
}
h3 { margin: 0 0 1rem; font-size: 0.95rem; color: var(--text-primary); }
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-700);
}
.info-row:last-child { border-bottom: none; }
.info-label { color: var(--text-muted); font-size: 0.85rem; }
.info-value { color: var(--text-primary); font-size: 0.85rem; font-weight: 500; }
.event-list { display: flex; flex-direction: column; gap: 0.5rem; }
.event-item {
  display: flex;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--surface-700);
  font-size: 0.83rem;
}
.event-item:last-child { border-bottom: none; }
.event-time { color: var(--accent-cyan); min-width: 50px; }
.event-desc { color: var(--text-muted); }
.state-message { color: var(--text-muted); text-align: center; margin-top: 4rem; }
</style>