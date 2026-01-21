#!/bin/bash
#
# 🔧 BACKEND DEPLOYMENT SCRIPT - CPU-Friendly & Secure
# Deploys only the backend to production
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="/var/www/kattenbak"
BACKEND_DIR="${PROJECT_ROOT}/backend"
NICE_LEVEL=10

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 BACKEND DEPLOYMENT - PRODUCTION                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ✅ Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
cd "$PROJECT_ROOT"
git pull origin main || {
  echo -e "${RED}❌ Git pull failed${NC}"
  exit 1
}

# ✅ CPU CHECK: Check current load
CPU_LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | awk '{ print $1 }' | sed 's/,//')
CPU_COUNT=$(nproc)
LOAD_THRESHOLD=$(echo "$CPU_COUNT * 0.7" | bc)

if (( $(echo "$CPU_LOAD > $LOAD_THRESHOLD" | bc -l) )); then
  echo -e "${YELLOW}⚠️  High CPU load detected. Waiting 30s before build...${NC}"
  sleep 30
fi

# ✅ BACKEND BUILD: CPU-friendly
echo ""
echo -e "${BLUE}🔨 Building Backend (CPU-friendly)...${NC}"
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  nice -n $NICE_LEVEL npm install --legacy-peer-deps
fi

# Build with CPU limit
echo -e "${YELLOW}🔧 Compiling TypeScript...${NC}"
nice -n $NICE_LEVEL npm run build 2>&1 | tail -30

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend build successful${NC}"
else
  echo -e "${RED}❌ Backend build failed${NC}"
  exit 1
fi

# ✅ Restart backend service
echo ""
echo -e "${YELLOW}♻️  Restarting backend service...${NC}"
pm2 restart backend --update-env || {
  echo -e "${RED}❌ PM2 restart failed${NC}"
  exit 1
}

sleep 3

# ✅ Health check
echo ""
echo -e "${YELLOW}🔍 Verifying backend health...${NC}"
HEALTH_RESPONSE=$(curl -s https://catsupply.nl/api/v1/health 2>/dev/null || echo "")
if echo "$HEALTH_RESPONSE" | grep -q '"status"'; then
  echo -e "${GREEN}✅ Backend health check passed${NC}"
else
  echo -e "${YELLOW}⚠️  Backend health check failed (may need more time)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ BACKEND DEPLOYMENT COMPLETE                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
