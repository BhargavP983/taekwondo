import { Router } from 'express';
import { 
  getDashboardStats, 
  getRecentActivities,
  getStateAdminStats,
  getStateAdminActivities
} from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', requireRole('super_admin'), getDashboardStats);

// GET /api/dashboard/activities - Get recent activities
router.get('/activities', requireRole('super_admin'), getRecentActivities);

// State Admin routes
router.get('/state/stats', requireRole('state_admin', 'super_admin'), getStateAdminStats);
router.get('/state/activities', requireRole('state_admin', 'super_admin'), getStateAdminActivities);

export default router;
