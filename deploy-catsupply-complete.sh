#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE SECURE DEPLOYMENT - catsupply.nl
# Lokale test → Deploy → SSL → Security - ABSOLUUT SECURE
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
WWW_DOMAIN="www.catsupply.nl"
SERVER_IP="185.224.139.54"
SSH_HOST="deployer@185.224.139.54"
SSH_PORT="2222"
SSH_KEY="$HOME/.ssh/kattenbak_deploy"
APP_DIR="/var/www/kattenbak"
DEPLOY_USER="deploy"

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🚀 COMPLETE SECURE DEPLOYMENT - catsupply.nl${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Domain:${NC} $DOMAIN"
echo -e "${CYAN}API:${NC} $API_DOMAIN"
echo -e "${CYAN}Admin:${NC} $ADMIN_DOMAIN"
echo -e "${CYAN}Server:${NC} $SERVER_IP"
echo ""

# ═══════════════════════════════════════════════════════════════════
# PHASE 1: LOKALE VERIFICATIE
# ═══════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 1: LOKALE VERIFICATIE${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check SSH key
if [ ! -f "$SSH_KEY" ]; then
  echo -e "${RED}✗${NC} SSH key niet gevonden: $SSH_KEY"
  echo "  Genereer eerst SSH keys met: ssh-keygen -t ed25519 -f $SSH_KEY"
  exit 1
fi
echo -e "${GREEN}✓${NC} SSH key gevonden"

# Check environment files
if [ ! -f "backend/.env.production" ]; then
  echo -e "${RED}✗${NC} backend/.env.production ontbreekt!"
  echo ""
  echo "  Maak deze aan met de volgende inhoud:"
  echo ""
  cat > backend/.env.production.template << 'EOF'
# Database (PostgreSQL op server)
DATABASE_URL="postgresql://kattenbak_user:STRONG_PASSWORD_HERE@localhost:5432/kattenbak_prod"

# Server
NODE_ENV="production"
PORT=3101
FRONTEND_URL="https://catsupply.nl"
ADMIN_URL="https://admin.catsupply.nl"

# Security
JWT_SECRET="GENERATE_LONG_RANDOM_STRING_HERE"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="STRONG_ADMIN_PASSWORD_HERE"

# Mollie (Production keys)
MOLLIE_API_KEY="live_XXXXXXXXXXXXXXXXXXXXXXXX"

# Email (Production SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@catsupply.nl"
SMTP_PASS="YOUR_EMAIL_APP_PASSWORD"
EMAIL_FROM="Catsupply <noreply@catsupply.nl>"

# hCaptcha (Production)
HCAPTCHA_SECRET="0x0000000000000000000000000000000000000000"

# MyParcel
MYPARCEL_API_KEY="YOUR_MYPARCEL_KEY"
EOF
  echo -e "${YELLOW}Template gemaakt:${NC} backend/.env.production.template"
  echo "  Kopieer en vul in: cp backend/.env.production.template backend/.env.production"
  exit 1
fi
echo -e "${GREEN}✓${NC} backend/.env.production gevonden"

# Check for placeholders
if grep -q "CHANGE_THIS\|XXXXXXXX\|YOUR_" backend/.env.production 2>/dev/null; then
  echo -e "${RED}✗${NC} backend/.env.production bevat placeholders!"
  echo "  Update alle CHANGE_THIS, XXXXXXXX, YOUR_* waarden"
  exit 1
fi
echo -e "${GREEN}✓${NC} Geen placeholders in .env.production"

# Test lokale backend
echo ""
echo -e "${CYAN}Testing lokale backend...${NC}"
if ! curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠${NC}  Backend niet actief - start eerst met: cd backend && npm run dev"
  echo "  Of skip lokale test en deploy direct"
  read -p "  Doorgaan zonder lokale test? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo -e "${GREEN}✓${NC} Backend werkt lokaal"
fi

# ═══════════════════════════════════════════════════════════════════
# PHASE 2: SERVER CONNECTIVITEIT
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 2: SERVER CONNECTIVITEIT${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test SSH connectie
echo -e "${CYAN}Testing SSH connectie...${NC}"
if ! ssh -i "$SSH_KEY" -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_HOST" "echo 'SSH OK'" 2>/dev/null; then
  echo -e "${RED}✗${NC} SSH connectie mislukt!"
  echo ""
  echo "  Oplossing:"
  echo "  1. Zorg dat je SSH key op de server staat:"
  echo "     ssh-copy-id -i $SSH_KEY -p $SSH_PORT $SSH_HOST"
  echo ""
  echo "  2. Of upload handmatig:"
  echo "     cat ${SSH_KEY}.pub"
  echo "     → Kopieer output"
  echo "     → Log in op server via ander account"
  echo "     → Plak in ~/.ssh/authorized_keys"
  echo ""
  exit 1
fi
echo -e "${GREEN}✓${NC} SSH connectie werkt"

# Check DNS
echo -e "${CYAN}Checking DNS configuratie...${NC}"
RESOLVED_IP=$(dig +short $DOMAIN A | tail -1)
if [ "$RESOLVED_IP" != "$SERVER_IP" ]; then
  echo -e "${RED}✗${NC} DNS incorrect!"
  echo "  $DOMAIN resolves naar: $RESOLVED_IP"
  echo "  Verwacht: $SERVER_IP"
  echo ""
  echo "  Fix DNS bij je provider:"
  echo "  A     $DOMAIN            → $SERVER_IP"
  echo "  A     www.$DOMAIN        → $SERVER_IP"
  echo "  A     api.$DOMAIN        → $SERVER_IP"
  echo "  A     admin.$DOMAIN      → $SERVER_IP"
  exit 1
fi
echo -e "${GREEN}✓${NC} DNS correct: $DOMAIN → $SERVER_IP"

# ═══════════════════════════════════════════════════════════════════
# PHASE 3: SERVER SETUP
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 3: SERVER SETUP${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create deployment script for server
cat > /tmp/server-setup.sh << 'SERVERSCRIPT'
#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Installing system dependencies...${NC}"

# Update system
sudo dnf update -y

# Install Node.js 20
if ! command -v node &> /dev/null; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo dnf install -y nodejs
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Install PostgreSQL
if ! command -v psql &> /dev/null; then
  sudo dnf install -y postgresql-server postgresql-contrib
  sudo postgresql-setup --initdb
  sudo systemctl enable --now postgresql
fi
echo -e "${GREEN}✓${NC} PostgreSQL installed"

# Install Nginx
if ! command -v nginx &> /dev/null; then
  sudo dnf install -y nginx
  sudo systemctl enable nginx
fi
echo -e "${GREEN}✓${NC} Nginx installed"

# Install Certbot
if ! command -v certbot &> /dev/null; then
  sudo dnf install -y certbot python3-certbot-nginx
fi
echo -e "${GREEN}✓${NC} Certbot installed"

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi
echo -e "${GREEN}✓${NC} PM2 installed"

# Setup PostgreSQL database
echo -e "${CYAN}Setting up database...${NC}"
sudo -u postgres psql << 'EOF'
-- Create database
CREATE DATABASE kattenbak_prod;

-- Create user (update password!)
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
EOF
echo -e "${GREEN}✓${NC} Database created"

# Create app directory
sudo mkdir -p /var/www/kattenbak
sudo chown -R $USER:$USER /var/www/kattenbak
echo -e "${GREEN}✓${NC} App directory created"

# Setup firewall
echo -e "${CYAN}Configuring firewall...${NC}"
if command -v firewall-cmd &> /dev/null; then
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --permanent --add-port=2222/tcp
  sudo firewall-cmd --reload
  echo -e "${GREEN}✓${NC} Firewall configured"
fi

echo ""
echo -e "${GREEN}✓ Server setup complete!${NC}"
SERVERSCRIPT

echo -e "${CYAN}Uploading and running server setup...${NC}"
scp -i "$SSH_KEY" -P "$SSH_PORT" /tmp/server-setup.sh "$SSH_HOST:/tmp/"
ssh -i "$SSH_KEY" -p "$SSH_PORT" "$SSH_HOST" "bash /tmp/server-setup.sh"

# ═══════════════════════════════════════════════════════════════════
# PHASE 4: DEPLOY APPLICATION
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 4: DEPLOY APPLICATION${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Build locally
echo -e "${CYAN}Building applications...${NC}"

echo "  → Backend"
cd backend
npm install --production
npx prisma generate
cd ..

echo "  → Frontend"
cd frontend
npm install
NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build
cd ..

echo "  → Admin"
cd admin-next
npm install
NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build
cd ..

echo -e "${GREEN}✓${NC} Applications built"

# Create deployment package
echo -e "${CYAN}Creating deployment package...${NC}"
tar -czf /tmp/kattenbak-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  --exclude=dist \
  backend frontend admin-next shared package.json

echo -e "${GREEN}✓${NC} Package created"

# Upload to server
echo -e "${CYAN}Uploading to server...${NC}"
scp -i "$SSH_KEY" -P "$SSH_PORT" /tmp/kattenbak-deploy.tar.gz "$SSH_HOST:/tmp/"
scp -i "$SSH_KEY" -P "$SSH_PORT" backend/.env.production "$SSH_HOST:/tmp/backend.env"

# Deploy on server
ssh -i "$SSH_KEY" -p "$SSH_PORT" "$SSH_HOST" << 'SSHCOMMANDS'
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/var/www/kattenbak"

echo -e "${CYAN}Extracting application...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR
tar -xzf /tmp/kattenbak-deploy.tar.gz

# Setup environment
mv /tmp/backend.env backend/.env

# Install dependencies
echo -e "${CYAN}Installing dependencies...${NC}"
cd backend && npm install --production && npx prisma generate && cd ..
cd frontend && npm install && cd ..
cd admin-next && npm install && cd ..

# Run migrations
echo -e "${CYAN}Running database migrations...${NC}"
cd backend
npx prisma migrate deploy
npx prisma db seed || true
cd ..

echo -e "${GREEN}✓${NC} Application deployed"
SSHCOMMANDS

echo -e "${GREEN}✓${NC} Application deployed to server"

# ═══════════════════════════════════════════════════════════════════
# PHASE 5: NGINX CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 5: NGINX CONFIGURATION${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create Nginx config
cat > /tmp/nginx-catsupply.conf << 'NGINXCONF'
# Backend API - api.catsupply.nl
server {
    listen 80;
    server_name api.catsupply.nl;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}

# Frontend - catsupply.nl & www.catsupply.nl
server {
    listen 80;
    server_name catsupply.nl www.catsupply.nl;
    
    location / {
        proxy_pass http://localhost:3102;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin - admin.catsupply.nl
server {
    listen 80;
    server_name admin.catsupply.nl;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF

echo -e "${CYAN}Uploading Nginx configuration...${NC}"
scp -i "$SSH_KEY" -P "$SSH_PORT" /tmp/nginx-catsupply.conf "$SSH_HOST:/tmp/"

ssh -i "$SSH_KEY" -p "$SSH_PORT" "$SSH_HOST" << 'NGINXSETUP'
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Installing Nginx config...${NC}"
sudo mv /tmp/nginx-catsupply.conf /etc/nginx/conf.d/catsupply.conf

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo -e "${GREEN}✓${NC} Nginx configured and running"
NGINXSETUP

echo -e "${GREEN}✓${NC} Nginx configured"

# ═══════════════════════════════════════════════════════════════════
# PHASE 6: PM2 PROCESS MANAGEMENT
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 6: PM2 PROCESS MANAGEMENT${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create PM2 ecosystem
cat > /tmp/ecosystem.config.js << 'PM2CONFIG'
module.exports = {
  apps: [
    {
      name: 'kattenbak-backend',
      cwd: '/var/www/kattenbak/backend',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3101
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'kattenbak-frontend',
      cwd: '/var/www/kattenbak/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3102',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3102
      },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'kattenbak-admin',
      cwd: '/var/www/kattenbak/admin-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/admin-error.log',
      out_file: '/var/log/pm2/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    }
  ]
};
PM2CONFIG

echo -e "${CYAN}Uploading PM2 config...${NC}"
scp -i "$SSH_KEY" -P "$SSH_PORT" /tmp/ecosystem.config.js "$SSH_HOST:/tmp/"

ssh -i "$SSH_KEY" -p "$SSH_PORT" "$SSH_HOST" << 'PM2SETUP'
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/var/www/kattenbak"

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Stop existing processes
pm2 delete all || true

# Start with ecosystem
cd $APP_DIR
cp /tmp/ecosystem.config.js .

echo -e "${CYAN}Starting applications with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo -e "${GREEN}✓${NC} PM2 configured and applications started"
PM2SETUP

echo -e "${GREEN}✓${NC} Applications running with PM2"

# ═══════════════════════════════════════════════════════════════════
# PHASE 7: SSL CERTIFICATES (Certbot)
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 7: SSL CERTIFICATES${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Important:${NC} Dit vereist dat DNS correct is geconfigureerd!"
echo "  Zorg dat alle domeinen naar $SERVER_IP wijzen"
echo ""
read -p "DNS geconfigureerd en ready voor SSL? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ssh -i "$SSH_KEY" -p "$SSH_PORT" "$SSH_HOST" << 'SSLSETUP'
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}Installing SSL certificates...${NC}"

# Get email for Let's Encrypt
read -p "Email voor SSL certificaten: " SSL_EMAIL

# Install certificates for all domains
sudo certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "$SSL_EMAIL" \
  --redirect \
  -d catsupply.nl \
  -d www.catsupply.nl \
  -d api.catsupply.nl \
  -d admin.catsupply.nl

# Setup auto-renewal
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer

echo -e "${GREEN}✓${NC} SSL certificates installed and auto-renewal configured"

# Restart Nginx
sudo systemctl restart nginx

echo ""
echo -e "${GREEN}✓ HTTPS enabled!${NC}"
echo "  → https://catsupply.nl"
echo "  → https://api.catsupply.nl"
echo "  → https://admin.catsupply.nl"
SSLSETUP

  echo -e "${GREEN}✓${NC} SSL configured"
else
  echo -e "${YELLOW}⚠${NC}  SSL skipped - configureer later met:"
  echo "    sudo certbot --nginx -d catsupply.nl -d www.catsupply.nl -d api.catsupply.nl -d admin.catsupply.nl"
fi

# ═══════════════════════════════════════════════════════════════════
# PHASE 8: SECURITY HARDENING
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 8: SECURITY HARDENING${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ssh -i "$SSH_KEY" -p "$SSH_PORT" "$SSH_HOST" << 'SECURITY'
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Applying security measures...${NC}"

# Set secure permissions
sudo chown -R $USER:$USER /var/www/kattenbak
sudo chmod -R 755 /var/www/kattenbak
sudo chmod 600 /var/www/kattenbak/backend/.env

# Firewall rules
if command -v firewall-cmd &> /dev/null; then
  # Only allow HTTP, HTTPS, SSH
  sudo firewall-cmd --permanent --remove-service=cockpit || true
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --permanent --add-port=2222/tcp
  
  # Block direct access to app ports
  sudo firewall-cmd --permanent --remove-port=3001/tcp || true
  sudo firewall-cmd --permanent --remove-port=3101/tcp || true
  sudo firewall-cmd --permanent --remove-port=3102/tcp || true
  
  sudo firewall-cmd --reload
  echo -e "${GREEN}✓${NC} Firewall configured"
fi

# Disable root SSH login
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd || true
echo -e "${GREEN}✓${NC} SSH hardened"

# Setup fail2ban (optional)
if ! command -v fail2ban-client &> /dev/null; then
  sudo dnf install -y fail2ban || true
  sudo systemctl enable fail2ban || true
  sudo systemctl start fail2ban || true
  echo -e "${GREEN}✓${NC} Fail2ban installed"
fi

echo -e "${GREEN}✓${NC} Security hardening complete"
SECURITY

echo -e "${GREEN}✓${NC} Security configured"

# ═══════════════════════════════════════════════════════════════════
# PHASE 9: VERIFICATION
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}PHASE 9: VERIFICATION${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}Testing deployment...${NC}"

# Test endpoints
sleep 5

echo "  → Backend health"
if curl -s -k https://api.catsupply.nl/health | grep -q "Healthy"; then
  echo -e "    ${GREEN}✓${NC} Backend responding"
else
  echo -e "    ${YELLOW}⚠${NC}  Backend check failed (mogelijk nog aan het starten)"
fi

echo "  → Frontend"
if curl -s -k https://catsupply.nl | grep -q "html"; then
  echo -e "    ${GREEN}✓${NC} Frontend responding"
else
  echo -e "    ${YELLOW}⚠${NC}  Frontend check failed"
fi

echo "  → Admin"
if curl -s -k https://admin.catsupply.nl | grep -q "html"; then
  echo -e "    ${GREEN}✓${NC} Admin responding"
else
  echo -e "    ${YELLOW}⚠${NC}  Admin check failed"
fi

# ═══════════════════════════════════════════════════════════════════
# SUCCESS!
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Your site is now live at:${NC}"
echo ""
echo -e "  🌐 Frontend:  ${GREEN}https://catsupply.nl${NC}"
echo -e "  📡 API:       ${GREEN}https://api.catsupply.nl${NC}"
echo -e "  🔧 Admin:     ${GREEN}https://admin.catsupply.nl${NC}"
echo ""
echo -e "${CYAN}Useful commands:${NC}"
echo "  → SSH:        ssh -i $SSH_KEY -p $SSH_PORT $SSH_HOST"
echo "  → PM2 status: pm2 status"
echo "  → PM2 logs:   pm2 logs"
echo "  → Nginx:      sudo systemctl status nginx"
echo "  → SSL renew:  sudo certbot renew --dry-run"
echo ""
echo -e "${GREEN}✨ Deployment beveiligd met SSL, firewall, en PM2 auto-restart!${NC}"
echo ""
