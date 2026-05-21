import { AbuseSeverity, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { checkIpRisk } from './ipIntel';
import { verifyTurnstile } from './turnstile';
import { audit } from '../audit/auditService';

const TRIAL_COOLDOWN_DAYS = Number(process.env.TRIAL_COOLDOWN_DAYS || 30);

export interface AbuseCheckInput {
  userId?: string;
  email?: string;
  ipAddress?: string;
  fingerprint?: string;
  turnstileToken?: string;
}

export async function logAbuse(
  eventType: string,
  severity: AbuseSeverity,
  opts: AbuseCheckInput & { metadata?: Record<string, unknown>; blocked?: boolean },
) {
  await prisma.abuseLog.create({
    data: {
      userId: opts.userId,
      ipAddress: opts.ipAddress,
      fingerprint: opts.fingerprint,
      eventType,
      severity,
      metadata: opts.metadata ? (opts.metadata as Prisma.InputJsonValue) : undefined,
      blocked: opts.blocked ?? false,
    },
  });
}

export async function assertCanClaimTrial(input: AbuseCheckInput): Promise<void> {
  const { userId, ipAddress, fingerprint, turnstileToken } = input;

  if (!turnstileToken || !(await verifyTurnstile(turnstileToken, ipAddress))) {
    await logAbuse('TURNSTILE_FAILED', 'HIGH', { ...input, blocked: true });
    throw new Error('Captcha verification failed');
  }

  if (!fingerprint || fingerprint.length < 16) {
    await logAbuse('MISSING_FINGERPRINT', 'HIGH', { ...input, blocked: true });
    throw new Error('Device fingerprint required');
  }

  if (ipAddress) {
    const ipRisk = await checkIpRisk(ipAddress);
    if (ipRisk.risky) {
      await logAbuse('RISKY_IP', 'HIGH', {
        ...input,
        blocked: true,
        metadata: { reasons: ipRisk.reasons },
      });
      throw new Error('VPN, proxy, or datacenter networks are not allowed for free trials');
    }
  }

  const duplicateOr = [
    fingerprint ? { fingerprint } : undefined,
    ipAddress ? { ipAddress } : undefined,
  ].filter(Boolean) as { fingerprint?: string; ipAddress?: string }[];

  if (duplicateOr.length > 0) {
    const prior = await prisma.trial.findFirst({
      where: {
        OR: duplicateOr,
        status: { in: ['ACTIVE', 'EXPIRED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (prior) {
      if (prior.cooldownUntil && prior.cooldownUntil > new Date()) {
        await logAbuse('TRIAL_COOLDOWN', 'MEDIUM', { ...input, userId: prior.userId, blocked: true });
        throw new Error('Free trial already used on this device or network. Try again later.');
      }
      if (prior.status === 'ACTIVE' || prior.status === 'EXPIRED') {
        await logAbuse('DUPLICATE_TRIAL', 'CRITICAL', { ...input, userId: prior.userId, blocked: true });
        throw new Error('A free trial was already claimed from this device or IP');
      }
    }
  }

  if (userId) {
    const active = await prisma.trial.findFirst({
      where: { userId, status: { in: ['PENDING', 'ACTIVE'] } },
    });
    if (active) {
      throw new Error('You already have a trial on this account');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.status === 'BANNED' || user?.status === 'SUSPENDED') {
      throw new Error('Account is not eligible for trials');
    }
  }
}

export function trialCooldownDate(): Date {
  return new Date(Date.now() + TRIAL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
}

export async function notifyDiscord(title: string, body: string) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `**${title}**\n${body}` }),
    });
  } catch {
    /* ignore */
  }
}

export async function recordTrialApproved(userId: string, trialId: string) {
  await audit('TRIAL', 'ACTIVATED', `Trial ${trialId} activated`, { trialId }, userId);
  await notifyDiscord('Trial activated', `User ${userId} — trial ${trialId}`);
}
