<template>
  <div class="alert-panel">
    <div class="panel-header">
      <h2>Active Alerts</h2>
      <span class="alert-count" :class="{ 'has-alerts': alerts.length > 0 }">
        {{ alerts.length }}
      </span>
    </div>

    <p v-if="loadError" class="panel-error">{{ loadError }}</p>
    <div v-else-if="loading" class="no-alerts">Loading alerts...</div>
    <div v-else-if="alerts.length === 0" class="no-alerts">
      ✓ No active alerts
    </div>

    <div v-else class="alert-list">
      <p v-if="resolveError" class="panel-error">{{ resolveError }}</p>
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
        :class="`severity-${alert.severity.toLowerCase()}`"
      >
        <div class="alert-header">
          <span class="severity-badge">{{ alert.severity }}</span>
          <span class="alert-type">{{ alert.type }}</span>
          <span class="alert-time">{{ formatTime(alert.createdAt) }}</span>
        </div>
        <p class="alert-message">{{ alert.message }}</p>
        <button
          type="button"
          class="resolve-btn"
          :disabled="resolvingId === alert.id"
          @click="resolve(alert.id)"
        >
          {{ resolvingId === alert.id ? 'Resolving...' : 'Resolve' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { alertsApi, type Alert } from '../services/api';

const props = defineProps<{
  lastEvent: { type: string; payload: unknown; timestamp: string } | null;
}>();

const alerts = ref<Alert[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const resolveError = ref<string | null>(null);
const resolvingId = ref<number | null>(null);

function isAlert(payload: unknown): payload is Alert {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const alert = payload as Partial<Alert>;
  return typeof alert.id === 'number' && typeof alert.message === 'string' && typeof alert.createdAt === 'string';
}

function addAlert(alert: Alert): void {
  if (alerts.value.some((item) => item.id === alert.id)) {
    return;
  }
  alerts.value.unshift(alert);
}

function removeAlert(id: number): void {
  alerts.value = alerts.value.filter((alert) => alert.id !== id);
}

onMounted(async () => {
  try {
    const response = await alertsApi.listOpen();
    const incoming = response.data.data;
    const incomingIds = new Set(incoming.map((alert) => alert.id));
    const arrivedDuringLoad = alerts.value.filter((alert) => !incomingIds.has(alert.id));
    alerts.value = [...arrivedDuringLoad, ...incoming];
  } catch {
    loadError.value = 'Failed to load alerts';
  } finally {
    loading.value = false;
  }
});

watch(
  () => props.lastEvent,
  (event) => {
    if (!event) {
      return;
    }
    if (event.type === 'ALERT' && isAlert(event.payload) && !event.payload.isResolved) {
      addAlert(event.payload);
      return;
    }
    if (event.type === 'ALERT_RESOLVED' && isAlert(event.payload)) {
      removeAlert(event.payload.id);
    }
  },
);

async function resolve(id: number): Promise<void> {
  resolvingId.value = id;
  resolveError.value = null;
  try {
    await alertsApi.resolve(id);
    removeAlert(id);
  } catch {
    resolveError.value = 'Failed to resolve alert';
  } finally {
    resolvingId.value = null;
  }
}

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
.panel-error { color: var(--accent-red); font-size: 0.85rem; margin: 0 0 0.6rem; }
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
.alert-message { margin: 0 0 0.6rem; font-size: 0.82rem; color: var(--text-muted); }
.resolve-btn {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--surface-700);
  border-radius: 6px;
  padding: 0.25rem 0.7rem;
  font-size: 0.75rem;
  cursor: pointer;
}
.resolve-btn:hover:not(:disabled) { border-color: var(--accent-cyan); color: var(--accent-cyan); }
.resolve-btn:disabled { opacity: 0.6; cursor: default; }
</style>
