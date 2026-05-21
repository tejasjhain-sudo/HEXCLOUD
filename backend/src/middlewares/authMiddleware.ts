import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { db } from '../services/supabaseData';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser?.email) {
      return res.status(403).json({ error: 'Invalid or expired Supabase credentials' });
    }

    const dbUser = await db.upsertUserFromAuth({
      id: supabaseUser.id,
      email: supabaseUser.email,
    });

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as 'USER' | 'ADMIN',
    };

    next();
  } catch (err: unknown) {
    logger.error('Supabase token authentication failed', 'AUTH_MIDDLEWARE', err);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
};
