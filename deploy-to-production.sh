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

# Laad .env.server (zelfde als deploy-frontend-only) voor SSHPASS
[ -f "$(dirname "$0")/.env.server" ] && source "$(dirname "$0")/.env.server"
[ -f ".env.server" ] && source ".env.server"

SERVER_HOST="${SERVER_HOST:-catsupply.nl}"
SERVER_USER="${SERVER_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_mewsimqr}"
SSH_OPTS="-o StrictHostKeyChecking=no"

if [ -n "$SSHPASS" ] && command -v sshpass >/dev/null 2>&1; then
  ssh_exec() { sshpass -e ssh $SSH_OPTS "${SERVER_USER}@${SERVER_HOST}" "$@"; }
  SSH_AUTH="sshpass (password)"
elif [ -f "$SSH_KEY" ]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
  ssh_exec() { ssh $SSH_OPTS "${SERVER_USER}@${SERVER_HOST}" "$@"; }
  SSH_AUTH="key: $SSH_KEY"
else
  ssh_exec() { ssh $SSH_OPTS "${SERVER_USER}@${SERVER_HOST}" "$@"; }
  SSH_AUTH="default"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 PRODUCTION DEPLOYMENT${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Server: ${SERVER_USER}@${SERVER_HOST}${NC}"
echo -e "${YELLOW}Auth: ${SSH_AUTH}${NC}"
echo ""

echo -e "${GREEN}📥 Volledige pull (fetch + reset --hard origin/main)...${NC}"
ssh_exec "cd /var/www/kattenbak && git fetch origin && git reset --hard origin/main && git rev-parse --short HEAD && echo '✅ Code updated'"

echo -e "${GREEN}📦 Root deps (workspace hoisting voor express etc)...${NC}"
ssh_exec "cd /var/www/kattenbak && npm ci --legacy-peer-deps 2>/dev/null || true"

# ━━━ BACKEND FIRST (isolated – nooit frontend bouwen als backend faalt) ━━━
echo -e "${GREEN}🔧 Building backend...${NC}"
ssh_exec "cd /var/www/kattenbak/backend && npm ci --legacy-peer-deps && npx prisma generate && npm run build && (test -d node_modules/express || test -d ../node_modules/express) && echo '✅ Backend built' || (echo '❌ node_modules/express missing!' && exit 1)"

echo -e "${GREEN}♻️  Restarting backend (PM2 wait-ready)...${NC}"
ssh_exec "cd /var/www/kattenbak && pm2 reload backend --update-env 2>/dev/null || pm2 start ecosystem.config.js --only backend && pm2 save"

echo -e "${GREEN}🏥 Wacht op backend + DB (max 90s)...${NC}"
sleep 5
BACKEND_READY=false
for i in $(seq 1 20); do
  RAW=$(curl -sf --max-time 5 https://catsupply.nl/api/v1/health 2>/dev/null || echo '{}')
  SUCCESS=$(echo "$RAW" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success', False))" 2>/dev/null || echo "false")
  DB=$(echo "$RAW" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('database',''))" 2>/dev/null || echo "")
  if [ "$SUCCESS" = "True" ] && [ "$DB" = "connected" ]; then
    echo -e "${GREEN}✅ Backend + DB ready${NC}"
    BACKEND_READY=true
    break
  fi
  echo "   Poging $i/20 (db=$DB)..."
  sleep 3
done
if [ "$BACKEND_READY" != "true" ]; then
  echo -e "${RED}⚠️ Backend/DB niet ready na 20 pogingen - check server logs${NC}"
  ssh_exec "pm2 logs backend --lines 20 --nostream 2>/dev/null || true"
fi

# ━━━ FRONTEND + ADMIN (na backend OK) ━━━
echo -e "${GREEN}🔧 Building frontend...${NC}"
ssh_exec "cd /var/www/kattenbak/frontend && rm -rf .next/cache && NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' npm ci --legacy-peer-deps && NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' npm run build && echo '✅ Frontend built'"

echo -e "${GREEN}🔧 Building admin...${NC}"
ssh_exec "cd /var/www/kattenbak/admin-next && npm ci --legacy-peer-deps && NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' npm run build && echo '✅ Admin built'"

echo -e "${GREEN}♻️  Restarting frontend + frontend2 + admin...${NC}"
ssh_exec "cd /var/www/kattenbak && pm2 reload ecosystem.config.js --update-env && pm2 save && pm2 list && echo '✅ Services restarted'"

echo -e "${GREEN}📋 Nginx config updaten (least_conn balancer)...${NC}"
ssh_exec "cp /var/www/kattenbak/deployment/nginx-catsupply.conf /etc/nginx/sites-available/catsupply.conf 2>/dev/null && nginx -t && nginx -s reload 2>/dev/null && echo '✅ Nginx reloaded' || echo '⚠️ Nginx config path kan anders zijn – handmatig kopiëren indien nodig'"

# Health check
echo -e "${GREEN}🏥 Final health check...${NC}"
sleep 3
BACKEND_HEALTH=$(curl -s https://catsupply.nl/api/v1/health | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('success', False) and d.get('database')=='connected')" 2>/dev/null || echo "false")
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
