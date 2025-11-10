import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../../data/cadets.json');

export interface CadetEntry {
  entryId: string;
  gender: string;
  weightCategory: string;
  name: string;
  dateOfBirth: string;
  age: string;
  weight: string;
  parentGuardianName: string;
  state: string;
  district: string;
  presentBeltGrade: string;
  tfiIdCardNo: string;
  academicQualification: string;
  schoolName: string;
  createdAt: string;
}

interface CadetData {
  lastEntryId: number;
  entries: CadetEntry[];
}

export class CadetDataManager {
  private static data: CadetData = {
    lastEntryId: 0,
    entries: []
  };

  static initialize() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      console.log(`📊 Cadet data initialized. Total entries: ${this.data.entries.length}`);
    } catch (error) {
      console.error('❌ Error initializing cadet data:', error);
    }
  }

  static generateEntryId(): string {
    this.data.lastEntryId++;
    const id = this.data.lastEntryId.toString().padStart(6, '0');
    return `CAD-${id}`;
  }

  static addEntry(entry: Omit<CadetEntry, 'entryId' | 'createdAt'>): string {
    const entryId = this.generateEntryId();
    const fullEntry: CadetEntry = {
      entryId,
      ...entry,
      createdAt: new Date().toISOString()
    };

    this.data.entries.push(fullEntry);

    console.log(`✅ Cadet entry added: ${entryId}`);
    return entryId;
  }

  static getAllEntries(): CadetEntry[] {
    return this.data.entries;
  }

  static getEntryById(entryId: string): CadetEntry | undefined {
    return this.data.entries.find(entry => entry.entryId === entryId);
  }

  static deleteEntry(entryId: string): boolean {
    const initialLength = this.data.entries.length;
    this.data.entries = this.data.entries.filter(entry => entry.entryId !== entryId);
    
    if (this.data.entries.length < initialLength) {
      console.log(`🗑️ Cadet entry deleted: ${entryId}`);
      return true;
    }
    return false;
  }

  static getStats() {
    return {
      totalEntries: this.data.entries.length,
      lastEntryId: this.data.lastEntryId
    };
  }
}

// Initialize on import
CadetDataManager.initialize();
