import { Router } from 'express';
import { register, login, getProfile, getAllUsers } from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, requireRole('super_admin'), getAllUsers);

export default router;
