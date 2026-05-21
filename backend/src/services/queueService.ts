import { db } from './supabaseData';
import { logger } from '../utils/logger';
import { socketService } from './socketService';

const MAX_SESSION_DURATION_MS = 4 * 60 * 60 * 1000;
const MAX_CONCURRENT_GPUS = 3;

class QueueService {
  private activeTimers = new Map<string, NodeJS.Timeout>();

  constructor() {
    setInterval(() => this.cleanupExpiredSessions(), 30000);
  }

  registerSessionTimer(sessionId: string, startTime: Date) {
    const elapsed = Date.now() - startTime.getTime();
    const remaining = MAX_SESSION_DURATION_MS - elapsed;
    if (remaining <= 0) {
      this.endSession(sessionId);
    } else {
      const timer = setTimeout(() => this.endSession(sessionId), remaining);
      this.activeTimers.set(sessionId, timer);
    }
  }

  clearSessionTimer(sessionId: string) {
    const timer = this.activeTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(sessionId);
    }
  }

  async cleanupExpiredSessions() {
    try {
      const activeSessions = await db.listActiveGpuSessions();
      for (const session of activeSessions) {
        if (session.start_time) {
          const elapsed = Date.now() - new Date(session.start_time as string).getTime();
          if (elapsed >= MAX_SESSION_DURATION_MS) {
            await this.endSession(session.id as string);
          }
        }
      }
      await this.processQueue();
    } catch (e) {
      logger.error('Failed to cleanup expired GPU sessions', 'CLOUD_PC', e);
    }
  }

  async getQueueStatus(userId: string) {
    const userSession = await db.getActiveGpuSessionForUser(userId);
    if (!userSession) return null;

    if (userSession.status === 'QUEUED') {
      const preceding = await db.countQueuedBefore(userSession.created_at as string);
      return {
        session: {
          id: userSession.id,
          userId: userSession.user_id,
          gpuType: userSession.gpu_type,
          status: userSession.status,
          startTime: userSession.start_time,
          endTime: userSession.end_time,
          createdAt: userSession.created_at,
        },
        queuePosition: preceding + 1,
      };
    }

    return {
      session: {
        id: userSession.id,
        userId: userSession.user_id,
        gpuType: userSession.gpu_type,
        status: userSession.status,
        startTime: userSession.start_time,
        endTime: userSession.end_time,
        createdAt: userSession.created_at,
      },
      queuePosition: 0,
    };
  }

  async startSession(userId: string, gpuType: string) {
    const existing = await db.getActiveGpuSessionForUser(userId);
    if (existing) throw new Error('You already have an active or queued GPU session');

    const user = await db.getUserById(userId);
    if (!user || Number(user.wallet_balance) <= 0) {
      throw new Error('Insufficient wallet balance. Please add credits first.');
    }

    await db.createGpuSession({ user_id: userId, gpu_type: gpuType, status: 'QUEUED' });
    await logger.info(`User ${userId} requested GPU session. Added to queue.`, 'CLOUD_PC');
    await this.processQueue();
    socketService.broadcastQueueUpdate();
    return this.getQueueStatus(userId);
  }

  async endSession(sessionId: string) {
    const session = await db.getGpuSession(sessionId);
    if (!session || session.status === 'ENDED') return;

    this.clearSessionTimer(sessionId);

    let debitAmount = 0;
    const now = new Date().toISOString();
    if (session.start_time && session.status === 'ACTIVE') {
      const durationHours =
        (Date.now() - new Date(session.start_time as string).getTime()) / (1000 * 60 * 60);
      let hourlyRate = 0.5;
      if (session.gpu_type === 'RTX_4090') hourlyRate = 1.2;
      else if (session.gpu_type === 'RTX_3080') hourlyRate = 0.8;
      else if (session.gpu_type === 'A10G') hourlyRate = 1.5;
      debitAmount = parseFloat((durationHours * hourlyRate).toFixed(2));
    }

    await db.updateGpuSession(sessionId, { status: 'ENDED', end_time: now });
    if (debitAmount > 0) {
      await db.debitUserWallet(
        session.user_id as string,
        debitAmount,
        `Cloud PC GPU Session Charge (${session.gpu_type})`,
      );
    }

    await logger.info(`GPU session ${sessionId} ended. Wallet debited: $${debitAmount}`, 'CLOUD_PC');
    await this.processQueue();
    socketService.sendToUser(session.user_id as string, 'session_ended', { sessionId, debitAmount });
    socketService.broadcastQueueUpdate();
  }

  async processQueue() {
    const activeCount = (await db.listActiveGpuSessions()).length;
    const freeSlots = MAX_CONCURRENT_GPUS - activeCount;

    if (freeSlots > 0) {
      const nextSessions = await db.listQueuedGpuSessions(freeSlots);
      for (const session of nextSessions) {
        const startTime = new Date().toISOString();
        await db.updateGpuSession(session.id as string, { status: 'ACTIVE', start_time: startTime });
        this.registerSessionTimer(session.id as string, new Date(startTime));
        await logger.info(`GPU session ${session.id} is now ACTIVE.`, 'CLOUD_PC');
        socketService.sendToUser(session.user_id as string, 'session_active', {
          sessionId: session.id,
          startTime,
        });
      }
    }
  }
}

export const queueService = new QueueService();
