"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../models/user");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createDefaultAdmin = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ap-taekwondo');
        const existingAdmin = await user_1.User.findOne({ email: 'admin@aptaekwondo.com' });
        if (existingAdmin) {
            console.log('✅ Default admin already exists');
        }
        else {
            await user_1.User.create({
                email: 'admin@aptaekwondo.com',
                password: 'admin123',
                name: 'Super Admin',
                role: 'super_admin',
                isActive: true
            });
            console.log('✅ Default admin created');
            console.log('Email: admin@aptaekwondo.com');
            console.log('Password: admin123');
        }
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};
createDefaultAdmin();
