<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Fleet Dashboard</h1>
      <div class="header-right">
        <span class="ws-indicator" :class="{ connected: isConnected }">
          {{ isConnected ? '● Live' : '○ Offline' }}
        </span>
        <span class="train-count">{{ trains.length }} trains</span>
      </div>
    </div>

    <AlertPanel :last-event="lastEvent" />
    <TrainMap :trains="trains" class="map-section" />

    <div v-if="loading" class="state-message">Loading fleet data...</div>
    <div v-else-if="error" class="state-message error">{{ error }}</div>
    <div v-else class="train-grid">
      <TrainCard
        v-for="train in trains"
        :key="train.id"
        :train="train"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TrainCard from '../components/TrainCard.vue';
import TrainMap from '../components/TrainMap.vue';
import AlertPanel from '../components/AlertPanel.vue';
import {  trainsApi , type Train } from '../services/api';
import { useWebSocket } from '../composables/useWebSocket';


const trains = ref<Train[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const { isConnected, lastEvent } = useWebSocket('ws://localhost:3001');

onMounted(async () => {
  try {
    const response = await trainsApi.getAll();
    trains.value = response.data.data;
  } catch (err) {
    error.value = 'Failed to load fleet data';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard { padding: 2rem; }
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
h1 { font-size: 1.5rem; color: var(--accent-cyan); margin: 0; }
.header-right { display: flex; align-items: center; gap: 1rem; }
.ws-indicator { font-size: 0.85rem; color: var(--accent-red); font-weight: 500; }
.ws-indicator.connected { color: var(--accent-green); }
.train-count {
  background: var(--surface-700);
  color: var(--text-muted);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
}
.map-section { margin-bottom: 2rem; }
.train-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.state-message { color: var(--text-muted); text-align: center; margin-top: 4rem; }
.state-message.error { color: var(--accent-red); }
</style>