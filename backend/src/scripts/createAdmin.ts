import mongoose from 'mongoose';
import { User } from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ap-taekwondo');
    
    const existingAdmin = await User.findOne({ email: 'admin@aptaekwondo.com' });
    
    if (existingAdmin) {
      console.log('✅ Default admin already exists');
    } else {
      await User.create({
        email: 'admin@aptaekwondo.com',
        password: 'admin123',
        name: 'Super Admin',
        role: 'superAdmin',
        isActive: true
      });
      console.log('✅ Default admin created');
      console.log('Email: admin@aptaekwondo.com');
      console.log('Password: admin123');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
