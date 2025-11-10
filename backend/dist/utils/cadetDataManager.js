"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CadetDataManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_FILE = path_1.default.join(__dirname, '../../data/cadets.json');
class CadetDataManager {
    static initialize() {
        try {
            const dir = path_1.default.dirname(DATA_FILE);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            console.log(`📊 Cadet data initialized. Total entries: ${this.data.entries.length}`);
        }
        catch (error) {
            console.error('❌ Error initializing cadet data:', error);
        }
    }
    static generateEntryId() {
        this.data.lastEntryId++;
        const id = this.data.lastEntryId.toString().padStart(6, '0');
        return `CAD-${id}`;
    }
    static addEntry(entry) {
        const entryId = this.generateEntryId();
        const fullEntry = {
            entryId,
            ...entry,
            createdAt: new Date().toISOString()
        };
        this.data.entries.push(fullEntry);
        console.log(`✅ Cadet entry added: ${entryId}`);
        return entryId;
    }
    static getAllEntries() {
        return this.data.entries;
    }
    static getEntryById(entryId) {
        return this.data.entries.find(entry => entry.entryId === entryId);
    }
    static deleteEntry(entryId) {
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
exports.CadetDataManager = CadetDataManager;
CadetDataManager.data = {
    lastEntryId: 0,
    entries: []
};
// Initialize on import
CadetDataManager.initialize();
