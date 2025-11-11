import mongoose from 'mongoose';
import { Cadet } from '../models/cadet';
import { Poomsae } from '../models/poomsae';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ap-taekwondo';
    
    // Configure mongoose with optimized settings
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,        // Maximum number of connections in the pool
      minPoolSize: 2,         // Minimum number of connections
      serverSelectionTimeoutMS: 5000,  // Timeout for selecting a server
      socketTimeoutMS: 45000,  // Close sockets after 45 seconds of inactivity
      family: 4,              // Use IPv4, skip trying IPv6
    });
    
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
      console.log('⚠️ MongoDB disconnected - attempting to reconnect...');
      setTimeout(connectDB, 5000); // Attempt to reconnect after 5 seconds
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000); // Retry connection instead of exiting
  }
};

export default connectDB;
