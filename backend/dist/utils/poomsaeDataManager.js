"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoomsaeDataManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_FILE = path_1.default.join(__dirname, '../../data/poomsae.json');
class PoomsaeDataManager {
    static initialize() {
        try {
            const dir = path_1.default.dirname(DATA_FILE);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            if (fs_1.default.existsSync(DATA_FILE)) {
                const fileData = fs_1.default.readFileSync(DATA_FILE, 'utf-8');
                this.data = JSON.parse(fileData);
            }
            else {
                this.saveData();
            }
            console.log(`📊 Poomsae data initialized. Total entries: ${this.data.entries.length}`);
        }
        catch (error) {
            console.error('❌ Error initializing poomsae data:', error);
        }
    }
    static generateEntryId() {
        this.data.lastEntryId++;
        const id = this.data.lastEntryId.toString().padStart(6, '0');
        return `PMS-${id}`;
    }
    static addEntry(entry) {
        const entryId = this.generateEntryId();
        const fullEntry = {
            entryId,
            ...entry,
            createdAt: new Date().toISOString()
        };
        this.data.entries.push(fullEntry);
        this.saveData();
        console.log(`✅ Poomsae entry added: ${entryId}`);
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
            this.saveData();
            return true;
        }
        return false;
    }
    static saveData() {
        try {
            fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
        }
        catch (error) {
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
exports.PoomsaeDataManager = PoomsaeDataManager;
PoomsaeDataManager.data = {
    lastEntryId: 0,
    entries: []
};
PoomsaeDataManager.initialize();
