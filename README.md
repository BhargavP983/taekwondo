


# Taekwondo Management System

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
