import { Router } from 'express';
import {
  login,
  getProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  listDistrictAdmins,
  createDistrictAdmin,
  updateDistrictAdmin,
  deleteDistrictAdmin,
  toggleDistrictAdmin
} from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Super admin only routes
router.get('/users', authenticateToken, requireRole('super_admin'), getAllUsers);
// Protected admin routes
router.post('/users', authenticateToken, requireRole('super_admin'), createUser);
router.put('/users/:userId', authenticateToken, requireRole('super_admin'), updateUser);
router.delete('/users/:userId', authenticateToken, requireRole('super_admin'), deleteUser);
router.patch('/users/:userId/toggle-status', authenticateToken, requireRole('super_admin'), toggleUserStatus);

// Protected State Admin routes
// State admin can manage district admins in their state
router.get('/district-admins', authenticateToken, requireRole('state_admin', 'super_admin'), listDistrictAdmins);
router.post('/district-admins', authenticateToken, requireRole('state_admin', 'super_admin'), createDistrictAdmin);
router.put('/district-admins/:userId', authenticateToken, requireRole('state_admin', 'super_admin'), updateDistrictAdmin);
router.delete('/district-admins/:userId', authenticateToken, requireRole('state_admin', 'super_admin'), deleteDistrictAdmin);
router.patch('/district-admins/:userId/toggle-status', authenticateToken, requireRole('state_admin', 'super_admin'), toggleDistrictAdmin); 

export default router;
