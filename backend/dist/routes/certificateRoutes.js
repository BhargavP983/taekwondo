"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const certificateController_1 = require("../controllers/certificateController");
const Certificate_1 = require("../models/Certificate");
const router = (0, express_1.Router)();
router.post('/generate', authMiddleware_1.authenticateToken, certificateController_1.createCertificate);
router.get('/', authMiddleware_1.authenticateToken, certificateController_1.getCertificates);
// DELETE /api/certificates/:fileName - Delete specific certificate
router.delete('/:fileName', certificateController_1.deleteCertificate);
router.get('/api/certificates', async (req, res) => {
    const certificates = await Certificate_1.Certificate.find();
    res.status(200).json({ success: true, data: certificates });
});
exports.default = router;
