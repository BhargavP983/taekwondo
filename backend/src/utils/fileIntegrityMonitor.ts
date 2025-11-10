import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface FileHash {
  hash: string;
  lastModified: number;
}

class FileIntegrityMonitor {
  private hashMap: Map<string, FileHash> = new Map();
  private readonly ignoreDirs = ['node_modules', '.git', 'dist', 'build'];
  private readonly allowedExtensions = ['.js', '.ts', '.json', '.env'];
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.initializeHashes();
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private shouldMonitorFile(filePath: string): boolean {
    const relativePath = path.relative(this.basePath, filePath);
    const shouldIgnore = this.ignoreDirs.some(dir => 
      relativePath.startsWith(dir + path.sep)
    );
    
    if (shouldIgnore) return false;
    
    const ext = path.extname(filePath);
    return this.allowedExtensions.includes(ext);
  }

  private async initializeHashes(): Promise<void> {
    const processDirectory = async (dir: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.ignoreDirs.includes(entry.name)) {
            await processDirectory(fullPath);
          }
        } else if (entry.isFile() && this.shouldMonitorFile(fullPath)) {
          const stats = await fs.promises.stat(fullPath);
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

  public async checkIntegrity(): Promise<void> {
    const alerts: string[] = [];

    const processDirectory = async (dir: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.ignoreDirs.includes(entry.name)) {
            await processDirectory(fullPath);
          }
        } else if (entry.isFile() && this.shouldMonitorFile(fullPath)) {
          const stats = await fs.promises.stat(fullPath);
          const currentHash = await this.calculateFileHash(fullPath);
          const storedData = this.hashMap.get(fullPath);

          if (!storedData) {
            alerts.push(`New file detected: ${fullPath}`);
          } else if (currentHash !== storedData.hash) {
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
const monitor = new FileIntegrityMonitor(path.resolve(__dirname, '..'));

// Check integrity every 5 minutes
setInterval(() => {
  monitor.checkIntegrity().catch(console.error);
}, 5 * 60 * 1000);

// Export for use in tests
export default FileIntegrityMonitor;