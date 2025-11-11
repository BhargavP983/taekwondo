# Ubuntu VPS Deployment Guide

## Prerequisites
- Ubuntu VPS (20.04 or 22.04 recommended)
- Root or sudo access
- SSH access to your VPS
- Domain name (optional - can deploy with IP address first)

---

## Part 1: Initial Server Setup (First Time Only)

### Step 1: Connect to Your VPS
```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### Step 2: Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Create a Deploy User (Recommended)
```bash
# Create user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

### Step 4: Install Node.js (v18 or v20)
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 5: Install MongoDB
```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Create MongoDB list file
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### Step 6: Secure MongoDB
```bash
# Connect to MongoDB
mongosh

# Inside MongoDB shell, create admin user:
use admin
db.createUser({
  user: "admin",
  pwd: "YourStrongPasswordHere",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase"]
})

# Create application database user
use ap-taekwondo
db.createUser({
  user: "taekwondo_user",
  pwd: "YourAppPasswordHere",
  roles: [{ role: "readWrite", db: "ap-taekwondo" }]
})

exit
```

Enable authentication:
```bash
# Edit MongoDB config
sudo nano /etc/mongod.conf

# Add these lines:
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

### Step 7: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 8: Install Nginx
```bash
sudo apt install -y nginx
```

### Step 9: Setup Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Part 2: Deploy Your Application

### Step 1: Transfer Files to VPS

#### Option A: Using Git (Recommended)
```bash
# On your VPS
cd /home/deploy
mkdir -p apps
cd apps

# Clone your repository (if you have it on GitHub)
git clone https://github.com/BhargavP983/-taekwondo.git
cd -taekwondo

# OR if not using Git, go to Option B
```

#### Option B: Using SCP (From Your Local Machine)
```bash
# From your Windows machine (PowerShell or Git Bash)
cd "X:\Web Dev\Gemini\-taekwondo"

# Upload backend (includes src/templates folder)
scp -r backend/ deploy@your-vps-ip:/home/deploy/apps/-taekwondo/

# Upload frontend
scp -r frontend/ deploy@your-vps-ip:/home/deploy/apps/-taekwondo/

# OR use FileZilla/WinSCP for GUI upload
# Important: Make sure to transfer the entire backend folder including src/templates/
```

#### Option C: Using rsync (Best for updates)
```bash
# From Windows with WSL or Git Bash
rsync -avz --progress backend/ deploy@your-vps-ip:/home/deploy/apps/-taekwondo/backend/
rsync -avz --progress frontend/ deploy@your-vps-ip:/home/deploy/apps/-taekwondo/frontend/

# This preserves all files including templates
```

### Step 2: Setup Backend

```bash
# SSH into your VPS
ssh deploy@your-vps-ip

# Navigate to backend
cd /home/deploy/apps/-taekwondo/backend

# Install ALL dependencies (including devDependencies needed for building)
npm install

# Create .env file
nano .env
```

Paste this content (update with your values):

**Option A: Without Domain (Using IP Address)**
```bash
NODE_ENV=production
PORT=5000

# Update this with your MongoDB credentials
MONGODB_URI=mongodb://taekwondo_user:YourAppPasswordHere@localhost:27017/ap-taekwondo

# Generate a strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-32-char-secret-here
JWT_EXPIRES_IN=7d

# Replace with your VPS IP address
CORS_ORIGIN=http://your-vps-ip,http://your-vps-ip:5173
FRONTEND_URL=http://your-vps-ip

MAX_FILE_SIZE=5242880

# Certificate Template Paths
TEMPLATE_PATH=./src/templates/certificate-template.png
UPLOAD_DIR=./uploads/certificate

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Option B: With Domain (For later when you have domain)**
```bash
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb://taekwondo_user:YourAppPasswordHere@localhost:27017/ap-taekwondo
JWT_SECRET=your-generated-32-char-secret-here
JWT_EXPIRES_IN=7d

# Update with your domain
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

MAX_FILE_SIZE=5242880

