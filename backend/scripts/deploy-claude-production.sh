#!/bin/bash
set -e

echo "=========================================="
echo "🚀 CLAUDE PRODUCTION DEPLOYMENT"
echo "=========================================="
echo ""
echo "Team: AI Engineer + DevOps + Security"
echo "Target: catsupply.nl"
echo ""

# 1. Build locally first (catch errors early)
echo "1️⃣ Building backend locally..."
cd "$(dirname "$0")/.."
npm run build 2>&1 | tail -5

if [ $? -ne 0 ]; then
  echo "❌ Build failed locally!"
  exit 1
fi

echo "✅ Local build successful"
echo ""

# 2. SSH to server
echo "2️⃣ Deploying to production server..."
ssh root@185.224.139.74 << 'SSHEOF'
set -e

cd /var/www/kattenbak/backend

echo "📥 Pulling latest code..."
git pull

echo ""
echo "🔨 Building on server..."
npm run build 2>&1 | tail -10

if [ $? -ne 0 ]; then
  echo "❌ Server build failed!"
  exit 1
fi

echo ""
echo "🔄 Restarting backend..."
pm2 restart backend --update-env

echo ""
echo "⏳ Waiting for startup (10s)..."
sleep 10

echo ""
echo "📊 Service status:"
pm2 list | grep backend

echo ""
echo "✅ DEPLOYMENT COMPLETE"

SSHEOF

# 3. Health check
echo ""
echo "3️⃣ Production health check..."
sleep 2

HEALTH=$(curl -s https://catsupply.nl/api/v1/rag/health)
echo "$HEALTH" | python3 -m json.tool

echo ""
echo "=========================================="
echo "✅ PRODUCTION DEPLOYMENT SUCCESSFUL"
echo "=========================================="
echo ""
echo "Next: Add CLAUDE_API_KEY to server .env.production"
echo "Command: ssh root@185.224.139.74"
echo "         echo 'CLAUDE_API_KEY=sk-ant-...' >> /var/www/kattenbak/backend/.env.production"
echo "         pm2 restart backend"
echo ""
