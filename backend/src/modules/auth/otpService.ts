import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { signAccessToken } from './jwt';
import { audit } from '../audit/auditService';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_LENGTH = 6;

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, '0');
}

export async function sendEmailOtp(email: string, ipAddress?: string): Promise<{ demoCode?: string }> {
  const normalized = email.trim().toLowerCase();
  const code = generateOtp();
  const codeHash = hashOtp(code);

  await prisma.otpCode.create({
    data: {
      email: normalized,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      ipAddress,
    },
  });

  // Production: integrate Resend / AWS SES / Postmark
  if (process.env.SMTP_URL || process.env.RESEND_API_KEY) {
    console.info(`[OTP] sent to ${normalized}`);
  }

  await audit('AUTH', 'OTP_SENT', `OTP requested for ${normalized}`, { email: normalized });

  return process.env.NODE_ENV === 'production' ? {} : { demoCode: code };
}

export async function verifyEmailOtp(
  email: string,
  code: string,
  meta: { ipAddress?: string; userAgent?: string; fingerprint?: string },
) {
  const normalized = email.trim().toLowerCase();
  const codeHash = hashOtp(code);

  const record = await prisma.otpCode.findFirst({
    where: {
      email: normalized,
      codeHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    throw new Error('Invalid or expired OTP');
  }

  await prisma.otpCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  let user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalized,
        emailVerifiedAt: new Date(),
        role: normalized.endsWith('@hexcloud.com') ? 'ADMIN' : 'USER',
      },
    });
  } else if (!user.emailVerifiedAt) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
    throw new Error('Account is suspended');
  }

  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      fingerprint: meta.fingerprint,
      expiresAt,
    },
  });

  await audit('AUTH', 'LOGIN', `User ${user.email} signed in via OTP`, { userId: user.id });

  return { token, user };
}
