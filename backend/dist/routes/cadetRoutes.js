"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cadetController_1 = require("../controllers/cadetController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const handlers_1 = require("../types/handlers");
const router = (0, express_1.Router)();
// Public route (for form submission)
router.post('/', (0, handlers_1.asHandler)(cadetController_1.createCadetEntry));
// Protected routes
router.get('/', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(cadetController_1.getAllCadetEntries));
// District admin scoped listing (kept for district-specific dashboards)
router.get('/district', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('districtAdmin', 'superAdmin', 'district_admin', 'super_admin'), (0, handlers_1.asHandler)(cadetController_1.getCadetsForDistrictAdmin));
router.get('/district/stats', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('districtAdmin', 'superAdmin', 'district_admin', 'super_admin'), (0, handlers_1.asHandler)(cadetController_1.getDistrictCadetStats));
router.get('/stats', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(cadetController_1.getCadetStats));
router.get('/:entryId', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(cadetController_1.getCadetByEntryId));
router.delete('/:entryId', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(cadetController_1.deleteCadetEntry));
exports.default = router;
