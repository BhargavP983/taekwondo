import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { Certificate } from '../models/Certificate';
import { SerialNumberGenerator } from '../utils/serialGenerator';

interface CertificateData {
  name: string;
  date: string;
  grade: string;
  generatedBy: string;
}

export class CertificateService {
  private templatePath: string;
  private uploadDir: string;

  constructor() {
    this.templatePath = process.env.TEMPLATE_PATH || path.resolve('./src/templates/certificate-template.png');
    this.uploadDir = process.env.UPLOAD_DIR || path.resolve('./uploads/certificate');

    // Ensure upload dir exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`📁 Created uploads directory: ${this.uploadDir}`);
    }
  }

  /**
   * Generates a certificate: creates file, saves DB record, returns full object.
   */
  async generateAndSaveCertificate(data: CertificateData) {
    // 1. Generate Serial Number — you may customize for unique/pretty format
    const certCount = await Certificate.countDocuments();
    const serial = (certCount + 1).toString().padStart(9, '0').replace(/(\d{3})(?=\d)/g, '$1-');

    // 2. Render certificate image using template and save PNG
    if (!fs.existsSync(this.templatePath)) {
      throw new Error(`Certificate template not found at: ${this.templatePath}`);
    }
    const image = await loadImage(this.templatePath);
    const canvas = createCanvas(image.width, image.height);
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
    // X: 440 (starts after "Name:")
    // Y: 590 (on the horizontal line)

    // DATE - positioned on the line after "Date:"
    ctx.font = '80px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.fillText(data.date, 800, 1325);
    //                      ↑    ↑
    // X: 440 (starts after "Date:")
    // Y: 700 (on the horizontal line)

    // GRADE - positioned on the line after "Grade:"
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(data.grade, 930, 1550);
    //                       ↑    ↑
    // X: 440 (starts after "Grade:")
    // Y: 810 (on the horizontal line)

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
    const fullSavePath = path.join(this.uploadDir, fileName);

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(fullSavePath, buffer);

    // 3. Compute the public URL for frontend preview/download
    // (Assumes '/uploads/certificate' is statically served from server root)
    const downloadUrl = `/uploads/certificate/${fileName}`;

    // 4. Save to MongoDB
    const doc = await Certificate.create({
      serial,
      name: data.name,
      date: new Date(data.date),
      grade: data.grade,
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
    return Certificate.find().sort({ generatedAt: -1 }).lean();
  }

  /**
   * Delete certificate both from DB and delete the file from the FS
   */
  async deleteCertificateById(certId: string) {
    const cert = await Certificate.findById(certId).lean();
    if (!cert) return false;

    // Delete the file
    const localPath = path.resolve('./', cert.filePath.replace(/^\/uploads\/certificate\//, 'uploads/certificate/'));
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    
    // Delete from MongoDB
    await Certificate.deleteOne({ _id: certId });
    return true;
  }

  /**
   * Get stats (e.g., total certificates)
   */
  async getStats() {
    const count = await Certificate.countDocuments();
    return { total: count };
  }

  /**
   * Optionally get by serial, by user, etc.
   */
  async getCertificateBySerial(serial: string) {
    return Certificate.findOne({ serial });
  }
}
