const { createCanvas, loadImage } = require('@napi-rs/canvas');
import fs from 'fs';
import path from 'path';

interface cadetFormData {
  entryId: string;
  gender: string;
  weightCategory: string;
  name: string;
  dateOfBirth: string;
  age: string;
  weight: string;
  parentGuardianName: string;
  state: string;
  presentBeltGrade: string;
  tfiIdCardNo: string;
  academicQualification: string;
  schoolName: string;
  district: string;
}

export class CadetFormGenerator {
  private templatePath: string;
  private uploadDir: string;

  constructor() {
    this.templatePath = process.env.FORM_TEMPLATE_PATH || './src/templates/cadet-form-template.jpg';
    this.uploadDir = process.env.FORM_UPLOAD_DIR || './uploads/forms';
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`📁 Created forms directory: ${this.uploadDir}`);
    }
  }

  async generateCadetForm(data: cadetFormData) {
    try {
      if (!fs.existsSync(this.templatePath)) {
        throw new Error(`Form template not found at: ${this.templatePath}`);
      }

      const image = await loadImage(this.templatePath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      // Draw template background
      ctx.drawImage(image, 0, 0);

      // Set default text properties
      ctx.fillStyle = '#000000';
      ctx.textBaseline = 'middle';

      // ============================================
      // FILL IN THE FORM DATA
      // Adjust coordinates based on your CADET form template
      // ============================================

      // Gender - Check mark in checkbox (Boy or Girl)
      if (data.gender === 'Boy') {
        ctx.font = 'bold 200px Arial';
        ctx.fillText('●', 635, 515);  // Boy checkbox
      } else {
        ctx.font = 'bold 200px Arial';
        ctx.fillText('●', 635, 617);  // Girl checkbox
      }

      // Weight Category
      ctx.font = '90px Arial';
      ctx.fillText(data.weightCategory, 1150, 625);

      // Name (In Capital Letters)
      ctx.font = 'bold 90px Arial';
      ctx.fillText(data.name, 700, 820);

      // Date of Birth
      ctx.font = '80px Arial';
      ctx.fillText(data.dateOfBirth, 695, 950);

      // Age
      ctx.fillText(data.age, 1325, 950);

      // Weight
      ctx.fillText(data.weight, 1750, 950);

      // Parent/Guardian Name
      ctx.font = '80px Arial';
      ctx.fillText(data.parentGuardianName, 700, 1090);

      // State
      ctx.fillText(data.state, 700, 1225);

      // Present Belt Grade
      ctx.fillText(data.presentBeltGrade, 780, 1500);

      // TFI ID Card No
      ctx.fillText(data.tfiIdCardNo, 1740, 1500);

      // Academic Qualification
      ctx.fillText(data.academicQualification, 780, 1635);

      // Name of School
      ctx.font = '70px Arial';
      ctx.fillText(data.schoolName, 1740, 1640);

      // Application Number (Entry ID) - Top right corner
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0000FF';
      ctx.fillText(`Application No: ${data.entryId}`, 1500, 380);

      // ============================================

      // Generate filename
      const fileName = `form_${data.entryId}_${Date.now()}.png`;
      const filePath = path.join(this.uploadDir, fileName);

      // Save form
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filePath, buffer);

      console.log(`✅ Application form generated: ${fileName}`);

      return {
        success: true,
        filePath: `/forms/${fileName}`,
        fileName,
        entryId: data.entryId
      };
    } catch (error) {
      console.error('❌ Error generating application form:', error);
      throw error;
    }
  }
}
