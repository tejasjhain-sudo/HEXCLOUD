import { Router } from 'express';
import { 
  createVps, getVpsPlans, startVps, stopVps, deleteVps, getUserVps,
  getVpsDetails, startVpsBody, stopVpsBody, restartVps,
  reinstallVps, getVpsStats, addFirewallRule, removeFirewallRule,
  getBackups, createBackup
} from '../controllers/vpsController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/plans', getVpsPlans);

// Existing legacy endpoints
router.post('/create', createVps);
router.post('/start/:id', startVps);
router.post('/stop/:id', stopVps);
router.delete('/:id', deleteVps);
router.get('/user', getUserVps);

// Standard REST API Requirements for Dashboard Management
router.post('/start', startVpsBody);
router.post('/stop', stopVpsBody);
router.post('/restart', restartVps);
router.post('/reinstall', reinstallVps);
router.get('/stats', getVpsStats);
router.post('/firewall/add', addFirewallRule);
router.post('/firewall/remove', removeFirewallRule);
router.get('/backups', getBackups);
router.post('/backup/create', createBackup);

// Detail parameter route must be loaded last so it doesn't shadow /stats or /backups
router.get('/:id', getVpsDetails);

export default router;
