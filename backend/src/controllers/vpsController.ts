import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, mapVpsRow } from '../services/supabaseData';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { computeProvider } from '../services/computeProvider';
import { socketService } from '../services/socketService';
import { logger } from '../utils/logger';
import {
  VPS_TIERS,
  VPS_MAX_CPU,
  VPS_MAX_RAM_MB,
  getVpsTierById,
  resolveVpsTier,
  formatInr,
} from '../config/vpsPricing';
import { effectiveWalletBalance, allocateOnDemoNode, ensureDemoComputeNode } from '../services/trialCredits';

const tierIdEnum = z.enum(['1gb-2cpu', '2gb-2cpu', '4gb-2cpu', '8gb-2cpu', '16gb-2cpu']);

const createVpsSchema = z
  .object({
    name: z.string().min(3).max(30),
    osType: z.enum(['Ubuntu 22.04', 'Ubuntu 24.04', 'Debian 12', 'CentOS 9', 'Windows Server 2022']),
    tierId: tierIdEnum.optional(),
    cpu: z.number().min(1).max(VPS_MAX_CPU).optional(),
    ram: z.number().min(512).max(VPS_MAX_RAM_MB).optional(),
    storage: z.number().min(10).max(500).default(50),
  })
  .refine((d) => d.tierId || (d.cpu != null && d.ram != null), {
    message: 'Provide tierId or both cpu and ram',
  });

export const getVpsPlans = async (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    currency: 'INR',
    maxCpu: VPS_MAX_CPU,
    maxRamMb: VPS_MAX_RAM_MB,
    tiers: VPS_TIERS.map((t) => ({
      id: t.id,
      label: t.label,
      cpu: t.cpu,
      ramMb: t.ramMb,
      ramGb: t.ramMb / 1024,
      priceInr: t.priceInr,
      priceLabel: formatInr(t.priceInr),
    })),
  });
};

