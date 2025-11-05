import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Super admin only routes
router.get('/users', authenticateToken, requireRole('super_admin'), getAllUsers);
router.post('/users', authenticateToken, requireRole('super_admin'), createUser);
router.put('/users/:userId', authenticateToken, requireRole('super_admin'), updateUser);
router.delete('/users/:userId', authenticateToken, requireRole('super_admin'), deleteUser);
router.patch('/users/:userId/toggle-status', authenticateToken, requireRole('super_admin'), toggleUserStatus);

export default router;
