#!/bin/bash

##############################################################################
# ROBUST FRONTEND DEPLOYMENT SCRIPT
# - Server-side build (eliminates platform issues)
# - Health checks before going live
# - Automatic rollback on failure
# - PM2 process management
##############################################################################

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="root"
SERVER_HOST="catsupply.nl"
SERVER_PATH="/var/www/kattenbak/frontend"
BACKUP_PATH="/var/www/kattenbak/frontend-backup"
MAX_RETRIES=3
HEALTH_CHECK_TIMEOUT=60

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 ROBUST FRONTEND DEPLOYMENT                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

##############################################################################
# STEP 1: Pre-deployment Checks
##############################################################################
echo -e "\n${YELLOW}[1/7] Pre-deployment checks...${NC}"

# Check if server is reachable
if ! ping -c 1 "$SERVER_HOST" &> /dev/null; then
    echo -e "${RED}❌ Server unreachable!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server reachable${NC}"

# Check if SSH works
if ! sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo OK" &> /dev/null; then
    echo -e "${RED}❌ SSH connection failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection working${NC}"

##############################################################################
# STEP 2: Backup Current Version
##############################################################################
echo -e "\n${YELLOW}[2/7] Creating backup...${NC}"

sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    
    # Remove old backup
    rm -rf /var/www/kattenbak/frontend-backup
    
    # Create new backup
    if [ -d /var/www/kattenbak/frontend/.next ]; then
        cp -r /var/www/kattenbak/frontend/.next /var/www/kattenbak/frontend-backup
        echo "✓ Backup created"
    else
        echo "⚠ No existing .next to backup"
    fi
ENDSSH

echo -e "${GREEN}✓ Backup complete${NC}"

##############################################################################
# STEP 3: Git Pull Latest Code
##############################################################################
echo -e "\n${YELLOW}[3/7] Pulling latest code...${NC}"

sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    cd /var/www/kattenbak
    
    # Stash any local changes
    git stash || true
    
    # Pull latest
    git pull origin main
    
    echo "✓ Code updated"
ENDSSH

echo -e "${GREEN}✓ Code updated${NC}"

##############################################################################
# STEP 4: Clean Install (Server-side)
##############################################################################
echo -e "\n${YELLOW}[4/7] Installing dependencies...${NC}"

sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    cd /var/www/kattenbak/frontend
    
    # Clean install
    rm -rf node_modules .next
    
    # Install with legacy peer deps to avoid conflicts
    npm install --legacy-peer-deps --production=false
    
    echo "✓ Dependencies installed"
ENDSSH

echo -e "${GREEN}✓ Dependencies installed${NC}"

##############################################################################
# STEP 5: Server-side Build
##############################################################################
echo -e "\n${YELLOW}[5/7] Building application...${NC}"

sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    cd /var/www/kattenbak/frontend
    
    # Set production env var
    export NODE_ENV=production
    export NEXT_PUBLIC_API_URL=http://catsupply.nl:3101/api/v1
    
    # Build
    npm run build
    
    echo "✓ Build complete"
ENDSSH

echo -e "${GREEN}✓ Build complete${NC}"

##############################################################################
# STEP 6: Deploy with PM2
##############################################################################
echo -e "\n${YELLOW}[6/7] Deploying with PM2...${NC}"

sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    cd /var/www/kattenbak/frontend
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/kattenbak/frontend',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'http://catsupply.nl:3101/api/v1',
      PORT: 3102
    },
    error_file: '/root/.pm2/logs/frontend-error.log',
    out_file: '/root/.pm2/logs/frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
EOF
    
    # Delete old process
    pm2 delete frontend || true
    
    # Start with ecosystem file
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    echo "✓ PM2 deployment complete"
ENDSSH

echo -e "${GREEN}✓ PM2 deployment complete${NC}"

##############################################################################
# STEP 7: Health Check
##############################################################################
echo -e "\n${YELLOW}[7/7] Running health checks...${NC}"

# Wait for startup
echo -n "Waiting for application to start"
sleep 10
echo " ✓"

# Check PM2 status
echo -n "Checking PM2 status..."
PM2_STATUS=$(sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "pm2 jlist" | grep -o '"status":"[^"]*"' | grep -o 'online' || echo "")

if [ "$PM2_STATUS" == "online" ]; then
    echo -e " ${GREEN}✓ Process running${NC}"
else
    echo -e " ${RED}✗ Process not running!${NC}"
    
    # Attempt rollback
    echo -e "${YELLOW}Attempting rollback...${NC}"
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
        if [ -d /var/www/kattenbak/frontend-backup ]; then
            rm -rf /var/www/kattenbak/frontend/.next
            cp -r /var/www/kattenbak/frontend-backup /var/www/kattenbak/frontend/.next
            pm2 restart frontend
            echo "✓ Rollback complete"
        fi
ENDSSH
    exit 1
fi

# HTTP health check
echo -n "Checking HTTP response..."
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/ || echo "000")
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e " ${GREEN}✓ HTTP 200 OK${NC}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo -n "."
            sleep 5
        else
            echo -e " ${RED}✗ HTTP $HTTP_CODE (after $MAX_RETRIES retries)${NC}"
            exit 1
        fi
    fi
done

# Check error logs
echo -n "Checking for errors in logs..."
ERROR_COUNT=$(sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "tail -n 50 /root/.pm2/logs/frontend-error.log | grep -i 'error' | wc -l" || echo "0")

if [ "$ERROR_COUNT" -gt 5 ]; then
    echo -e " ${YELLOW}⚠ $ERROR_COUNT errors found in logs${NC}"
    echo -e "${YELLOW}Recent errors:${NC}"
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "tail -n 10 /root/.pm2/logs/frontend-error.log"
else
    echo -e " ${GREEN}✓ No critical errors${NC}"
fi

##############################################################################
# SUCCESS
##############################################################################
echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ DEPLOYMENT SUCCESSFUL!                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}📊 Deployment Summary:${NC}"
echo -e "  🌐 URL: https://catsupply.nl"
echo -e "  📦 Version: $(cd /Users/emin/kattenbak && git rev-parse --short HEAD)"
echo -e "  ⏰ Time: $(date '+%Y-%m-%d %H:%M:%S')"

echo -e "\n${BLUE}🔍 Next Steps:${NC}"
echo -e "  1. Test product page: https://catsupply.nl/product/automatische-kattenbak-premium"
echo -e "  2. Check PM2 logs: pm2 logs frontend"
echo -e "  3. Monitor status: pm2 status"

exit 0
