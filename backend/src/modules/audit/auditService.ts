import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export async function audit(
  service: string,
  action: string,
  message: string,
  metadata?: Record<string, unknown>,
  userId?: string,
) {
  try {
    await prisma.auditLog.create({
      data: {
        service,
        action,
        message,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
        userId,
      },
    });
  } catch {
    console.error('[AUDIT]', service, action, message);
  }
}
