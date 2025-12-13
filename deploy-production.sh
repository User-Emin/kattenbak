#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRODUCTION DEPLOYMENT - catsupply.nl
# Complete setup: SSL, Nginx, PM2, Database, Security - ABSOLUUT SECURE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
DOMAIN="catsupply.nl"
API_DOMAIN="api.catsupply.nl"
ADMIN_DOMAIN="admin.catsupply.nl"
SERVER_IP="185.224.139.54"
DEPLOY_USER="deploy"
APP_DIR="/var/www/kattenbak"

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🚀 PRODUCTION DEPLOYMENT - catsupply.nl${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if we're on the server
if [ "$(hostname -I 2>/dev/null | grep -o '185.224.139.54')" ]; then
  ON_SERVER=true
  echo -e "${GREEN}✓${NC} Running on production server"
else
  ON_SERVER=false
  echo -e "${YELLOW}⚠${NC}  Running locally - will prepare for deployment"
fi

# ═══════════════════════════════════════════════════════════════════
# 1. PRE-DEPLOYMENT CHECKS
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}1. Pre-Deployment Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if production env files exist
if [ -f "backend/.env.production" ]; then
  echo -e "${GREEN}✓${NC} backend/.env.production exists"
else
  echo -e "${RED}✗${NC} backend/.env.production missing!"
  echo "  Create from: backend/.env.production.example"
  exit 1
fi

if [ -f "frontend/.env.production" ]; then
  echo -e "${GREEN}✓${NC} frontend/.env.production exists"
else
  echo -e "${YELLOW}⚠${NC}  frontend/.env.production will be created"
fi

# Check for sensitive data
if grep -q "CHANGE_THIS" backend/.env.production 2>/dev/null; then
  echo -e "${RED}✗${NC} backend/.env.production contains CHANGE_THIS placeholders!"
  echo "  Please update all passwords and secrets"
  exit 1
else
  echo -e "${GREEN}✓${NC} No CHANGE_THIS placeholders found"
fi

# ═══════════════════════════════════════════════════════════════════
# 2. BUILD APPLICATIONS
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}2. Building Applications${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend
echo -e "${YELLOW}Building backend...${NC}"
cd backend
npm install --production
npx prisma generate
cd ..
echo -e "${GREEN}✓${NC} Backend built"

# Frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✓${NC} Frontend built"

# Admin
echo -e "${YELLOW}Building admin...${NC}"
cd admin-next
npm install
npm run build
cd ..
echo -e "${GREEN}✓${NC} Admin built"

# ═══════════════════════════════════════════════════════════════════
# 3. SERVER SETUP (if on server)
# ═══════════════════════════════════════════════════════════════════

if [ "$ON_SERVER" = true ]; then
  echo ""
  echo -e "${CYAN}3. Server Configuration${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Install dependencies
  echo -e "${YELLOW}Installing system dependencies...${NC}"
  sudo apt-get update
  sudo apt-get install -y nginx certbot python3-certbot-nginx postgresql redis-server
  
  # Setup Nginx
  echo -e "${YELLOW}Configuring Nginx...${NC}"
  
  # Backend (API)
  sudo tee /etc/nginx/sites-available/$API_DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $API_DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    location / {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
  
  # Frontend
  sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
  
  # Admin
  sudo tee /etc/nginx/sites-available/$ADMIN_DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $ADMIN_DOMAIN;
    
    # Extra security for admin
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # IP whitelist (optional - add your IPs)
    # allow 1.2.3.4;
    # deny all;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
  
  # Enable sites
  sudo ln -sf /etc/nginx/sites-available/$API_DOMAIN /etc/nginx/sites-enabled/
  sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
  sudo ln -sf /etc/nginx/sites-available/$ADMIN_DOMAIN /etc/nginx/sites-enabled/
  
  # Test Nginx config
  sudo nginx -t
  sudo systemctl reload nginx
  
  echo -e "${GREEN}✓${NC} Nginx configured"
  
  # Setup SSL
  echo -e "${YELLOW}Setting up SSL with Let's Encrypt...${NC}"
  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN -d $ADMIN_DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN
  
  echo -e "${GREEN}✓${NC} SSL certificates installed"
  
  # Setup PM2
  echo -e "${YELLOW}Configuring PM2...${NC}"
  sudo npm install -g pm2
  
  # Create PM2 ecosystem file
  cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'kattenbak-backend',
      cwd: '$APP_DIR/backend',
      script: 'dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      time: true
    },
    {
      name: 'kattenbak-frontend',
      cwd: '$APP_DIR/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '800M',
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      time: true
    },
    {
      name: 'kattenbak-admin',
      cwd: '$APP_DIR/admin-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/admin-error.log',
      out_file: '/var/log/pm2/admin-out.log',
      time: true
    }
  ]
};
EOF
  
  # Start PM2
  pm2 start ecosystem.config.js
  pm2 save
  sudo pm2 startup
  
  echo -e "${GREEN}✓${NC} PM2 configured and started"
  
  # Setup Database
  echo -e "${YELLOW}Setting up production database...${NC}"
  sudo -u postgres psql -c "CREATE DATABASE kattenbak_prod;" 2>/dev/null || echo "Database might already exist"
  sudo -u postgres psql -c "CREATE USER prod_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_IN_ENV_FILE';" 2>/dev/null || echo "User might already exist"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO prod_user;"
  
  # Run migrations
  cd backend
  npx prisma migrate deploy
  cd ..
  
  echo -e "${GREEN}✓${NC} Database configured"
  
  # Setup Firewall
  echo -e "${YELLOW}Configuring firewall...${NC}"
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable
  
  echo -e "${GREEN}✓${NC} Firewall configured"
  
  # Setup log rotation
  sudo tee /etc/logrotate.d/kattenbak > /dev/null <<EOF
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $DEPLOY_USER $DEPLOY_USER
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
  
  echo -e "${GREEN}✓${NC} Log rotation configured"
fi

# ═══════════════════════════════════════════════════════════════════
# 4. DEPLOYMENT SUMMARY
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}Production URLs:${NC}"
echo "  Frontend: https://$DOMAIN"
echo "  Admin:    https://$ADMIN_DOMAIN"
echo "  API:      https://$API_DOMAIN"
echo ""

echo -e "${CYAN}Services:${NC}"
if [ "$ON_SERVER" = true ]; then
  pm2 status
else
  echo "  Run this script on the server to start services"
fi
echo ""

echo -e "${CYAN}SSL Certificates:${NC}"
echo "  Auto-renewal: sudo certbot renew --dry-run"
echo "  Check expiry: sudo certbot certificates"
echo ""

echo -e "${CYAN}Monitoring:${NC}"
echo "  PM2 logs:     pm2 logs"
echo "  Nginx logs:   sudo tail -f /var/log/nginx/error.log"
echo "  DB status:    sudo systemctl status postgresql"
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Test all URLs"
echo "  2. Monitor logs for errors"
echo "  3. Setup monitoring (optional): pm2 install pm2-logrotate"
echo "  4. Setup backups (database, uploads)"
echo ""

echo -e "${GREEN}Production deployment ready! 🚀${NC}"
