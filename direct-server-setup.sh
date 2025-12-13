#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DIRECT SERVER SETUP - RUN LOKAAL, INSTALLEERT ALLES OP SERVER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SERVER="185.224.139.54"
USER="root"
PASSWORD="Pursangue66@"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 DIRECT SERVER SETUP${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}⚠️  sshpass niet gevonden. Installeren...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            echo -e "${RED}❌ Homebrew niet gevonden!${NC}"
            echo "Installeer Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        brew install hudochenkov/sshpass/sshpass
    else
        # Linux
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

echo -e "${GREEN}1/5 Connecting to server...${NC}"

# Create server setup script
cat > /tmp/server-setup.sh << 'SERVERSCRIPT'
#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 KATTENBAK SERVER SETUP - COMPLETE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. SYSTEM UPDATE
echo -e "${GREEN}[1/12] System update...${NC}"
apt update && apt upgrade -y

# 2. INSTALL ESSENTIALS
echo -e "${GREEN}[2/12] Essential packages...${NC}"
apt install -y curl wget git build-essential software-properties-common

# 3. INSTALL NODE.JS 22
echo -e "${GREEN}[3/12] Node.js 22...${NC}"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 4. INSTALL PM2
echo -e "${GREEN}[4/12] PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u root --hp /root | tail -1 | bash

# 5. INSTALL NGINX
echo -e "${GREEN}[5/12] Nginx...${NC}"
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# 6. INSTALL POSTGRESQL
echo -e "${GREEN}[6/12] PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# 7. INSTALL REDIS
echo -e "${GREEN}[7/12] Redis...${NC}"
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# 8. SETUP FIREWALL
echo -e "${GREEN}[8/12] Firewall (UFW)...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# 9. INSTALL FAIL2BAN
echo -e "${GREEN}[9/12] Fail2ban...${NC}"
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# 10. CREATE PROJECT DIRECTORY
echo -e "${GREEN}[10/12] Project directory...${NC}"
mkdir -p /var/www/kattenbak
cd /var/www/kattenbak

# 11. SETUP DATABASE
echo -e "${GREEN}[11/12] Database setup...${NC}"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
sudo -u postgres psql << EOF
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
EOF

echo "Database password: ${DB_PASSWORD}" > /root/db-credentials.txt
chmod 600 /root/db-credentials.txt

# 12. INSTALL CERTBOT
echo -e "${GREEN}[12/12] Certbot for SSL...${NC}"
apt install -y certbot python3-certbot-nginx

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SERVER SETUP COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 INSTALLED VERSIONS:"
echo "   Node.js: $(node --version)"
echo "   NPM: $(npm --version)"
echo "   PM2: $(pm2 --version)"
echo "   PostgreSQL: $(psql --version | cut -d' ' -f3)"
echo "   Redis: $(redis-server --version | cut -d' ' -f4)"
echo ""
echo "🔐 DATABASE CREDENTIALS:"
echo "   Database: kattenbak_prod"
echo "   User: kattenbak_user"
echo "   Password: saved in /root/db-credentials.txt"
echo ""
echo "🔥 FIREWALL STATUS:"
ufw status
echo ""
echo "✅ Ready for deployment!"
echo ""

SERVERSCRIPT

# 2. COPY SCRIPT TO SERVER
echo -e "${GREEN}2/5 Copying setup script to server...${NC}"
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no /tmp/server-setup.sh ${USER}@${SERVER}:/root/

# 3. MAKE EXECUTABLE
echo -e "${GREEN}3/5 Making script executable...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} "chmod +x /root/server-setup.sh"

# 4. RUN SETUP
echo -e "${GREEN}4/5 Running server setup (dit duurt 5-10 minuten)...${NC}"
echo ""
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} "bash /root/server-setup.sh"

# 5. GET STATUS
echo ""
echo -e "${GREEN}5/5 Getting server status...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << 'STATUSCHECK'
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SERVER STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Node.js: $(node --version)"
echo "✅ PM2: $(pm2 --version)"
echo "✅ Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "✅ PostgreSQL: $(sudo -u postgres psql -c 'SELECT version();' | head -3 | tail -1 | cut -d' ' -f2-3)"
echo "✅ Redis: $(redis-cli ping)"
echo ""
echo "🔥 Firewall:"
sudo ufw status | grep -E "Status:|80|443|22"
echo ""
echo "🗄️  Database credentials:"
cat /root/db-credentials.txt
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SERVER READY! Clone repo and deploy!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
STATUSCHECK

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 COMPLETE! SERVER IS KLAAR!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Next: Clone repo en deploy:${NC}"
echo "  ssh root@${SERVER}"
echo "  cd /var/www/kattenbak"
echo "  git clone https://github.com/User-Emin/kattenbak.git ."
echo ""
