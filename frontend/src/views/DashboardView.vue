<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Fleet Dashboard</h1>
      <span class="train-count">{{ trains.length }} trains</span>
    </div>

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
import { trainsApi, type Train } from '../services/api';

const trains = ref<Train[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  trains.value = [
    { id: 1, trainNumber: 'ICE-101', name: 'Hannover Express', line: 'Hannover–Berlin', maxSpeed: 300, status: 'ONLINE', createdAt: new Date().toISOString() },
    { id: 2, trainNumber: 'ICE-102', name: 'Hildesheim Flyer', line: 'Hannover–Berlin', maxSpeed: 300, status: 'OFFLINE', createdAt: new Date().toISOString() },
    { id: 3, trainNumber: 'IC-201', name: 'Niedersachsen Link', line: 'Hannover–Braunschweig', maxSpeed: 200, status: 'MAINTENANCE', createdAt: new Date().toISOString() },
    { id: 4, trainNumber: 'RE-301', name: 'Leine Valley', line: 'Hannover–Hildesheim', maxSpeed: 160, status: 'INACTIVE', createdAt: new Date().toISOString() },
  ];
  loading.value = false;
});
</script>

<style scoped>
.dashboard { padding: 2rem; }
.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
h1 { font-size: 1.5rem; color: #06b6d4; margin: 0; }
.train-count {
  background: #1e2d47;
  color: #94a3b8;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
}
.train-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.state-message {
  color: #94a3b8;
  text-align: center;
  margin-top: 4rem;
}
.state-message.error { color: #ef4444; }
</style>