<template>
  <div class="alert-panel">
    <div class="panel-header">
      <h2>Active Alerts</h2>
      <span class="alert-count" :class="{ 'has-alerts': alerts.length > 0 }">
        {{ alerts.length }}
      </span>
    </div>

    <div v-if="alerts.length === 0" class="no-alerts">
      ✓ No active alerts
    </div>

    <div v-else class="alert-list">
      <div
        v-for="(alert, index) in alerts"
        :key="index"
        class="alert-item"
        :class="`severity-${alert.severity.toLowerCase()}`"
      >
        <div class="alert-header">
          <span class="severity-badge">{{ alert.severity }}</span>
          <span class="alert-type">{{ alert.type }}</span>
          <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
        </div>
        <p class="alert-message">{{ alert.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Alert {
  trainId: number;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
}

const props = defineProps<{ lastEvent: { type: string; payload: any; timestamp: string } | null }>();

const alerts = ref<Alert[]>([]);

watch(
  () => props.lastEvent,
  (event) => {
    console.log('AlertPanel received event:', event);
    if (event?.type === 'ALERT') {
      alerts.value.unshift({ ...event.payload, timestamp: event.timestamp });
      if (alerts.value.length > 20) alerts.value.pop();
    }
  },
  { deep: true } 
);

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}
</script>

<style scoped>
.alert-panel {
  background: var(--surface-800);
  border: 1px solid var(--surface-700);
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 2rem;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}
h2 { margin: 0; font-size: 1rem; color: var(--text-primary); }
.alert-count {
  background: var(--surface-700);
  color: var(--text-muted);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
}
.alert-count.has-alerts { background: #450a0a; color: var(--accent-red); }
.no-alerts { color: var(--accent-green); font-size: 0.9rem; }
.alert-list { display: flex; flex-direction: column; gap: 0.6rem; }
.alert-item {
  padding: 0.8rem;
  border-radius: 8px;
  border-left: 3px solid;
}
.severity-critical { background: #1a0505; border-color: var(--accent-red); }
.severity-high     { background: #1a0a05; border-color: var(--accent-amber); }
.severity-medium   { background: #0f1728; border-color: #3b82f6; }
.severity-low      { background: var(--surface-700); border-color: var(--text-muted); }
.alert-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.3rem;
}
.severity-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--surface-700);
  color: var(--text-muted);
}
.alert-type { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); }
.alert-time { font-size: 0.75rem; color: var(--text-muted); margin-left: auto; }
.alert-message { margin: 0; font-size: 0.82rem; color: var(--text-muted); }
</style>