import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:5000';

class WebSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      this.socket.on('connect', () => console.log('WebSocket connected'));
      this.socket.on('disconnect', () => console.log('WebSocket disconnected'));
      this.socket.on('connect_error', (err) => console.error('WebSocket error:', err));
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToPIDUpdates(vehicleId: string, callback: (data: unknown) => void): void {
    const socket = this.connect();
    socket.emit('subscribe', { vehicleId });
    socket.on(`pid_update:${vehicleId}`, callback);
  }

  unsubscribeFromPIDUpdates(vehicleId: string): void {
    if (this.socket) {
      this.socket.emit('unsubscribe', { vehicleId });
      this.socket.off(`pid_update:${vehicleId}`);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const wsService = new WebSocketService();
export default wsService;
