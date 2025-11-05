import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_FILE = path.join(__dirname, '../../data/users.json');

export type UserRole = 'super_admin' | 'state_admin' | 'district_admin';

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: UserRole;
  state?: string; // For state_admin
  district?: string; // For district_admin
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface UserData {
  users: User[];
}

export class UserDataManager {
  private static data: UserData = {
    users: []
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
        // Create default super admin
        this.createDefaultAdmin();
        this.saveData();
      }
      console.log(`👥 User data initialized. Total users: ${this.data.users.length}`);
    } catch (error) {
      console.error('❌ Error initializing user data:', error);
    }
  }

  private static async createDefaultAdmin() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    this.data.users.push({
      id: 'SA-000001',
      email: 'admin@aptaekwondo.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      isActive: true
    });
    console.log('✅ Default super admin created (email: admin@aptaekwondo.com, password: admin123)');
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'password'> & { password: string }): Promise<User> {
    const id = this.generateUserId(userData.role);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser: User = {
      id,
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role,
      state: userData.state,
      district: userData.district,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    this.data.users.push(newUser);
    this.saveData();
    
    console.log(`✅ User created: ${newUser.email} (${newUser.role})`);
    return newUser;
  }

  private static generateUserId(role: UserRole): string {
    const prefix = role === 'super_admin' ? 'SA' : role === 'state_admin' ? 'STA' : 'DA';
    const count = this.data.users.filter(u => u.role === role).length + 1;
    return `${prefix}-${count.toString().padStart(6, '0')}`;
  }

  static findByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static findById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static updateLastLogin(userId: string) {
    const user = this.findById(userId);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.saveData();
    }
  }

  static getAllUsers(): Omit<User, 'password'>[] {
    return this.data.users.map(({ password, ...user }) => user);
  }

  static updateUser(userId: string, updates: Partial<User>): boolean {
    const index = this.data.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      this.saveData();
      return true;
    }
    return false;
  }

  static deleteUser(userId: string): boolean {
    const initialLength = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== userId);
    
    if (this.data.users.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  private static saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('❌ Error saving user data:', error);
    }
  }
}

UserDataManager.initialize();
