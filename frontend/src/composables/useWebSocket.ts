import { ref, onUnmounted } from 'vue';

interface WsEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export function useWebSocket(url: string) {
  const isConnected = ref(false);
  const lastEvent = ref<WsEvent | null>(null);
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect(): void {
    ws = new WebSocket(url);

    ws.onopen = () => {
      isConnected.value = true;
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        lastEvent.value = JSON.parse(event.data);
      } catch {
        console.error('Invalid WebSocket message');
      }
    };

    ws.onclose = () => {
      isConnected.value = false;
      console.log('WebSocket disconnected — reconnecting in 3s...');
      reconnectTimer = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws?.close();
    };
  }

  function disconnect(): void {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
  }

  connect();
  onUnmounted(disconnect);

  return { isConnected, lastEvent };
}