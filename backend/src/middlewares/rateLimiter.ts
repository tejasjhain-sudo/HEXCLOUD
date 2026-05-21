import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = rateLimitMap.get(ip);

    if (!record) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > limit) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfterMs: record.resetTime - now,
      });
    }

    next();
  };
};
