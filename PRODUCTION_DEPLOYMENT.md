# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

#### Backend (.env)
Create a `.env` file in the `backend` directory with the following variables:

```bash
NODE_ENV=production
PORT=5000

# Database - Use your production MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ap-taekwondo?retryWrites=true&w=majority

# JWT - Generate a strong secret key
JWT_SECRET=generate-a-super-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# CORS - Add your production domain
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# File Upload Limits
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.production)
Create a `.env.production` file in the `frontend` directory:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com
```

### 2. Security Enhancements

#### Update JWT Secret
Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Use this value for `JWT_SECRET` in your production `.env` file.

#### MongoDB Security
- Use MongoDB Atlas or a secured MongoDB instance
- Enable authentication
- Use strong passwords
- Whitelist only necessary IP addresses
- Enable SSL/TLS connections

### 3. Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in the `dist` folder.

### 4. Backend Production Setup

#### Install Dependencies
```bash
cd backend
npm install --production
```

#### Build TypeScript (if needed)
```bash
npm run build
```

#### Start with PM2 (Recommended for production)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/server.js --name taekwondo-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 5. Reverse Proxy Setup (Nginx)

#### Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### Configure Nginx
Create a configuration file: `/etc/nginx/sites-available/taekwondo`

```nginx
# API Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Max body size for file uploads
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
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/taekwondo/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/taekwondo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL/TLS Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

### 7. Firewall Configuration

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 8. Monitoring and Logging

#### PM2 Monitoring
```bash
# View logs
pm2 logs taekwondo-backend

# Monitor status
pm2 status

# Monitor resources
pm2 monit
```

#### Setup Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 9. Database Backup

#### Setup automated MongoDB backups:
```bash
# Create backup script: /usr/local/bin/mongodb-backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="your-mongodb-uri" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Make it executable and add to crontab:
```bash
chmod +x /usr/local/bin/mongodb-backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/mongodb-backup.sh
```

### 10. Health Checks

The application includes a health check endpoint at `/health`

Setup monitoring with:
- UptimeRobot (https://uptimerobot.com)
- Pingdom
- StatusCake
- New Relic

### 11. Performance Optimization

#### Enable Nginx Caching
Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;
proxy_cache_key "$scheme$request_method$host$request_uri";
```

#### Database Indexes
Ensure indexes are created for frequently queried fields (already done in models).

### 12. Security Headers

Helmet is already configured, but verify these headers in production:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### 13. Additional Production Considerations

#### File Storage
For production, consider using:
- AWS S3 for certificate and form uploads
- Cloudinary for image hosting
- This removes dependency on local file system and enables scaling

#### Email Service
If implementing email notifications:
- SendGrid
- AWS SES
- Mailgun

#### CDN
Use a CDN for frontend static assets:
- Cloudflare
- AWS CloudFront
- Fastly

### 14. Deployment Checklist

- [ ] Environment variables configured for both frontend and backend
- [ ] Strong JWT secret generated
- [ ] MongoDB connection secured with authentication
- [ ] Frontend built for production
- [ ] Backend running with PM2
- [ ] Nginx configured and running
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] CORS origins set to production domains only
- [ ] Console logs disabled in production
- [ ] Rate limiting configured
- [ ] File upload size limits set
- [ ] Database backups configured
- [ ] Health monitoring setup
- [ ] Error tracking setup (optional: Sentry)
- [ ] Test all features in production environment

### 15. Common Production Issues

#### Issue: CORS errors in production
- Solution: Verify `CORS_ORIGIN` in backend .env includes your production domain

#### Issue: 502 Bad Gateway
- Solution: Check if backend is running (`pm2 status`), check logs (`pm2 logs`)

#### Issue: Certificate images not loading
- Solution: Verify static file serving in Nginx and check file permissions

#### Issue: Database connection errors
- Solution: Verify MongoDB URI, check IP whitelist, verify network connectivity

### 16. Rollback Plan

Keep track of:
- Previous working build
- Database backup before major changes
- PM2 process restart commands
- Nginx configuration backups

Quick rollback:
```bash
# Stop current process
pm2 stop taekwondo-backend

# Restore previous build
cd /path/to/backup

# Start previous version
pm2 start dist/server.js --name taekwondo-backend
```

### 17. Post-Deployment Testing

Test these features:
- [ ] User login/logout
- [ ] Cadet form submission
- [ ] Poomsae form submission
- [ ] Certificate generation
- [ ] Bulk certificate generation
- [ ] Excel export functionality
- [ ] File downloads
- [ ] Admin dashboards
- [ ] All CRUD operations

### Support

For issues during deployment:
- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check MongoDB logs
- Verify environment variables are loaded
