<template>
  <div class="analytics">
    <div class="analytics-header">
      <h1>Analytics</h1>
      <span class="date-label">{{ today }}</span>
    </div>

    <!-- Fleet Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card">
        <span class="summary-value">{{ summary.totalTrains }}</span>
        <span class="summary-label">Total Trains</span>
      </div>
      <div class="summary-card online">
        <span class="summary-value">{{ summary.onlineTrains }}</span>
        <span class="summary-label">Online</span>
      </div>
      <div class="summary-card offline">
        <span class="summary-value">{{ summary.offlineTrains }}</span>
        <span class="summary-label">Offline</span>
      </div>
      <div class="summary-card maintenance">
        <span class="summary-value">{{ summary.maintenanceTrains }}</span>
        <span class="summary-label">Maintenance</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Fleet Status Distribution</h3>
        <canvas ref="statusChartRef"></canvas>
      </div>
      <div class="chart-card">
        <h3>Speed Distribution</h3>
        <canvas ref="speedChartRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController } from 'chart.js';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController);

const statusChartRef = ref<HTMLCanvasElement | null>(null);
const speedChartRef = ref<HTMLCanvasElement | null>(null);

const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Mock data 
const summary = ref({
  totalTrains: 10,
  onlineTrains: 6,
  offlineTrains: 2,
  maintenanceTrains: 1,
  inactiveTrains: 1,
});

onMounted(() => {
  // Status Chart
  if (statusChartRef.value) {
    new Chart(statusChartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Online', 'Offline', 'Maintenance', 'Inactive'],
        datasets: [{
          data: [6, 2, 1, 1],
          backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#94a3b8'],
          borderWidth: 0,
        }],
      },
      options: {
        plugins: {
          legend: {
            labels: { color: '#f1f5f9' },
          },
        },
      },
    });
  }

  // Speed Bar Chart
  if (speedChartRef.value) {
    new Chart(speedChartRef.value, {
      type: 'bar',
      data: {
        labels: ['ICE-101', 'ICE-102', 'ICE-103', 'IC-201', 'IC-202', 'IC-203', 'RE-301', 'RE-302', 'RE-303', 'S1'],
        datasets: [{
          label: 'Max Speed (km/h)',
          data: [300, 300, 300, 200, 200, 200, 160, 160, 160, 120],
          backgroundColor: '#06b6d4',
          borderRadius: 4,
        }],
      },
      options: {
        plugins: {
          legend: { labels: { color: '#f1f5f9' } },
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2d47' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2d47' } },
        },
      },
    });
  }
});
</script>

<style scoped>
.analytics { padding: 2rem; }
.analytics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
h1 { font-size: 1.5rem; color: var(--accent-cyan); margin: 0; }
.date-label { font-size: 0.85rem; color: var(--text-muted); }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
.summary-card {
  background: var(--surface-800);
  border: 1px solid var(--surface-700);
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.summary-card.online  { border-color: var(--accent-green); }
.summary-card.offline { border-color: var(--accent-red); }
.summary-card.maintenance { border-color: var(--accent-amber); }
.summary-value { font-size: 2rem; font-weight: 600; color: var(--text-primary); }
.summary-label { font-size: 0.8rem; color: var(--text-muted); }

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}
.chart-card {
  background: var(--surface-800);
  border: 1px solid var(--surface-700);
  border-radius: 12px;
  padding: 1.5rem;
}
h3 { margin: 0 0 1rem; font-size: 0.95rem; color: var(--text-primary); }
</style>