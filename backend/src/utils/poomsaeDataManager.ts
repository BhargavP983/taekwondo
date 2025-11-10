import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../../data/poomsae.json');

export interface PoomsaeEntry {
  entryId: string;
  division: string;
  category: string;
  gender: string;
  name: string;
  stateOrg: string;
  district: string;
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
  createdAt: string;
}

interface PoomsaeData {
  lastEntryId: number;
  entries: PoomsaeEntry[];
}

export class PoomsaeDataManager {
  private static data: PoomsaeData = {
    lastEntryId: 0,
    entries: []
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
      } else {
        this.saveData();
      }
      console.log(`📊 Poomsae data initialized. Total entries: ${this.data.entries.length}`);
    } catch (error) {
      console.error('❌ Error initializing poomsae data:', error);
    }
  }

  static generateEntryId(): string {
    this.data.lastEntryId++;
    const id = this.data.lastEntryId.toString().padStart(6, '0');
    return `PMS-${id}`;
  }

  static addEntry(entry: Omit<PoomsaeEntry, 'entryId' | 'createdAt'>): string {
    const entryId = this.generateEntryId();
    const fullEntry: PoomsaeEntry = {
      entryId,
      ...entry,
      createdAt: new Date().toISOString()
    };

    this.data.entries.push(fullEntry);
    this.saveData();

    console.log(`✅ Poomsae entry added: ${entryId}`);
    return entryId;
  }

  static getAllEntries(): PoomsaeEntry[] {
    return this.data.entries;
  }

  static getEntryById(entryId: string): PoomsaeEntry | undefined {
    return this.data.entries.find(entry => entry.entryId === entryId);
  }

  static deleteEntry(entryId: string): boolean {
    const initialLength = this.data.entries.length;
    this.data.entries = this.data.entries.filter(entry => entry.entryId !== entryId);
    
    if (this.data.entries.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  private static saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('❌ Error saving poomsae data:', error);
    }
  }

  static getStats() {
    return {
      totalEntries: this.data.entries.length,
      lastEntryId: this.data.lastEntryId
    };
  }
}

PoomsaeDataManager.initialize();
