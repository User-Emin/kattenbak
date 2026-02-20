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

# Build backend (npm ci in backend dir – node_modules MUST exist for backend to start)
echo -e "${GREEN}🔧 Building backend...${NC}"
ssh_exec "cd /var/www/kattenbak/backend && npm ci --legacy-peer-deps && npx prisma generate && npm run build && (test -d node_modules/express || test -d ../node_modules/express) && echo '✅ Backend built' || (echo '❌ node_modules/express missing - backend will fail!' && exit 1)"

# Build frontend
echo -e "${GREEN}🔧 Building frontend...${NC}"
ssh_exec "cd /var/www/kattenbak/frontend && rm -rf .next/cache && NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' npm ci --legacy-peer-deps && NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' npm run build && echo '✅ Frontend built'"

# Build admin
echo -e "${GREEN}🔧 Building admin...${NC}"
ssh_exec "cd /var/www/kattenbak/admin-next && npm ci --legacy-peer-deps && NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' npm run build && echo '✅ Admin built'"

# Restart services (reload ecosystem to pick up config changes e.g. server-database.js)
echo -e "${GREEN}♻️  Restarting services...${NC}"
ssh_exec "cd /var/www/kattenbak && pm2 reload ecosystem.config.js --update-env 2>/dev/null || pm2 start ecosystem.config.js && pm2 save && pm2 list && echo '✅ Services restarted'"

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
