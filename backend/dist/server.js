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
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
const database_1 = __importDefault(require("./config/database"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
// Connect to MongoDB
(0, database_1.default)();
// Security middleware (allow cross-origin resource loads for images/files)
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// Rate limiting for all routes
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // limit each IP
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// CORS configuration
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // In development, allow all localhost origins
        if (NODE_ENV === 'development') {
            if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
                return callback(null, true);
            }
        }
        // Check if origin is in allowed list
        if (CORS_ORIGIN.includes(origin)) {
            return callback(null, true);
        }
        // In production, reject unauthorized origins
        if (NODE_ENV === 'production') {
            return callback(new Error('Not allowed by CORS'));
        }
        // Development fallback - allow
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Disposition'],
}));
console.log('✅ CORS enabled');
console.log('   Environment:', NODE_ENV);
console.log('   Allowed Origins:', CORS_ORIGIN);
// Body parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
console.log('✅ Body parsers enabled');
// Request logging (only in development)
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log('\n📨 Incoming Request:');
        console.log('   Method:', req.method);
        console.log('   Path:', req.path);
        console.log('   Origin:', req.get('origin'));
        console.log('   Body:', req.body);
        next();
    });
}
// Basic logging for all environments
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`📨 ${req.method} ${req.path}`);
    }
    next();
});
// Static files with relaxed CORP for cross-origin embedding (frontend on different port)
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/forms', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(path_1.default.join(__dirname, '../uploads/forms'))); // Add this
// Routes
app.use('/api/certificates', certificateRoutes_1.default);
app.use('/api/cadets', cadetRoutes_1.default); // Register cadet routes
app.use('/api/poomsae', poomsaeRoutes_1.default); // Register poomsae routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/export', exportRoutes_1.default); // Register export routes
console.log('✅ Routes registered');
// Health check with proper database status
app.get('/health', async (req, res) => {
    console.log('🏥 Health check requested');
    const mongoose = require('mongoose');
    try {
        // Check database connection state
        const dbState = mongoose.connection.readyState;
        const dbStatus = dbState === 1 ? 'Connected' :
            dbState === 2 ? 'Connecting' :
                dbState === 0 ? 'Disconnected' : 'Unknown';
        // Try a quick ping to verify database is responsive
        if (dbState === 1) {
            await mongoose.connection.db.admin().ping();
        }
        res.status(200).json({
            status: 'OK',
            message: 'Backend server is running',
            database: dbStatus,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Health check failed:', error);
        res.status(503).json({
            status: 'ERROR',
            message: 'Service temporarily unavailable',
            database: 'Error',
            timestamp: new Date().toISOString()
        });
    }
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
