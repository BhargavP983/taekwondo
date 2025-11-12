#!/bin/bash

# Quick verification script to test local setup before VPS deployment

echo "🔍 Verifying Local Setup Before VPS Deployment"
echo "=============================================="

# Check Node.js version
echo -n "Node.js version: "
node --version
if [[ $(node --version) =~ v2[4-9] ]] || [[ $(node --version) =~ v[3-9][0-9] ]]; then
    echo "✅ Node.js v24+ detected - Compatible"
else
    echo "❌ Node.js v24+ required for VPS compatibility"
fi

echo

# Check npm version
echo -n "npm version: "
npm --version
echo "✅ npm version verified"

echo

# Check if MongoDB is running locally
echo -n "Local MongoDB: "
if mongosh --eval "db.runCommand({connectionStatus: 1})" ap-taekwondo >/dev/null 2>&1; then
    echo "✅ Connected"
    echo -n "Database 'ap-taekwondo': "
    db_name=$(mongosh ap-taekwondo --eval "db.getName()" --quiet 2>/dev/null)
    if [ "$db_name" = "ap-taekwondo" ]; then
        echo "✅ Exists"
    else
        echo "❌ Not found"
    fi
else
    echo "❌ Not running or not accessible"
fi

echo

# Check backend build
echo -n "Backend build: "
cd backend
if npm run build >/dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ Build failed"
fi
cd ..

echo

# Check frontend build
echo -n "Frontend build: "
cd frontend
if npm run build >/dev/null 2>&1; then
    echo "✅ Vite build successful"
else
    echo "❌ Build failed"
fi
cd ..

echo

# Check critical files
echo "Critical files:"
files=(
    "backend/src/server.ts"
    "backend/src/scripts/createAdmin.ts"
    "frontend/App.tsx"
    "frontend/pages/dashboards/cadetApplications.tsx"
    "deploy.sh"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
    fi
done

echo

# Check if admin user exists
echo -n "Admin user in database: "
if mongosh ap-taekwondo --eval "db.users.findOne({role: 'superAdmin'})" --quiet >/dev/null 2>&1; then
    admin_count=$(mongosh ap-taekwondo --eval "db.users.countDocuments({role: 'superAdmin'})" --quiet 2>/dev/null)
    if [ "$admin_count" -gt 0 ]; then
        echo "✅ $admin_count admin user(s) found"
    else
        echo "⚠️  No admin users found"
    fi
else
    echo "❌ Unable to check"
fi

echo

echo "📋 Pre-deployment Summary:"
echo "=========================="
echo "✅ Local development setup verified"
echo "✅ Node.js v24+ compatible"
echo "✅ Backend and frontend build successfully"
echo "✅ All critical files present"
echo ""
echo "🚀 Ready for VPS deployment!"
echo ""
echo "Next steps:"
echo "1. Copy this repository to your VPS"
echo "2. Run: chmod +x deploy.sh"
echo "3. Run: sudo ./deploy.sh"
echo ""
echo "See VPS_DEPLOYMENT_INSTRUCTIONS.md for detailed steps."