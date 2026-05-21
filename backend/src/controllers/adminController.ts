import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { db, mapGpuRow, mapVpsRow } from '../services/supabaseData';
import { computeProvider } from '../services/computeProvider';
import { queueService } from '../services/queueService';
import { socketService } from '../services/socketService';
import { logger } from '../utils/logger';

export const getUsers = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await db.listUsersForAdmin());
  } catch (err) {
    next(err);
  }
};

export const suspendUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await db.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot suspend administrative accounts' });
    }
    await db.suspendUser(id);
    await logger.warn(`User ${user.email} suspended by ${req.user?.email}`, 'ADMIN');
    res.json({ message: 'User suspended successfully' });
  } catch (err) {
    next(err);
  }
};

export const getAllVps = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rows = await db.listAllVps();
    res.json(rows.map((v) => mapVpsRow(v as Record<string, unknown>)));
  } catch (err) {
    next(err);
  }
};

export const stopVpsAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const vps = await db.getVpsById(id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found' });

    await computeProvider.stopVM(id);
    const updated = await db.updateVps(id, { status: 'STOPPED' });
    await logger.info(`VPS ${id} stopped by admin ${req.user?.email}`, 'ADMIN');
    socketService.sendToUser(vps.user_id as string, 'vps_status_update', mapVpsRow(updated as Record<string, unknown>));
    res.json(mapVpsRow(updated as Record<string, unknown>));
  } catch (err) {
    next(err);
  }
};

export const suspendVpsAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const vps = await db.getVpsById(id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found' });
    const updated = await db.updateVps(id, { status: 'STOPPED', is_suspended: true });
    await logger.warn(`VPS ${id} suspended by admin ${req.user?.email}`, 'ADMIN');
    res.json(mapVpsRow(updated as Record<string, unknown>));
  } catch (err) {
    next(err);
  }
};

export const getAllGpuSessions = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rows = await db.listGpuSessions();
    res.json(rows.map((s) => mapGpuRow(s as Record<string, unknown>)));
  } catch (err) {
    next(err);
  }
};

export const stopGpuSessionAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const session = await db.getGpuSession(id);
    if (!session) return res.status(404).json({ error: 'GPU session not found' });
    await queueService.endSession(id);
    await logger.info(`GPU session ${id} terminated by admin ${req.user?.email}`, 'ADMIN');
    res.json({ message: 'GPU Session terminated successfully' });
  } catch (err) {
    next(err);
  }
};

export const getSystemLogs = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await db.listLogs(100);
    res.json(
      logs.map((l) => ({
        id: l.id,
        level: l.level,
        message: l.message,
        service: l.service,
        createdAt: l.created_at,
      })),
    );
  } catch (err) {
    next(err);
  }
};

export const getBillingOverview = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await db.getBillingOverview());
  } catch (err) {
    next(err);
  }
};

export const getTickets = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tickets = await db.listTickets();
    res.json(
      tickets.map((t) => ({
        id: t.id,
        userId: t.user_id,
        userEmail: t.userEmail,
        subject: t.subject,
        message: t.message,
        status: t.status,
        priority: t.priority,
        adminNotes: t.admin_notes,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      })),
    );
  } catch (err) {
    next(err);
  }
};

export const updateTicket = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const patch: Record<string, unknown> = {};
    if (req.body.status) patch.status = req.body.status;
    if (req.body.priority) patch.priority = req.body.priority;
    if (req.body.adminNotes !== undefined) patch.admin_notes = req.body.adminNotes;
    const updated = await db.updateTicket(id, patch);
    res.json({
      id: updated.id,
      userId: updated.user_id,
      subject: updated.subject,
      message: updated.message,
      status: updated.status,
      priority: updated.priority,
      adminNotes: updated.admin_notes,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

export const getComputeNodes = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const nodes = await db.listComputeNodes();
    res.json(
      nodes.map((n) => ({
        id: n.id,
        name: n.name,
        region: n.region,
        status: n.status,
        totalCpu: n.total_cpu,
        usedCpu: n.used_cpu,
        totalRamGb: n.total_ram_gb,
        usedRamGb: n.used_ram_gb,
        vpsCount: n.vps_count,
      })),
    );
  } catch (err) {
    next(err);
  }
};

export const updateComputeNode = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await db.updateComputeNode(id, status);
    res.json({
      id: updated.id,
      name: updated.name,
      region: updated.region,
      status: updated.status,
      totalCpu: updated.total_cpu,
      usedCpu: updated.used_cpu,
      totalRamGb: updated.total_ram_gb,
      usedRamGb: updated.used_ram_gb,
      vpsCount: updated.vps_count,
    });
  } catch (err) {
    next(err);
  }
};

/** Single request for admin dashboard — production-friendly */
export const getAdminOverview = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [users, vps, sessions, logs, tickets, nodes, billingOverview] = await Promise.all([
      db.listUsersForAdmin(),
      db.listAllVps(),
      db.listGpuSessions(),
      db.listLogs(100),
      db.listTickets(),
      db.listComputeNodes(),
      db.getBillingOverview(),
    ]);

    res.json({
      users,
      vps: vps.map((v) => mapVpsRow(v as Record<string, unknown>)),
      sessions: sessions.map((s) => mapGpuRow(s as Record<string, unknown>)),
      logs: logs.map((l) => ({
        id: l.id,
        level: l.level,
        message: l.message,
        service: l.service,
        createdAt: l.created_at,
      })),
      tickets: tickets.map((t) => ({
        id: t.id,
        userId: t.user_id,
        userEmail: t.userEmail,
        subject: t.subject,
        message: t.message,
        status: t.status,
        priority: t.priority,
        adminNotes: t.admin_notes,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      })),
      computeNodes: nodes.map((n) => ({
        id: n.id,
        name: n.name,
        region: n.region,
        status: n.status,
        totalCpu: n.total_cpu,
        usedCpu: n.used_cpu,
        totalRamGb: n.total_ram_gb,
        usedRamGb: n.used_ram_gb,
        vpsCount: n.vps_count,
      })),
      billingOverview,
    });
  } catch (err) {
    next(err);
  }
};
