#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRODUCTION DEPLOYMENT SCRIPT
# Voor 185.224.139.54
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 DEPLOYING KATTENBAK TO PRODUCTION${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if we're on the server
if [ ! -d "/var/www/kattenbak" ]; then
  echo -e "${RED}❌ Error: Not on production server${NC}"
  echo -e "${YELLOW}💡 Run this script on 185.224.139.54${NC}"
  exit 1
fi

cd /var/www/kattenbak

# 1. Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from GitHub...${NC}"
git pull origin main

# 2. Check if .env files exist
echo -e "${YELLOW}🔍 Checking environment files...${NC}"
if [ ! -f "backend/.env.production" ]; then
  echo -e "${RED}❌ Error: backend/.env.production not found${NC}"
  echo -e "${YELLOW}💡 Copy from .env.example and configure${NC}"
  exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
  echo -e "${RED}❌ Error: frontend/.env.local not found${NC}"
  echo -e "${YELLOW}💡 Copy from .env.development and configure${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Environment files found${NC}"

# 3. Install dependencies & build - BACKEND
echo -e "${YELLOW}🔧 Building backend...${NC}"
cd backend
npm install --production
npm run build
cd ..

# 4. Install dependencies & build - FRONTEND
echo -e "${YELLOW}🔧 Building frontend...${NC}"
cd frontend
npm install --production
npm run build
cd ..

# 5. Install dependencies & build - ADMIN
echo -e "${YELLOW}🔧 Building admin...${NC}"
cd admin
npm install --production
npm run build
cd ..

# 6. Restart PM2 services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
pm2 reload ecosystem.config.js

# 7. Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"
sleep 5

# Check backend
if curl -f http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend is healthy${NC}"
else
  echo -e "${RED}❌ Backend health check failed${NC}"
  pm2 logs kattenbak-backend --lines 20
  exit 1
fi

# Check frontend
if curl -f http://localhost:3100 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
  echo -e "${RED}❌ Frontend health check failed${NC}"
  pm2 logs kattenbak-frontend --lines 20
  exit 1
fi

# Check admin
if curl -f http://localhost:3002 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Admin is healthy${NC}"
else
  echo -e "${RED}❌ Admin health check failed${NC}"
  pm2 logs kattenbak-admin --lines 20
  exit 1
fi

# 8. Show status
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
pm2 status
echo ""
echo -e "${GREEN}📊 Process Status:${NC}"
pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status) (CPU: \(.monit.cpu)%, MEM: \(.monit.memory / 1024 / 1024 | floor)MB)"'
echo ""
echo -e "${GREEN}🌐 Services:${NC}"
echo -e "   Frontend: http://localhost:3100"
echo -e "   Backend:  http://localhost:3101"
echo -e "   Admin:    http://localhost:3102"
echo ""
echo -e "${YELLOW}💡 View logs: pm2 logs${NC}"
echo -e "${YELLOW}💡 Monitor: pm2 monit${NC}"

