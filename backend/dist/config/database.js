"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ap-taekwondo';
        await mongoose_1.default.connect(mongoURI);
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📊 Database: ${mongoose_1.default.connection.name}`);
        // Handle connection events
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1); // Exit process with failure
    }
};
exports.default = connectDB;
