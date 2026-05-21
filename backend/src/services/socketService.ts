import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { isOriginAllowed } from '../utils/corsOrigins';

class SocketService {
  private io: SocketServer | null = null;
  private userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  init(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: (origin, callback) => {
          if (isOriginAllowed(origin)) callback(null, true);
          else callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        const sockets = this.userSockets.get(userId) || [];
        sockets.push(socket.id);
        this.userSockets.set(userId, sockets);
      }

      socket.on('disconnect', () => {
        if (userId) {
          const sockets = this.userSockets.get(userId) || [];
          const updated = sockets.filter((id) => id !== socket.id);
          if (updated.length > 0) {
            this.userSockets.set(userId, updated);
          } else {
            this.userSockets.delete(userId);
          }
        }
      });
    });
  }

  sendToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.io?.to(socketId).emit(event, data);
      });
    }
  }

  broadcastQueueUpdate() {
    if (!this.io) return;
    this.io.emit('queue_update');
  }

  broadcastSystemLog(log: any) {
    if (!this.io) return;
    this.io.emit('system_log', log);
  }
}

export const socketService = new SocketService();
