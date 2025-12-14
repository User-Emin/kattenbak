# 🚀 EXPERT TEAM DEPLOYMENT - 185.224.139.74

**Server:** 185.224.139.74  
**Status:** ✅ ONLINE (ping OK, SSH port 22 open)  
**Mission:** Complete secure production deployment catsupply.nl

---

## 👥 EXPERT TEAM SPREAD

### 🔧 **INFRASTRUCTURE EXPERT** (Team Lead)
**Verantwoordelijk voor:** Server setup, OS, system services

```bash
# PHASE 1: SERVER DISCOVERY & BASELINE
ssh root@185.224.139.74

# Check current state
uname -a                    # OS version
df -h                       # Disk space
free -h                     # Memory
ps aux | head -20          # Running processes
systemctl list-units       # Active services
netstat -tlnp              # Open ports
cat /etc/os-release        # Distribution

# Check existing software
command -v node
command -v npm
command -v psql
command -v nginx
command -v pm2
command -v git

# User accounts
cat /etc/passwd | grep -E "deploy|kattenbak|www"
```

---

### 🗄️ **DATABASE EXPERT**
**Verantwoordelijk voor:** PostgreSQL setup, migrations, backup

```bash
# PHASE 2: DATABASE SETUP
ssh root@185.224.139.74

# Install PostgreSQL if needed
if ! command -v psql; then
    dnf install -y postgresql-server postgresql-contrib
    postgresql-setup --initdb
    systemctl enable --now postgresql
fi

# Create production database
sudo -u postgres psql << 'DBSQL'
-- Check existing databases
\l

-- Create if not exists
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD 'lsavaoC57Cs05N8stXAujrGtDGEvZfxC';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
ALTER DATABASE kattenbak_prod OWNER TO kattenbak_user;

-- Verify
\l
\du
DBSQL

# Configure pg_hba.conf for local connections
echo "host kattenbak_prod kattenbak_user 127.0.0.1/32 md5" | sudo tee -a /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql

# Test connection
PGPASSWORD='lsavaoC57Cs05N8stXAujrGtDGEvZfxC' psql -h localhost -U kattenbak_user -d kattenbak_prod -c "SELECT version();"
```

---

### 🌐 **NETWORK & DNS EXPERT**
**Verantwoordelijk voor:** DNS, Nginx, SSL, firewall

```bash
# PHASE 3: NETWORK SETUP
ssh root@185.224.139.74

# Install Nginx
dnf install -y nginx
systemctl enable nginx

# Nginx configuration
cat > /etc/nginx/conf.d/catsupply.conf << 'NGINXCONF'
# Backend API
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

# Frontend
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

# Admin
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

nginx -t
systemctl restart nginx

# Firewall setup
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# DNS Check
dig catsupply.nl A +short
dig api.catsupply.nl A +short
dig admin.catsupply.nl A +short
# All should point to 185.224.139.74

# SSL Setup (after apps running)
dnf install -y certbot python3-certbot-nginx
certbot --nginx \
  -d catsupply.nl \
  -d www.catsupply.nl \
  -d api.catsupply.nl \
  -d admin.catsupply.nl \
  --non-interactive \
  --agree-tos \
  --email your@email.com \
  --redirect
```

---

### 💻 **APPLICATION EXPERT**
**Verantwoordelijk voor:** Node.js, app deployment, PM2

```bash
# PHASE 4: APPLICATION DEPLOYMENT
ssh root@185.224.139.74

# Install Node.js 20
if ! command -v node; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
fi
node --version
npm --version

# Install PM2
npm install -g pm2

# Install Git
dnf install -y git

# Create app directory
mkdir -p /var/www
cd /var/www

# Clone repository
if [ -d "kattenbak" ]; then
    cd kattenbak && git pull origin main
else
    git clone https://github.com/User-Emin/kattenbak.git
    cd kattenbak
fi

# Setup environment
cat > backend/.env << 'ENVFILE'
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
ENVFILE

chmod 600 backend/.env

# Install dependencies & build
cd backend
npm install --production
npx prisma generate
npm run build

cd ../frontend
npm install
NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build

cd ../admin-next
npm install
NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build

# Run migrations
cd ../backend
npx prisma migrate deploy
npx prisma db seed || true

# Setup PM2
cd /var/www/kattenbak
cat > ecosystem.config.js << 'PM2CONF'
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: '/var/www/kattenbak/backend',
      script: 'dist/server.js',
      instances: 1,
      env: { NODE_ENV: 'production', PORT: 3101 },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      autorestart: true,
      max_restarts: 10
    },
    {
      name: 'frontend',
      cwd: '/var/www/kattenbak/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3102',
      instances: 1,
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
      env: { NODE_ENV: 'production', PORT: 3001 },
      error_file: '/var/log/pm2/admin-error.log',
      out_file: '/var/log/pm2/admin-out.log',
      autorestart: true
    }
  ]
};
PM2CONF

mkdir -p /var/log/pm2
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### 🔒 **SECURITY EXPERT**
**Verantwoordelijk voor:** Security hardening, permissions, SSH

```bash
# PHASE 5: SECURITY HARDENING
ssh root@185.224.139.74

# Secure file permissions
chown -R root:root /var/www/kattenbak
chmod -R 755 /var/www/kattenbak
chmod 600 /var/www/kattenbak/backend/.env

