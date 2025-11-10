"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const poomsaeController_1 = require("../controllers/poomsaeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public route (for form submission)
router.post('/', poomsaeController_1.createPoomsaeEntry);
// Protected routes
router.get('/', authMiddleware_1.authenticateToken, poomsaeController_1.getAllPoomsaeEntries);
router.get('/stats', authMiddleware_1.authenticateToken, poomsaeController_1.getPoomsaeStats);
router.get('/:entryId', authMiddleware_1.authenticateToken, poomsaeController_1.getPoomsaeEntryById);
router.delete('/:entryId', authMiddleware_1.authenticateToken, poomsaeController_1.deletePoomsaeEntry);
exports.default = router;
