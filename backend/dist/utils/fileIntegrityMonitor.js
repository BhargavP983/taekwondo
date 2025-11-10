"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class FileIntegrityMonitor {
    constructor(basePath) {
        this.hashMap = new Map();
        this.ignoreDirs = ['node_modules', '.git', 'dist', 'build'];
        this.allowedExtensions = ['.js', '.ts', '.json', '.env'];
        this.basePath = basePath;
        this.initializeHashes();
    }
    async calculateFileHash(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto_1.default.createHash('sha256');
            const stream = fs_1.default.createReadStream(filePath);
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    shouldMonitorFile(filePath) {
        const relativePath = path_1.default.relative(this.basePath, filePath);
        const shouldIgnore = this.ignoreDirs.some(dir => relativePath.startsWith(dir + path_1.default.sep));
        if (shouldIgnore)
            return false;
        const ext = path_1.default.extname(filePath);
        return this.allowedExtensions.includes(ext);
    }
    async initializeHashes() {
        const processDirectory = async (dir) => {
            const entries = await fs_1.default.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!this.ignoreDirs.includes(entry.name)) {
                        await processDirectory(fullPath);
                    }
                }
                else if (entry.isFile() && this.shouldMonitorFile(fullPath)) {
                    const stats = await fs_1.default.promises.stat(fullPath);
                    const hash = await this.calculateFileHash(fullPath);
                    this.hashMap.set(fullPath, {
                        hash,
                        lastModified: stats.mtimeMs
                    });
                }
            }
        };
        await processDirectory(this.basePath);
        console.log('File integrity monitor initialized');
    }
    async checkIntegrity() {
        const alerts = [];
        const processDirectory = async (dir) => {
            const entries = await fs_1.default.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!this.ignoreDirs.includes(entry.name)) {
                        await processDirectory(fullPath);
                    }
                }
                else if (entry.isFile() && this.shouldMonitorFile(fullPath)) {
                    const stats = await fs_1.default.promises.stat(fullPath);
                    const currentHash = await this.calculateFileHash(fullPath);
                    const storedData = this.hashMap.get(fullPath);
                    if (!storedData) {
                        alerts.push(`New file detected: ${fullPath}`);
                    }
                    else if (currentHash !== storedData.hash) {
                        if (stats.mtimeMs === storedData.lastModified) {
                            alerts.push(`File content changed without modification time update: ${fullPath}`);
                        }
                        this.hashMap.set(fullPath, {
                            hash: currentHash,
                            lastModified: stats.mtimeMs
                        });
                    }
                }
            }
        };
        await processDirectory(this.basePath);
        if (alerts.length > 0) {
            console.error('⚠️ Security Alerts:');
            alerts.forEach(alert => console.error(alert));
        }
    }
}
// Initialize the monitor
const monitor = new FileIntegrityMonitor(path_1.default.resolve(__dirname, '..'));
// Check integrity every 5 minutes
setInterval(() => {
    monitor.checkIntegrity().catch(console.error);
}, 5 * 60 * 1000);
// Export for use in tests
exports.default = FileIntegrityMonitor;
