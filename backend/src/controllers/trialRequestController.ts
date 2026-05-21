import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { db } from '../services/supabaseData';
import { grantTestingTrial } from '../services/trialCredits';
import { logger } from '../utils/logger';

/** User submits a trial request form */
export const submitTrialRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;
    if (!userId || !email) return res.status(401).json({ error: 'Unauthorized' });

    const body = z
      .object({
        fullName: z.string().min(2, 'Name is required'),
        purpose: z.string().min(10, 'Please describe your purpose (at least 10 characters)'),
        osPreference: z.string().min(1, 'Please select an OS'),
        comments: z.string().optional(),
      })
      .parse(req.body);

    // Check if user already has a pending request
    const existing = await db.getUserLatestPendingRequest(userId);
    if (existing) {
      return res.status(409).json({ error: 'You already have a pending trial request. Please wait for admin review.' });
    }

    // Check if user already has an approved trial (active or expired)
    const requests = await db.getUserTrialRequests(userId);
    const approved = requests.find((r: Record<string, unknown>) => r.status === 'APPROVED');
    if (approved) {
      return res.status(409).json({ error: 'You have already been granted a trial.' });
    }

    const trial = await db.createTrialRequest(userId, body.fullName, body.purpose, body.osPreference, body.comments);

    await logger.info(`Trial request submitted by ${email}: "${body.purpose}"`, 'TRIAL');

    res.status(201).json({
      message: 'Trial request submitted. An admin will review it shortly.',
      request: {
        id: trial.id,
        status: trial.status,
        fullName: trial.full_name,
        purpose: trial.purpose,
        osPreference: trial.os_preference,
        comments: trial.comments,
        createdAt: trial.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** User fetches their own trial requests */
export const getMyTrialRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const requests = await db.getUserTrialRequests(userId);
    res.json(
      requests.map((r: Record<string, unknown>) => ({
        id: r.id,
        status: r.status,
        fullName: r.full_name,
        purpose: r.purpose,
        osPreference: r.os_preference,
        comments: r.comments,
        adminNote: r.admin_note,
        reviewedAt: r.reviewed_at,
        createdAt: r.created_at,
      })),
    );
  } catch (err) {
    next(err);
  }
};

/** Admin lists all trial requests */
export const listTrialRequests = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const requests = await db.listAllTrialRequests();
    res.json(
      requests.map((r: Record<string, unknown>) => ({
        id: r.id,
        userId: r.user_id,
        userEmail: (r.user as { email: string } | undefined)?.email ?? 'Unknown',
        status: r.status,
        fullName: r.full_name,
        purpose: r.purpose,
        osPreference: r.os_preference,
        comments: r.comments,
        adminNote: r.admin_note,
        reviewedBy: r.reviewed_by,
        reviewedAt: r.reviewed_at,
        createdAt: r.created_at,
      })),
    );
  } catch (err) {
    next(err);
  }
};

/** Admin approves a trial request — grants credits */
export const approveTrialRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    const adminEmail = req.user?.email;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const body = z.object({ adminNote: z.string().optional() }).parse(req.body ?? {});

    const existing = await db.getTrialRequestById(id);
    if (!existing || existing.status !== 'PENDING') {
      return res.status(404).json({ error: 'Pending trial request not found' });
    }

    // Update the request status to APPROVED
    await db.updateTrialRequest(id, {
      status: 'APPROVED',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      admin_note: body.adminNote ?? 'Approved',
    });

    // Grant trial credits to the user
    const user = await db.getUserById(existing.user_id as string);
    if (user) {
      await grantTestingTrial(user.id, user.email);
    }

    await logger.info(`Trial request ${id} approved by ${adminEmail}`, 'TRIAL');

    res.json({ message: 'Trial request approved and credits granted.' });
  } catch (err) {
    next(err);
  }
};

/** Admin rejects a trial request */
export const rejectTrialRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    const adminEmail = req.user?.email;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const body = z.object({ adminNote: z.string().optional() }).parse(req.body ?? {});

    const existing = await db.getTrialRequestById(id);
    if (!existing || existing.status !== 'PENDING') {
      return res.status(404).json({ error: 'Pending trial request not found' });
    }

    await db.updateTrialRequest(id, {
      status: 'REJECTED',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      admin_note: body.adminNote ?? 'Rejected',
    });

    await logger.info(`Trial request ${id} rejected by ${adminEmail}`, 'TRIAL');

    res.json({ message: 'Trial request rejected.' });
  } catch (err) {
    next(err);
  }
};
