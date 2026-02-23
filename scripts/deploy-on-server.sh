#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DEPLOY ON SERVER - Draai dit script OP de server (na ssh root@...)
# Gebruik: cd /var/www/kattenbak && ./scripts/deploy-on-server.sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

PROJECT_ROOT="${PROJECT_ROOT:-/var/www/kattenbak}"
cd "$PROJECT_ROOT"

echo "📥 Git pull..."
git pull origin main

echo "📦 Workspace deps..."
npm ci --legacy-peer-deps

echo "🔧 Prisma generate..."
cd backend && npx prisma generate && cd ..

echo "🔧 Backend build..."
cd backend && npm run build && cd ..

echo "🔧 Frontend build..."
cd frontend
npm ci --legacy-peer-deps
rm -rf .next/cache
NEXT_PUBLIC_API_URL="https://catsupply.nl/api/v1" npm run build
cd ..

echo "♻️  PM2 restart..."
pm2 restart all
pm2 list

echo "✅ Deploy op server klaar."
echo "🌐 https://catsupply.nl | 🔐 /admin | 🔌 /api/v1"
