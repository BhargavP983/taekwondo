const { createCanvas, loadImage } = require('@napi-rs/canvas');
import fs from 'fs';
import path from 'path';

interface PoomsaeFormData {
  entryId: string;
  division: string;
  category: string;
  gender: string;
  name: string;
  stateOrg: string;
  dateOfBirth: string;
  age: string;
  weight: string;
  parentGuardianName: string;
  mobileNo: string;
  currentBeltGrade: string;
  tfiIdNo: string;
  danCertificateNo: string;
  academicQualification: string;
  nameOfCollege: string;
  nameOfBoardUniversity: string;
}

export class PoomsaeFormGenerator {
  private templatePath: string;
  private uploadDir: string;

  constructor() {
    this.templatePath = process.env.POOMSAE_TEMPLATE_PATH || './src/templates/poomsae-form-template.jpg';
    this.uploadDir = process.env.FORM_UPLOAD_DIR || './uploads/forms';
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async generatePoomsaeForm(data: PoomsaeFormData) {
    try {
      if (!fs.existsSync(this.templatePath)) {
        throw new Error(`Poomsae template not found at: ${this.templatePath}`);
      }

      const image = await loadImage(this.templatePath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(image, 0, 0);
      ctx.fillStyle = '#000000';
      ctx.textBaseline = 'middle';

      // Mark checkboxes based on selections
      ctx.font = 'bold 100px Arial';
      
      // Division checkboxes (adjust coordinates based on your template)
      const divisionMap: { [key: string]: number } = {
        'Under 30': 625,
        'Under 40': 900,
        'Under 50': 1170,
        'Under 60': 1430,
        'Under 65': 1710,
        'Over 65': 1980,
        'Over 30': 2240
      };
      if (divisionMap[data.division]) {
        ctx.fillText('X', divisionMap[data.division], 760);
      }

      // Category checkboxes
      const categoryMap: { [key: string]: number } = {
        'Individual': 1030,
        'Pair': 1620,
        'Group': 2230
      };
      if (categoryMap[data.category]) {
        ctx.fillText('●', categoryMap[data.category], 850);
      }

      // Gender checkboxes
      const genderMap: { [key: string]: number } = {
        'Male': 1035,
        'Female': 1620
      };
      if (genderMap[data.gender]) {
        ctx.fillText('●', genderMap[data.gender], 935);
      }

      // Fill text fields
      ctx.font = '60px Arial';

      ctx.fillText(data.name, 650, 1110);
      ctx.fillText(data.stateOrg, 650, 1230);
      ctx.fillText(data.dateOfBirth, 650, 1350);
      ctx.fillText(data.age, 1315, 1355);
      ctx.fillText(data.weight, 1730, 1355);
      ctx.fillText(data.parentGuardianName, 650, 1480);
      ctx.fillText(data.mobileNo, 1970, 1480);
      ctx.fillText(data.currentBeltGrade, 650, 1600);
      
      
      ctx.fillText(data.academicQualification, 750, 1850);
      ctx.fillText(data.nameOfCollege, 1450, 1850);
      ctx.fillText(data.nameOfBoardUniversity, 750, 1980);

      ctx.font = 'bold 40px Arial';
      ctx.fillText(data.tfiIdNo, 1185, 1600);
      ctx.fillText(data.danCertificateNo, 1970, 1600);

      // Application Number
      ctx.font = 'bold 50px Arial';
      ctx.fillStyle = '#0000FF';
      ctx.fillText(`Application No: ${data.entryId}`, 900, 600);

      const fileName = `poomsae_${data.entryId}_${Date.now()}.png`;
      const filePath = path.join(this.uploadDir, fileName);

      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filePath, buffer);

      console.log(`✅ Poomsae form generated: ${fileName}`);

      return {
        filePath: `/forms/${fileName}`,
        fileName,
        entryId: data.entryId
      };
    } catch (error) {
      console.error('❌ Error generating poomsae form:', error);
      throw error;
    }
  }
}
