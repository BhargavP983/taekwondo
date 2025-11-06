import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createCertificate, getCertificates, deleteCertificate } from '../controllers/certificateController';


const router = Router();

router.post('/generate', authenticateToken, createCertificate);
router.get('/', authenticateToken, getCertificates);

// DELETE /api/certificates/:fileName - Delete specific certificate
router.delete('/:fileName', deleteCertificate);

export default router;
