#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECURE DEPLOYMENT VIA GIT – Principes
# - Alleen git als bron: op server altijd git fetch + reset --hard origin/main
# - Geen handmatige edits op server; schone install (rm node_modules) voorkomt EEXIST/corrupte tsc
# - Build backend + frontend; pm2 restart all
# - Volledige verificatie: scripts/e2e-deployment-verification.sh
# Credentials: .env.server (SERVER_HOST, SSHPASS) of env – NOOIT in repo
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load credentials: .env.server or env vars (env vars take precedence)
if [ -f "$PROJECT_ROOT/.env.server" ]; then
  source "$PROJECT_ROOT/.env.server"
  echo -e "${GREEN}✅ Credentials loaded from .env.server${NC}"
fi
if [ -n "$SERVER_HOST" ] || [ -n "$SERVER_USER" ] || [ -n "$SSHPASS" ]; then
  echo -e "${GREEN}✅ Using SERVER_* from environment${NC}"
fi
: "${SERVER_USER:=root}"

# Validate credentials
if [ -z "$SERVER_HOST" ] || [ -z "$SSHPASS" ]; then
  echo -e "${RED}❌ Missing credentials. Set .env.server or: SERVER_HOST, SSHPASS (SERVER_USER optional, default root)${NC}"
  exit 1
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 SECURE DEPLOYMENT TO PRODUCTION${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Server: ${SERVER_HOST}${NC}"
echo -e "${YELLOW}User: ${SERVER_USER}${NC}"
echo ""

# Export SSHPASS for sshpass
export SSHPASS

# SSH command helper
ssh_exec() {
  sshpass -e ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" "$@"
}

# ━━━ Pre-check: code staat op origin/main (optioneel, niet blokkeren)
echo -e "${GREEN}🔍 Pre-check: git status lokaal...${NC}"
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo -e "   ${YELLOW}⚠️  Geen git repo (OK als je script vanaf server draait)${NC}"
else
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
  echo "   Branch: ${BRANCH:-?} | Deploy gebruikt altijd origin/main op server."
fi
echo ""

# ━━━ Deploy via git: sync + server-script (schone install, build, restart)
echo -e "${GREEN}📥 Server: git sync + deploy-from-git (schone install, build, pm2)...${NC}"
ssh_exec "cd /var/www/kattenbak && git fetch origin && git reset --hard origin/main && bash scripts/deploy-from-git-server.sh"
echo ""

# ━━━ Korte pauze zodat backend/nginx zeker klaar is na server-side wait
echo -e "${GREEN}⏳ 5s wachten (backend readiness al op server gecontroleerd)...${NC}"
sleep 5

# ━━━ Volledige verificatie: E2E deployment checks
echo -e "${GREEN}🔍 Verificatie: E2E deployment (volledig)...${NC}"
if [ -f "$PROJECT_ROOT/scripts/e2e-deployment-verification.sh" ]; then
  if bash "$PROJECT_ROOT/scripts/e2e-deployment-verification.sh"; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESS – 100% BEVESTIGD (E2E geslaagd)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  else
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  DEPLOYMENT DONE – E2E verificatie gefaald (check output hierboven)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  fi
else
  # Fallback: alleen health checks
  FRONT_OK=0
  BACKEND_OK=0
  if curl -sf --max-time 10 "https://catsupply.nl" > /dev/null; then FRONT_OK=1; echo -e "   ${GREEN}✅ Frontend: OK${NC}"; else echo -e "   ${RED}❌ Frontend: niet bereikbaar${NC}"; fi
  if curl -sf --max-time 10 "https://catsupply.nl/api/v1/health" > /dev/null; then BACKEND_OK=1; echo -e "   ${GREEN}✅ Backend health: OK${NC}"; else echo -e "   ${RED}❌ Backend health: niet bereikbaar${NC}"; fi
  if [ "$FRONT_OK" = 1 ] && [ "$BACKEND_OK" = 1 ]; then
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESS – Health OK${NC}"
  else
    echo -e "${YELLOW}⚠️  DEPLOYMENT DONE – Verificatie gedeeltelijk${NC}"
  fi
fi
echo ""
echo "🌐 Frontend: https://catsupply.nl"
echo "🔐 Admin: https://catsupply.nl/admin"
echo "🔌 Backend: https://catsupply.nl/api/v1"
echo ""

