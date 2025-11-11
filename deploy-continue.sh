#!/bin/bash

###############################################################################
# Taekwondo Application - Deployment Continuation Script (From Step 9)
# Use this script when initial setup (Steps 1-8) is already complete
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="deploy"
APP_DIR="/home/$DEPLOY_USER/apps/-taekwondo"

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

###############################################################################
# Step 9: Setup Backend
###############################################################################

step9_setup_backend() {
    print_header "STEP 9: Setting Up Backend"
    
    if [ ! -d "$APP_DIR/backend" ]; then
        print_error "Backend directory not found at $APP_DIR/backend"
        print_info "Please ensure application code is cloned first"
        return 1
    fi
    
    cd "$APP_DIR/backend"
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    retry_command "npm install" "Install backend npm packages" || return 1
    
    # Fix permissions for node_modules/.bin
    if [ -d "node_modules/.bin" ]; then
        print_info "Setting execute permissions for node_modules/.bin..."
        chmod -R +x node_modules/.bin/
        print_success "Permissions updated"
    fi
    
    # Create or verify .env file
    if [ ! -f ".env" ]; then
        print_info "Creating backend .env file..."
        
        prompt_input "Enter your VPS IP address" "" VPS_IP
        prompt_input "Enter MongoDB password for taekwondo_user" "" MONGODB_PASSWORD
        
        # Generate JWT secret
        JWT_SECRET=$(openssl rand -hex 32)
        
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
    
    if [ ! -d "$APP_DIR/frontend" ]; then
        print_error "Frontend directory not found at $APP_DIR/frontend"
        return 1
    fi
    
    cd "$APP_DIR/frontend"
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    retry_command "npm install" "Install frontend npm packages" || return 1
    
    # Fix permissions for node_modules/.bin
    if [ -d "node_modules/.bin" ]; then
        print_info "Setting execute permissions for node_modules/.bin..."
        chmod -R +x node_modules/.bin/
        print_success "Permissions updated"
    fi
    
    # Create or verify .env.production file
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
        print_info "Current directory: $(pwd)"
        print_info "Directory contents:"
        ls -la
        return 1
    fi
    
    # Check critical files
    critical_files=(
        "pages/dashboards/CadetApplications.tsx"
        "pages/dashboards/PoomsaeApplications.tsx"
        "pages/dashboards/CertificatesList.tsx"
        "App.tsx"
    )
    
    missing_files=()
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "Critical files missing:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        print_info "Current directory: $(pwd)"
        print_info "Checking pages/dashboards contents:"
        ls -la pages/dashboards/ 2>/dev/null || echo "  Directory doesn't exist"
        print_warning "Files may not have been transferred to VPS properly"
        print_info "Please verify files are present or use git pull to fetch them"
        return 1
    fi
    
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
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 not found. Installing PM2..."
        sudo npm install -g pm2
    fi
    
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
    
    # Setup PM2 startup (if not already configured)
    print_info "Configuring PM2 startup..."
    pm2 startup | grep "sudo env" | bash || true
    
    print_success "PM2 configured"
}

###############################################################################
# Step 12: Configure Nginx
###############################################################################

step12_configure_nginx() {
    print_header "STEP 12: Configuring Nginx"
    
    NGINX_CONFIG="/etc/nginx/sites-available/taekwondo"
    
    # Check if Nginx is installed
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx not found. Please install Nginx first"
        return 1
    fi
    
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
    
    # Remove default site if exists
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
# Main Execution
###############################################################################

main() {
    clear
    print_header "TAEKWONDO APPLICATION - DEPLOYMENT CONTINUATION (FROM STEP 9)"
    
    echo -e "${BLUE}This script continues deployment from Step 9.${NC}"
    echo -e "${BLUE}Ensure Steps 1-8 are already complete.${NC}\n"
    
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    # Array of steps
    steps=(
        "step9_setup_backend"
        "step10_setup_frontend"
        "step11_start_backend"
        "step12_configure_nginx"
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
        print_info "Your application should now be running at:"
        echo -e "  ${GREEN}Frontend: http://$VPS_IP${NC}"
        echo -e "  ${GREEN}Backend API: http://$VPS_IP:5000${NC}"
        echo
        print_info "Useful commands:"
        echo "  pm2 status              - Check backend status"
        echo "  pm2 logs taekwondo-backend - View backend logs"
        echo "  sudo systemctl status nginx - Check Nginx status"
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
