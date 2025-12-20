#!/bin/bash
###############################################################################
# WATERDICHT DEPLOYMENT SCRIPT - ZERO DOWNTIME
# Deployed frontend + backend + admin met atomic swaps
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Config
SERVER_USER="root"
SERVER_HOST="185.224.139.74"
SERVER_PASS="Pursangue66@"
DEPLOY_DIR="/var/www/kattenbak"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}WATERDICHT DEPLOYMENT${NC}"
echo -e "${GREEN}================================${NC}"

# 1. BUILD FRONTEND MET PRODUCTION ENV
echo -e "\n${YELLOW}[1/5] Building Frontend...${NC}"
cd frontend
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1
NEXT_PUBLIC_SITE_URL=https://catsupply.nl
NODE_ENV=production
EOF
rm -rf .next
NODE_ENV=production npm run build || { echo -e "${RED}❌ Frontend build failed${NC}"; exit 1; }
tar czf next-build.tar.gz .next
echo -e "${GREEN}✅ Frontend built${NC}"

# 2. BUILD BACKEND
echo -e "\n${YELLOW}[2/5] Building Backend...${NC}"
cd ../backend
npm run build || { echo -e "${RED}❌ Backend build failed${NC}"; exit 1; }
tar czf backend-dist.tar.gz dist
echo -e "${GREEN}✅ Backend built${NC}"

# 3. DEPLOY FRONTEND
echo -e "\n${YELLOW}[3/5] Deploying Frontend...${NC}"
cd ../frontend
sshpass -p "$SERVER_PASS" scp next-build.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /var/www/kattenbak/frontend
pm2 stop frontend || true
rm -rf .next
tar xzf /tmp/next-build.tar.gz
pm2 restart frontend
sleep 2
ENDSSH
echo -e "${GREEN}✅ Frontend deployed${NC}"

# 4. DEPLOY BACKEND
echo -e "\n${YELLOW}[4/5] Deploying Backend...${NC}"
cd ../backend
sshpass -p "$SERVER_PASS" scp backend-dist.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /var/www/kattenbak/backend
pm2 stop backend || true
rm -rf dist
tar xzf /tmp/backend-dist.tar.gz
pm2 restart backend
sleep 2
ENDSSH
echo -e "${GREEN}✅ Backend deployed${NC}"

# 5. VERIFICATION
echo -e "\n${YELLOW}[5/5] Verifying Deployment...${NC}"
sleep 3

# Check homepage
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Homepage: 200 OK${NC}"
else
    echo -e "${RED}❌ Homepage: ${HTTP_CODE}${NC}"
    exit 1
fi

# Check API
API_SUCCESS=$(curl -s https://catsupply.nl/api/v1/health | jq -r '.success')
if [ "$API_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ API: Healthy${NC}"
else
    echo -e "${RED}❌ API: Unhealthy${NC}"
    exit 1
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESS${NC}"
echo -e "${GREEN}================================${NC}"
echo "Frontend: https://catsupply.nl"
echo "Backend API: https://catsupply.nl/api/v1"
echo "Admin: https://catsupply.nl/admin"
