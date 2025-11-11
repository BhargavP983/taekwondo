"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const authSchemas_1 = require("../schemas/authSchemas");
const handlers_1 = require("../types/handlers");
const router = (0, express_1.Router)();
// Public routes with rate limiting
// Public routes with rate limiting
router.post('/login', authMiddleware_1.authRateLimiter, (0, validationMiddleware_1.validateRequest)(authSchemas_1.loginSchema), (0, handlers_1.asHandler)(authController_1.login));
// Protected routes
router.get('/profile', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(authController_1.getProfile));
// Super admin only routes
router.get('/users', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('superAdmin'), (0, handlers_1.asHandler)(authController_1.getAllUsers));
router.post('/users', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('superAdmin'), (0, validationMiddleware_1.validateRequest)(authSchemas_1.createUserSchema), (0, handlers_1.asHandler)(authController_1.createUser));
router.put('/users/:userId', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('superAdmin'), (0, validationMiddleware_1.validateRequest)(authSchemas_1.createUserSchema), (0, handlers_1.asHandler)(authController_1.updateUser));
router.delete('/users/:userId', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('superAdmin'), (0, handlers_1.asHandler)(authController_1.deleteUser));
router.patch('/users/:userId/toggle-status', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('superAdmin'), (0, handlers_1.asHandler)(authController_1.toggleUserStatus));
// Protected State Admin routes
// State admin can manage district admins in their state
router.get('/district-admins', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(authController_1.listDistrictAdmins));
router.post('/district-admins', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(authController_1.createDistrictAdmin));
router.put('/district-admins/:userId', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(authController_1.updateDistrictAdmin));
router.delete('/district-admins/:userId', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(authController_1.deleteDistrictAdmin));
router.patch('/district-admins/:userId/toggle-status', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(authController_1.toggleDistrictAdmin));
// Change password for any authenticated user
router.post('/change-password', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(authController_1.changePassword));
// Admin reset password for other users (SuperAdmin -> StateAdmin, StateAdmin -> DistrictAdmin)
router.post('/admin-reset-password/:userId', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('superAdmin', 'stateAdmin'), (0, handlers_1.asHandler)(authController_1.adminResetPassword));
exports.default = router;
