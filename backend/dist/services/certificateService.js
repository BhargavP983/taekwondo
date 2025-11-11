"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const canvas_1 = require("@napi-rs/canvas");
const Certificate_1 = require("../models/Certificate");
class CertificateService {
    constructor() {
        this.templatePath = process.env.TEMPLATE_PATH || path_1.default.resolve('./src/templates/certificate-template.png');
        this.uploadDir = process.env.UPLOAD_DIR || path_1.default.resolve('./uploads/certificate');
        // Ensure upload dir exists
        if (!fs_1.default.existsSync(this.uploadDir)) {
            fs_1.default.mkdirSync(this.uploadDir, { recursive: true });
            console.log(`📁 Created uploads directory: ${this.uploadDir}`);
        }
    }
    /**
     * Generates a certificate: creates file, saves DB record, returns full object.
     */
    async generateAndSaveCertificate(data) {
        // 1. Generate Serial Number — you may customize for unique/pretty format
        const certCount = await Certificate_1.Certificate.countDocuments();
        const serial = (certCount + 1).toString().padStart(9, '0').replace(/(\d{3})(?=\d)/g, '$1-');
        // 2. Render certificate image using template and save PNG
        if (!fs_1.default.existsSync(this.templatePath)) {
            throw new Error(`Certificate template not found at: ${this.templatePath}`);
        }
        const image = await (0, canvas_1.loadImage)(this.templatePath);
        const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        // ============================================
        // TEXT POSITIONING FOR YOUR TEMPLATE
        // ============================================
        // NAME - positioned on the line after "Name:"
        ctx.font = 'bold 90px Arial';
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.name, 800, 1100);
        //                       ↑    ↑
        //                       X    Y
        // X: 800 (starts after "Name:")
        // Y: 1100 (on the horizontal line)
        // DATE OF BIRTH - positioned on the line after "Date of Birth:"
        ctx.font = '80px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        const formattedDate = new Date(data.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        ctx.fillText(formattedDate, 800, 1325);
        //                      ↑    ↑
        // X: 800 (starts after "Date of Birth:")
        // Y: 1325 (on the horizontal line)
        // MEDAL - positioned on the line after "Medal:"
        ctx.font = 'bold 100px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(data.medal, 930, 1550);
        //                       ↑    ↑
        // X: 930 (starts after "Medal:")
        // Y: 1550 (on the horizontal line)
        // CATEGORY - positioned on the line after "Category:"
        ctx.font = '80px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(data.category, 930, 1775);
        //                       ↑    ↑
        // X: 930 (starts after "Category:")
        // Y: 1775 (on the horizontal line)
        // SERIAL NUMBER - top right corner (on the decorative border pattern)
        ctx.font = '50px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.fillText(serial, 1000, 270);
        //                         ↑                  ↑
        // X: Center (on the decorative pattern area)
        // Y: 470 (in the decorative border pattern)
        // ============================================
        // File name and path
        const fileName = `cert_${serial.replace(/-/g, '_')}_${Date.now()}.png`;
        // const filePath = path.join(this.uploadDir, fileName);
        // For writing, we need the actual disk path
        const fullSavePath = path_1.default.join(this.uploadDir, fileName);
        // Save to file
        const buffer = canvas.toBuffer('image/png');
        fs_1.default.writeFileSync(fullSavePath, buffer);
        // 3. Compute the public URL for frontend preview/download
        // (Assumes '/uploads/certificate' is statically served from server root)
        const downloadUrl = `/uploads/certificate/${fileName}`;
        // 4. Save to MongoDB
        const doc = await Certificate_1.Certificate.create({
            serial,
            name: data.name,
            dateOfBirth: new Date(data.dateOfBirth),
            medal: data.medal,
            category: data.category,
            generatedBy: data.generatedBy,
            filePath: downloadUrl
        });
        // Return as JS object so all fields are present (esp. for new Mongo 7.x)
        return doc.toObject();
    }
    /**
     * List all certificates (from MongoDB)
     */
    async listAllCertificates() {
        return Certificate_1.Certificate.find().sort({ generatedAt: -1 }).lean();
    }
    /**
     * Delete certificate both from DB and delete the file from the FS
     */
    async deleteCertificateById(certId) {
        const cert = await Certificate_1.Certificate.findById(certId).lean();
        if (!cert)
            return false;
        // Delete the file
        const localPath = path_1.default.resolve('./', cert.filePath.replace(/^\/uploads\/certificate\//, 'uploads/certificate/'));
        if (fs_1.default.existsSync(localPath))
            fs_1.default.unlinkSync(localPath);
        // Delete from MongoDB
        await Certificate_1.Certificate.deleteOne({ _id: certId });
        return true;
    }
    /**
     * Get stats (e.g., total certificates)
     */
    async getStats() {
        const count = await Certificate_1.Certificate.countDocuments();
        return { total: count };
    }
    /**
     * Optionally get by serial, by user, etc.
     */
    async getCertificateBySerial(serial) {
        return Certificate_1.Certificate.findOne({ serial });
    }
}
exports.CertificateService = CertificateService;
