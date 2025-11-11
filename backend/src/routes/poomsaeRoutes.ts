import { Router } from 'express';
import {
  createPoomsaeEntry,
  getAllPoomsaeEntries,
  getPoomsaeEntryById,
  deletePoomsaeEntry,
  getPoomsaeStats,
  getPoomsaeForDistrictAdmin,
  getDistrictPoomsaeStats
} from '../controllers/poomsaeController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { asHandler } from '../types/handlers';

const router = Router();

// Public route (for form submission)
router.post('/', createPoomsaeEntry);

// Protected routes
router.get('/', authenticateToken(), asHandler(getAllPoomsaeEntries as any));
// District admin scoped listing
router.get(
  '/district',
  authenticateToken(),
  requireRole('districtAdmin', 'superAdmin', 'district_admin', 'super_admin'),
  asHandler(getPoomsaeForDistrictAdmin as any)
);
router.get(
  '/district/stats',
  authenticateToken(),
  requireRole('districtAdmin', 'superAdmin', 'district_admin', 'super_admin'),
  asHandler(getDistrictPoomsaeStats as any)
);
router.get('/stats', authenticateToken(), asHandler(getPoomsaeStats as any));
router.get('/:entryId', authenticateToken(), asHandler(getPoomsaeEntryById as any));
router.delete('/:entryId', authenticateToken(), asHandler(deletePoomsaeEntry as any));

export default router;
