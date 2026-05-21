import { Router } from 'express';
import { startGpuSession, endGpuSession, getSessionStatus } from '../controllers/cloudPcController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/session/start', startGpuSession);
router.post('/session/end/:id', endGpuSession);
router.get('/session/status', getSessionStatus);

export default router;
