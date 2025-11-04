import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../../data/certificates.json');

interface CertificateRecord {
  serialNumber: string;
  name: string;
  date: string;
  grade: string;
  fileName: string;
  createdAt: string;
}

interface CertificateData {
  lastSerial: number;
  certificates: CertificateRecord[];
}

export class SerialNumberGenerator {
  private static currentSerial: number = 1;
  private static data: CertificateData = {
    lastSerial: 0,
    certificates: []
  };

  static initialize() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileData);
        this.currentSerial = this.data.lastSerial + 1;
      } else {
        this.saveData();
      }
      console.log(`📊 Serial number initialized at: ${this.currentSerial}`);
      console.log(`📝 Total certificates stored: ${this.data.certificates.length}`);
    } catch (error) {
      console.error('❌ Error initializing serial number:', error);
    }
  }

  static generate(): string {
    const serial = this.currentSerial.toString().padStart(9, '0');
    const formatted = `${serial.slice(0, 3)}-${serial.slice(3, 6)}-${serial.slice(6, 9)}`;
    
    this.currentSerial++;
    this.data.lastSerial = this.currentSerial - 1;
    
    return formatted;
  }

  static saveCertificateRecord(record: Omit<CertificateRecord, 'createdAt'>) {
    const fullRecord: CertificateRecord = {
      ...record,
      createdAt: new Date().toISOString()
    };

    this.data.certificates.push(fullRecord);
    this.saveData();

    console.log(`📝 Certificate record saved: ${record.serialNumber}`);
  }

  static getAllCertificates(): CertificateRecord[] {
    return this.data.certificates;
  }

  static getCertificateBySerial(serialNumber: string): CertificateRecord | undefined {
    return this.data.certificates.find(cert => cert.serialNumber === serialNumber);
  }

  static deleteCertificateRecord(serialNumber: string): boolean {
    const initialLength = this.data.certificates.length;
    this.data.certificates = this.data.certificates.filter(
      cert => cert.serialNumber !== serialNumber
    );
    
    if (this.data.certificates.length < initialLength) {
      this.saveData();
      console.log(`🗑️ Certificate record deleted: ${serialNumber}`);
      return true;
    }
    return false;
  }

  private static saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('❌ Error saving certificate data:', error);
    }
  }

  static getStats() {
    return {
      totalCertificates: this.data.certificates.length,
      lastSerial: this.data.lastSerial,
      nextSerial: this.currentSerial
    };
  }
}

// Initialize on import
SerialNumberGenerator.initialize();
