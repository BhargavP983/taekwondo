# Backend - Taekwondo Association API

Node.js + Express + TypeScript backend for the Taekwondo Association Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- TypeScript knowledge

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ap-taekwondo

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (comma-separated)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Base URL for file serving
BASE_URL=http://localhost:5000
```

### Development
```bash
npm run dev        # Start with auto-reload
npm run build      # Compile TypeScript
npm start          # Start production build
npm run create-admin  # Create first admin user
```

## 📁 Project Structure

```
src/
├── server.ts              # Express app entry point
├── config/
│   └── database.ts        # MongoDB connection & retry logic
├── controllers/           # Route handlers with business logic
│   ├── authController.ts  # Authentication & user management
│   ├── cadetController.ts # Cadet registration management
│   ├── certificateController.ts # Certificate generation
│   ├── dashboardController.ts   # Dashboard statistics
│   ├── exportController.ts     # Data export functionality
│   └── poomsaeController.ts    # Poomsae competition management
├── middleware/
│   ├── authMiddleware.ts       # JWT verification & RBAC
│   ├── errorMiddleware.ts      # Global error handling
│   ├── uploadMiddleware.ts     # File upload handling
│   └── validationMiddleware.ts # Zod schema validation
├── models/               # Mongoose schemas & interfaces
│   ├── cadet.ts         # Cadet data model
│   ├── Certificate.ts   # Certificate data model
│   ├── counter.ts       # Atomic ID generation
│   ├── interfaces.ts    # TypeScript interfaces
│   ├── poomsae.ts      # Poomsae competition model
│   └── user.ts         # User & authentication model
├── routes/              # Express route definitions
│   ├── authRoutes.ts   # Authentication endpoints
│   ├── cadetRoutes.ts  # Cadet management endpoints
│   ├── certificateRoutes.ts # Certificate endpoints
│   ├── dashboardRoutes.ts   # Dashboard endpoints
│   ├── exportRoutes.ts     # Export endpoints
│   └── poomsaeRoutes.ts    # Poomsae endpoints
├── schemas/             # Zod validation schemas
│   ├── authSchemas.ts  # Authentication validation
│   ├── cadetSchemas.ts # Cadet form validation
│   └── poomsaeSchemas.ts # Poomsae validation
├── services/            # Business logic & external integrations
│   ├── cadetFormService.ts    # PDF form generation
│   ├── certificateService.ts  # Certificate generation with Canvas
│   └── poomsaeFormService.ts  # Poomsae form generation
├── scripts/             # Utility scripts
│   ├── createAdmin.ts  # Create admin user
│   ├── fixTfiIndex.ts  # Database maintenance
│   └── updateRoles.ts  # Role migration scripts
├── types/               # TypeScript type definitions
│   ├── api.ts          # API response types
│   ├── errors.ts       # Custom error classes
│   ├── express.ts      # Express type extensions
│   ├── handlers.ts     # Route handler types
│   ├── jwt.ts          # JWT payload types
│   ├── params.ts       # Route parameter types
│   └── user.ts         # User-related types
└── utils/               # Helper functions
    ├── cadetDataManager.ts     # Cadet data processing
    ├── fileIntegrityMonitor.ts # File system monitoring
    ├── jwtUtils.ts            # JWT token utilities
    ├── poomsaeDataManager.ts   # Poomsae data processing
    └── serialGenerator.ts      # Unique ID generation
```

## 🔐 Authentication Flow

### JWT Token Structure
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'superAdmin' | 'stateAdmin' | 'districtAdmin' | 'user';
  name: string;
  state?: string;    // For state/district admins
  district?: string; // For district admins
}
```

### Role-Based Access Control
- **Routes protected by** `authenticateToken()` middleware
- **Role enforcement via** `requireRole(...roles)` middleware
- **Data filtering** applied at controller level based on user role

### Password Security
- Bcrypt hashing with salt rounds: 10
- Password comparison via `user.comparePassword()`
- Passwords excluded from JSON responses

## 🌐 API Endpoints

### Authentication (`/api/auth`)
```http
POST   /login                    # User login
GET    /profile                  # Get current user profile
GET    /users                    # List all users (superAdmin only)
POST   /users                    # Create user (superAdmin only)
PUT    /users/:userId            # Update user (superAdmin only)
DELETE /users/:userId            # Delete user (superAdmin only)
PATCH  /users/:userId/toggle-status # Toggle user active status

# District Admin Management (stateAdmin, superAdmin)
GET    /district-admins          # List district admins
POST   /district-admins          # Create district admin
PUT    /district-admins/:userId  # Update district admin
DELETE /district-admins/:userId  # Delete district admin
PATCH  /district-admins/:userId/toggle-status # Toggle status

# Password Management
POST   /change-password          # Change own password
POST   /admin-reset-password/:userId # Admin reset user password
```

### Cadet Management (`/api/cadets`)
```http
POST   /                        # Create cadet entry (generates PDF form)
GET    /                        # List cadet entries (paginated, role-filtered)
GET    /:entryId                # Get specific cadet by entry ID
DELETE /:entryId                # Delete cadet entry
GET    /stats                   # Get cadet statistics (role-filtered)
```

### Certificate Generation (`/api/certificates`)
```http
POST   /generate                # Generate certificate with Canvas API
GET    /                        # List generated certificates
DELETE /:fileName               # Delete certificate file
GET    /template/download       # Download certificate template
```

