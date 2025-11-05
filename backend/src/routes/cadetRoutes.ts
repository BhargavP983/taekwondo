import { Router } from 'express';
import {
  createCadetEntry,
  getAllCadetEntries,
  getCadetEntryById,
  deleteCadetEntry,
  getCadetStats,
  downloadApplicationForm
} from '../controllers/cadetController';

const router = Router();

// POST /api/cadets - Create new cadet entry
router.post('/', createCadetEntry);

// GET /api/cadets - Get all cadet entries
router.get('/', getAllCadetEntries);

// GET /api/cadets/stats - Get statistics
router.get('/stats', getCadetStats);

// GET /api/cadets/:entryId - Get specific entry
router.get('/:entryId', getCadetEntryById);

// GET /api/cadets/:entryId/download - Download application form
router.get('/:entryId/download', downloadApplicationForm);

// DELETE /api/cadets/:entryId - Delete entry
router.delete('/:entryId', deleteCadetEntry);

export default router;
