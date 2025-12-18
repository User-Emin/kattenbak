#!/bin/bash
# AUTOMATED DEPLOYMENT SCRIPT WITH SECURITY CHECKS
# Usage: ./deploy.sh [production|staging]

set -e  # Exit on error

ENV=${1:-production}
SERVER_IP="185.224.139.74"
SERVER_USER="root"
SERVER_PASS="Amasyaspor@66"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 DEPLOYMENT SCRIPT - Environment: ${ENV}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# STEP 1: Pre-deployment checks
echo -e "\n${YELLOW}[1/8]${NC} Pre-deployment security checks..."
./PRE_DEPLOYMENT_VALIDATION.sh || {
    echo -e "${RED}❌ Pre-deployment validation failed!${NC}"
    exit 1
}

# STEP 2: Git check (ignore build artifacts)
echo -e "\n${YELLOW}[2/8]${NC} Checking Git status..."
UNCOMMITTED=$(git status --porcelain | grep -v "tsconfig.tsbuildinfo")
if [ -n "$UNCOMMITTED" ]; then
    echo -e "${RED}❌ Uncommitted changes detected!${NC}"
    echo "Commit or stash changes before deploying"
    exit 1
fi
echo -e "${GREEN}✅ Git clean${NC}"

# STEP 3: Push to remote
echo -e "\n${YELLOW}[3/8]${NC} Pushing to GitHub..."
git push origin main || {
    echo -e "${RED}❌ Git push failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Pushed to GitHub${NC}"

# STEP 4: Pull on server
echo -e "\n${YELLOW}[4/8]${NC} Pulling latest code on server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} \
    "cd /var/www/kattenbak && git pull origin main" || {
    echo -e "${RED}❌ Git pull on server failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Code updated on server${NC}"

# STEP 5: Build frontend
echo -e "\n${YELLOW}[5/8]${NC} Building frontend..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} \
    "cd /var/www/kattenbak/frontend && rm -rf .next && npm run build" || {
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Frontend built${NC}"

# STEP 6: Copy static files
echo -e "\n${YELLOW}[6/8]${NC} Copying static assets..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} \
    "cd /var/www/kattenbak/frontend && \
     cp -r .next/static .next/standalone/frontend/.next/static && \
     cp -r public .next/standalone/frontend/public" || {
    echo -e "${RED}❌ Static copy failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Static files copied${NC}"

# STEP 7: Restart services
echo -e "\n${YELLOW}[7/8]${NC} Restarting PM2 services..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} \
    "pm2 restart frontend backend && pm2 save" || {
    echo -e "${RED}❌ PM2 restart failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Services restarted${NC}"

# STEP 8: Health check
echo -e "\n${YELLOW}[8/8]${NC} Running health checks..."
sleep 5

# Check homepage
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Homepage: 200 OK${NC}"
else
    echo -e "${RED}❌ Homepage: ${HTTP_CODE}${NC}"
fi

# Check backend API
API_STATUS=$(curl -s http://${SERVER_IP}:3101/health | jq -r '.success' 2>/dev/null || echo "false")
if [ "$API_STATUS" == "true" ]; then
    echo -e "${GREEN}✅ Backend API: Healthy${NC}"
else
    echo -e "${RED}❌ Backend API: Failed${NC}"
fi

# Check PM2 status
PM2_STATUS=$(sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} \
    "pm2 list | grep -c online" || echo "0")
if [ "$PM2_STATUS" -ge 2 ]; then
    echo -e "${GREEN}✅ PM2: ${PM2_STATUS} services online${NC}"
else
    echo -e "${RED}❌ PM2: Only ${PM2_STATUS} services online${NC}"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "🌐 Website: https://catsupply.nl"
echo "📊 Check PM2: ssh root@${SERVER_IP} 'pm2 monit'"
echo ""
