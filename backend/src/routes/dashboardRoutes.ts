import { Router } from 'express';
import { getDashboardStats, getRecentActivities } from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', requireRole('super_admin'), getDashboardStats);

// GET /api/dashboard/activities - Get recent activities
router.get('/activities', requireRole('super_admin'), getRecentActivities);

export default router;
