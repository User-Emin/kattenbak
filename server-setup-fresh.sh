#!/bin/bash

# ════════════════════════════════════════════════════════════════
# 🚀 FRESH SERVER SETUP - COMPLETE E2E (AlmaLinux 10)
# ════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🚀 STARTING FRESH SERVER SETUP"
echo "════════════════════════════════════════════════════════════════"
echo ""

# ────────────────────────────────────────────────────────────────
# 1. SYSTEM UPDATE
# ────────────────────────────────────────────────────────────────
echo "📦 Updating system packages..."
dnf update -y

# ────────────────────────────────────────────────────────────────
# 2. INSTALL NODE.JS 22 (via NodeSource)
# ────────────────────────────────────────────────────────────────
echo "📦 Installing Node.js 22 via NodeSource..."
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs
node -v
npm -v

# ────────────────────────────────────────────────────────────────
# 3. INSTALL PM2
# ────────────────────────────────────────────────────────────────
echo "📦 Installing PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root
pm2 -v

# ────────────────────────────────────────────────────────────────
# 4. INSTALL POSTGRESQL 16
# ────────────────────────────────────────────────────────────────
echo "📦 Installing PostgreSQL 16..."
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
dnf -qy module disable postgresql
dnf install -y postgresql16-server postgresql16
/usr/pgsql-16/bin/postgresql-16-setup initdb
systemctl enable postgresql-16
systemctl start postgresql-16

# Configure PostgreSQL
echo "🔧 Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE kattenbak_prod;"
sudo -u postgres psql -c "CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD 'KattenbakSecure2026!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;"
sudo -u postgres psql -d kattenbak_prod -c "GRANT ALL ON SCHEMA public TO kattenbak_user;"

# Enable MD5 authentication
sed -i 's/ident/md5/g' /var/lib/pgsql/16/data/pg_hba.conf
systemctl restart postgresql-16

echo "✅ PostgreSQL configured"

# ────────────────────────────────────────────────────────────────
# 5. INSTALL REDIS
# ────────────────────────────────────────────────────────────────
echo "📦 Installing Redis..."
dnf install -y redis
systemctl enable redis
systemctl start redis

# ────────────────────────────────────────────────────────────────
# 6. INSTALL NGINX
# ────────────────────────────────────────────────────────────────
echo "📦 Installing Nginx..."
dnf install -y nginx
systemctl enable nginx

# Configure Nginx
echo "🔧 Configuring Nginx..."
cat > /etc/nginx/conf.d/catsupply.conf << 'NGINX_CONF'
# Upstream definitions
upstream backend_api {
    server 127.0.0.1:3100;
    keepalive 32;
}

upstream frontend_app {
    server 127.0.0.1:3102;
    keepalive 32;
}

upstream admin_app {
    server 127.0.0.1:3103;
    keepalive 32;
}

# Main server block (HTTP → HTTPS redirect)
server {
    listen 80;
    listen [::]:80;
    server_name catsupply.nl www.catsupply.nl;
    
    # Allow Certbot for SSL
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect everything else to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name catsupply.nl www.catsupply.nl;
    
    # SSL configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/catsupply.nl/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/catsupply.nl/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # API proxy
    location /api/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Admin panel proxy
    location /admin {
        proxy_pass http://admin_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Frontend proxy (main site)
    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static files
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend_app;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
NGINX_CONF

# Test Nginx config
nginx -t
systemctl start nginx

echo "✅ Nginx configured"

# ────────────────────────────────────────────────────────────────
# 7. INSTALL CERTBOT FOR SSL
# ────────────────────────────────────────────────────────────────
echo "📦 Installing Certbot..."
dnf install -y certbot python3-certbot-nginx
mkdir -p /var/www/certbot

# ────────────────────────────────────────────────────────────────
# 8. SETUP APPLICATION DIRECTORY
# ────────────────────────────────────────────────────────────────
echo "📁 Setting up application directory..."
mkdir -p /var/www/kattenbak
cd /var/www/kattenbak

# Initialize git (for GitHub Actions deployment)
dnf install -y git
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/User-Emin/kattenbak.git || true
fi

# ────────────────────────────────────────────────────────────────
# 9. CREATE .ENV FILES
# ────────────────────────────────────────────────────────────────
echo "🔐 Creating environment files..."

# Backend .env
mkdir -p /var/www/kattenbak/backend
cat > /var/www/kattenbak/backend/.env << 'BACKEND_ENV'
# Database
DATABASE_URL="postgresql://kattenbak_user:KattenbakSecure2026!@localhost:5432/kattenbak_prod"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
NODE_ENV=production
PORT=3100
CORS_ORIGIN=https://catsupply.nl

# JWT
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_MIN_32_CHARS

# Media Encryption
MEDIA_ENCRYPTION_KEY=CHANGE_THIS_TO_32_CHAR_KEY_FOR_ENCRYPTION

# Email (Hostinger)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=noreply@catsupply.nl
EMAIL_PASSWORD=CHANGE_THIS

# Mollie Payment
MOLLIE_API_KEY=CHANGE_THIS

# MyParcel Shipping
MYPARCEL_API_KEY=CHANGE_THIS
BACKEND_ENV

# Frontend .env
mkdir -p /var/www/kattenbak/frontend
cat > /var/www/kattenbak/frontend/.env.production << 'FRONTEND_ENV'
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1
NEXT_PUBLIC_SITE_URL=https://catsupply.nl
FRONTEND_ENV

# Admin .env
mkdir -p /var/www/kattenbak/admin-next
cat > /var/www/kattenbak/admin-next/.env.production << 'ADMIN_ENV'
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1
ADMIN_ENV

echo "✅ Environment files created (REMEMBER TO UPDATE SECRETS!)"

# ────────────────────────────────────────────────────────────────
# 10. FIREWALL CONFIGURATION
# ────────────────────────────────────────────────────────────────
echo "🔥 Configuring firewall..."
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

echo "✅ Firewall configured"

# ────────────────────────────────────────────────────────────────
# SUMMARY
# ────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ FRESH SERVER SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 INSTALLED:"
echo "  ✅ Node.js $(node -v)"
echo "  ✅ PM2 $(pm2 -v)"
echo "  ✅ PostgreSQL 16"
echo "  ✅ Redis"
echo "  ✅ Nginx"
echo "  ✅ Certbot"
echo ""
echo "🗄️  DATABASE:"
echo "  Name: kattenbak_prod"
echo "  User: kattenbak_user"
echo "  Password: KattenbakSecure2026!"
echo ""
echo "⚠️  NEXT STEPS:"
echo "  1. Update secrets in /var/www/kattenbak/backend/.env"
echo "  2. Run: certbot --nginx -d catsupply.nl -d www.catsupply.nl"
echo "  3. Push to GitHub main branch to trigger auto-deployment"
echo ""
echo "🚀 SERVER IP: $(hostname -I | awk '{print $1}')"
echo "════════════════════════════════════════════════════════════════"
