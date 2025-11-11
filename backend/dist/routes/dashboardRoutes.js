"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const handlers_1 = require("../types/handlers");
const router = (0, express_1.Router)();
// All dashboard routes require authentication
router.use((0, authMiddleware_1.authenticateToken)());
// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', (0, authMiddleware_1.requireRole)('superAdmin'), (0, handlers_1.asHandler)(dashboardController_1.getDashboardStats));
// GET /api/dashboard/activities - Get recent activities
router.get('/activities', (0, authMiddleware_1.requireRole)('superAdmin'), (0, handlers_1.asHandler)(dashboardController_1.getRecentActivities));
// State Admin routes
router.get('/state/stats', (0, authMiddleware_1.requireRole)('stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(dashboardController_1.getDashboardStats));
router.get('/state/activities', (0, authMiddleware_1.requireRole)('stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(dashboardController_1.getRecentActivities));
// District Admin routes
router.get('/district/stats', (0, authMiddleware_1.requireRole)('districtAdmin', 'stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(dashboardController_1.getDashboardStats));
router.get('/district/activities', (0, authMiddleware_1.requireRole)('districtAdmin', 'stateAdmin', 'superAdmin'), (0, handlers_1.asHandler)(dashboardController_1.getRecentActivities));
exports.default = router;
