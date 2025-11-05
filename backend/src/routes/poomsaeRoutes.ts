import { Router } from 'express';
import { createPoomsaeEntry, getAllPoomsaeEntries } from '../controllers/poomsaeController';

const router = Router();

router.post('/', createPoomsaeEntry);
router.get('/', getAllPoomsaeEntries);

export default router;
