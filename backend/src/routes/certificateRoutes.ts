import { Router } from 'express';
import {
  generateCertificate,
  listCertificates,
  deleteCertificate
} from '../controllers/certificateController';

const router = Router();

// POST /api/certificates - Generate new certificate
router.post('/', generateCertificate);

// GET /api/certificates - List all certificates
router.get('/', listCertificates);

// DELETE /api/certificates/:fileName - Delete specific certificate
router.delete('/:fileName', deleteCertificate);

export default router;
