import { Router } from 'express';
import {
  createPoomsaeEntry,
  getAllPoomsaeEntries,
  getPoomsaeEntryById,
  deletePoomsaeEntry,
  getPoomsaeStats
} from '../controllers/poomsaeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public route (for form submission)
router.post('/', createPoomsaeEntry);

// Protected routes
router.get('/', authenticateToken, getAllPoomsaeEntries);
router.get('/stats', authenticateToken, getPoomsaeStats);
router.get('/:entryId', authenticateToken, getPoomsaeEntryById);
router.delete('/:entryId', authenticateToken, deletePoomsaeEntry);

export default router;
