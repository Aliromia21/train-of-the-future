import { WebSocketServer, WebSocket } from 'ws';
import { WsEvent } from '../../shared/types';

class RealtimeService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  init(port: number): void {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`WebSocket client connected (total: ${this.clients.size})`);

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`WebSocket client disconnected (total: ${this.clients.size})`);
      });

      // Send welcome event
      this.sendToClient(ws, { type: 'CONNECTED', payload: { message: 'Connected to Train of the Future' }, timestamp: new Date().toISOString() });
    });

    console.log(`WebSocket server running on port ${port}`);
  }

  broadcast<T>(event: WsEvent<T>): void {
    const message = JSON.stringify(event);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private sendToClient<T>(ws: WebSocket, event: WsEvent<T>): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const realtimeService = new RealtimeService();