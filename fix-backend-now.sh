#!/bin/bash
set -e

echo "🚀 EXPERT RECOMMENDED FIX - tsc-alias 1.8.10"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.74 << 'REMOTE'
set -e

cd /var/www/kattenbak/backend

echo "[1/5] Installing correct tsc-alias version..."
npm install -D tsc-alias@1.8.10

echo "[2/5] Optimizing tsconfig..."
cat > tsconfig.json << 'TS'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": { "@/*": ["./*"] },
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  }
}
TS

echo "[3/5] Building backend..."
rm -rf dist
npx tsc --skipLibCheck
npx tsc-alias -p tsconfig.json

echo "[4/5] Generating Prisma..."
npx prisma generate > /dev/null 2>&1

echo "[5/5] Testing backend..."
node dist/server.js &
PID=$!
sleep 8

if ps -p $PID > /dev/null 2>&1; then
    echo "✅ BACKEND RUNNING!"
    curl http://localhost:3101/health
    kill $PID
    
    # Deploy to PM2
    pm2 delete backend 2>/dev/null || true
    pm2 start dist/server.js --name backend -i 2
    pm2 save
    
    sleep 5
    pm2 status
    
    echo ""
    echo "🎉 BACKEND LIVE!"
    curl http://localhost:3101/health
else
    echo "❌ Failed"
    exit 1
fi
REMOTE

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
