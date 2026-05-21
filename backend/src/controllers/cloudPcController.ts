import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { queueService } from '../services/queueService';
import { db } from '../services/supabaseData';

const startSessionSchema = z.object({
  gpuType: z.enum(['RTX_3080', 'RTX_4090', 'A10G']),
});

export const startGpuSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { gpuType } = startSessionSchema.parse(req.body);
    const sessionInfo = await queueService.startSession(userId, gpuType);
    res.status(201).json(sessionInfo);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to start GPU session';
    res.status(400).json({ error: message });
  }
};

export const endGpuSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const session = await db.getGpuSession(id);
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ error: 'GPU Session not found or access denied' });
    }
    await queueService.endSession(id);
    res.json({ message: 'GPU Session ended successfully' });
  } catch (err) {
    next(err);
  }
};

export const getSessionStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const status = await queueService.getQueueStatus(userId);
    res.json(status);
  } catch (err) {
    next(err);
  }
};
