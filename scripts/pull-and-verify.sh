#!/bin/bash

# 🚀 PULL AND VERIFY - FRONTEND
# Pulls latest changes and verifies deployment

set -e

echo "🚀 PULL AND VERIFY - FRONTEND"
echo "=============================="
echo ""

SERVER_HOST=${SERVER_HOST:-185.224.139.74}
REMOTE_PATH="/var/www/kattenbak"

# ✅ Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
ssh root@$SERVER_HOST << EOF
cd $REMOTE_PATH
git pull origin main
echo "✅ Git pull complete"
echo ""

# ✅ Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
echo "✅ Frontend build complete"
echo ""

# ✅ Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart frontend
pm2 save
echo "✅ PM2 restarted"
echo ""

# ✅ Verify deployment
echo "🔍 Verifying deployment..."
sleep 3
pm2 list | grep frontend
pm2 logs frontend --lines 10 --nostream
echo ""
echo "✅ Verification complete!"
EOF

echo ""
echo "✅ Pull and verify complete!"
echo ""
echo "🌐 Check: https://catsupply.nl/product/automatische-kattenbak-premium"
echo ""
