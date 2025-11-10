"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificateStats = exports.deleteCertificate = exports.getCertificates = exports.createCertificate = void 0;
const certificateService_1 = require("../services/certificateService");
const certificateService = new certificateService_1.CertificateService();
const createCertificate = async (req, res) => {
    try {
        const { name, date, grade } = req.body;
        if (!name || !date || !grade) {
            return res.status(400).json({ success: false, message: 'Name, date, and grade are required.' });
        }
        const generatedBy = req.user?.userId || req.user?.email || 'system';
        // Service handles both image file and MongoDB record
        const cert = await certificateService.generateAndSaveCertificate({
            name,
            date,
            grade,
            generatedBy
        });
        res.status(201).json({ success: true, data: { ...cert, previewUrl: `http://localhost:5000${cert.filePath}` } });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};
exports.createCertificate = createCertificate;
/**
 * Get all certificates (returns MongoDB records, not files).
 */
const getCertificates = async (req, res) => {
    try {
        const certs = await certificateService.listAllCertificates();
        res.json({ success: true, data: certs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
    }
};
exports.getCertificates = getCertificates;
/**
 * Delete a certificate by ID (deletes both DB record and image file).
 */
const deleteCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ success: false, message: 'Certificate id required' });
        const deleted = await certificateService.deleteCertificateById(id);
        if (deleted) {
            res.json({ success: true, message: 'Certificate deleted successfully' });
        }
        else {
            res.status(404).json({ success: false, message: 'Certificate not found' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete certificate' });
    }
};
exports.deleteCertificate = deleteCertificate;
/**
 * Optionally: Get stats
 */
const getCertificateStats = async (_, res) => {
    try {
        const stats = await certificateService.getStats();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};
exports.getCertificateStats = getCertificateStats;
