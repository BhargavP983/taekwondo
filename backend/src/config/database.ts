import mongoose from 'mongoose';
import { Cadet } from '../models/cadet';
import { Poomsae } from '../models/poomsae';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ap-taekwondo';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Ensure indexes match schema (drops old/conflicting ones)
    try {
      await Promise.all([
        Cadet.syncIndexes(),
        Poomsae.syncIndexes()
      ]);
      console.log('🔧 Schema indexes synchronized');
    } catch (idxErr) {
      console.warn('⚠️ Failed to sync indexes:', idxErr);
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
