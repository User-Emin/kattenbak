#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DIRECT SERVER SETUP - CATSUPPLY.NL
# Run dit script DIRECT op de server (185.224.139.54)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 DIRECT SERVER SETUP - catsupply.nl${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Database password die we lokaal gegenereerd hebben
DB_PASSWORD="lsavaoC57Cs05N8stXAujrGtDGEvZfxC"

# ═══════════════════════════════════════════════════════════════════
# 1. SYSTEM UPDATE
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/10] System update...${NC}"
sudo dnf update -y

# ═══════════════════════════════════════════════════════════════════
# 2. INSTALL NODE.JS 20
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[2/10] Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# ═══════════════════════════════════════════════════════════════════
# 3. INSTALL POSTGRESQL
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[3/10] Installing PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    sudo dnf install -y postgresql-server postgresql-contrib
    sudo postgresql-setup --initdb
    
    # Configure PostgreSQL
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/g" /var/lib/pgsql/data/postgresql.conf
    
    # Allow local connections
    sudo bash -c 'cat >> /var/lib/pgsql/data/pg_hba.conf << EOF
# Kattenbak app
host    kattenbak_prod    kattenbak_user    127.0.0.1/32    md5
EOF'
    
    sudo systemctl enable --now postgresql
    sleep 3
fi
echo -e "${GREEN}✓${NC} PostgreSQL installed"

# Create database and user
echo -e "${CYAN}[3.1/10] Setting up database...${NC}"
sudo -u postgres psql << EOF || true
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
ALTER DATABASE kattenbak_prod OWNER TO kattenbak_user;
EOF
echo -e "${GREEN}✓${NC} Database created"

# ═══════════════════════════════════════════════════════════════════
# 4. INSTALL NGINX
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[4/10] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo dnf install -y nginx
fi
sudo systemctl enable nginx
echo -e "${GREEN}✓${NC} Nginx installed"

# ═══════════════════════════════════════════════════════════════════
# 5. INSTALL CERTBOT
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[5/10] Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo dnf install -y certbot python3-certbot-nginx
fi
echo -e "${GREEN}✓${NC} Certbot installed"

# ═══════════════════════════════════════════════════════════════════
# 6. INSTALL PM2
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[6/10] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo -e "${GREEN}✓${NC} PM2 installed"

# ═══════════════════════════════════════════════════════════════════
# 7. CLONE REPOSITORY
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[7/10] Cloning repository...${NC}"
sudo mkdir -p /var/www
cd /var/www

if [ -d "kattenbak" ]; then
    echo "Repository exists, pulling latest..."
    cd kattenbak
    git pull origin main || true
else
    sudo git clone https://github.com/User-Emin/kattenbak.git
    sudo chown -R $USER:$USER /var/www/kattenbak
    cd kattenbak
fi
echo -e "${GREEN}✓${NC} Repository ready"

# ═══════════════════════════════════════════════════════════════════
# 8. SETUP ENVIRONMENT FILE
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[8/10] Creating environment file...${NC}"
cat > backend/.env << 'ENVEOF'
# Database
DATABASE_URL="postgresql://kattenbak_user:lsavaoC57Cs05N8stXAujrGtDGEvZfxC@localhost:5432/kattenbak_prod"

# Server
NODE_ENV="production"
PORT=3101
FRONTEND_URL="https://catsupply.nl"
ADMIN_URL="https://admin.catsupply.nl"

# Security
JWT_SECRET="mK8vN2pQ9xR4wT6yU1zA5bC7dE3fG9hJ2kL4mN8pQ0rS5tV7wX1yZ3aB6cD9eF2gH"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="XjMBrpkF3dnP4QsAImFPYvu1iXmJpYJ0"

# Mollie (Test voor nu - update later!)
MOLLIE_API_KEY="test_zvH9gxkV8k8BqEFnhcPcdHjxAaFWnK"

# Email (Test - update later!)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="test@catsupply.nl"
SMTP_PASS="test_password"
EMAIL_FROM="Catsupply <test@catsupply.nl>"

