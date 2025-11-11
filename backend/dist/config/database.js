"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cadet_1 = require("../models/cadet");
const poomsae_1 = require("../models/poomsae");
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ap-taekwondo';
        // Configure mongoose with optimized settings
        mongoose_1.default.set('strictQuery', false);
        await mongoose_1.default.connect(mongoURI, {
            maxPoolSize: 10, // Maximum number of connections in the pool
            minPoolSize: 2, // Minimum number of connections
            serverSelectionTimeoutMS: 5000, // Timeout for selecting a server
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
        });
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📊 Database: ${mongoose_1.default.connection.name}`);
        // Ensure indexes match schema (drops old/conflicting ones)
        try {
            await Promise.all([
                cadet_1.Cadet.syncIndexes(),
                poomsae_1.Poomsae.syncIndexes()
            ]);
            console.log('🔧 Schema indexes synchronized');
        }
        catch (idxErr) {
            console.warn('⚠️ Failed to sync indexes:', idxErr);
        }
        // Handle connection events
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected - attempting to reconnect...');
            setTimeout(connectDB, 5000); // Attempt to reconnect after 5 seconds
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000); // Retry connection instead of exiting
    }
};
exports.default = connectDB;
