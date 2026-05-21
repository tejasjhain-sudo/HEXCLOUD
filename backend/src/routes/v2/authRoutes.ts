import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendEmailOtp, verifyEmailOtp } from '../../modules/auth/otpService';
import { ipRateLimit } from '../../middlewares/apiRateLimit';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { prisma } from '../../lib/prisma';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

const router = Router();

router.post(
  '/otp/send',
  ipRateLimit(5, 15 * 60 * 1000),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      const result = await sendEmailOtp(email, req.ip);
      res.json({ message: 'OTP sent', ...result });
    } catch (e) {
      next(e);
    }
  },
);

router.post(
  '/otp/verify',
  ipRateLimit(10, 15 * 60 * 1000),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = z
        .object({
          email: z.string().email(),
          code: z.string().length(6),
          fingerprint: z.string().min(16).optional(),
        })
        .parse(req.body);

      const result = await verifyEmailOtp(body.email, body.code, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        fingerprint: body.fingerprint,
      });

      res.json({
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
      });
    } catch (e) {
      next(e);
    }
  },
);

router.get('/me', jwtAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    walletBalance: Number(user.walletBalance),
    emailVerified: Boolean(user.emailVerifiedAt),
  });
});

export default router;
