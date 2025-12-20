#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🚀 FULL DEPLOYMENT SCRIPT${NC}"
echo -e "${BLUE}================================${NC}"

# 1. BUILD FRONTEND
echo -e "\n${BLUE}📦 Building Frontend...${NC}"
cd /Users/emin/kattenbak/frontend
rm -rf .next
NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' NEXT_PUBLIC_SITE_URL='https://catsupply.nl' NODE_ENV=production npm run build
tar czf next-build.tar.gz .next
echo -e "${GREEN}✓ Frontend built${NC}"

# 2. BUILD ADMIN
echo -e "\n${BLUE}📦 Building Admin...${NC}"
cd /Users/emin/kattenbak/admin-next
rm -rf .next
NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' NODE_ENV=production npm run build
tar czf admin-build.tar.gz .next
echo -e "${GREEN}✓ Admin built${NC}"

# 3. UPLOAD BUILDS
echo -e "\n${BLUE}📤 Uploading builds...${NC}"
sshpass -p 'Pursangue66@' scp /Users/emin/kattenbak/frontend/next-build.tar.gz root@185.224.139.74:/tmp/
sshpass -p 'Pursangue66@' scp /Users/emin/kattenbak/admin-next/admin-build.tar.gz root@185.224.139.74:/tmp/
echo -e "${GREEN}✓ Builds uploaded${NC}"

# 4. DEPLOY ON SERVER
echo -e "\n${BLUE}🔧 Deploying on server...${NC}"
sshpass -p 'Pursangue66@' ssh root@185.224.139.74 << 'ENDSSH'
set -e

# Deploy Frontend
cd /var/www/kattenbak/frontend
pm2 stop frontend || true
rm -rf .next
tar xzf /tmp/next-build.tar.gz
pm2 restart frontend || pm2 start 'npm start' --name frontend

# Deploy Admin
cd /var/www/kattenbak/admin-next
pm2 stop admin || true
rm -rf .next
tar xzf /tmp/admin-build.tar.gz
pm2 restart admin || pm2 start 'npm start' --name admin

# Wait for services
sleep 10

# Show status
pm2 status
ENDSSH

echo -e "${GREEN}✓ Deployment complete${NC}"

# 5. VERIFY
echo -e "\n${BLUE}🔍 Running verification...${NC}"
/Users/emin/kattenbak/deployment/verify-deployment.sh

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESS${NC}"
echo -e "${GREEN}================================${NC}"


