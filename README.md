


# Taekwondo Association Management System

A comprehensive web application for managing Taekwondo association operations including cadet registrations, Poomsae competitions, certificate generation, and administrative dashboards with role-based access control.

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture, data flow diagrams, and technical specifications.

## 🚀 Quick Start

### Prerequisites
- **Node.js v24.11.1 LTS or higher** (tested and verified ✅)
- **npm v11.6.2 or higher** (comes with Node.js LTS)
- MongoDB (local installation or MongoDB Atlas)
- Git

> ⚠️ **Important**: If you're using older Node.js versions (v18.x or v20.x), please upgrade to v24.11.1 LTS for optimal compatibility with native modules and the latest security features.

### 1. Clone the Repository
```bash
git clone https://github.com/BhargavP983/taekwondo.git
cd taekwondo
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
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

Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Create Admin User
Create the first admin user:
```bash
cd backend
npm run create-admin
```

Follow the prompts to create a superAdmin user.

## 📁 Project Structure

```
taekwondo/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── server.ts       # Express app entry point
│   │   ├── config/         # Database and configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Authentication, validation, etc.
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── uploads/            # File storage (forms, certificates)
│   └── package.json
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   └── types/          # TypeScript definitions
│   ├── pages/              # Page components
│   ├── services/           # API client
│   └── package.json
└── README.md
```

## 🔐 Authentication & Roles

The system uses JWT-based authentication with the following roles:

### Role Hierarchy
1. **Super Admin** (`superAdmin`)
   - Full system access
   - User management
   - All data access across states and districts

2. **State Admin** (`stateAdmin`)
   - Manage district admins within their state
   - View/manage all cadets and competitions in their state
   - Generate certificates for their state

3. **District Admin** (`districtAdmin`)
   - View/manage cadets and competitions in their district only
   - Generate certificates for their district

### Default Login Routes
- Super Admin → `/admin/dashboard`
- State Admin → `/state-admin/dashboard`
- District Admin → `/district-admin/dashboard`

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon (auto-reload)
npm run build      # Compile TypeScript
npm start          # Start compiled production build
```

### Frontend Development
```bash
cd frontend
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Available Scripts

#### Backend Scripts
- `npm run dev` - Development with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run create-admin` - Create admin user

#### Frontend Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user
- `GET /api/auth/users` - List users (super admin)
- `POST /api/auth/users` - Create user (super admin)

### Cadets
- `POST /api/cadets` - Create cadet entry
- `GET /api/cadets` - List cadet entries (filtered by role)
- `GET /api/cadets/:entryId` - Get specific cadet
- `DELETE /api/cadets/:entryId` - Delete cadet

### Certificates
- `POST /api/certificates/generate` - Generate certificate
- `GET /api/certificates` - List certificates
- `DELETE /api/certificates/:fileName` - Delete certificate

### Health Check
- `GET /health` - System health status

## 📋 Environment Variables

### Backend Required Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ap-taekwondo` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-change-in-production` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `http://localhost:5173,http://localhost:3000` |

### Frontend Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_BACKEND_URL` | Backend base URL | `http://localhost:5000` |

## 🔧 Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create the database automatically

### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a cluster
3. Get the connection string
4. Update `MONGODB_URI` in `.env`

### Initial Data
The system will automatically:
- Create database indexes
- Set up counter collections for ID generation
- Initialize required collections

## 📦 Production Deployment

### Backend Production Setup
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper `CORS_ORIGIN`
4. Set up MongoDB with authentication
5. Configure reverse proxy (nginx)
6. Set up SSL/HTTPS

### Frontend Production Build
```bash
npm run build
```
Serve the `dist` folder with a web server.

### Security Checklist
- [ ] Change default JWT secret
- [ ] Set up HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Configure rate limiting
- [ ] Set up file upload limits
- [ ] Configure logging and monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if MongoDB is running
   - Verify `.env` file exists with correct values
   - Check if port 5000 is available

2. **Frontend can't connect to backend**
   - Verify backend is running on port 5000
   - Check `VITE_API_BASE_URL` in frontend `.env`
   - Check CORS configuration

3. **Authentication not working**
   - Verify `JWT_SECRET` is set
   - Check token storage in browser dev tools
   - Verify API endpoints are correct

