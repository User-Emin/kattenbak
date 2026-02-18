#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRODUCTION DEPLOYMENT SCRIPT
# Deploys latest code to production server
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SERVER_HOST="${SERVER_HOST:-catsupply.nl}"
SERVER_USER="${SERVER_USER:-root}"
# SSH key: gebruik -i als bestand bestaat (bijv. ~/.ssh/id_ed25519_mewsimqr)
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_mewsimqr}"
SSH_OPTS="-o StrictHostKeyChecking=no"
[ -f "$SSH_KEY" ] && SSH_OPTS="$SSH_OPTS -i $SSH_KEY"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 PRODUCTION DEPLOYMENT${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Server: ${SERVER_USER}@${SERVER_HOST}${NC}"
echo -e "${YELLOW}SSH key: ${SSH_KEY}${NC}"
echo ""

# SSH command helper
ssh_exec() {
  ssh $SSH_OPTS "${SERVER_USER}@${SERVER_HOST}" "$@"
}

echo -e "${GREEN}📥 Volledige pull (fetch + reset --hard origin/main)...${NC}"
ssh_exec "cd /var/www/kattenbak && git fetch origin && git reset --hard origin/main && git rev-parse --short HEAD && echo '✅ Code updated'"

# Build backend (npm ci in backend dir so node_modules exists for PM2 cwd)
echo -e "${GREEN}🔧 Building backend...${NC}"
ssh_exec << 'ENDSSH'
cd /var/www/kattenbak/backend
npm ci --legacy-peer-deps
npx prisma generate
npm run build
echo "✅ Backend built"
ENDSSH

# Build frontend
echo -e "${GREEN}🔧 Building frontend...${NC}"
ssh_exec << 'ENDSSH'
cd /var/www/kattenbak/frontend
rm -rf .next/cache
NEXT_PUBLIC_API_URL="https://catsupply.nl/api/v1" npm ci --legacy-peer-deps
NEXT_PUBLIC_API_URL="https://catsupply.nl/api/v1" npm run build
echo "✅ Frontend built"
ENDSSH

# Restart services
echo -e "${GREEN}♻️  Restarting services...${NC}"
ssh_exec << 'ENDSSH'
pm2 restart all
pm2 save
pm2 list
echo "✅ Services restarted"
ENDSSH

# Health check
echo -e "${GREEN}🏥 Health check...${NC}"
sleep 5
BACKEND_HEALTH=$(curl -s https://catsupply.nl/api/v1/health | python3 -c 'import sys, json; print(json.load(sys.stdin).get("success", False))' 2>/dev/null || echo "false")
FRONTEND_HEALTH=$(curl -s -o /dev/null -w '%{http_code}' https://catsupply.nl)

if [ "$BACKEND_HEALTH" = "True" ] && [ "$FRONTEND_HEALTH" = "200" ]; then
  echo -e "${GREEN}✅ All services healthy!${NC}"
else
  echo -e "${RED}⚠️  Health check issues detected${NC}"
  echo "  Backend: $BACKEND_HEALTH"
  echo "  Frontend: $FRONTEND_HEALTH"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🌐 Frontend: https://catsupply.nl"
echo "🔐 Admin: https://catsupply.nl/admin"
echo "🔌 Backend: https://catsupply.nl/api/v1"
echo ""
