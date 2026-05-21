import { prisma } from '../../lib/prisma';
import { assertCanClaimTrial, recordTrialApproved, trialCooldownDate } from '../abuse/abuseService';
import { audit } from '../audit/auditService';
import { getVpsProvider } from '../../providers/vps';

const TRIAL_DURATION_MS = 2 * 60 * 60 * 1000;
const TRIAL_CREDITS = 10_000;

export async function claimTrial(input: {
  userId: string;
  ipAddress?: string;
  fingerprint?: string;
  turnstileToken?: string;
}) {
  await assertCanClaimTrial(input);

  const expiresAt = new Date(Date.now() + TRIAL_DURATION_MS);

  const trial = await prisma.trial.create({
    data: {
      userId: input.userId,
      status: 'ACTIVE',
      creditsInr: TRIAL_CREDITS,
      startedAt: new Date(),
      expiresAt,
      ipAddress: input.ipAddress,
      fingerprint: input.fingerprint,
      turnstilePassed: true,
      cooldownUntil: trialCooldownDate(),
    },
  });

  await prisma.user.update({
    where: { id: input.userId },
    data: { walletBalance: TRIAL_CREDITS },
  });

  const provider = getVpsProvider();
  const vps = await provider.createInstance({
    userId: input.userId,
    trialId: trial.id,
    name: `trial-${trial.id.slice(0, 8)}`,
    osType: 'Ubuntu 24.04',
    cpu: 2,
    ramMb: 4096,
    storageGb: 50,
    region: 'demo-1',
  });

  await prisma.vpsInstance.create({
    data: {
      id: vps.id,
      userId: input.userId,
      trialId: trial.id,
      externalId: vps.externalId,
      provider: vps.provider,
      name: vps.name,
      status: 'PROVISIONING',
      osType: vps.osType,
      cpu: vps.cpu,
      ramMb: vps.ramMb,
      storageGb: vps.storageGb,
      ipAddress: vps.ipAddress,
      expiresAt,
    },
  });

  await recordTrialApproved(input.userId, trial.id);
  return trial;
}

export async function getTrialStatusForUser(userId: string) {
  const trial = await prisma.trial.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { vpsInstances: true },
  });

  if (!trial) {
    return { hasTrial: false, canClaim: true, step: 1 };
  }

  const now = Date.now();
  const msRemaining = trial.expiresAt ? Math.max(0, trial.expiresAt.getTime() - now) : 0;
  const active = trial.status === 'ACTIVE' && msRemaining > 0;

  return {
    hasTrial: true,
    canClaim: false,
    trial: {
      id: trial.id,
      status: trial.status,
      msRemaining,
      active,
      expiresAt: trial.expiresAt,
      creditsInr: Number(trial.creditsInr),
      vps: trial.vpsInstances,
    },
  };
}

/** Cron: expire trials and delete VPS */
export async function processExpiredTrials() {
  const expired = await prisma.trial.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: new Date() },
    },
    include: { vpsInstances: true },
  });

  const provider = getVpsProvider();

  for (const trial of expired) {
    for (const vps of trial.vpsInstances) {
      try {
        await provider.deleteInstance(vps.id, vps.externalId ?? undefined);
      } catch (e) {
        console.error('[TRIAL_EXPIRY] delete VPS', vps.id, e);
      }
      await prisma.vpsInstance.update({
        where: { id: vps.id },
        data: { status: 'DELETED' },
      });
    }

    await prisma.trial.update({
      where: { id: trial.id },
      data: { status: 'EXPIRED' },
    });

    await prisma.user.update({
      where: { id: trial.userId },
      data: { walletBalance: 0 },
    });

    await audit('TRIAL', 'EXPIRED', `Trial ${trial.id} expired`, { trialId: trial.id }, trial.userId);
  }

  return expired.length;
}
