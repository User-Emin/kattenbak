#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECURE DEPLOYMENT SCRIPT - DRY & PRODUCTION READY
# Uses .env.server for credentials (NEVER committed to repo)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load credentials from .env.server
if [ -f "$PROJECT_ROOT/.env.server" ]; then
  source "$PROJECT_ROOT/.env.server"
  echo -e "${GREEN}✅ Credentials loaded from .env.server${NC}"
else
  echo -e "${RED}❌ .env.server not found!${NC}"
  echo "Create it with:"
  echo "  export SERVER_HOST='185.224.139.74'"
  echo "  export SERVER_USER='root'"
  echo "  export SSHPASS='your-password'"
  exit 1
fi

# Validate credentials
if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ] || [ -z "$SSHPASS" ]; then
  echo -e "${RED}❌ Missing credentials in .env.server${NC}"
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

echo -e "${GREEN}📥 Pulling latest code...${NC}"
ssh_exec << 'ENDSSH'
cd /var/www/kattenbak
git pull origin main
ENDSSH

echo -e "${GREEN}🔧 Building admin panel...${NC}"
ssh_exec << 'ENDSSH'
cd /var/www/kattenbak/admin-next
NEXT_PUBLIC_API_URL="https://catsupply.nl/api/v1" npm run build
ENDSSH

echo -e "${GREEN}♻️  Restarting services...${NC}"
ssh_exec << 'ENDSSH'
pm2 restart all
pm2 list
ENDSSH

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESS!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🌐 Frontend: https://catsupply.nl"
echo "🔐 Admin: https://catsupply.nl/admin"
echo "🔌 Backend: https://catsupply.nl/api/v1"
echo ""