# hCaptcha (Test key - update later!)
HCAPTCHA_SECRET="0x0000000000000000000000000000000000000000"

# MyParcel (Update later!)
MYPARCEL_API_KEY="test_key"
ENVEOF

chmod 600 backend/.env
echo -e "${GREEN}✓${NC} Environment configured"

# ═══════════════════════════════════════════════════════════════════
# 9. INSTALL DEPENDENCIES & BUILD
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[9/10] Installing dependencies and building...${NC}"

# Backend
echo "  → Backend..."
cd /var/www/kattenbak/backend
npm install --production
npx prisma generate
npm run build || true

# Frontend
echo "  → Frontend..."
cd /var/www/kattenbak/frontend
npm install
NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build

# Admin
echo "  → Admin..."
cd /var/www/kattenbak/admin-next
npm install
NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build

cd /var/www/kattenbak
echo -e "${GREEN}✓${NC} Applications built"

# Run migrations
echo -e "${CYAN}[9.1/10] Running database migrations...${NC}"
cd backend
npx prisma migrate deploy
npx prisma db seed || true
cd ..
echo -e "${GREEN}✓${NC} Database migrated"

# ═══════════════════════════════════════════════════════════════════
# 10. CONFIGURE NGINX
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[10/10] Configuring Nginx...${NC}"

sudo tee /etc/nginx/conf.d/catsupply.conf > /dev/null << 'NGINXEOF'
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
NGINXEOF

sudo nginx -t
sudo systemctl restart nginx
echo -e "${GREEN}✓${NC} Nginx configured"

# ═══════════════════════════════════════════════════════════════════
# 11. START APPLICATIONS WITH PM2
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[11/10] Starting applications...${NC}"

# Create PM2 ecosystem
cat > /var/www/kattenbak/ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: '/var/www/kattenbak/backend',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3101 },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'frontend',
      cwd: '/var/www/kattenbak/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3102',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3102 },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      autorestart: true
    },
    {
      name: 'admin',
      cwd: '/var/www/kattenbak/admin-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3001 },
      error_file: '/var/log/pm2/admin-error.log',
      out_file: '/var/log/pm2/admin-out.log',
      autorestart: true
    }
  ]
};
PM2EOF

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Stop existing
pm2 delete all || true

# Start apps
cd /var/www/kattenbak
pm2 start ecosystem.config.js

# Save and setup startup
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo -e "${GREEN}✓${NC} Applications started"

# ═══════════════════════════════════════════════════════════════════
# 12. CONFIGURE FIREWALL
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[12/10] Configuring firewall...${NC}"
if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --permanent --add-service=ssh
    sudo firewall-cmd --reload
    echo -e "${GREEN}✓${NC} Firewall configured"
fi

# ═══════════════════════════════════════════════════════════════════
# 13. SETUP SSL (OPTIONAL - RUN MANUALLY)
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Applications running:${NC}"
pm2 status
echo ""
echo -e "${YELLOW}⚠️  NEXT STEPS:${NC}"
echo ""
echo "1. Setup SSL certificates:"
echo "   sudo certbot --nginx -d catsupply.nl -d www.catsupply.nl -d api.catsupply.nl -d admin.catsupply.nl"
echo ""
echo "2. Update production credentials in /var/www/kattenbak/backend/.env:"
echo "   - MOLLIE_API_KEY (get LIVE key from Mollie)"
echo "   - SMTP credentials (real email service)"
echo "   - HCAPTCHA_SECRET (production key)"
echo ""
echo "3. Restart services:"
echo "   pm2 restart all"
echo ""
echo -e "${GREEN}Your sites:${NC}"
echo "  → http://catsupply.nl (will be HTTPS after SSL)"
echo "  → http://api.catsupply.nl"
echo "  → http://admin.catsupply.nl"
echo ""
echo -e "${GREEN}Admin login:${NC}"
echo "  Username: admin"
echo "  Password: XjMBrpkF3dnP4QsAImFPYvu1iXmJpYJ0"
echo ""
echo -e "${CYAN}Monitor logs:${NC}"
echo "  pm2 logs"
echo "  pm2 monit"
echo ""
