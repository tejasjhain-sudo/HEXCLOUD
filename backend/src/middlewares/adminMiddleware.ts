import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access forbidden: Administrator privileges required' });
  }
  next();
};
