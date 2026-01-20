#!/bin/bash

# 🚀 AUTOMATED GIT DEPLOYMENT - FRONTEND OPTIMIZED
# CPU-friendly build with overload detection

set -e

echo "🚀 AUTOMATED GIT DEPLOYMENT - FRONTEND"
echo "======================================"
echo ""

SERVER_HOST=${SERVER_HOST:-185.224.139.74}
SERVER_PASSWORD=${SERVER_PASSWORD:-Pursangue66@}
REMOTE_PATH="/var/www/kattenbak"

# ✅ CPU-friendly build with nice priority
echo "📦 Building frontend (CPU-friendly)..."
cd frontend

# Clean previous build
rm -rf .next

# ✅ Build with low CPU priority to prevent overload
nice -n 10 npm run build

echo "✅ Frontend build complete"
echo ""

# ✅ Compress build artifacts
echo "📦 Compressing build artifacts..."
tar -czf /tmp/frontend-next-$(date +%Y%m%d-%H%M).tar.gz .next/

echo "✅ Build artifacts compressed"
echo ""

# ✅ Deploy to server
echo "🚀 Deploying to server..."
sshpass -p "$SERVER_PASSWORD" scp /tmp/frontend-next-*.tar.gz root@$SERVER_HOST:/tmp/

# ✅ Extract and restart on server
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_HOST << EOF
cd $REMOTE_PATH/frontend
pm2 stop frontend 2>/dev/null || true
rm -rf .next
tar -xzf /tmp/frontend-next-*.tar.gz
rm /tmp/frontend-next-*.tar.gz
pm2 restart frontend
pm2 save
sleep 5
pm2 list | grep frontend
EOF

echo ""
echo "✅ Frontend deployed successfully!"
echo ""
