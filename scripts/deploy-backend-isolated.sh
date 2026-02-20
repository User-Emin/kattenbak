#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BACKEND-ISOLATED DEPLOY – Backend nooit crashen
# 1. Bouw backend, restart met PM2 wait-ready
# 2. Wacht tot DB connected vóór verder
# 3. Optioneel: frontend/admin daarna
# Gebruik: bash scripts/deploy-backend-isolated.sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="${PROJECT_ROOT:-/var/www/kattenbak}"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}━━━ 1. Git pull (alleen backend-fixes) ━━━${NC}"
git fetch origin
git reset --hard origin/main
echo "HEAD: $(git rev-parse --short HEAD)"
echo ""

echo -e "${YELLOW}━━━ 2. Backend build (npm ci, prisma, tsc) ━━━${NC}"
cd backend
npm ci --legacy-peer-deps
npx prisma generate
npm run build
test -d node_modules/express || (echo -e "${RED}❌ express ontbreekt${NC}" && exit 1)
cd ..
echo ""

echo -e "${YELLOW}━━━ 3. Backend restart (PM2 wait-ready) ━━━${NC}"
pm2 reload backend --update-env 2>/dev/null || pm2 start ecosystem.config.js --only backend
pm2 save
echo ""

echo -e "${YELLOW}━━━ 4. Wacht op backend + DB (max 90s) ━━━${NC}"
MAX_ATTEMPTS=30
SLEEP=3
attempt=1
while [ $attempt -le $MAX_ATTEMPTS ]; do
  RAW=$(curl -sf --max-time 5 "http://127.0.0.1:3101/api/v1/health" 2>/dev/null || true)
  if [ -n "$RAW" ]; then
    SUCCESS=$(echo "$RAW" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success', False))" 2>/dev/null || echo "false")
    DB=$(echo "$RAW" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('database',''))" 2>/dev/null || echo "")
    if [ "$SUCCESS" = "True" ] && [ "$DB" = "connected" ]; then
      echo -e "${GREEN}✅ Backend + DB ready (attempt $attempt)${NC}"
      break
    fi
  fi
  echo "   Wachten... (attempt $attempt/$MAX_ATTEMPTS, db=$DB)"
  sleep $SLEEP
  attempt=$((attempt + 1))
done

if [ $attempt -gt $MAX_ATTEMPTS ]; then
  echo -e "${RED}❌ Backend na ${MAX_ATTEMPTS} pogingen niet bereikbaar met DB${NC}"
  echo "Logs:"
  pm2 logs backend --lines 30 --nostream 2>/dev/null || true
  exit 1
fi
echo ""

echo -e "${GREEN}✅ Backend deploy voltooid. Product-API beschikbaar.${NC}"
echo "🔌 https://catsupply.nl/api/v1"
