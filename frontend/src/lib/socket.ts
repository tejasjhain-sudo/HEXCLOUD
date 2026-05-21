import { io, Socket } from 'socket.io-client';
import { getApiOrigin } from './api';

let socket: Socket | null = null;

export function connectSocket(userId: string): Socket {
  if (socket?.connected) return socket;
  socket = io(getApiOrigin(), {
    query: { userId },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
