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
  toggleDistrictAdmin,
  changePassword,
  adminResetPassword
} from '../controllers/authController';
import { authenticateToken, requireRole, authRateLimiter } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserSchema, loginSchema } from '../schemas/authSchemas';
import { asHandler } from '../types/handlers';
import { UserParams } from '../types/params';

const router = Router();

// Public routes with rate limiting
// Public routes with rate limiting
router.post('/login', 
  authRateLimiter,
  validateRequest(loginSchema),
  asHandler(login)
);

// Protected routes
router.get('/profile', 
  authenticateToken(),
  asHandler(getProfile)
);

// Super admin only routes
router.get('/users', 
  authenticateToken(),
  requireRole('superAdmin'),
  asHandler(getAllUsers)
);
router.post('/users', 
  authenticateToken(),
  requireRole<{}>('superAdmin'),
  validateRequest(createUserSchema),
  asHandler(createUser)
);

router.put('/users/:userId', 
  authenticateToken(),
  requireRole<UserParams>('superAdmin'),
  validateRequest(createUserSchema),
  asHandler(updateUser)
);

router.delete('/users/:userId', 
  authenticateToken(),
  requireRole<UserParams>('superAdmin'),
  asHandler(deleteUser)
);

router.patch('/users/:userId/toggle-status', 
  authenticateToken(),
  requireRole<UserParams>('superAdmin'),
  asHandler(toggleUserStatus)
);

// Protected State Admin routes
// State admin can manage district admins in their state
router.get('/district-admins', 
  authenticateToken(),
  requireRole<{}>('stateAdmin', 'superAdmin'),
  asHandler(listDistrictAdmins)
);

router.post('/district-admins', 
  authenticateToken(),
  requireRole<{}>('stateAdmin', 'superAdmin'),
  asHandler(createDistrictAdmin)
);

router.put('/district-admins/:userId', 
  authenticateToken(),
  requireRole<UserParams>('stateAdmin', 'superAdmin'),
  asHandler(updateDistrictAdmin)
);

router.delete('/district-admins/:userId', 
  authenticateToken(),
  requireRole<UserParams>('stateAdmin', 'superAdmin'),
  asHandler(deleteDistrictAdmin)
);

router.patch('/district-admins/:userId/toggle-status', 
  authenticateToken(),
  requireRole<UserParams>('stateAdmin', 'superAdmin'),
  asHandler(toggleDistrictAdmin)
);

// Change password for any authenticated user
router.post('/change-password',
  authenticateToken(),
  asHandler(changePassword)
);

// Admin reset password for other users (SuperAdmin -> StateAdmin, StateAdmin -> DistrictAdmin)
router.post('/admin-reset-password/:userId',
  authenticateToken(),
  requireRole<UserParams>('superAdmin', 'stateAdmin'),
  asHandler(adminResetPassword)
);

export default router;
