import { Router } from 'express';
import {
  createCadetEntry,
  getAllCadetEntries,
  getCadetByEntryId,
  deleteCadetEntry,
  getCadetStats,
  getCadetsForDistrictAdmin
} from '../controllers/cadetController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { asHandler } from '../types/handlers';
import { CadetQuery, EntryParams } from '../types/express';

const router = Router();

// Public route (for form submission)
router.post('/', asHandler(createCadetEntry));

// Protected routes
router.get('/', authenticateToken(), asHandler(getAllCadetEntries));
// District admin scoped listing (kept for district-specific dashboards)
router.get(
  '/district',
  authenticateToken(),
  requireRole('districtAdmin', 'superAdmin', 'district_admin', 'super_admin'),
  asHandler(getCadetsForDistrictAdmin)
);
router.get('/stats', authenticateToken(), asHandler(getCadetStats as any));
router.get<EntryParams>('/:entryId', authenticateToken(), asHandler(getCadetByEntryId));
router.delete<EntryParams>('/:entryId', authenticateToken(), asHandler(deleteCadetEntry));

export default router;
