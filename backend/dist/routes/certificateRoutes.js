"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const certificateController_1 = require("../controllers/certificateController");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
router.post('/generate', (0, authMiddleware_1.authenticateToken)(), certificateController_1.createCertificate);
router.get('/', (0, authMiddleware_1.authenticateToken)(), certificateController_1.getCertificates);
// Download Excel template for bulk certificate generation
router.get('/template/download', (0, authMiddleware_1.authenticateToken)(), certificateController_1.downloadCertificateTemplate);
// Bulk generate certificates from uploaded Excel file
router.post('/bulk-generate', (0, authMiddleware_1.authenticateToken)(), uploadMiddleware_1.uploadExcel.single('file'), certificateController_1.bulkGenerateCertificates);
// DELETE /api/certificates/:fileName - Delete specific certificate
router.delete('/:fileName', certificateController_1.deleteCertificate);
// (Removed redundant /api/certificates nested route; root list already handled by GET '/')
exports.default = router;
