import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { SerialNumberGenerator } from '../utils/serialGenerator';

interface CertificateData {
  name: string;
  date: string;
  grade: string;
}

export class CertificateService {
  private templatePath: string;
  private uploadDir: string;

  constructor() {
    this.templatePath = process.env.TEMPLATE_PATH || './src/templates/certificate-template.png';
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`📁 Created uploads directory: ${this.uploadDir}`);
    }
  }

  async generateCertificate(data: CertificateData) {
    try {
      if (!fs.existsSync(this.templatePath)) {
        throw new Error(`Certificate template not found at: ${this.templatePath}`);
      }

      const image = await loadImage(this.templatePath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      // Draw template background
      ctx.drawImage(image, 0, 0);

      // Generate serial number
      const serialNumber = SerialNumberGenerator.generate();

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
      ctx.fillText(serialNumber, 1000, 270);
      //                         ↑                  ↑
      // X: Center (on the decorative pattern area)
      // Y: 470 (in the decorative border pattern)

      // ============================================

      // Generate filename
      const fileName = `cert_${serialNumber.replace(/-/g, '_')}_${Date.now()}.png`;
      const filePath = path.join(this.uploadDir, fileName);

      // Save certificate image
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filePath, buffer);

      // Save certificate record to JSON
      SerialNumberGenerator.saveCertificateRecord({
        serialNumber,
        name: data.name,
        date: data.date,
        grade: data.grade,
        fileName
      });

      console.log(`✅ Certificate generated: ${fileName}`);

      return {
        filePath: `/certificates/${fileName}`,
        fileName,
        serialNumber
      };
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      throw error;
    }
  }

  getAllCertificates() {
    // Get from JSON records
    return SerialNumberGenerator.getAllCertificates();
  }

  getCertificateBySerial(serialNumber: string) {
    return SerialNumberGenerator.getCertificateBySerial(serialNumber);
  }

  deleteCertificate(fileName: string): boolean {
    try {
      // Delete file
      const filePath = path.join(this.uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete record from JSON
      // Extract serial number from filename (cert_XXX_XXX_XXX_timestamp.png)
      const serialMatch = fileName.match(/cert_(\d{3})_(\d{3})_(\d{3})_/);
      if (serialMatch) {
        const serialNumber = `${serialMatch[1]}-${serialMatch[2]}-${serialMatch[3]}`;
        SerialNumberGenerator.deleteCertificateRecord(serialNumber);
      }

      console.log(`🗑️ Deleted certificate: ${fileName}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting certificate:', error);
      return false;
    }
  }

  getStats() {
    return SerialNumberGenerator.getStats();
  }
}
