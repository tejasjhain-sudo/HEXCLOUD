import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { verifyAccessToken } from '../modules/auth/jwt';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from './authMiddleware';

export async function jwtAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return res.status(401).json({ error: 'Session expired or revoked' });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