### Dashboard (`/api/dashboard`)
```http
GET    /stats                   # Get dashboard statistics
GET    /recent-activities       # Get recent system activities
```

### Export (`/api/export`)
```http
POST   /cadets                  # Export cadet data (Excel/PDF)
POST   /certificates            # Export certificate data
```

### Health Check
```http
GET    /health                  # System health & database status
```

## 📊 Database Models

### User Model
```typescript
interface IUser {
  email: string;           // Unique, lowercase, validated
  password: string;        // Bcrypt hashed
  name: string;           // Display name
  role: UserRole;         // superAdmin | stateAdmin | districtAdmin | user
  state?: string;         // For state/district admins
  district?: string;      // For district admins
  isActive: boolean;      // Account status
  lastLogin?: Date;       // Last login timestamp
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-generated
}
```

### Cadet Model
```typescript
interface ICadetDocument {
  entryId: string;              // Unique ID (CAD-000001)
  gender: 'male' | 'female' | 'other';
  weightCategory?: string;
  name: string;                 // Uppercase, trimmed
  dateOfBirth: Date;
  age: number;                  // 5-50 range
  weight: number;               // 10-150 range
  parentGuardianName?: string;
  state: string;                // Indexed
  district: string;             // Indexed
  presentBeltGrade?: string;
  tfiIdCardNo?: string;         // Unique when provided
  academicQualification?: string;
  schoolName?: string;
  formFileName?: string;        // Generated PDF filename
  applicationStatus?: string;   // Default: 'pending'
  createdAt: Date;
  updatedAt: Date;
}
```

### Certificate Model
```typescript
interface ICertificate {
  serial: string;          // Unique serial number
  name: string;           // Recipient name
  dateOfBirth: string;    // DOB as string
  medal: string;          // Medal type
  category: string;       // Competition category
  generatedBy: string;    // User ID who generated
  filePath: string;       // File storage path
  createdAt: Date;
}
```

## 🔧 Services & Utilities

### CadetFormService
- **Purpose**: Generate PDF application forms
- **Technology**: Custom form generation
- **Output**: PDF files in `uploads/forms/`
- **Features**: Auto-filled forms with cadet data

### CertificateService
- **Purpose**: Generate certificates with custom design
- **Technology**: @napi-rs/canvas (native performance)
- **Output**: Image/PDF certificates in `uploads/certificates/`
- **Features**: Custom fonts, logos, serial numbers

### File Integrity Monitor
- **Purpose**: Monitor file system changes
- **Features**: Real-time file monitoring, integrity checks
- **Security**: Detects unauthorized file modifications

### JWT Utilities
```typescript
// Generate JWT token
generateToken(payload: JWTPayload): string

// Verify and decode token
verifyToken(token: string): JWTPayload | null

// Decode without verification
decodeToken(token: string): JWTPayload | null
```

## 🛡️ Security Features

### Rate Limiting
- **Global**: 100 requests per 15 minutes per IP
- **Auth endpoints**: Additional rate limiting
- **Configurable** via environment variables

### Security Headers
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
```

### CORS Configuration
- **Environment-based** origin allowlist
- **Development fallback** for localhost
- **Credentials support** enabled
- **Method restrictions** applied

### Input Validation
- **Zod schemas** for all endpoints
- **Type-safe validation** with error handling
- **Custom error messages** for better UX

## 🔄 Data Flow Patterns

### Role-Based Data Filtering
```typescript
// District admins see only their district
if (req.user?.role === 'districtAdmin') {
  filter.district = req.user.district;
}

// State admins see only their state
if (req.user?.role === 'stateAdmin') {
  filter.state = req.user.state;
}

// Super admins can apply query filters
if (req.user?.role === 'superAdmin') {
  if (req.query.district) filter.district = req.query.district;
  if (req.query.state) filter.state = req.query.state;
}
```

### Error Handling Pattern
```typescript
try {
  // Business logic
  const result = await someOperation();
  res.status(200).json({
    success: true,
    message: 'Operation successful',
    data: result
  });
} catch (error) {
  next(error); // Passes to global error middleware
}
```

## 🚀 Production Considerations

### Environment Variables
- Set strong `JWT_SECRET` (>32 characters)
- Use production MongoDB with authentication
- Configure proper `CORS_ORIGIN`
- Set `NODE_ENV=production`

### File Storage
- Currently using local file system
- Consider cloud storage (AWS S3, Google Cloud) for scale
- Implement backup strategy for `uploads/` directory

### Database Optimization
- Indexes configured on frequently queried fields
- Connection pooling enabled
- Automatic retry on connection failures

### Monitoring
- Health check endpoint for load balancers
- Comprehensive logging in development
- Error tracking hooks in place

## 🐛 Development Tips

### Debugging
```bash
# Check database connection
curl http://localhost:5000/health

# Test authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/profile

# Monitor logs
npm run dev # Watch console output
```

### Common Issues
1. **MongoDB connection failed**: Check if MongoDB is running
2. **JWT verification failed**: Verify token format and secret
3. **File upload issues**: Check `uploads/` directory permissions
4. **CORS errors**: Verify origin configuration

### Testing
- Use Postman/Insomnia for API testing
- Check network tab in browser dev tools
- Use MongoDB Compass for database inspection