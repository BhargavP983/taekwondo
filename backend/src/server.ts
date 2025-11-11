import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorMiddleware';
import certificateRoutes from './routes/certificateRoutes';
import cadetRoutes from './routes/cadetRoutes';
import poomsaeRoutes from './routes/poomsaeRoutes';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import exportRoutes from './routes/exportRoutes';
import connectDB from './config/database';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];

// Connect to MongoDB
connectDB();

// Security middleware (allow cross-origin resource loads for images/files)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting for all routes
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // limit each IP
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
}, express.static(path.join(__dirname, '../uploads')));

app.use('/forms', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads/forms'))); // Add this


// Routes
app.use('/api/certificates', certificateRoutes);
app.use('/api/cadets', cadetRoutes); // Register cadet routes
app.use('/api/poomsae', poomsaeRoutes); // Register poomsae routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes); // Register export routes

console.log('✅ Routes registered');

// Health check with proper database status
app.get('/health', async (req: Request, res: Response) => {
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
  } catch (error) {
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
app.use((req: Request, res: Response) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.path}` 
  });
});

// Global error handler
app.use(errorHandler);

// Import and initialize file integrity monitor
import './utils/fileIntegrityMonitor';

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
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('   Try killing the process or use a different port.');
  } else {
    console.error('❌ Server failed to start:', err);
  }
});
