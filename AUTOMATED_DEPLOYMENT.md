# Automated VPS Deployment Scripts

This directory contains automated deployment scripts to deploy the Taekwondo application to an Ubuntu VPS with minimal manual intervention.

## 📋 Overview

The deployment process is fully automated with:
- ✅ **Error handling and retry mechanisms** - Automatically retries failed operations up to 3 times
- ✅ **Progress tracking** - Clear visual feedback with colors and status indicators
- ✅ **Interactive prompts** - Guides you through configuration when needed
- ✅ **Rollback safety** - Validates each step before proceeding
- ✅ **Security hardening** - Configures firewall, MongoDB authentication, and secure defaults

## 🚀 Quick Start

### Option A: Full Deployment (Steps 1-13)

**Use when:** Setting up a fresh VPS

1. **Ensure you have SSH client installed**
   - Go to Settings > Apps > Optional Features
   - Add "OpenSSH Client" if not installed

2. **Run the PowerShell deployment script**
   ```powershell
   cd "X:\Web Dev\Gemini\-taekwondo"
   .\deploy.ps1
   ```

3. **Follow the prompts**
   - Enter your VPS IP address
   - The script will upload deploy.sh and run it on your VPS
   - You'll be prompted for MongoDB passwords and configuration

4. **Access your application**
   - Frontend: `http://YOUR_VPS_IP`
   - Backend API: `http://YOUR_VPS_IP:5000`

### Option B: Continue from Step 9

**Use when:** Steps 1-8 (system setup) are already complete, but Step 9 failed

1. **Run the continuation script**
   ```powershell
   cd "X:\Web Dev\Gemini\-taekwondo"
   .\deploy-continue.ps1
   ```

2. **What it does:**
   - Step 9: Setup backend (with permission fix)
   - Step 10: Setup frontend (with permission fix)
   - Step 11: Start backend with PM2
   - Step 12: Configure Nginx

### Option C: Deploy Directly on VPS

**Use when:** You prefer manual control

1. **Upload the deploy.sh script to your VPS**
   ```bash
   scp deploy.sh deploy@YOUR_VPS_IP:/tmp/
   # Or for continuation:
   scp deploy-continue.sh deploy@YOUR_VPS_IP:/tmp/
   ```

2. **SSH into your VPS**
   ```bash
   ssh deploy@YOUR_VPS_IP
   ```

3. **Run the deployment script**
   ```bash
   chmod +x /tmp/deploy.sh
   sudo /tmp/deploy.sh
   ```

4. **Follow the interactive prompts**

## 📦 What Gets Installed

The script automatically installs and configures:

1. **System Updates** - Latest security patches
2. **Node.js v20** - JavaScript runtime
3. **MongoDB v7.0** - Database with authentication
4. **PM2** - Process manager for Node.js
5. **Nginx** - Web server and reverse proxy
6. **UFW Firewall** - Network security
7. **Application Code** - Clones from GitHub
8. **Backend Setup** - Dependencies, build, and configuration
9. **Frontend Setup** - Dependencies, build, and static files
10. **PM2 Process** - Starts backend in cluster mode
11. **Nginx Configuration** - Serves frontend and proxies API
12. **Automated Backups** - Daily MongoDB and upload backups

## 🔧 What You'll Need

Before running the script, prepare:

- ✅ **Ubuntu VPS** (20.04 or 22.04) with root/sudo access
- ✅ **SSH access** to the VPS
- ✅ **VPS IP address**
- ✅ **MongoDB passwords** (you'll be prompted to create them)
- ✅ **GitHub repository access** (if private repo)

## 🎯 Script Features

### Retry Mechanism

Each critical operation is retried up to 3 times with 5-second delays:
```bash
# Example: Network operations
- Attempt 1: Download Node.js setup...
- ⚠ Failed. Retrying in 5 seconds...
- Attempt 2: Download Node.js setup...
- ✓ Success!
```

### Error Handling

If a step fails after retries:
```bash
✗ Install MongoDB failed after 3 attempts
Continue with next steps? (y/N):
```

You can choose to:
- Continue deployment (skip failed step)
- Abort deployment (fix issue manually)

### Smart Detection

The script detects existing installations:
```bash
ℹ Node.js already installed: v20.11.0
Reinstall Node.js? (y/N):
```

### Progress Indicators

Clear visual feedback throughout:
- 🔵 **Blue headers** - Major step starting
- ✅ **Green checkmarks** - Success
- ❌ **Red X marks** - Errors
- ⚠️ **Yellow warnings** - Important notices
- ℹ️ **Cyan info** - Helpful information

## 📝 Step-by-Step Breakdown

### Step 1: System Update
- Updates package lists
- Upgrades installed packages
- **Retry:** Yes (3 attempts)

### Step 2: Node.js Installation
- Adds NodeSource repository
- Installs Node.js v20 and npm
- **Retry:** Yes (3 attempts)
- **Skip:** If already installed (with prompt)

### Step 3: MongoDB Installation
- Imports MongoDB GPG key
- Adds MongoDB repository
- Installs MongoDB 7.0
- Starts and enables MongoDB service
- **Retry:** Yes (3 attempts)
- **Skip:** If already installed (with prompt)

### Step 4: MongoDB Configuration
- Creates admin user (userAdminAnyDatabase role)
- Creates application user (readWrite on ap-taekwondo)
- Enables authentication in mongod.conf
- Restarts MongoDB
- **Passwords:** Securely prompted (hidden input)

### Step 5: PM2 Installation
- Installs PM2 globally via npm
- **Retry:** Yes (3 attempts)
- **Skip:** If already installed

### Step 6: Nginx Installation
- Installs Nginx web server
- Starts and enables service
- **Retry:** Yes (3 attempts)
- **Skip:** If already installed

### Step 7: Firewall Configuration
- Enables UFW firewall
- Allows SSH (port 22)
- Allows HTTP/HTTPS (ports 80, 443)
- Allows backend API (port 5000)
- **No retry** (firewall changes are immediate)

### Step 8: Clone Application
- Creates app directory
- Clones from GitHub if new
- Pulls latest changes if exists
- Stashes local changes if needed
- **Retry:** Yes (3 attempts)

### Step 9: Backend Setup
- Installs npm dependencies (including devDependencies)
- Creates .env file with prompted configuration
- Verifies template files exist
- Builds TypeScript (tsc)
- Creates upload and data directories
- **Retry:** Yes for npm/build (3 attempts)
- **Validation:** Checks for templates and dist/

### Step 10: Frontend Setup
- Installs npm dependencies
- Creates .env.production file
- Verifies critical files exist
- Builds production bundle with Vite
- Validates dist/ directory created
- **Retry:** Yes for npm/build (3 attempts)
- **Validation:** Checks for critical React components

### Step 11: Start Backend
- Starts backend with PM2 using ecosystem.config.json
- Saves PM2 process list
- Configures PM2 to start on boot
- **Retry:** Restarts if already running
- **Validation:** Checks PM2 status shows "online"

### Step 12: Nginx Configuration
- Creates Nginx config for frontend (port 80)
- Creates Nginx config for backend API (port 5000)
- Enables gzip compression
- Configures static file caching
- Tests and reloads Nginx
- **Validation:** nginx -t before reloading

### Step 13: Automated Backups
- Creates backup script for MongoDB and uploads
- Schedules daily backups via cron (2 AM)
- Keeps last 7 days of backups
- **No retry** (cron configuration)

## 🔍 Post-Deployment Verification

After successful deployment, verify:

### 1. Check Backend Status
```bash
pm2 status
# Should show: taekwondo-backend | online

pm2 logs taekwondo-backend --lines 20
# Should show: Server running on port 5000
```

### 2. Check Frontend Files
```bash
ls -la /home/deploy/apps/-taekwondo/frontend/dist/
# Should see: index.html, assets/
```

### 3. Test API Endpoint
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

### 4. Test Frontend
```bash
curl http://localhost
# Should return HTML content
```

### 5. Check Nginx Status
```bash
sudo systemctl status nginx
# Should show: active (running)
```

### 6. Check MongoDB
```bash
sudo systemctl status mongod
# Should show: active (running)

mongosh -u taekwondo_user -p --authenticationDatabase ap-taekwondo
# Should connect successfully
```

## 🛠️ Manual Fixes for Common Issues

### Issue 1: tsc Permission Denied

**Symptom:** Build fails with "sh: 1: tsc: Permission denied"

**Fix:**
```bash
cd /home/deploy/apps/-taekwondo/backend
chmod -R +x node_modules/.bin/
npm run build
```

**Note:** The updated deployment script now automatically fixes this.

### Issue 2: MongoDB Connection Failed

**Symptom:** Backend logs show "MongoServerError: Authentication failed"

**Fix:**
```bash
# Reset MongoDB password
mongosh
use ap-taekwondo
db.updateUser("taekwondo_user", {pwd: "NEW_PASSWORD"})

# Update backend .env
cd /home/deploy/apps/-taekwondo/backend
nano .env
# Update MONGODB_URI with new password

# Restart backend
pm2 restart taekwondo-backend
```

### Issue 3: Backend Won't Start

**Symptom:** PM2 shows "errored" or "stopped"

**Fix:**
```bash
# Check logs for specific error
pm2 logs taekwondo-backend --lines 50

# Common causes:
# 1. Missing .env file
cd /home/deploy/apps/-taekwondo/backend
ls -la .env

# 2. TypeScript not built
npm run build

# 3. Port already in use
sudo lsof -i :5000
# Kill process or change port in .env

# Restart after fixing
pm2 restart taekwondo-backend
```

### Issue 4: Frontend Shows Blank Page

**Symptom:** Browser shows empty white page

**Fix:**
```bash
# Check if dist folder exists
ls -la /home/deploy/apps/-taekwondo/frontend/dist/

# Rebuild if missing
cd /home/deploy/apps/-taekwondo/frontend
chmod -R +x node_modules/.bin/  # Fix permissions if needed
npm run build

# Check Nginx config
sudo nginx -t
sudo systemctl restart nginx

# Check browser console (F12) for specific errors
```

### Issue 5: 502 Bad Gateway

**Symptom:** Nginx returns 502 error

**Fix:**
```bash
# Check if backend is running
pm2 status
curl http://localhost:5000/api/health

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Restart both services
pm2 restart taekwondo-backend
sudo systemctl restart nginx
```

### Issue 6: CORS Errors

**Symptom:** Browser console shows CORS policy errors

**Fix:**
```bash
# Update backend .env with correct CORS_ORIGIN
cd /home/deploy/apps/-taekwondo/backend
nano .env

# Should include your VPS IP:
CORS_ORIGIN=http://YOUR_VPS_IP,http://YOUR_VPS_IP:5173

# Restart backend
pm2 restart taekwondo-backend
```

## 🔄 Updating the Application

After making changes locally and pushing to GitHub:

```bash
# SSH into VPS
ssh deploy@YOUR_VPS_IP

# Navigate to app directory
cd /home/deploy/apps/-taekwondo

# Pull latest changes
git stash  # Save any local changes
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart taekwondo-backend

# Update frontend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

Or simply **re-run the deployment script** - it will update everything:
```bash
sudo /tmp/deploy.sh
```

## 📊 Monitoring Commands

```bash
# Check all service statuses
pm2 status                          # Backend processes
sudo systemctl status nginx         # Web server
sudo systemctl status mongod        # Database

# View logs
pm2 logs taekwondo-backend         # Backend logs (live)
pm2 logs taekwondo-backend --lines 100  # Last 100 lines
sudo tail -f /var/log/nginx/access.log  # Nginx access log
sudo tail -f /var/log/nginx/error.log   # Nginx error log

# Resource usage
pm2 monit                          # PM2 monitoring dashboard
htop                               # System resources

# Check backups
ls -lh /home/deploy/backups/       # Backup files
```

## 🔐 Security Notes

The deployment script implements:
- ✅ MongoDB authentication (not exposed publicly)
- ✅ UFW firewall (only necessary ports open)
- ✅ File upload size limits (10MB max)
- ✅ Nginx security headers
- ✅ JWT token-based authentication
- ✅ Rate limiting on API endpoints

**Recommended additional security:**
- Enable Fail2Ban for SSH protection
- Setup SSL certificate with Let's Encrypt (when domain available)
- Regular security updates: `sudo apt update && sudo apt upgrade`
- Strong MongoDB passwords (12+ characters, mixed case, numbers, symbols)

## 📞 Getting Help

If deployment fails:

1. **Check the error message** - Script provides specific error details
2. **Review logs** - Use commands from "Monitoring Commands" section
3. **Consult troubleshooting guide** - See UBUNTU_VPS_DEPLOYMENT.md Part 5
4. **Re-run specific steps** - Script can skip already-completed steps

## 📄 Files Created by Script

```
/home/deploy/apps/-taekwondo/          # Application root
├── backend/
│   ├── .env                           # Backend configuration
│   ├── dist/                          # Compiled TypeScript
│   ├── uploads/                       # User uploads
│   ├── data/                          # Application data
│   └── logs/                          # Application logs
├── frontend/
│   ├── .env.production                # Frontend configuration
│   └── dist/                          # Built frontend assets
/etc/nginx/sites-available/taekwondo  # Nginx configuration
/usr/local/bin/backup-taekwondo.sh    # Backup script
/home/deploy/backups/                  # Backup storage
```

## 🎉 Success!

If all steps complete successfully, you'll see:

```
================================================
DEPLOYMENT SUMMARY
================================================

✓ All steps completed successfully!

ℹ Your application is now running at:
  Frontend: http://YOUR_VPS_IP
  Backend API: http://YOUR_VPS_IP:5000

ℹ Useful commands:
  pm2 status              - Check backend status
  pm2 logs taekwondo-backend - View backend logs
  sudo systemctl status nginx - Check Nginx status
  sudo systemctl status mongod - Check MongoDB status
```

Congratulations! Your Taekwondo application is now live! 🥋🎉
