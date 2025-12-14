#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ONE-COMMAND DEPLOYMENT - 185.224.139.74
# Complete secure deployment voor catsupply.nl
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cat << 'DEPLOYMENT_SCRIPT' | ssh root@185.224.139.74 'bash -s'
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 DEPLOYING CATSUPPLY.NL...${NC}"

# 1. Update system
echo -e "${CYAN}[1/12] System update...${NC}"
dnf update -y > /dev/null 2>&1

# 2. Install Node.js
echo -e "${CYAN}[2/12] Installing Node.js 20...${NC}"
if ! command -v node > /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    dnf install -y nodejs > /dev/null 2>&1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# 3. Install PostgreSQL
echo -e "${CYAN}[3/12] Installing PostgreSQL...${NC}"
if ! command -v psql > /dev/null; then
    dnf install -y postgresql-server postgresql-contrib > /dev/null 2>&1
    postgresql-setup --initdb > /dev/null 2>&1
    systemctl enable --now postgresql > /dev/null 2>&1
    sleep 3
fi

# 4. Setup database
echo -e "${CYAN}[4/12] Setting up database...${NC}"
sudo -u postgres psql << 'EOF' > /dev/null 2>&1 || true
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD 'lsavaoC57Cs05N8stXAujrGtDGEvZfxC';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
ALTER DATABASE kattenbak_prod OWNER TO kattenbak_user;
EOF
echo "host kattenbak_prod kattenbak_user 127.0.0.1/32 md5" >> /var/lib/pgsql/data/pg_hba.conf
systemctl restart postgresql > /dev/null 2>&1
echo -e "${GREEN}✓ Database created${NC}"

# 5. Install Nginx
echo -e "${CYAN}[5/12] Installing Nginx...${NC}"
dnf install -y nginx > /dev/null 2>&1
systemctl enable nginx > /dev/null 2>&1

# 6. Install PM2
echo -e "${CYAN}[6/12] Installing PM2...${NC}"
npm install -g pm2 > /dev/null 2>&1

# 7. Clone repository
echo -e "${CYAN}[7/12] Cloning repository...${NC}"
mkdir -p /var/www
cd /var/www
if [ -d "kattenbak" ]; then
    cd kattenbak && git pull origin main > /dev/null 2>&1
else
    dnf install -y git > /dev/null 2>&1
    git clone https://github.com/User-Emin/kattenbak.git > /dev/null 2>&1
    cd kattenbak
fi

# 8. Setup environment
echo -e "${CYAN}[8/12] Configuring environment...${NC}"
cat > backend/.env << 'ENV'
DATABASE_URL="postgresql://kattenbak_user:lsavaoC57Cs05N8stXAujrGtDGEvZfxC@localhost:5432/kattenbak_prod"
NODE_ENV="production"
PORT=3101
FRONTEND_URL="https://catsupply.nl"
ADMIN_URL="https://admin.catsupply.nl"
JWT_SECRET="mK8vN2pQ9xR4wT6yU1zA5bC7dE3fG9hJ2kL4mN8pQ0rS5tV7wX1yZ3aB6cD9eF2gH"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="XjMBrpkF3dnP4QsAImFPYvu1iXmJpYJ0"
MOLLIE_API_KEY="test_zvH9gxkV8k8BqEFnhcPcdHjxAaFWnK"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="test@catsupply.nl"
SMTP_PASS="test_password"
EMAIL_FROM="Catsupply <test@catsupply.nl>"
HCAPTCHA_SECRET="0x0000000000000000000000000000000000000000"
MYPARCEL_API_KEY="test_key"
ENV
chmod 600 backend/.env

# 9. Build applications
echo -e "${CYAN}[9/12] Building applications (dit duurt ~5 minuten)...${NC}"
cd backend && npm install --production > /dev/null 2>&1 && npx prisma generate > /dev/null 2>&1 && npm run build > /dev/null 2>&1
cd ../frontend && npm install > /dev/null 2>&1 && NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build > /dev/null 2>&1
cd ../admin-next && npm install > /dev/null 2>&1 && NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build > /dev/null 2>&1
cd /var/www/kattenbak

# 10. Database migrations
echo -e "${CYAN}[10/12] Running migrations...${NC}"
cd backend && npx prisma migrate deploy > /dev/null 2>&1 && npx prisma db seed > /dev/null 2>&1 || true
cd ..

# 11. Configure Nginx
echo -e "${CYAN}[11/12] Configuring Nginx...${NC}"
cat > /etc/nginx/conf.d/catsupply.conf << 'NGINX'
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
    }
}
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
NGINX
nginx -t && systemctl restart nginx

# 12. Start with PM2
echo -e "${CYAN}[12/12] Starting applications...${NC}"
mkdir -p /var/log/pm2
pm2 delete all > /dev/null 2>&1 || true

cd /var/www/kattenbak
pm2 start backend/dist/server.js --name backend --cwd /var/www/kattenbak/backend
pm2 start "npm run start" --name frontend --cwd /var/www/kattenbak/frontend -- --port 3102
pm2 start "npm run start" --name admin --cwd /var/www/kattenbak/admin-next -- --port 3001
pm2 save
pm2 startup

# Firewall
echo -e "${CYAN}Configuring firewall...${NC}"
firewall-cmd --permanent --add-service=http > /dev/null 2>&1 || true
firewall-cmd --permanent --add-service=https > /dev/null 2>&1 || true
firewall-cmd --reload > /dev/null 2>&1 || true

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
pm2 status
echo ""
echo -e "${CYAN}Sites (HTTP for now):${NC}"
echo "  → http://catsupply.nl"
echo "  → http://api.catsupply.nl"
echo "  → http://admin.catsupply.nl"
echo ""
echo -e "${CYAN}Setup SSL:${NC}"
echo "  dnf install -y certbot python3-certbot-nginx"
echo "  certbot --nginx -d catsupply.nl -d www.catsupply.nl -d api.catsupply.nl -d admin.catsupply.nl"
echo ""
echo -e "${CYAN}Admin Login:${NC}"
echo "  Username: admin"
echo "  Password: XjMBrpkF3dnP4QsAImFPYvu1iXmJpYJ0"
echo ""
DEPLOYMENT_SCRIPT
