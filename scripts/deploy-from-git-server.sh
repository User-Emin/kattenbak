#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DEPLOY FROM GIT – Draai OP de server (of via: ssh user@host 'bash -s' < scripts/deploy-from-git-server.sh)
# Principes: alleen git als bron, schone install, build, restart, geen handmatige edits.
# Gebruik: cd /var/www/kattenbak && bash scripts/deploy-from-git-server.sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="${PROJECT_ROOT:-/var/www/kattenbak}"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}━━━ 1. Git (alleen origin/main, geen lokale wijzigingen) ━━━${NC}"
git fetch origin
git reset --hard origin/main
git rev-parse --short HEAD
echo ""

echo -e "${YELLOW}━━━ 2. Schone node_modules (voorkom EEXIST / corrupte tsc) ━━━${NC}"
rm -rf node_modules backend/node_modules frontend/node_modules
rm -f node_modules/kattenbak-backend 2>/dev/null || true
echo ""

echo -e "${YELLOW}━━━ 3. Root workspace deps ━━━${NC}"
npm ci --legacy-peer-deps
echo ""

echo -e "${YELLOW}━━━ 4. Backend (deps, Prisma, build) ━━━${NC}"
cd backend
npm ci --legacy-peer-deps
npx prisma generate
npm run build
cd ..
echo ""

echo -e "${YELLOW}━━━ 5. Frontend (deps, build) ━━━${NC}"
cd frontend
npm ci --legacy-peer-deps
rm -rf .next .next/cache
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://catsupply.nl/api/v1}" npm run build
cd ..
echo ""

echo -e "${YELLOW}━━━ 6. PM2 restart ━━━${NC}"
pm2 restart all
pm2 list
echo ""

echo -e "${YELLOW}━━━ 7. Backend readiness (robuste check: wacht tot health 200) ━━━${NC}"
BACKEND_URL="${BACKEND_HEALTH_URL:-http://127.0.0.1:3101/api/v1/health}"
MAX_ATTEMPTS=30
SLEEP=3
attempt=1
while [ $attempt -le $MAX_ATTEMPTS ]; do
  if curl -sf --max-time 5 "$BACKEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend bereikbaar (attempt $attempt)${NC}"
    break
  fi
  echo "   Backend nog niet klaar (attempt $attempt/$MAX_ATTEMPTS), wacht ${SLEEP}s..."
  sleep $SLEEP
  attempt=$((attempt + 1))
done
if [ $attempt -gt $MAX_ATTEMPTS ]; then
  echo -e "${RED}⚠️  Backend na ${MAX_ATTEMPTS} pogingen niet bereikbaar – check: pm2 logs backend${NC}"
fi
echo ""

echo -e "${GREEN}✅ Deploy from git klaar. Backend-check gedaan. Voer E2E uit (scripts/e2e-deployment-verification.sh).${NC}"
echo "🌐 https://catsupply.nl | 🔐 /admin | 🔌 /api/v1"
