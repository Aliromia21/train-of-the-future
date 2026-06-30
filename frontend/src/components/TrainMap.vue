<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import type { Train } from '../services/api';

const props = defineProps<{ trains: Train[] }>();

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
const markers: Map<number, L.Marker> = new Map();

const statusColors: Record<string, string> = {
  ONLINE: '#22c55e',
  OFFLINE: '#ef4444',
  MAINTENANCE: '#f59e0b',
  INACTIVE: '#94a3b8',
};

function createIcon(status: string): L.DivIcon {
  const color = statusColors[status] ?? '#94a3b8';
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 14px; height: 14px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 6px ${color};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// reference points
const STATIONS = [
  { name: 'Hannover Hbf',      lat: 52.3764, lon: 9.7415  },
  { name: 'Hildesheim Hbf',    lat: 52.1530, lon: 9.9509  },
  { name: 'Braunschweig Hbf',  lat: 52.2524, lon: 10.5354 },
  { name: 'Wolfsburg Hbf',     lat: 52.4279, lon: 10.7873 },
  { name: 'Magdeburg Hbf',     lat: 52.1308, lon: 11.6265 },
  { name: 'Berlin Hbf',        lat: 52.5251, lon: 13.3694 },
];

onMounted(() => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value).setView([52.35, 11.0], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  // Adding station markers
  STATIONS.forEach((station) => {
    L.circleMarker([station.lat, station.lon], {
      radius: 5,
      color: '#06b6d4',
      fillColor: '#0f1728',
      fillOpacity: 1,
      weight: 2,
    })
      .addTo(map!)
      .bindPopup(`<b>${station.name}</b>`);
  });
});

onUnmounted(() => {
  map?.remove();
  map = null;
});

// Watching for train changes and update markers
watch(
  () => props.trains,
  (trains) => {
    if (!map) return;

    trains.forEach((train) => {
      // Mocking positions based on train id for now
      const station = STATIONS[train.id % STATIONS.length];
      const lat = station.lat + (Math.random() - 0.5) * 0.1;
      const lon = station.lon + (Math.random() - 0.5) * 0.1;

      if (markers.has(train.id)) {
        markers.get(train.id)!.setLatLng([lat, lon]);
        markers.get(train.id)!.setIcon(createIcon(train.status));
      } else {
        const marker = L.marker([lat, lon], { icon: createIcon(train.status) })
          .addTo(map!)
          .bindPopup(`
            <b>${train.trainNumber}</b><br>
            ${train.name}<br>
            Status: ${train.status}<br>
            Line: ${train.line}
          `);
        markers.set(train.id, marker);
      }
    });
  },
  { immediate: true },
);
</script>

<style>
@import 'leaflet/dist/leaflet.css';

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  border: 1px solid #1e2d47;
  overflow: hidden;
}
</style>