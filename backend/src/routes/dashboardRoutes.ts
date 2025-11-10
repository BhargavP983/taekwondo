import { Router } from 'express';
import { 
  getDashboardStats, 
  getRecentActivities
} from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { asHandler } from '../types/handlers';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken());

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', 
  requireRole<{}>('superAdmin'),
  asHandler(getDashboardStats)
);

// GET /api/dashboard/activities - Get recent activities
router.get('/activities', 
  requireRole<{}>('superAdmin'),
  asHandler(getRecentActivities)
);

// State Admin routes
router.get('/state/stats', 
  requireRole<{}>('stateAdmin', 'superAdmin'),
  asHandler(getDashboardStats)
);

router.get('/state/activities', 
  requireRole<{}>('stateAdmin', 'superAdmin'),
  asHandler(getRecentActivities)
);

// District Admin routes
router.get('/district/stats', 
  requireRole<{}>('districtAdmin', 'stateAdmin', 'superAdmin'),
  asHandler(getDashboardStats)
);

router.get('/district/activities', 
  requireRole<{}>('districtAdmin', 'stateAdmin', 'superAdmin'),
  asHandler(getRecentActivities)
);

export default router;
