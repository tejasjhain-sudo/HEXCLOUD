import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { claimTrial, getTrialStatusForUser } from '../../modules/trial/trialService';
import { ipRateLimit } from '../../middlewares/apiRateLimit';

const router = Router();

router.use(jwtAuth);

router.get('/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const status = await getTrialStatusForUser(req.user!.id);
    res.json(status);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/claim',
  ipRateLimit(3, 60 * 60 * 1000),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const body = z
        .object({
          fingerprint: z.string().min(16),
          turnstileToken: z.string().min(1),
        })
        .parse(req.body);

      const trial = await claimTrial({
        userId: req.user!.id,
        ipAddress: req.ip,
        fingerprint: body.fingerprint,
        turnstileToken: body.turnstileToken,
      });

      res.json({
        message: 'Trial activated — ₹10,000 credits for 2 hours',
        trial: {
          id: trial.id,
          expiresAt: trial.expiresAt,
          creditsInr: Number(trial.creditsInr),
        },
      });
    } catch (e) {
      next(e);
    }
  },
);

export default router;
