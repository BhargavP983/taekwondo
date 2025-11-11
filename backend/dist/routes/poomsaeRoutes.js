"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const poomsaeController_1 = require("../controllers/poomsaeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const handlers_1 = require("../types/handlers");
const router = (0, express_1.Router)();
// Public route (for form submission)
router.post('/', poomsaeController_1.createPoomsaeEntry);
// Protected routes
router.get('/', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(poomsaeController_1.getAllPoomsaeEntries));
// District admin scoped listing
router.get('/district', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('districtAdmin', 'superAdmin', 'district_admin', 'super_admin'), (0, handlers_1.asHandler)(poomsaeController_1.getPoomsaeForDistrictAdmin));
router.get('/district/stats', (0, authMiddleware_1.authenticateToken)(), (0, authMiddleware_1.requireRole)('districtAdmin', 'superAdmin', 'district_admin', 'super_admin'), (0, handlers_1.asHandler)(poomsaeController_1.getDistrictPoomsaeStats));
router.get('/stats', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(poomsaeController_1.getPoomsaeStats));
router.get('/:entryId', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(poomsaeController_1.getPoomsaeEntryById));
router.delete('/:entryId', (0, authMiddleware_1.authenticateToken)(), (0, handlers_1.asHandler)(poomsaeController_1.deletePoomsaeEntry));
exports.default = router;
