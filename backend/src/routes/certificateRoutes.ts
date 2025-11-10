import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createCertificate, getCertificates, deleteCertificate } from '../controllers/certificateController';
import { Certificate } from '../models/Certificate';


const router = Router();

router.post('/generate', authenticateToken(), createCertificate as unknown as RequestHandler);
router.get('/', authenticateToken(), getCertificates);

// DELETE /api/certificates/:fileName - Delete specific certificate
router.delete('/:fileName', deleteCertificate);

router.get('/api/certificates', async (req, res) => {
  const certificates = await Certificate.find();
  res.status(200).json({ success: true, data: certificates });
});

export default router;
