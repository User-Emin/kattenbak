#!/bin/bash

##############################################################################
# FIX ADMIN DEPLOYMENT - Safe Admin-Next Deployment
# - Removes old admin from frontend
# - Deploys admin-next to /admin
# - Health checks to prevent 502 errors
# - Error handling and rollback
##############################################################################

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="root"
SERVER_HOST="185.224.139.74"
ADMIN_PATH="/var/www/kattenbak/admin-next"
BACKUP_PATH="/var/www/kattenbak/admin-next-backup"
MAX_RETRIES=5
HEALTH_CHECK_TIMEOUT=30

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔧 FIX ADMIN DEPLOYMENT                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

##############################################################################
# STEP 1: Pre-deployment Checks
##############################################################################
echo -e "\n${YELLOW}[1/8] Pre-deployment checks...${NC}"

if ! ping -c 1 "$SERVER_HOST" &> /dev/null; then
    echo -e "${RED}❌ Server unreachable!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server reachable${NC}"

if [ ! -d "admin-next" ]; then
    echo -e "${RED}❌ admin-next directory not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ admin-next directory found${NC}"

##############################################################################
# STEP 2: Remove Old Admin from Frontend
##############################################################################
echo -e "\n${YELLOW}[2/8] Removing old admin from frontend...${NC}"

if [ -d "frontend/app/admin" ]; then
    rm -rf frontend/app/admin
    echo -e "${GREEN}✓ Old admin removed${NC}"
else
    echo -e "${YELLOW}⚠ Old admin directory not found (already removed?)${NC}"
fi

##############################################################################
# STEP 3: Git Commit Changes
##############################################################################
echo -e "\n${YELLOW}[3/8] Committing changes to git...${NC}"

git add -A || true
git commit -m "Fix: Remove old admin, configure admin-next for /admin route" || echo -e "${YELLOW}⚠ No changes to commit${NC}"
git push origin main || echo -e "${YELLOW}⚠ Git push failed (continuing anyway)${NC}"

echo -e "${GREEN}✓ Git operations complete${NC}"

##############################################################################
# STEP 4: SSH to Server - Backup Current Admin
##############################################################################
echo -e "\n${YELLOW}[4/8] Creating backup on server...${NC}"

ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    
    # Create backup directory
    mkdir -p /var/www/kattenbak/admin-next-backup
    
    # Backup current admin if it exists
    if [ -d /var/www/kattenbak/admin-next/.next ]; then
        cp -r /var/www/kattenbak/admin-next/.next /var/www/kattenbak/admin-next-backup/ || true
        echo "✓ Backup created"
    else
        echo "⚠ No existing .next to backup"
    fi
ENDSSH

echo -e "${GREEN}✓ Backup complete${NC}"

##############################################################################
# STEP 5: Pull Latest Code on Server
##############################################################################
echo -e "\n${YELLOW}[5/8] Pulling latest code on server...${NC}"

ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    cd /var/www/kattenbak
    
    # Stash any local changes
    git stash || true
    
    # Pull latest
    git fetch origin
    git reset --hard origin/main
    
    echo "✓ Code updated"
ENDSSH

echo -e "${GREEN}✓ Code updated${NC}"

##############################################################################
# STEP 6: Install Dependencies & Build Admin
##############################################################################
echo -e "\n${YELLOW}[6/8] Installing dependencies and building admin...${NC}"

ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    cd /var/www/kattenbak/admin-next
    
    # Clean install
    rm -rf node_modules .next
    
    # Install dependencies
    npm install --legacy-peer-deps --production=false
    
    # Set environment variables
    export NODE_ENV=production
    export NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1
    
    # Build
    npm run build
    
    echo "✓ Build complete"
ENDSSH

echo -e "${GREEN}✓ Build complete${NC}"

##############################################################################
# STEP 7: Deploy with PM2 (with health checks)
##############################################################################
echo -e "\n${YELLOW}[7/8] Deploying admin with PM2...${NC}"

ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    cd /var/www/kattenbak/admin-next
    
    # Stop old admin process
    pm2 stop admin || pm2 delete admin || true
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'admin',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/kattenbak/admin-next',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://catsupply.nl/api/v1',
      PORT: 3103,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/root/.pm2/logs/admin-error.log',
    out_file: '/root/.pm2/logs/admin-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
EOF
    
    # Start with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    echo "✓ PM2 deployment complete"
ENDSSH

echo -e "${GREEN}✓ PM2 deployment complete${NC}"

##############################################################################
# STEP 8: Health Checks & Update Nginx
##############################################################################
echo -e "\n${YELLOW}[8/8] Running health checks and updating Nginx...${NC}"

# Wait for admin to start
echo -n "Waiting for admin to start..."
sleep 10
echo " ✓"

# Health check
RETRY_COUNT=0
ADMIN_HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HTTP_CODE=$(ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3103/admin/login || echo '000'")
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "302" ]; then
        ADMIN_HEALTHY=true
        echo -e "${GREEN}✓ Admin health check passed (HTTP $HTTP_CODE)${NC}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -n "."
        sleep 3
    fi
done

if [ "$ADMIN_HEALTHY" = false ]; then
    echo -e "\n${RED}❌ Admin health check failed after $MAX_RETRIES retries${NC}"
    echo -e "${YELLOW}⚠ Attempting rollback...${NC}"
    
    # Rollback
    ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
        if [ -d /var/www/kattenbak/admin-next-backup/.next ]; then
            pm2 stop admin || true
            rm -rf /var/www/kattenbak/admin-next/.next
            cp -r /var/www/kattenbak/admin-next-backup/.next /var/www/kattenbak/admin-next/
            pm2 restart admin
            echo "✓ Rollback complete"
        fi
ENDSSH
    
    exit 1
fi

# Update Nginx config
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    
    # Update Nginx upstream to point to port 3103
    sed -i 's|server 127.0.0.1:3102|server 127.0.0.1:3103|g' /etc/nginx/sites-available/catsupply || true
    
    # Test Nginx config
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx || service nginx reload
    
    echo "✓ Nginx updated and reloaded"
ENDSSH

echo -e "${GREEN}✓ Nginx updated${NC}"

##############################################################################
# SUCCESS
##############################################################################
echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ ADMIN DEPLOYMENT SUCCESSFUL                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo -e "\n${BLUE}Admin is now available at: https://catsupply.nl/admin${NC}"
echo -e "${BLUE}Login page: https://catsupply.nl/admin/login${NC}"
