import { Router } from 'express';
import {
  createCadetEntry,
  getAllCadetEntries,
  getCadetEntryById,
  deleteCadetEntry,
  getCadetStats,
  getCadetsForStateAdmin
} from '../controllers/cadetController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public route (for form submission)
router.post('/', createCadetEntry);

// Protected routes
router.get('/', authenticateToken, getAllCadetEntries);
router.get('/state', authenticateToken, requireRole('state_admin', 'super_admin'), getCadetsForStateAdmin);
router.get('/stats', authenticateToken, getCadetStats);
router.get('/:entryId', authenticateToken, getCadetEntryById);
router.delete('/:entryId', authenticateToken, deleteCadetEntry);

export default router;
