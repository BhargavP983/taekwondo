import { Router } from 'express';
import { exportCadets, exportPoomsae } from '../controllers/exportController';
import { authenticateToken } from '../middleware/authMiddleware';
import { asHandler } from '../types/handlers';

const router = Router();

// Export routes - all admin roles can export
router.get('/cadets',
  authenticateToken(),
  asHandler(exportCadets)
);

router.get('/poomsae',
  authenticateToken(),
  asHandler(exportPoomsae)
);

export default router;
