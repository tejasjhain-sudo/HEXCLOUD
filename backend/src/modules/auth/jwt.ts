import jwt, { type SignOptions } from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'change-me-in-production';
const signOptions: SignOptions = { expiresIn: '7d' };

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, signOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
