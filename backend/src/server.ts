import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import certificateRoutes from './routes/certificateRoutes';
import cadetRoutes from './routes/cadetRoutes'; // Import cadet routes
import poomsaeRoutes from './routes/poomsaeRoutes'; // Import poomsae routes

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// CORS with detailed logging
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

console.log('✅ CORS enabled for http://localhost:5173');

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/certificates', express.static(path.join(__dirname, '../uploads')));
app.use('/forms', express.static(path.join(__dirname, '../uploads/forms'))); // Add this


// Routes
app.use('/api/certificates', certificateRoutes);
app.use('/api/cadets', cadetRoutes); // Register cadet routes
app.use('/api/poomsae', poomsaeRoutes); // Register poomsae routes


console.log('✅ Routes registered');

// Health check
app.get('/health', (req: Request, res: Response) => {
  console.log('🏥 Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.path}` 
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Server Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log('\n🚀 ================================');
  console.log(`✅ Server started successfully!`);
  console.log(`📍 Backend:  http://localhost:${PORT}`);
  console.log(`📍 Frontend: http://localhost:5173`);
  console.log(`📊 Health:   http://localhost:${PORT}/health`);
  console.log(`📡 API:      http://localhost:${PORT}/api/certificates`);
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