# Certificate Template Paths
TEMPLATE_PATH=./src/templates/certificate-template.png
UPLOAD_DIR=./uploads/certificate

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Save and exit (Ctrl+X, Y, Enter)

```bash
# Build TypeScript
npm run build

# After successful build, you can optionally remove devDependencies to save space
# npm prune --production

# Verify template files exist
ls -la src/templates/
# Should see: certificate-template.png, cadet-form-template.JPG, etc.

# Create logs directory
mkdir -p logs

# Create uploads directories
mkdir -p uploads/certificate
mkdir -p uploads/forms
mkdir -p data

# Set permissions
chmod -R 755 uploads
chmod -R 755 data

# Test the application
node dist/server.js
# If it works, press Ctrl+C to stop
```

### Step 3: Start Backend with PM2

```bash
# Start with PM2
pm2 start ecosystem.config.json

# Check status
pm2 status

# View logs
pm2 logs taekwondo-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs
```

### Step 4: Setup Frontend

```bash
cd /home/deploy/apps/-taekwondo/frontend

# Create production environment file
nano .env.production
```

Paste this content:

**Option A: Without Domain (Using IP Address)**
```bash
VITE_API_BASE_URL=http://your-vps-ip:5000/api
VITE_BACKEND_URL=http://your-vps-ip:5000
```

**Option B: With Domain (For later)**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com
```

Save and exit

```bash
# Install dependencies
npm install

# Build for production
npm run build

# If you encounter "Could not resolve" errors on Linux:
# This is due to case-sensitivity. The files exist but may need explicit .tsx extensions
# The build should work if all files are transferred correctly

