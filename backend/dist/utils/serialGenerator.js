"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialNumberGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_FILE = path_1.default.join(__dirname, '../../data/certificates.json');
class SerialNumberGenerator {
    static initialize() {
        try {
            const dir = path_1.default.dirname(DATA_FILE);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            if (fs_1.default.existsSync(DATA_FILE)) {
                const fileData = fs_1.default.readFileSync(DATA_FILE, 'utf-8');
                this.data = JSON.parse(fileData);
                this.currentSerial = this.data.lastSerial + 1;
            }
            else {
                this.saveData();
            }
            console.log(`📊 Serial number initialized at: ${this.currentSerial}`);
            console.log(`📝 Total certificates stored: ${this.data.certificates.length}`);
        }
        catch (error) {
            console.error('❌ Error initializing serial number:', error);
        }
    }
    static generate() {
        const serial = this.currentSerial.toString().padStart(9, '0');
        const formatted = `${serial.slice(0, 3)}-${serial.slice(3, 6)}-${serial.slice(6, 9)}`;
        this.currentSerial++;
        this.data.lastSerial = this.currentSerial - 1;
        return formatted;
    }
    static saveCertificateRecord(record) {
        const fullRecord = {
            ...record,
            createdAt: new Date().toISOString()
        };
        this.data.certificates.push(fullRecord);
        this.saveData();
        console.log(`📝 Certificate record saved: ${record.serialNumber}`);
    }
    static getAllCertificates() {
        return this.data.certificates;
    }
    static getCertificateBySerial(serialNumber) {
        return this.data.certificates.find(cert => cert.serialNumber === serialNumber);
    }
    static deleteCertificateRecord(serialNumber) {
        const initialLength = this.data.certificates.length;
        this.data.certificates = this.data.certificates.filter(cert => cert.serialNumber !== serialNumber);
        if (this.data.certificates.length < initialLength) {
            this.saveData();
            console.log(`🗑️ Certificate record deleted: ${serialNumber}`);
            return true;
        }
        return false;
    }
    static saveData() {
        try {
            fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
        }
        catch (error) {
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
exports.SerialNumberGenerator = SerialNumberGenerator;
SerialNumberGenerator.currentSerial = 1;
SerialNumberGenerator.data = {
    lastSerial: 0,
    certificates: []
};
// Initialize on import
SerialNumberGenerator.initialize();
