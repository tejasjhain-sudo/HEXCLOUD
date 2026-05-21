import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { prisma } from '../../lib/prisma';
import { audit } from '../../modules/audit/auditService';

const router = Router();

router.use(jwtAuth);

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}

router.use(requireAdmin);

router.get('/overview', async (_req, res: Response, next: NextFunction) => {
  try {
    const [users, trials, vps, abuse, logs] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.trial.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.vpsInstance.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.abuseLog.findMany({
        where: { severity: { in: ['HIGH', 'CRITICAL'] } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    ]);
    res.json({ users, trials, vps, abuse, logs });
  } catch (e) {
    next(e);
  }
});

router.post('/users/:id/ban', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'BANNED' },
    });
    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: 'BAN_USER',
        targetType: 'user',
        targetId: req.params.id,
        metadata: { reason },
      },
    });
    await audit('ADMIN', 'BAN', `Banned user ${req.params.id}`, { reason }, req.user!.id);
    res.json({ message: 'User banned' });
  } catch (e) {
    next(e);
  }
});

router.post('/trials/:id/approve', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.trial.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE', approvedById: req.user!.id, startedAt: new Date() },
    });
    res.json({ message: 'Trial approved' });
  } catch (e) {
    next(e);
  }
});

router.post('/trials/:id/reject', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = z.object({ reason: z.string() }).parse(req.body);
    await prisma.trial.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', rejectedReason: reason },
    });
    res.json({ message: 'Trial rejected' });
  } catch (e) {
    next(e);
  }
});

export default router;
