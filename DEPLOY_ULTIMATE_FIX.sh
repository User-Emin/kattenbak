#!/bin/bash
# ULTIMATE HYDRATION FIX - DEPLOYMENT SCRIPT
# Run this on the SERVER (185.224.139.74) as root
set -e

echo "🚀 ULTIMATE HYDRATION FIX DEPLOYMENT"
echo "===================================="
echo ""

cd /root/kattenbak

echo "📥 Step 1: Git pull latest code..."
git fetch origin
git reset --hard origin/main
git pull origin main
echo "✅ Code updated to: $(git log -1 --oneline)"
echo ""

cd frontend

echo "🗑️  Step 2: NUCLEAR CLEAN - Remove ALL build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
echo "✅ Build artifacts removed"
echo ""

echo "📦 Step 3: Full production build..."
npm run build
echo "✅ Build completed"
echo ""

echo "🔄 Step 4: PM2 restart..."
pm2 stop frontend || true
pm2 delete frontend || true
pm2 start npm --name "frontend" -- start -- -p 3102
pm2 save
echo "✅ PM2 restarted"
echo ""

echo "💨 Step 5: Clear NGINX cache..."
rm -rf /var/cache/nginx/*
systemctl reload nginx
echo "✅ NGINX cache cleared"
echo ""

echo "🎯 Deployment Summary:"
echo "  - Commit: $(cd /root/kattenbak && git log -1 --oneline)"
echo "  - Build ID: $(cat .next/BUILD_ID)"
echo "  - PM2 Status:"
pm2 list | grep frontend || echo "    (frontend should be online)"
echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Test the site at: https://catsupply.nl"
echo "   Remember to do a HARD REFRESH (Cmd+Shift+R on Mac)"
