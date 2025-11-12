# 🚀 VPS Deployment Instructions

## Updated Deployment Script

The deployment script has been updated to work with Node.js v24.11.1 LTS and includes all necessary fixes for your Taekwondo application.

## Prerequisites on Your Ubuntu VPS

1. **Ubuntu VPS** (20.04 or 22.04 recommended)
2. **Root or sudo access**
3. **Git installed** (usually pre-installed)
4. **Internet connection**

## Step 1: Prepare Your VPS

```bash
# Connect to your VPS
ssh your_username@YOUR_VPS_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install git if not present
sudo apt install -y git
```

## Step 2: Download and Run Deployment Script

```bash
# Clone your repository
git clone https://github.com/BhargavP983/taekwondo.git
cd taekwondo

# Make deployment script executable
chmod +x deploy.sh

# Run the deployment script
sudo ./deploy.sh
```

## What the Updated Script Does

### ✅ **Automatic Setup:**
1. **Node.js v24 LTS Installation** - Required for native module compatibility
2. **MongoDB 7.0 Installation** - Database setup with security
3. **PM2 Installation** - Process manager for the backend
4. **Nginx Installation** - Web server and reverse proxy
5. **Firewall Configuration** - Security setup
6. **Application Deployment** - Clone and build your app
7. **Native Module Rebuild** - Ensures @napi-rs/canvas works properly
8. **Import Path Fix** - Fixes case-sensitive import issue in frontend
9. **Admin User Creation** - Creates the superAdmin user automatically

### 🔧 **Key Improvements Made:**

#### **Node.js v24 LTS Support:**
- Automatically installs Node.js v24.11.1 LTS
- Rebuilds native modules for compatibility
- Verifies version requirements

#### **Frontend Build Fix:**
- Automatically fixes the case-sensitive import issue:
  ```typescript
  // Fixes this import automatically:
  import CadetApplicationsComponent from './pages/dashboards/CadetApplications';
  // To this:
  import CadetApplicationsComponent from './pages/dashboards/cadetApplications';
  ```

#### **Admin User Creation:**
- Fixes the role name in createAdmin script (`super_admin` → `superAdmin`)
- Automatically creates admin user with credentials:
  - Email: `admin@aptaekwondo.com`
  - Password: `admin123`
  - **⚠️ Change password after first login!**

#### **Repository and Path Fixes:**
- Updated repository URL to `https://github.com/BhargavP983/taekwondo.git`
- Fixed application directory paths
- Updated backup script paths

## Step 3: Monitor Deployment

The script will show progress for each step:
```
================================================
STEP 1: Updating System
================================================
✓ System package list update completed successfully
✓ System upgrade completed successfully

================================================
STEP 2: Installing Node.js v24 LTS (Required)
================================================
✓ Node.js installed: v24.11.1, npm: v11.6.2 ✓ Compatible
```

## Step 4: Access Your Application

After successful deployment:

- **Frontend:** `http://YOUR_VPS_IP`
- **Backend API:** `http://YOUR_VPS_IP:5000`
- **Admin Login:** Use the credentials mentioned above

## Step 5: Post-Deployment Tasks

### **Change Default Admin Password:**
1. Open `http://YOUR_VPS_IP`
2. Login with `admin@aptaekwondo.com` / `admin123`
3. Go to Settings → Change Password
4. Set a strong password

### **Verify Services:**
```bash
# Check all services status
pm2 status                     # Backend status
sudo systemctl status nginx    # Web server status  
sudo systemctl status mongod   # Database status

# View logs
pm2 logs taekwondo-backend     # Backend logs
sudo tail -f /var/log/nginx/error.log  # Nginx logs
```

## Troubleshooting

### **If Deployment Fails:**

1. **Check the error message** - the script shows detailed errors
2. **Retry failed steps** - the script asks if you want to continue after failures
3. **Manual fix** - you can run individual steps manually

### **Common Issues:**

#### **Port 5000 Already in Use:**
```bash
# Kill any process using port 5000
sudo lsof -ti:5000 | xargs sudo kill -9
# Restart backend
pm2 restart taekwondo-backend
```

#### **MongoDB Connection Issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod
# Restart MongoDB
sudo systemctl restart mongod
```

#### **Frontend Build Errors:**
```bash
cd /home/deploy/apps/taekwondo/frontend
npm run build
# Check for any remaining import errors
```

## Useful Commands After Deployment

```bash
# Application management
pm2 restart taekwondo-backend  # Restart backend
pm2 stop taekwondo-backend     # Stop backend
pm2 start taekwondo-backend    # Start backend

# View logs
pm2 logs taekwondo-backend     # Backend logs
sudo journalctl -u nginx -f    # Nginx logs
sudo journalctl -u mongod -f   # MongoDB logs

# Update application code
cd /home/deploy/apps/taekwondo
git pull origin main
npm run build                   # Rebuild if needed
pm2 restart taekwondo-backend  # Restart backend
```

## Security Recommendations

### **After Deployment:**

1. **Change default passwords** - Admin user and MongoDB passwords
2. **Setup SSL/HTTPS** - Use Let's Encrypt for production
3. **Configure domain name** - Point your domain to the VPS IP
4. **Setup monitoring** - Use PM2 monitoring or external services
5. **Regular backups** - The script sets up daily backups at 2 AM

### **SSL Setup (Optional but Recommended):**
```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace yourdomain.com)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is set up automatically
```

## Support

If you encounter issues:

1. **Check the logs** using the commands above
2. **Review the deployment script output** for specific errors
3. **Verify all services are running** with the status commands
4. **Check the GitHub issues** for similar problems

Your Taekwondo application should now be fully deployed and running on your Ubuntu VPS! 🥋✨