4. **File uploads failing**
   - Check backend `uploads/` directory exists
   - Verify file permissions
   - Check file size limits

### Development Tips
- Use browser dev tools to inspect network requests
- Check backend console for detailed error logs
- Use MongoDB Compass to inspect database
- Check `http://localhost:5000/health` for backend status

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review the troubleshooting section above Management System

A comprehensive full-stack application for managing Taekwondo cadet applications, poomsae forms, and certificate generation.

## 🚀 Quick Start

### Production Deployment (Ubuntu VPS)

**🚀 Quick Start - Copy & Paste Method:**

See [SIMPLE_DEPLOYMENT_GUIDE.md](./SIMPLE_DEPLOYMENT_GUIDE.md) for step-by-step commands you can copy and paste directly into your VPS terminal.

**Or use automated scripts:**
```powershell
# Full deployment (fresh VPS)
.\deploy.ps1

# Or continue from Step 9 (if system setup already done)
.\deploy-continue.ps1
```

**What it does:**
- ✅ Installs Node.js, MongoDB, PM2, Nginx
- ✅ Configures security (firewall, MongoDB auth)
- ✅ Deploys backend and frontend
- ✅ Sets up automated backups
- ✅ Retries failed operations automatically
- ⏱️ **Total time:** 15-25 minutes

📚 **Documentation:**
- [AUTOMATED_DEPLOYMENT.md](./AUTOMATED_DEPLOYMENT.md) - Complete automated deployment guide
- [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md) - Quick commands and troubleshooting
- [UBUNTU_VPS_DEPLOYMENT.md](./UBUNTU_VPS_DEPLOYMENT.md) - Manual deployment steps

### Local Development

**Prerequisites:**  Node.js v18+, MongoDB

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
-taekwondo/
├── backend/           # Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── ecosystem.config.json  # PM2 configuration
├── frontend/          # React + Vite frontend
│   ├── pages/
│   └── services/
├── deploy.sh          # Automated deployment script (Linux)
├── deploy.ps1         # Deployment launcher (Windows)
└── AUTOMATED_DEPLOYMENT.md
```

## 🔧 Technologies

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- PM2 Process Manager

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router

**Deployment:**
- Ubuntu VPS
- Nginx (reverse proxy + static files)
- PM2 (process management)
- MongoDB 7.0

## 📖 Deployment Guides

| Guide | Use Case | Time |
|-------|----------|------|
| [AUTOMATED_DEPLOYMENT.md](./AUTOMATED_DEPLOYMENT.md) | First-time deployment | 15-25 min |
| [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md) | Quick commands & fixes | 2 min read |
| [UBUNTU_VPS_DEPLOYMENT.md](./UBUNTU_VPS_DEPLOYMENT.md) | Manual deployment or troubleshooting | 30-60 min |
| [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) | Production security hardening | 20-40 min |

## 🛠️ Available Scripts

### Backend
```bash
npm run dev        # Development with nodemon
npm run build      # Compile TypeScript
npm start          # Production start
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

## 🔐 Environment Variables

See `.env.example` files in backend and frontend directories for required configuration.

## 🎯 Features

- Cadet application management
- Poomsae form submissions
- Certificate generation
- User authentication and authorization
- Role-based access control (Admin, District Admin, User)
- File upload handling
- Dashboard analytics

## 🚀 Deployment Options

1. **Automated (Recommended):** Run `.\deploy.ps1` - handles everything automatically
2. **Manual:** Follow UBUNTU_VPS_DEPLOYMENT.md for step-by-step instructions
3. **Custom:** Use deployment scripts as reference and customize

## 📊 System Requirements (VPS)

- **Minimum:** 1 CPU, 1GB RAM, 10GB SSD
- **Recommended:** 1 CPU, 2GB RAM, 20GB SSD
- **OS:** Ubuntu 20.04 or 22.04

## 🆘 Support

If deployment fails:
1. Check [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md) for quick fixes
2. Review logs: `pm2 logs taekwondo-backend`
3. See troubleshooting section in [UBUNTU_VPS_DEPLOYMENT.md](./UBUNTU_VPS_DEPLOYMENT.md)

## 📝 License

[Your License Here]

## 👥 Contributors

[Your Team/Contributors Here]
