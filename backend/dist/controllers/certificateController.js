"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkGenerateCertificates = exports.downloadCertificateTemplate = exports.getCertificateStats = exports.deleteCertificate = exports.getCertificates = exports.createCertificate = void 0;
const certificateService_1 = require("../services/certificateService");
const exceljs_1 = __importDefault(require("exceljs"));
const certificateService = new certificateService_1.CertificateService();
const createCertificate = async (req, res) => {
    try {
        const { name, dateOfBirth, medal, category } = req.body;
        if (!name || !dateOfBirth || !medal || !category) {
            return res.status(400).json({ success: false, message: 'Name, date of birth, medal, and category are required.' });
        }
        const generatedBy = req.user?.userId || req.user?.email || 'system';
        // Service handles both image file and MongoDB record
        const cert = await certificateService.generateAndSaveCertificate({
            name,
            dateOfBirth,
            medal,
            category,
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
/**
 * Download Excel template for bulk certificate generation
 */
const downloadCertificateTemplate = async (_, res) => {
    try {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Certificate Template');
        // Define columns with headers
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Date of Birth', key: 'dateOfBirth', width: 20 },
            { header: 'Medal', key: 'medal', width: 15 },
            { header: 'Category', key: 'category', width: 25 }
        ];
        // Style the header row
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = {
            color: { argb: 'FFFFFFFF' },
            bold: true,
            size: 12
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        // Add sample data row
        worksheet.addRow({
            name: 'John Doe',
            dateOfBirth: '2005-01-15',
            medal: 'Gold',
            category: 'Junior Male'
        });
        // Add instructions in a separate sheet
        const instructionsSheet = workbook.addWorksheet('Instructions');
        instructionsSheet.columns = [{ header: 'Instructions', key: 'instructions', width: 100 }];
        instructionsSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
        instructionsSheet.getRow(1).font = {
            color: { argb: 'FFFFFFFF' },
            bold: true,
            size: 12
        };
        instructionsSheet.addRow({ instructions: '1. Fill in the Certificate Template sheet with participant data' });
        instructionsSheet.addRow({ instructions: '2. Name: Full name of the participant' });
        instructionsSheet.addRow({ instructions: '3. Date of Birth: Format as YYYY-MM-DD (e.g., 2005-01-15)' });
        instructionsSheet.addRow({ instructions: '4. Medal: Must be one of: Gold, Silver, or Bronze' });
        instructionsSheet.addRow({ instructions: '5. Category: Competition category (e.g., Junior Male, Senior Female, Under 50kg)' });
        instructionsSheet.addRow({ instructions: '6. Delete the sample row before uploading' });
        instructionsSheet.addRow({ instructions: '7. Save the file and upload it to the dashboard for bulk generation' });
        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        // Set headers for file download
        const fileName = `certificate_template_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader('Content-Length', Buffer.byteLength(buffer).toString());
        res.send(Buffer.from(buffer));
    }
    catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ success: false, message: 'Failed to generate template' });
    }
};
exports.downloadCertificateTemplate = downloadCertificateTemplate;
/**
 * Bulk generate certificates from uploaded Excel file
 */
const bulkGenerateCertificates = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const generatedBy = req.user?.userId || req.user?.email || 'system';
        // Parse Excel file
        const workbook = new exceljs_1.default.Workbook();
        // @ts-ignore - Buffer type mismatch between multer and exceljs
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.getWorksheet('Certificate Template');
        if (!worksheet) {
            return res.status(400).json({ success: false, message: 'Invalid template: "Certificate Template" sheet not found' });
        }
        const results = [];
        const rows = [];
        // Parse rows (skip header row)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return; // Skip header
            const name = row.getCell(1).value?.toString().trim();
            const dateOfBirth = row.getCell(2).value?.toString().trim();
            const medal = row.getCell(3).value?.toString().trim();
            const category = row.getCell(4).value?.toString().trim();
            if (name && dateOfBirth && medal && category) {
                rows.push({ name, dateOfBirth, medal, category });
            }
        });
        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid data found in template' });
        }
        // Generate certificates
        for (const data of rows) {
            try {
                // Validate medal value
                if (!['Gold', 'Silver', 'Bronze'].includes(data.medal)) {
                    results.push({
                        success: false,
                        name: data.name,
                        error: `Invalid medal value: ${data.medal}. Must be Gold, Silver, or Bronze`
                    });
                    continue;
                }
                // Validate date format
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(data.dateOfBirth)) {
                    results.push({
                        success: false,
                        name: data.name,
                        error: `Invalid date format: ${data.dateOfBirth}. Use YYYY-MM-DD`
                    });
                    continue;
                }
                const cert = await certificateService.generateAndSaveCertificate({
                    name: data.name,
                    dateOfBirth: data.dateOfBirth,
                    medal: data.medal,
                    category: data.category,
                    generatedBy
                });
                results.push({
                    success: true,
                    serial: cert.serial,
                    name: data.name
                });
            }
            catch (error) {
                results.push({
                    success: false,
                    name: data.name,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        res.status(200).json({
            success: true,
            message: `Generated ${successCount} certificates successfully. ${failCount} failed.`,
            data: {
                total: rows.length,
                successful: successCount,
                failed: failCount,
                results
            }
        });
    }
    catch (error) {
        console.error('Error in bulk generation:', error);
        res.status(500).json({ success: false, message: 'Failed to process bulk generation' });
    }
};
exports.bulkGenerateCertificates = bulkGenerateCertificates;
