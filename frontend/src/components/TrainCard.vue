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
  background: var(--surface-800);
  border: 1px solid var(--surface-700);
  border-radius: 12px;
  padding: 1.2rem;
  transition: border-color 0.2s;
}
.train-card:hover { border-color: var(--accent-blue); }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}
.train-number { font-weight: 600; color: var(--accent-cyan); font-size: 0.9rem; }
.status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 500;
}
.status-online .status-badge  { background: var(--status-online-bg); color: var(--status-online-text); }
.status-offline .status-badge { background: var(--status-offline-bg); color: var(--status-offline-text); }
.status-maintenance .status-badge { background: var(--status-maintenance-bg); color: var(--status-maintenance-text); }
.status-inactive .status-badge { background: var(--status-inactive-bg); color: var(--status-inactive-text); }
h3 { margin: 0 0 0.4rem; font-size: 1rem; color: var(--text-primary); }
.line, .speed { margin: 0.2rem 0; font-size: 0.85rem; color: var(--text-muted); }
</style>