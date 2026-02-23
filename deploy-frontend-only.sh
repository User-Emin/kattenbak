#!/bin/bash
# Pull + alleen frontend build + restart frontend. Backend wordt niet herstart (geen crash).
# Gebruikt SSHPASS (uit .env.server) als key niet werkt.

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Laad .env.server als die bestaat (snelkoppeling voor naadloze deploy)
[ -f "$(dirname "$0")/.env.server" ] && source "$(dirname "$0")/.env.server"
[ -f ".env.server" ] && source ".env.server"

SERVER_HOST="${SERVER_HOST:-catsupply.nl}"
SERVER_USER="${SERVER_USER:-root}"
SSH_OPTS="-o StrictHostKeyChecking=no"

if [ -n "$SSHPASS" ] && command -v sshpass >/dev/null 2>&1; then
  ssh_exec() { sshpass -e ssh $SSH_OPTS "${SERVER_USER}@${SERVER_HOST}" "$@"; }
elif [ -f "${SSH_KEY:-$HOME/.ssh/id_ed25519_mewsimqr}" ]; then
  SSH_OPTS="$SSH_OPTS -i ${SSH_KEY:-$HOME/.ssh/id_ed25519_mewsimqr}"
  ssh_exec() { ssh $SSH_OPTS "${SERVER_USER}@${SERVER_HOST}" "$@"; }
else
  ssh_exec() { ssh $SSH_OPTS "${SERVER_USER}@${SERVER_HOST}" "$@"; }
fi

echo -e "${CYAN}📥 Pull + frontend only (backend blijft draaien)...${NC}"
ssh_exec "cd /var/www/kattenbak && git fetch origin && git reset --hard origin/main && git rev-parse --short HEAD && echo '✅ Code updated'"

echo -e "${GREEN}🔧 Frontend build...${NC}"
ssh_exec "cd /var/www/kattenbak/frontend && rm -rf .next/cache && NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1 npm ci --legacy-peer-deps && NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1 npm run build && echo '✅ Frontend built'"

echo -e "${GREEN}♻️  Alleen frontend herstarten...${NC}"
ssh_exec "pm2 restart frontend && pm2 save && pm2 list && echo '✅ Frontend restarted'"

echo -e "${GREEN}✅ Klaar. Backend niet aangeraakt.${NC}"
