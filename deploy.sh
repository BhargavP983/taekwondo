#!/bin/bash

###############################################################################
# Taekwondo Application - Automated Ubuntu VPS Deployment Script
# This script automates the entire deployment process with error handling
###############################################################################

set -e  # Exit on error (we'll handle errors manually)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="deploy"
APP_DIR="/home/$DEPLOY_USER/apps/-taekwondo"
REPO_URL="https://github.com/BhargavP983/-taekwondo.git"
NODE_VERSION="20"
MONGODB_VERSION="7.0"

# Retry mechanism
MAX_RETRIES=3
RETRY_DELAY=5

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Retry function
retry_command() {
    local command="$1"
    local description="$2"
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        print_info "Attempting: $description (Attempt $((retries + 1))/$MAX_RETRIES)"
        
        if eval "$command"; then
            print_success "$description completed successfully"
            return 0
        else
            retries=$((retries + 1))
            if [ $retries -lt $MAX_RETRIES ]; then
                print_warning "$description failed. Retrying in $RETRY_DELAY seconds..."
                sleep $RETRY_DELAY
            else
                print_error "$description failed after $MAX_RETRIES attempts"
                return 1
            fi
        fi
    done
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Prompt for user input with default
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\"${input:-$default}\""
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

# Prompt for password (hidden input)
prompt_password() {
    local prompt="$1"
    local var_name="$2"
    
    read -s -p "$prompt: " password
    echo
    eval "$var_name=\"$password\""
}

###############################################################################
# Step 1: System Update
###############################################################################

step1_system_update() {
    print_header "STEP 1: Updating System"
    
    retry_command "sudo apt update" "System package list update" || return 1
    retry_command "sudo DEBIAN_FRONTEND=noninteractive apt upgrade -y" "System upgrade" || return 1
    
    print_success "System updated successfully"
}

###############################################################################
# Step 2: Install Node.js
###############################################################################

step2_install_nodejs() {
    print_header "STEP 2: Installing Node.js v$NODE_VERSION"
    
    if command_exists node; then
        current_version=$(node --version)
        print_info "Node.js already installed: $current_version"
        read -p "Reinstall Node.js? (y/N): " reinstall
        if [[ ! $reinstall =~ ^[Yy]$ ]]; then
            print_success "Skipping Node.js installation"
            return 0
        fi
    fi
    
    retry_command "curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -" \
        "Download Node.js setup script" || return 1
    
    retry_command "sudo apt install -y nodejs" "Install Node.js" || return 1
    
    node_ver=$(node --version)
    npm_ver=$(npm --version)
    print_success "Node.js installed: $node_ver, npm: $npm_ver"
}

###############################################################################
# Step 3: Install MongoDB
###############################################################################

step3_install_mongodb() {
    print_header "STEP 3: Installing MongoDB v$MONGODB_VERSION"
    
    if command_exists mongosh || command_exists mongo; then
        print_info "MongoDB already installed"
        read -p "Reinstall MongoDB? (y/N): " reinstall
        if [[ ! $reinstall =~ ^[Yy]$ ]]; then
            print_success "Skipping MongoDB installation"
            return 0
        fi
    fi
    
    # Import MongoDB public key
    retry_command "curl -fsSL https://www.mongodb.org/static/pgp/server-${MONGODB_VERSION}.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-${MONGODB_VERSION}.gpg --dearmor" \
        "Import MongoDB GPG key" || return 1
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-${MONGODB_VERSION}.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/${MONGODB_VERSION} multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-${MONGODB_VERSION}.list
    
    retry_command "sudo apt update" "Update package list with MongoDB repo" || return 1
    retry_command "sudo apt install -y mongodb-org" "Install MongoDB" || return 1
    
    # Start and enable MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    sleep 3
    
    if sudo systemctl is-active --quiet mongod; then
        print_success "MongoDB installed and running"
    else
        print_error "MongoDB installed but not running"
        return 1
    fi
}

###############################################################################
# Step 4: Configure MongoDB
###############################################################################

step4_configure_mongodb() {
    print_header "STEP 4: Configuring MongoDB Security"
    
    print_info "Creating MongoDB users..."
    
    prompt_password "Enter password for MongoDB admin user" MONGO_ADMIN_PASSWORD
    prompt_password "Enter password for application database user" MONGO_APP_PASSWORD
    
    # Create admin user
    mongosh <<EOF
use admin
db.createUser({
  user: "admin",
  pwd: "$MONGO_ADMIN_PASSWORD",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase"]
})
EOF
    
    if [ $? -eq 0 ]; then
        print_success "MongoDB admin user created"
    else
        print_warning "Admin user might already exist or creation failed"
    fi
    
    # Create application user
    mongosh <<EOF
use ap-taekwondo
db.createUser({
  user: "taekwondo_user",
  pwd: "$MONGO_APP_PASSWORD",
  roles: [{ role: "readWrite", db: "ap-taekwondo" }]
})
EOF
    
    if [ $? -eq 0 ]; then
        print_success "MongoDB application user created"
    else
        print_warning "Application user might already exist or creation failed"
    fi
    
    # Enable authentication
    if ! grep -q "authorization: enabled" /etc/mongod.conf; then
        print_info "Enabling MongoDB authentication..."
        sudo sed -i '/^#security:/a security:\n  authorization: enabled' /etc/mongod.conf
        sudo systemctl restart mongod
        sleep 3
        print_success "MongoDB authentication enabled"
    else
        print_info "MongoDB authentication already enabled"
    fi
    
    # Save MongoDB password for later use
    export MONGODB_PASSWORD="$MONGO_APP_PASSWORD"
}

###############################################################################
# Step 5: Install PM2
###############################################################################

step5_install_pm2() {
    print_header "STEP 5: Installing PM2 Process Manager"
    
    if command_exists pm2; then
        print_info "PM2 already installed"
        return 0
    fi
    
    retry_command "sudo npm install -g pm2" "Install PM2" || return 1
    print_success "PM2 installed successfully"
}

###############################################################################
# Step 6: Install Nginx
###############################################################################

step6_install_nginx() {
    print_header "STEP 6: Installing Nginx Web Server"
    
    if command_exists nginx; then
        print_info "Nginx already installed"
        return 0
    fi
    
    retry_command "sudo apt install -y nginx" "Install Nginx" || return 1
    
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx installed and running"
}

###############################################################################
# Step 7: Configure Firewall
###############################################################################

step7_configure_firewall() {
    print_header "STEP 7: Configuring Firewall"
    
    print_info "Configuring UFW firewall..."
    
    sudo ufw --force enable
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 5000/tcp  # Backend API
    
    print_success "Firewall configured"
    sudo ufw status
}

###############################################################################
# Step 8: Clone/Update Application Code
###############################################################################

step8_clone_application() {
    print_header "STEP 8: Getting Application Code"
    
    mkdir -p "$(dirname "$APP_DIR")"
    
    if [ -d "$APP_DIR" ]; then
        print_info "Application directory exists. Updating code..."
        cd "$APP_DIR"
        
        # Stash any local changes
        git stash
        
        retry_command "git pull origin main" "Update application code" || return 1
        print_success "Application code updated"
    else
        print_info "Cloning application repository..."
        retry_command "git clone $REPO_URL $APP_DIR" "Clone repository" || return 1
        print_success "Application code cloned"
    fi
}

###############################################################################
# Step 9: Setup Backend
###############################################################################

step9_setup_backend() {
    print_header "STEP 9: Setting Up Backend"
    
    cd "$APP_DIR/backend"
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    retry_command "npm install" "Install backend npm packages" || return 1
    
    # Create .env file
    if [ ! -f ".env" ]; then
        print_info "Creating backend .env file..."
        
        prompt_input "Enter your VPS IP address" "" VPS_IP
        
        # Generate JWT secret
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        
        cat > .env <<EOF
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb://taekwondo_user:${MONGODB_PASSWORD}@localhost:27017/ap-taekwondo

JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://$VPS_IP,http://$VPS_IP:5173
FRONTEND_URL=http://$VPS_IP

MAX_FILE_SIZE=5242880

TEMPLATE_PATH=./src/templates/certificate-template.png
UPLOAD_DIR=./uploads/certificate

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
        
        print_success "Backend .env file created"
    else
        print_info "Backend .env file already exists"
    fi
    
    # Verify templates exist
    if [ ! -d "src/templates" ]; then
        print_error "Templates directory not found!"
        return 1
    fi
    
    print_success "Templates directory verified"
    
    # Build TypeScript
    print_info "Building backend TypeScript..."
    retry_command "npm run build" "Build TypeScript" || return 1
    print_success "Backend built successfully"
    
    # Create necessary directories
    mkdir -p logs uploads/certificate uploads/forms data
    chmod -R 755 uploads data
    
    print_success "Backend setup completed"
}

###############################################################################
# Step 10: Setup Frontend
###############################################################################

step10_setup_frontend() {
    print_header "STEP 10: Setting Up Frontend"
    
    cd "$APP_DIR/frontend"
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    retry_command "npm install" "Install frontend npm packages" || return 1
    
    # Create .env.production file
    if [ ! -f ".env.production" ]; then
        print_info "Creating frontend .env.production file..."
        
        prompt_input "Enter your VPS IP address" "$VPS_IP" VPS_IP
        
        cat > .env.production <<EOF
VITE_API_BASE_URL=http://$VPS_IP:5000/api
VITE_BACKEND_URL=http://$VPS_IP:5000
EOF
        
        print_success "Frontend .env.production file created"
    else
        print_info "Frontend .env.production file already exists"
    fi
    
    # Verify pages directory structure
    if [ ! -d "pages/dashboards" ]; then
        print_error "Dashboard pages directory not found!"
        print_error "Please ensure all files were transferred correctly"
        return 1
    fi
    
    # Check critical files
    critical_files=(
        "pages/dashboards/CadetApplications.tsx"
        "pages/dashboards/PoomsaeApplications.tsx"
        "pages/dashboards/CertificatesList.tsx"
        "App.tsx"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Critical file missing: $file"
            return 1
        fi
    done
    
    print_success "All critical files verified"
    
    # Build frontend
    print_info "Building frontend for production..."
    retry_command "npm run build" "Build frontend" || return 1
    
    if [ -d "dist" ]; then
        print_success "Frontend built successfully"
    else
        print_error "Frontend build failed - dist directory not created"
        return 1
    fi
}

###############################################################################
# Step 11: Start Backend with PM2
###############################################################################

step11_start_backend() {
    print_header "STEP 11: Starting Backend with PM2"
    
    cd "$APP_DIR/backend"
    
    # Check if already running
    if pm2 list | grep -q "taekwondo-backend"; then
        print_info "Backend already running, restarting..."
        pm2 restart taekwondo-backend
    else
        print_info "Starting backend with PM2..."
        pm2 start ecosystem.config.json
    fi
    
    sleep 3
    
    # Check if running
    if pm2 list | grep -q "taekwondo-backend.*online"; then
        print_success "Backend started successfully"
    else
        print_error "Backend failed to start"
        pm2 logs taekwondo-backend --lines 50
        return 1
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    pm2 startup | grep "sudo env" | bash
    
    print_success "PM2 configured to start on boot"
}

###############################################################################
# Step 12: Configure Nginx
###############################################################################

step12_configure_nginx() {
    print_header "STEP 12: Configuring Nginx"
    
    NGINX_CONFIG="/etc/nginx/sites-available/taekwondo"
    
    print_info "Creating Nginx configuration..."
    
    sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
# Backend API
server {
    listen 5000;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend
server {
    listen 80;
    server_name _;

    root $APP_DIR/frontend/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~ /\\. {
        deny all;
    }
}
EOF
    
    # Enable site
    sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/taekwondo
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    if sudo nginx -t; then
        print_success "Nginx configuration valid"
        sudo systemctl restart nginx
        print_success "Nginx restarted"
    else
        print_error "Nginx configuration invalid"
        return 1
    fi
}

###############################################################################
# Step 13: Setup Automated Backups
###############################################################################

step13_setup_backups() {
    print_header "STEP 13: Setting Up Automated Backups"
    
    BACKUP_SCRIPT="/usr/local/bin/backup-taekwondo.sh"
    
    print_info "Creating backup script..."
    
    sudo tee "$BACKUP_SCRIPT" > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://taekwondo_user:${MONGODB_PASSWORD}@localhost:27017/ap-taekwondo" --out="$BACKUP_DIR/mongodb_$DATE"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /home/deploy/apps/-taekwondo/backend/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
find $BACKUP_DIR -type d -empty -delete

echo "Backup completed: $DATE"
EOF
    
    sudo chmod +x "$BACKUP_SCRIPT"
    
    # Add to crontab
    (crontab -l 2>/dev/null | grep -v "backup-taekwondo"; echo "0 2 * * * $BACKUP_SCRIPT >> /home/$DEPLOY_USER/logs/backup.log 2>&1") | crontab -
    
    print_success "Automated backups configured (daily at 2 AM)"
}

###############################################################################
# Main Execution
###############################################################################

main() {
    clear
    print_header "TAEKWONDO APPLICATION - AUTOMATED DEPLOYMENT"
    
    echo -e "${BLUE}This script will automatically deploy the Taekwondo application${NC}"
    echo -e "${BLUE}on your Ubuntu VPS with error handling and retry mechanisms.${NC}\n"
    
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    # Array of steps
    steps=(
        "step1_system_update"
        "step2_install_nodejs"
        "step3_install_mongodb"
        "step4_configure_mongodb"
        "step5_install_pm2"
        "step6_install_nginx"
        "step7_configure_firewall"
        "step8_clone_application"
        "step9_setup_backend"
        "step10_setup_frontend"
        "step11_start_backend"
        "step12_configure_nginx"
        "step13_setup_backups"
    )
    
    failed_steps=()
    
    # Execute each step
    for step in "${steps[@]}"; do
        if ! $step; then
            print_error "Step failed: $step"
            failed_steps+=("$step")
            
            read -p "Continue with next steps? (y/N): " continue_deploy
            if [[ ! $continue_deploy =~ ^[Yy]$ ]]; then
                print_error "Deployment aborted"
                exit 1
            fi
        fi
    done
    
    # Summary
    echo
    print_header "DEPLOYMENT SUMMARY"
    
    if [ ${#failed_steps[@]} -eq 0 ]; then
        print_success "All steps completed successfully!"
        echo
        print_info "Your application is now running at:"
        echo -e "  ${GREEN}Frontend: http://$VPS_IP${NC}"
        echo -e "  ${GREEN}Backend API: http://$VPS_IP:5000${NC}"
        echo
        print_info "Useful commands:"
        echo "  pm2 status              - Check backend status"
        echo "  pm2 logs taekwondo-backend - View backend logs"
        echo "  sudo systemctl status nginx - Check Nginx status"
        echo "  sudo systemctl status mongod - Check MongoDB status"
    else
        print_warning "Deployment completed with some failures:"
        for step in "${failed_steps[@]}"; do
            echo -e "  ${RED}✗${NC} $step"
        done
        echo
        print_info "Please review the errors above and fix manually"
    fi
}

# Run main function
main