# The build output is in the 'dist' folder
ls -la dist
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/taekwondo
```

**Option A: Without Domain (Using IP Address)**

Paste this configuration:

```nginx
# Backend API
server {
    listen 5000;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend
server {
    listen 80;
    server_name _;

    root /home/deploy/apps/-taekwondo/frontend/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~ /\. {
        deny all;
    }
}
```

**Option B: With Domain (Use this when you get a domain)**

Paste this configuration (update yourdomain.com with your actual domain):

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL is setup)
    # return 301 https://$server_name$request_uri;

    # Client max body size
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL is setup)
    # return 301 https://$server_name$request_uri;

    root /home/deploy/apps/-taekwondo/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

Save and exit

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/taekwondo /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx
```

### Step 6: Configure DNS (Skip if using IP address only)

**If you have a domain**, add these DNS records on your domain registrar:
```
Type: A
Name: @
Value: your-vps-ip
TTL: 3600

Type: A
Name: www
Value: your-vps-ip
TTL: 3600

Type: A
Name: api
Value: your-vps-ip
TTL: 3600
```

Wait for DNS propagation (can take 5-60 minutes)

**If you don't have a domain yet**, skip this step and continue to testing.

### Step 7: Install SSL Certificate (Skip if using IP address)

**Only do this if you have a domain configured.**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Test auto-renewal
sudo certbot renew --dry-run
```

**Without a domain**: SSL certificates require a domain name, so you'll access via HTTP for now.

### Step 8: Test Your Application

**Without Domain (IP Address):**
1. Visit `http://your-vps-ip` - Should show your frontend
2. Visit `http://your-vps-ip:5000/health` - Should show backend health status
3. Try logging in and testing features

**With Domain:**
1. Visit `https://yourdomain.com` - Should show your frontend
2. Visit `https://api.yourdomain.com/health` - Should show health status
3. Try logging in and testing features

---

## Part 3: Post-Deployment

### Open Required Ports (If using IP address without domain)

```bash
# Allow port 5000 for backend API
sudo ufw allow 5000/tcp

# Check firewall status
sudo ufw status
```

### Setup Automated Backups

Create backup script:
```bash
sudo nano /usr/local/bin/backup-taekwondo.sh
```

Paste:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://taekwondo_user:YourAppPasswordHere@localhost:27017/ap-taekwondo" --out="$BACKUP_DIR/mongodb_$DATE"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /home/deploy/apps/-taekwondo/backend/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
find $BACKUP_DIR -type d -empty -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-taekwondo.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /usr/local/bin/backup-taekwondo.sh >> /home/deploy/logs/backup.log 2>&1
```

### Setup Log Rotation for PM2

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Monitor Your Application

```bash
# View PM2 status
pm2 status

# View logs
pm2 logs taekwondo-backend --lines 100

# Monitor resources
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check MongoDB status
sudo systemctl status mongod
```

---

## Part 4: Updating Your Application

When you make code changes:

```bash
# On your local machine, push to git
git add .
git commit -m "Your changes"
git push

# On your VPS
ssh deploy@your-vps-ip
cd /home/deploy/apps/-taekwondo

# Pull latest changes
git pull

# Update backend
cd backend
npm install
npm run build
pm2 restart taekwondo-backend

# Update frontend
cd ../frontend
npm install
npm run build

# No need to restart Nginx, it serves static files
```

---

## Part 5: Troubleshooting

### Backend not starting?
```bash
# Check PM2 logs
pm2 logs taekwondo-backend --err

# Check if port 5000 is in use
sudo lsof -i :5000

# Check MongoDB connection
mongosh "mongodb://taekwondo_user:password@localhost:27017/ap-taekwondo"
```

### Frontend shows blank page?
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify build files exist
ls -la /home/deploy/apps/-taekwondo/frontend/dist

# Check Nginx configuration
sudo nginx -t
```

### CORS errors?
```bash
# Check backend .env file has correct CORS_ORIGIN
cat /home/deploy/apps/-taekwondo/backend/.env | grep CORS_ORIGIN

# Should include your domain
```

### Can't connect to MongoDB?
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh "mongodb://taekwondo_user:password@localhost:27017/ap-taekwondo"
```

### 502 Bad Gateway?
```bash
# Backend might be down
pm2 status
pm2 restart taekwondo-backend

# Check backend logs
pm2 logs taekwondo-backend
```

---

## Part 6: Security Hardening

### Change SSH Port (Optional but Recommended)
```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222 (or any other port)
sudo systemctl restart sshd

# Update firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow OpenSSH
```

### Setup Fail2Ban (Prevent Brute Force)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Regular Security Updates
```bash
# Setup automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Quick Reference Commands

```bash
# PM2 Commands
pm2 status                    # Check app status
pm2 restart taekwondo-backend # Restart app
pm2 logs taekwondo-backend   # View logs
pm2 monit                     # Resource monitor
pm2 stop taekwondo-backend   # Stop app
pm2 start ecosystem.config.json  # Start app

# Nginx Commands
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart Nginx
sudo nginx -t                 # Test configuration
sudo tail -f /var/log/nginx/error.log  # View errors

# MongoDB Commands
sudo systemctl status mongod  # Check status
sudo systemctl restart mongod # Restart MongoDB
mongosh                       # Connect to MongoDB

# System Commands
sudo systemctl reboot         # Reboot server
df -h                         # Check disk space
free -h                       # Check memory
htop                          # Process monitor
```

---

## Success Checklist

After deployment, verify:
- [ ] Backend running on PM2
- [ ] MongoDB connected and secured
- [ ] Nginx serving frontend
- [ ] SSL certificates installed
- [ ] Domain resolves to your site
- [ ] Can login to application
- [ ] Can submit forms
- [ ] Can generate certificates
- [ ] File uploads working
- [ ] Excel export working
- [ ] Backups scheduled
- [ ] Firewall configured

---

## Support

If you encounter issues:
1. Check the relevant logs (PM2, Nginx, MongoDB)
2. Verify environment variables are set correctly
3. Ensure all services are running
4. Check firewall rules
5. Verify DNS is propagated
6. Check SSL certificates are valid

For critical issues, you can always:
- Restart the backend: `pm2 restart taekwondo-backend`
- Restart Nginx: `sudo systemctl restart nginx`
- Restart MongoDB: `sudo systemctl restart mongod`
- Reboot the server: `sudo reboot`