export const createVps = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const validated = createVpsSchema.parse(req.body);

    const tier =
      (validated.tierId ? getVpsTierById(validated.tierId) : undefined) ??
      (validated.cpu != null && validated.ram != null
        ? resolveVpsTier(validated.cpu, validated.ram)
        : undefined);

    if (!tier) {
      return res.status(400).json({
        error: `Invalid VPS size. Choose a plan: ${VPS_TIERS.map((t) => t.label).join(', ')} (max ${VPS_MAX_RAM_MB / 1024} GB RAM, ${VPS_MAX_CPU} vCPU).`,
      });
    }

    const user = await db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const demoNodeId = await ensureDemoComputeNode();
    if (!demoNodeId) {
      return res.status(503).json({
        error: 'Demo compute node is unavailable. Run supabase_trial_credits_migration.sql in Supabase.',
      });
    }

    const balance = effectiveWalletBalance(user);
    if (balance < tier.priceInr) {
      const trialHint = user.trial_expires_at
        ? ' Testing credits may have expired (2 hour limit).'
        : '';
      return res.status(403).json({
        error: `Insufficient credits. ${tier.label} costs ${formatInr(tier.priceInr)}. Your balance: ${formatInr(balance)}.${trialHint}`,
      });
    }

    await db.debitUserWallet(
      userId,
      tier.priceInr,
      `VPS deployed — ${tier.label} (${formatInr(tier.priceInr)})`,
    );

    await computeProvider.createVM({
      name: validated.name,
      cpu: tier.cpu,
      ram: tier.ramMb,
      storage: validated.storage,
      osType: validated.osType,
    });

    const vps = await db.createVps({
      user_id: userId,
      name: validated.name,
      cpu: tier.cpu,
      ram: tier.ramMb,
      storage: validated.storage,
      os_type: validated.osType,
      status: 'PROVISIONING',
      ip_address: 'Pending...',
    });

    await allocateOnDemoNode(tier.cpu, tier.ramMb);

    await logger.info(`VPS ${vps.id} creation requested by user ${userId}`, 'VPS');

    const vpsId = vps.id as string;
    setTimeout(async () => {
      try {
        const randomIp = `185.220.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        const updatedVps = await db.updateVps(vpsId, { status: 'RUNNING', ip_address: randomIp });
        await logger.info(`VPS ${vpsId} provisioned. IP: ${randomIp}`, 'VPS');
        socketService.sendToUser(userId, 'vps_status_update', mapVpsRow(updatedVps as Record<string, unknown>));
      } catch (err) {
        logger.error(`Failed to complete provisioning for VPS ${vpsId}`, 'VPS', err);
      }
    }, 5000);

    res.status(201).json(mapVpsRow(vps as Record<string, unknown>));
  } catch (err) {
    next(err);
  }
};

export const startVps = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const vps = await db.findUserVps(userId, id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found or access denied' });
    await computeProvider.startVM(id);
    const updated = await db.updateVps(id, { status: 'RUNNING' });
    await logger.info(`VPS ${id} started by user ${userId}`, 'VPS');
    const mapped = mapVpsRow(updated as Record<string, unknown>);
    socketService.sendToUser(userId, 'vps_status_update', mapped);
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

export const stopVps = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const vps = await db.findUserVps(userId, id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found or access denied' });
    await computeProvider.stopVM(id);
    const updated = await db.updateVps(id, { status: 'STOPPED' });
    await logger.info(`VPS ${id} stopped by user ${userId}`, 'VPS');
    const mapped = mapVpsRow(updated as Record<string, unknown>);
    socketService.sendToUser(userId, 'vps_status_update', mapped);
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

export const deleteVps = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const vps = await db.findUserVps(userId, id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found or access denied' });
    await computeProvider.deleteVM(id);
    await db.deleteVps(id);
    await logger.info(`VPS ${id} deleted by user ${userId}`, 'VPS');
    socketService.sendToUser(userId, 'vps_deleted', { id });
    res.json({ message: 'VPS instance deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getUserVps = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const instances = await db.listUserVps(userId);
    res.json(instances.map((v) => mapVpsRow(v as Record<string, unknown>)));
  } catch (err) {
    next(err);
  }
};

// GET /api/vps/:id -> Get specific VPS details
export const getVpsDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (id === 'hex-sandbox-32gb') {
      return res.json({
        id: 'hex-sandbox-32gb',
        name: 'HEX-TEST-32GB-NODE',
        ipAddress: '185.190.140.55',
        osType: 'Ubuntu 24.04 LTS',
        cpu: 8,
        ram: 32768,
        storage: 250,
        status: 'RUNNING',
        createdAt: new Date().toISOString(),
      });
    }

    const vps = await db.findUserVps(userId!, id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found or access denied' });
    res.json(mapVpsRow(vps as Record<string, unknown>));
  } catch (err) {
    next(err);
  }
};

// POST /api/vps/start -> Start VM via POST body
export const startVpsBody = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing instance ID in request body' });

    if (id === 'hex-sandbox-32gb') {
      return res.json({ id, status: 'RUNNING', message: 'Sandbox node booted successfully' });
    }

    const vps = await db.findUserVps(userId!, id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found or access denied' });
    await computeProvider.startVM(id);
    const updated = await db.updateVps(id, { status: 'RUNNING' });
    await logger.info(`VPS ${id} started via REST API by user ${userId}`, 'VPS');
    const mapped = mapVpsRow(updated as Record<string, unknown>);
    socketService.sendToUser(userId!, 'vps_status_update', mapped);
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// POST /api/vps/stop -> Stop VM via POST body
export const stopVpsBody = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing instance ID in request body' });

    if (id === 'hex-sandbox-32gb') {
      return res.json({ id, status: 'STOPPED', message: 'Sandbox node stopped successfully' });
    }

    const vps = await db.findUserVps(userId!, id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found or access denied' });
    await computeProvider.stopVM(id);
    const updated = await db.updateVps(id, { status: 'STOPPED' });
    await logger.info(`VPS ${id} stopped via REST API by user ${userId}`, 'VPS');
    const mapped = mapVpsRow(updated as Record<string, unknown>);
    socketService.sendToUser(userId!, 'vps_status_update', mapped);
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// POST /api/vps/restart -> Reboot VM
export const restartVps = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing instance ID in request body' });

    if (id === 'hex-sandbox-32gb') {
      return res.json({ id, status: 'RUNNING', message: 'Sandbox node rebooted successfully' });
    }

    const vps = await db.findUserVps(userId!, id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found or access denied' });
    await computeProvider.stopVM(id);
    await computeProvider.startVM(id);
    const updated = await db.updateVps(id, { status: 'RUNNING' });
    await logger.info(`VPS ${id} restarted by user ${userId}`, 'VPS');
    const mapped = mapVpsRow(updated as Record<string, unknown>);
    socketService.sendToUser(userId!, 'vps_status_update', mapped);
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// POST /api/vps/reinstall -> OS Image Reinstallation
export const reinstallVps = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id, osType } = req.body;

    if (!id || !osType) return res.status(400).json({ error: 'Missing ID or OS variant' });

    if (id === 'hex-sandbox-32gb') {
      return res.json({ id, osType, status: 'RUNNING', message: 'Sandbox OS re-imaged' });
    }

    const vps = await db.findUserVps(userId!, id);
    if (!vps) return res.status(404).json({ error: 'VPS instance not found or access denied' });
    const updated = await db.updateVps(id, { os_type: osType, status: 'RUNNING' });
    await logger.info(`VPS ${id} OS re-imaged to ${osType} by user ${userId}`, 'VPS');
    const mapped = mapVpsRow(updated as Record<string, unknown>);
    socketService.sendToUser(userId!, 'vps_status_update', mapped);
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// GET /api/vps/stats -> Live hypervisor telemetry usage
export const getVpsStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: 'Missing instance ID in query string' });

    // Mock realistic telemetry values
    const cpuUsage = Math.floor(Math.random() * 35) + 10; // 10% - 45%
    const ramUsage = Math.floor(Math.random() * 20) + 40; // 40% - 60%
    const diskUsage = 34; // Constant disk allocation percentage
    const networkIn = Number((Math.random() * 2.5 + 0.1).toFixed(2)); // MB/s
    const networkOut = Number((Math.random() * 1.2 + 0.05).toFixed(2)); // MB/s

    // Dynamic historical array graphs
    const cpuHistory = Array.from({ length: 15 }, () => Math.floor(Math.random() * 30) + 12);
    const ramHistory = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10) + 45);
    const networkHistory = Array.from({ length: 15 }, () => Math.floor(Math.random() * 100) + 40);

    res.json({
      vpsId: id,
      cpuUsage,
      ramUsage,
      diskUsage,
      networkIn,
      networkOut,
      history: {
        cpuHistory,
        ramHistory,
        networkHistory
      }
    });
  } catch (err) {
    next(err);
  }
};

// In-memory mock storage for firewall rules and backups
const mockFirewalls = new Map<string, { id: string; port: number; protocol: 'TCP' | 'UDP'; description: string }[]>();
const mockBackupsList = new Map<string, { id: string; name: string; size: string; status: string; createdAt: string }[]>();

// POST /api/vps/firewall/add -> Allow Port Traffic
export const addFirewallRule = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id, port, protocol, description } = req.body;
    if (!id || !port || !protocol) return res.status(400).json({ error: 'Missing parameters' });

    const currentRules = mockFirewalls.get(id) || [
      { id: 'fw-default-ssh', port: 22, protocol: 'TCP', description: 'Default Secure Shell Access' },
      { id: 'fw-default-http', port: 80, protocol: 'TCP', description: 'Standard HTTP Web traffic' },
    ];

    const newRule = {
      id: `fw-${Date.now()}`,
      port: parseInt(port),
      protocol: protocol as any,
      description: description || 'Custom Traffic Rule'
    };

    currentRules.push(newRule);
    mockFirewalls.set(id, currentRules);

    res.json({ message: 'Firewall rules updated successfully', rules: currentRules });
  } catch (err) {
    next(err);
  }
};

// POST /api/vps/firewall/remove -> Remove Traffic Port
export const removeFirewallRule = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id, ruleId } = req.body;
    if (!id || !ruleId) return res.status(400).json({ error: 'Missing parameters' });

    const currentRules = mockFirewalls.get(id) || [
      { id: 'fw-default-ssh', port: 22, protocol: 'TCP', description: 'Default Secure Shell Access' },
      { id: 'fw-default-http', port: 80, protocol: 'TCP', description: 'Standard HTTP Web traffic' },
    ];

    const filtered = currentRules.filter(r => r.id !== ruleId);
    mockFirewalls.set(id, filtered);

    res.json({ message: 'Firewall rule revoked successfully', rules: filtered });
  } catch (err) {
    next(err);
  }
};

// GET /api/vps/backups -> List Backups
export const getBackups = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing ID parameter' });

    const list = mockBackupsList.get(id.toString()) || [
      { id: 'bk-daily-01', name: 'Standard Daily Cluster Sync', size: '2.4 GB', status: 'SUCCESS', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'bk-weekly-02', name: 'Pre-Deployment Baseline Backup', size: '3.1 GB', status: 'SUCCESS', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    ];

    res.json(list);
  } catch (err) {
    next(err);
  }
};

// POST /api/vps/backup/create -> Create New Snapshot
export const createBackup = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id, name } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing parameters' });

    const list = mockBackupsList.get(id) || [
      { id: 'bk-daily-01', name: 'Standard Daily Cluster Sync', size: '2.4 GB', status: 'SUCCESS', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'bk-weekly-02', name: 'Pre-Deployment Baseline Backup', size: '3.1 GB', status: 'SUCCESS', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    ];

    const newSnapshot = {
      id: `bk-${Date.now()}`,
      name: name || `Manual Snapshot - ${new Date().toLocaleDateString()}`,
      size: `${(Math.random() * 2 + 1).toFixed(1)} GB`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString()
    };

    list.unshift(newSnapshot);
    mockBackupsList.set(id, list);

    res.json({ message: 'System snapshot created successfully', backups: list });
  } catch (err) {
    next(err);
  }
};
