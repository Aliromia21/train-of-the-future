<template>
  <div class="train-card" :class="statusClass">
    <div class="card-header">
      <span class="train-number">{{ train.trainNumber }}</span>
      <span class="status-badge">{{ train.status }}</span>
    </div>
    <div class="card-body">
      <h3>{{ train.name }}</h3>
      <p class="line">{{ train.line }}</p>
      <p class="speed">Max {{ train.maxSpeed }} km/h</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Train } from '../services/api';

const props = defineProps<{ train: Train }>();

const statusClass = computed(() => ({
  'status-online': props.train.status === 'ONLINE',
  'status-offline': props.train.status === 'OFFLINE',
  'status-maintenance': props.train.status === 'MAINTENANCE',
  'status-inactive': props.train.status === 'INACTIVE',
}));
</script>

<style scoped>
.train-card {
  background: #0f1728;
  border: 1px solid #1e2d47;
  border-radius: 12px;
  padding: 1.2rem;
  transition: border-color 0.2s;
}
.train-card:hover { border-color: #3b82f6; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}
.train-number { font-weight: 600; color: #06b6d4; font-size: 0.9rem; }
.status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 500;
}
.status-online .status-badge  { background: #14532d; color: #22c55e; }
.status-offline .status-badge { background: #450a0a; color: #ef4444; }
.status-maintenance .status-badge { background: #451a03; color: #f59e0b; }
.status-inactive .status-badge { background: #1e2d47; color: #94a3b8; }
h3 { margin: 0 0 0.4rem; font-size: 1rem; color: #f1f5f9; }
.line, .speed { margin: 0.2rem 0; font-size: 0.85rem; color: #94a3b8; }
</style>