# SSH Hardening
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
sed -i 's/^#PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

# Add deploy user
useradd -m -s /bin/bash deploy
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Add your SSH key
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIspvSUPUZfCMBv/vgKn+g1vZNCKf063osxpErBYgSKh deploy@kattenbak" > /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# Give deploy sudo access (no password for pm2/systemctl)
echo "deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/pm2, /usr/bin/nginx" > /etc/sudoers.d/deploy

# Firewall - block direct app ports
firewall-cmd --permanent --remove-port=3001/tcp || true
firewall-cmd --permanent --remove-port=3101/tcp || true
firewall-cmd --permanent --remove-port=3102/tcp || true
firewall-cmd --reload

# Install fail2ban
dnf install -y fail2ban
systemctl enable --now fail2ban

# SELinux (if enabled)
if command -v getenforce; then
    setsebool -P httpd_can_network_connect 1
fi

systemctl restart sshd
```

---

### 📊 **MONITORING EXPERT**
**Verantwoordelijk voor:** Logs, monitoring, alerting

```bash
# PHASE 6: MONITORING SETUP
ssh root@185.224.139.74

# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# System monitoring script
cat > /usr/local/bin/catsupply-health.sh << 'HEALTHSCRIPT'
#!/bin/bash
echo "=== CATSUPPLY HEALTH CHECK ==="
echo "Date: $(date)"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "Nginx Status:"
systemctl status nginx --no-pager | head -5
echo ""
echo "PostgreSQL Status:"
systemctl status postgresql --no-pager | head -5
echo ""
echo "Disk Usage:"
df -h | grep -E "Filesystem|/dev/"
echo ""
echo "Memory:"
free -h
echo ""
echo "Recent Errors (Backend):"
tail -20 /var/log/pm2/backend-error.log
HEALTHSCRIPT

chmod +x /usr/local/bin/catsupply-health.sh

# Cron job for daily health check
echo "0 9 * * * /usr/local/bin/catsupply-health.sh > /var/log/catsupply-health.log 2>&1" | crontab -

# Test endpoints
curl -s http://localhost:3101/health
curl -s http://localhost:3102 | head -10
curl -s http://localhost:3001 | head -10
```

---

## 🎯 COMPLETE DEPLOYMENT SCRIPT

**Run this SINGLE script as root on 185.224.139.74:**

```bash
curl -o deploy.sh https://raw.githubusercontent.com/User-Emin/kattenbak/main/server-direct-setup.sh
chmod +x deploy.sh
./deploy.sh
```

**Or manual complete deployment:**

```bash
ssh root@185.224.139.74 << 'COMPLETE_DEPLOYMENT'
set -e

# 1. System update
dnf update -y

# 2. Install all packages
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs postgresql-server postgresql-contrib nginx certbot python3-certbot-nginx git fail2ban

# 3. Setup PostgreSQL
postgresql-setup --initdb
systemctl enable --now postgresql
sleep 3

sudo -u postgres psql << 'DBSETUP'
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD 'lsavaoC57Cs05N8stXAujrGtDGEvZfxC';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
ALTER DATABASE kattenbak_prod OWNER TO kattenbak_user;
DBSETUP

echo "host kattenbak_prod kattenbak_user 127.0.0.1/32 md5" >> /var/lib/pgsql/data/pg_hba.conf
systemctl restart postgresql

# 4. Clone & setup app
mkdir -p /var/www
cd /var/www
git clone https://github.com/User-Emin/kattenbak.git || (cd kattenbak && git pull)
cd kattenbak

# 5. Environment
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

# 6. Build apps
cd backend && npm install --production && npx prisma generate && npm run build && cd ..
cd frontend && npm install && NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build && cd ..
cd admin-next && npm install && NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build && cd ..

# 7. Migrations
cd backend && npx prisma migrate deploy && npx prisma db seed || true && cd ..

# 8. PM2
npm install -g pm2
mkdir -p /var/log/pm2
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 9. Nginx
cp /path/to/nginx/config /etc/nginx/conf.d/catsupply.conf
nginx -t && systemctl enable --now nginx

# 10. Firewall
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# 11. SSL
certbot --nginx -d catsupply.nl -d www.catsupply.nl -d api.catsupply.nl -d admin.catsupply.nl

echo "✅ DEPLOYMENT COMPLETE!"
pm2 status
COMPLETE_DEPLOYMENT
```

---

## ✅ VERIFICATION CHECKLIST

```bash
# On server (185.224.139.74):
pm2 status                              # All 3 apps running
curl http://localhost:3101/health       # Backend OK
curl http://localhost:3102              # Frontend OK
curl http://localhost:3001              # Admin OK
systemctl status nginx                  # Nginx running
systemctl status postgresql             # Database running

# From external:
curl https://catsupply.nl               # Frontend HTTPS
curl https://api.catsupply.nl/health    # API HTTPS
curl https://admin.catsupply.nl         # Admin HTTPS
```

---

## 🚀 EXPERT COORDINATION

**Team Lead commands:**

1. **Infrastructure:** Setup server baseline
2. **Database:** Create & configure PostgreSQL
3. **Network:** Configure Nginx & DNS
4. **Application:** Deploy apps & PM2
5. **Security:** Harden & secure
6. **Monitoring:** Setup health checks

**All experts work in parallel where possible!**

**ETA:** 20-30 minutes complete deployment! ⚡
