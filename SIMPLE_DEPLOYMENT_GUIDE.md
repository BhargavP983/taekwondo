# 📖 Simple Copy-Paste Deployment Guide

**Your VPS:** `34.14.196.123`

Just copy each block and paste into your terminal. That's it!

---

## 1️⃣ Connect to VPS
```bash
ssh YOUR_USERNAME@34.14.196.123
```

## 2️⃣ Install Everything (if not installed)
```bash
# Node.js v24 LTS (REQUIRED - Updated for compatibility)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt install -y nodejs
# Verify: node --version should show v24.11.1 or higher

# MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# PM2 & Nginx
sudo npm install -g pm2
sudo apt install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx

# Firewall
sudo ufw --force enable && sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw allow 5000/tcp
```

## 3️⃣ Setup MongoDB User
**⚠️ Change the password!**
```bash
mongosh <<EOF
use ap-taekwondo
db.createUser({user:"taekwondo_user",pwd:"YOUR_PASSWORD_HERE",roles:[{role:"readWrite",db:"ap-taekwondo"}]})
exit
EOF

sudo sed -i '/^#security:/a security:\n  authorization: enabled' /etc/mongod.conf
sudo systemctl restart mongod
```

## 4️⃣ Clone & Build Application
```bash
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/BhargavP983/-taekwondo.git
cd -taekwondo

# Pull latest changes (if repo already exists)
git pull origin main

# Backend
cd backend
npm install && chmod -R +x node_modules/.bin/ && npm run build
mkdir -p logs uploads/certificate uploads/forms data && chmod -R 755 uploads data

# Frontend
cd ../frontend
npm install && chmod -R +x node_modules/.bin/ && npm run build
```

## 5️⃣ Create Backend .env
```bash
cd ~/apps/-taekwondo/backend
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://taekwondo_user:YOUR_PASSWORD_HERE@localhost:27017/ap-taekwondo
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://34.14.196.123,http://34.14.196.123:5173
FRONTEND_URL=http://34.14.196.123
MAX_FILE_SIZE=5242880
TEMPLATE_PATH=./src/templates/certificate-template.png
UPLOAD_DIR=./uploads/certificate
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Edit to add your MongoDB password
nano .env
```

## 6️⃣ Create Frontend .env.production
```bash
cd ~/apps/-taekwondo/frontend
cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://34.14.196.123:5000/api
VITE_BACKEND_URL=http://34.14.196.123:5000
EOF
```

## 7️⃣ Start Backend
```bash
cd ~/apps/-taekwondo/backend
pm2 start ecosystem.config.json
pm2 save
pm2 startup  # Run the command it shows
```

## 8️⃣ Configure Nginx
**⚠️ Replace YOUR_USERNAME with your actual username!**
```bash
sudo tee /etc/nginx/sites-available/taekwondo > /dev/null << 'EOF'
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
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name _;
    root /home/YOUR_USERNAME/apps/-taekwondo/frontend/dist;
    index index.html;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    location / {try_files $uri $uri/ /index.html;}
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {expires 1y;add_header Cache-Control "public, immutable";}
}
EOF

sudo ln -sf /etc/nginx/sites-available/taekwondo /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

## 9️⃣ Verify
```bash
pm2 status
curl http://localhost:5000/api/health
ls -la ~/apps/-taekwondo/frontend/dist/
```

## ✅ Done!
- Frontend: http://34.14.196.123
- Backend: http://34.14.196.123:5000

---

## 🔧 Useful Commands

**View logs:**
```bash
pm2 logs taekwondo-backend
```

**Restart:**
```bash
pm2 restart taekwondo-backend
sudo systemctl restart nginx
```

**Update app:**
```bash
cd ~/apps/-taekwondo && git pull
cd backend && npm install && npm run build && pm2 restart taekwondo-backend
cd ../frontend && npm run build && sudo systemctl reload nginx
```

That's it! 🚀
