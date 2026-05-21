import { Router } from 'express';
import {
  getUsers,
  suspendUser,
  getAllVps,
  stopVpsAdmin,
  suspendVpsAdmin,
  getAllGpuSessions,
  stopGpuSessionAdmin,
  getSystemLogs,
  getBillingOverview,
  getTickets,
  updateTicket,
  getComputeNodes,
  updateComputeNode,
  getAdminOverview,
} from '../controllers/adminController';
import {
  listTrialRequests,
  approveTrialRequest,
  rejectTrialRequest,
} from '../controllers/trialRequestController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/adminMiddleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireAdmin);

router.get('/overview', getAdminOverview);
router.get('/users', getUsers);
router.post('/users/:id/suspend', suspendUser);
router.get('/vps', getAllVps);
router.post('/vps/stop/:id', stopVpsAdmin);
router.post('/vps/suspend/:id', suspendVpsAdmin);
router.get('/sessions', getAllGpuSessions);
router.post('/sessions/stop/:id', stopGpuSessionAdmin);
router.get('/logs', getSystemLogs);
router.get('/billing/overview', getBillingOverview);
router.get('/tickets', getTickets);
router.patch('/tickets/:id', updateTicket);
router.get('/nodes', getComputeNodes);
router.patch('/nodes/:id', updateComputeNode);

// Trial Request management
router.get('/trial-requests', listTrialRequests);
router.post('/trial-requests/:id/approve', approveTrialRequest);
router.post('/trial-requests/:id/reject', rejectTrialRequest);

export default router;
