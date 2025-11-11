import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createCertificate, getCertificates, deleteCertificate, downloadCertificateTemplate, bulkGenerateCertificates } from '../controllers/certificateController';
import { Certificate } from '../models/Certificate';
import { uploadExcel } from '../middleware/uploadMiddleware';


const router = Router();

router.post('/generate', authenticateToken(), createCertificate as unknown as RequestHandler);
router.get('/', authenticateToken(), getCertificates);

// Download Excel template for bulk certificate generation
router.get('/template/download', authenticateToken(), downloadCertificateTemplate);

// Bulk generate certificates from uploaded Excel file
router.post('/bulk-generate', authenticateToken(), uploadExcel.single('file'), bulkGenerateCertificates as unknown as RequestHandler);

// DELETE /api/certificates/:fileName - Delete specific certificate
router.delete('/:fileName', deleteCertificate);

// (Removed redundant /api/certificates nested route; root list already handled by GET '/')

export default router;
