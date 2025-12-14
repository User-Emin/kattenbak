#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# KATTENBAK ALMALINUX 10.1 SERVER SETUP - MAXIMAAL SECURE & CLEAN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Server: 185.224.139.54 | AlmaLinux 10.1 (Heliotrope Lion)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 KATTENBAK ALMALINUX 10.1 SECURE SETUP${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. SYSTEM UPDATE & CLEANUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[1/15] System update & cleanup...${NC}"
dnf clean all
dnf update -y
dnf autoremove -y

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. INSTALL EPEL & ESSENTIAL REPOS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[2/15] Installing EPEL & essential repositories...${NC}"
dnf install -y epel-release
dnf config-manager --set-enabled crb

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. ESSENTIAL PACKAGES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[3/15] Installing essential packages...${NC}"
dnf install -y \
  curl wget git vim nano \
  gcc-c++ make \
  policycoreutils-python-utils \
  tar gzip bzip2 unzip

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. INSTALL NODE.JS 22 LTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[4/15] Installing Node.js 22 LTS...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs
npm install -g npm@latest

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. INSTALL PM2
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[5/15] Installing PM2...${NC}"
npm install -g pm2@latest
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. INSTALL NGINX
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[6/15] Installing Nginx...${NC}"
dnf install -y nginx
systemctl enable nginx
systemctl start nginx

# SELinux: Allow Nginx to connect to backend
setsebool -P httpd_can_network_connect 1

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. INSTALL POSTGRESQL 16
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[7/15] Installing PostgreSQL 16...${NC}"
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
dnf -qy module disable postgresql
dnf install -y postgresql16-server postgresql16-contrib
/usr/pgsql-16/bin/postgresql-16-setup initdb
systemctl enable postgresql-16
systemctl start postgresql-16

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8. INSTALL REDIS 7
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[8/15] Installing Redis 7...${NC}"
dnf install -y redis
systemctl enable redis
systemctl start redis

# Redis hardening
sed -i 's/^bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
sed -i 's/^# requirepass foobared/requirepass '$(openssl rand -base64 32)'/' /etc/redis/redis.conf
systemctl restart redis

# Save Redis password
grep "requirepass" /etc/redis/redis.conf | cut -d' ' -f2 > /root/.redis-password
chmod 600 /root/.redis-password

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 9. FIREWALL SETUP (firewalld)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[9/15] Configuring firewall (firewalld)...${NC}"
systemctl enable firewalld
systemctl start firewalld

# Allow only essential services
firewall-cmd --permanent --zone=public --add-service=ssh
firewall-cmd --permanent --zone=public --add-service=http
firewall-cmd --permanent --zone=public --add-service=https
firewall-cmd --reload

echo -e "${BLUE}   ✅ Firewall: SSH, HTTP, HTTPS only${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 10. FAIL2BAN SETUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[10/15] Installing & configuring Fail2ban...${NC}"
dnf install -y fail2ban fail2ban-systemd

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = /var/log/secure
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl start fail2ban

echo -e "${BLUE}   ✅ Fail2ban: SSH + Nginx protection active${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 11. SELINUX CONFIGURATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[11/15] Configuring SELinux...${NC}"
# Keep SELinux enforcing but allow necessary connections
semanage port -a -t http_port_t -p tcp 3100 2>/dev/null || semanage port -m -t http_port_t -p tcp 3100
semanage port -a -t http_port_t -p tcp 3101 2>/dev/null || semanage port -m -t http_port_t -p tcp 3101
semanage port -a -t http_port_t -p tcp 3002 2>/dev/null || semanage port -m -t http_port_t -p tcp 3002

echo -e "${BLUE}   ✅ SELinux: Enforcing with app ports allowed${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 12. CREATE PROJECT STRUCTURE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[12/15] Creating project structure...${NC}"
mkdir -p /var/www/kattenbak
chmod 755 /var/www/kattenbak

