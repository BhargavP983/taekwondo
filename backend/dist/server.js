"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const certificateRoutes_1 = __importDefault(require("./routes/certificateRoutes"));
const cadetRoutes_1 = __importDefault(require("./routes/cadetRoutes"));
const poomsaeRoutes_1 = __importDefault(require("./routes/poomsaeRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const database_1 = __importDefault(require("./config/database"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
// Connect to MongoDB
(0, database_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// Rate limiting for all routes
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// CORS configuration
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Allow localhost origins for development
        if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
            return callback(null, true);
        }
        // Allow 127.0.0.1 origins for development
        if (origin.match(/^https?:\/\/127\.0\.0\.1(:\d+)?$/)) {
            return callback(null, true);
        }
        // In production, you might want to restrict this
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));
console.log('✅ CORS enabled for development URLs');
// Body parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
console.log('✅ Body parsers enabled');
// Detailed request logging
app.use((req, res, next) => {
    console.log('\n📨 Incoming Request:');
    console.log('   Method:', req.method);
    console.log('   Path:', req.path);
    console.log('   Origin:', req.get('origin'));
    console.log('   Body:', req.body);
    next();
});
// Logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});
// Static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/forms', express_1.default.static(path_1.default.join(__dirname, '../uploads/forms'))); // Add this
// Routes
app.use('/api/certificates', certificateRoutes_1.default);
app.use('/api/cadets', cadetRoutes_1.default); // Register cadet routes
app.use('/api/poomsae', poomsaeRoutes_1.default); // Register poomsae routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
console.log('✅ Routes registered');
// Health check
app.get('/health', (req, res) => {
    console.log('🏥 Health check requested');
    const mongoose = require('mongoose');
    res.status(200).json({
        status: 'OK',
        message: 'Backend server is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});
// 404 handler
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`
    });
});
// Global error handler
app.use(errorMiddleware_1.errorHandler);
// Import and initialize file integrity monitor
require("./utils/fileIntegrityMonitor");
// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 ================================');
    console.log(`✅ Server started successfully!`);
    console.log(`📍 Backend:  http://localhost:${PORT}`);
    console.log(`📍 Frontend: http://localhost:5173`);
    console.log(`📊 Health:   http://localhost:${PORT}/health`);
    console.log(`📡 API:      http://localhost:${PORT}/api/certificates`);
    console.log('🛡️  Security monitoring active');
    console.log('==================================\n');
    console.log('Waiting for requests...\n');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error('   Try killing the process or use a different port.');
    }
    else {
        console.error('❌ Server failed to start:', err);
    }
});