# SELinux context for web content
semanage fcontext -a -t httpd_sys_content_t "/var/www/kattenbak(/.*)?"
restorecon -Rv /var/www/kattenbak

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 13. SETUP POSTGRESQL DATABASE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[13/15] Setting up PostgreSQL database...${NC}"

# Generate strong password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Create database and user
sudo -u postgres /usr/pgsql-16/bin/psql << EOF
-- Drop if exists (clean setup)
DROP DATABASE IF EXISTS kattenbak_prod;
DROP USER IF EXISTS kattenbak_user;

-- Create fresh
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;

-- Connect and grant schema permissions
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kattenbak_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO kattenbak_user;
EOF

# Save credentials securely
cat > /root/.db-credentials << EOF
# Kattenbak Production Database Credentials
DATABASE_URL=postgresql://kattenbak_user:${DB_PASSWORD}@localhost:5432/kattenbak_prod

DB_HOST=localhost
DB_PORT=5432
DB_NAME=kattenbak_prod
DB_USER=kattenbak_user
DB_PASSWORD=${DB_PASSWORD}
EOF
chmod 600 /root/.db-credentials

echo -e "${BLUE}   ✅ PostgreSQL: Database & user created${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 14. INSTALL CERTBOT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[14/15] Installing Certbot for SSL...${NC}"
dnf install -y certbot python3-certbot-nginx
echo -e "${BLUE}   ✅ Certbot ready (run after DNS setup)${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 15. SYSTEM HARDENING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}[15/15] System hardening...${NC}"

# Disable unnecessary services
systemctl disable cups 2>/dev/null || true
systemctl stop cups 2>/dev/null || true

# Kernel hardening
cat >> /etc/sysctl.conf << 'EOF'

# Kattenbak Security Hardening
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
kernel.randomize_va_space = 2
EOF
sysctl -p

# Automatic security updates
dnf install -y dnf-automatic
sed -i 's/apply_updates = no/apply_updates = yes/' /etc/dnf/automatic.conf
systemctl enable --now dnf-automatic.timer

echo -e "${BLUE}   ✅ System hardened + auto security updates${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FINAL CLEANUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${GREEN}Cleaning up...${NC}"
dnf clean all
rm -rf /tmp/*

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FINAL STATUS REPORT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ALMALINUX SERVER SETUP COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 INSTALLED VERSIONS:${NC}"
echo "   OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   Node.js: $(node --version)"
echo "   NPM: $(npm --version)"
echo "   PM2: $(pm2 --version)"
echo "   PostgreSQL: $(sudo -u postgres /usr/pgsql-16/bin/psql --version | cut -d' ' -f3)"
echo "   Redis: $(redis-server --version | cut -d' ' -f4)"
echo "   Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
echo -e "${BLUE}🔐 SECURITY STATUS:${NC}"
echo "   ✅ Firewall (firewalld): Active"
firewall-cmd --list-services
echo "   ✅ Fail2ban: Active"
fail2ban-client status | head -2
echo "   ✅ SELinux: $(getenforce)"
echo "   ✅ Auto security updates: Enabled"
echo ""
echo -e "${BLUE}🔑 CREDENTIALS:${NC}"
echo "   Database: /root/.db-credentials"
echo "   Redis: /root/.redis-password"
echo ""
echo -e "${BLUE}📁 PROJECT DIRECTORY:${NC}"
echo "   /var/www/kattenbak (ready for git clone)"
echo ""
echo -e "${BLUE}📝 NEXT STEPS:${NC}"
echo "   1. Clone repo:"
echo "      cd /var/www/kattenbak"
echo "      git clone https://github.com/User-Emin/kattenbak.git ."
echo ""
echo "   2. Setup environment files with credentials"
echo "   3. Build & deploy with PM2"
echo "   4. Configure Nginx reverse proxy"
echo "   5. Setup SSL with certbot"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 SERVER KLAAR! MAXIMAAL SECURE & CLEAN!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""


