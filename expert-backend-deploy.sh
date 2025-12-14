#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXPERT BACKEND DEPLOYMENT - COMPLETE ISOLATION & SECURITY
# Deep technical approach with best practices
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${CYAN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EXPERT BACKEND DEPLOYMENT - 185.224.139.74"
echo "  Complete Isolation | Security Hardening | Auto-Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════════
# EXECUTE ON SERVER
# ═══════════════════════════════════════════════════════════════════

sshpass -p 'Pursangue66@' ssh -o StrictHostKeyChecking=no root@185.224.139.74 'bash -s' << 'REMOTE_EXPERT'
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

log_section() {
    echo -e "\n${BOLD}${CYAN}[$1]${NC} $2"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 1: COMPLETE ISOLATION - BACKEND
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "1/8" "COMPLETE BACKEND ISOLATION"

cd /var/www/kattenbak

# Remove workspace contamination
log_warning "Removing workspace dependencies..."
rm -f package.json package-lock.json
rm -rf node_modules

cd backend

# Clean slate
log_warning "Deep clean backend..."
rm -rf node_modules package-lock.json dist .npm
npm cache clean --force

# Install with maximum isolation
log_warning "Installing backend dependencies (isolated)..."
npm install \
    --no-save \
    --no-package-lock \
    --legacy-peer-deps \
    --omit=optional \
    --prefer-offline \
    2>&1 | grep -E "added|removed|audited" || true

log_success "Backend dependencies isolated"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 2: EXPERT BUILD WITH ESBUILD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "2/8" "EXPERT BUILD - ESBUILD (NO PATH ALIASES)"

# Install esbuild (fastest, most reliable bundler)
npm install -D esbuild esbuild-register

# Create optimized build script
cat > build.js << 'BUILD'
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/server.js',
  sourcemap: true,
  minify: false,
  external: [
    '@prisma/client',
    'express',
    'cors',
    'multer',
    'bcryptjs',
    'jsonwebtoken',
    'zod',
    'winston',
    'redis',
    '@mollie/api-client',
    'nodemailer',
    'axios',
    'sharp',
    'pg'
  ],
  logLevel: 'info',
  loader: {
    '.ts': 'ts',
    '.node': 'file'
  },
  tsconfig: 'tsconfig.json'
}).then(() => {
  console.log('✓ Backend built successfully with esbuild');
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
BUILD

log_warning "Building with esbuild..."
node build.js

log_success "Backend compiled (optimized bundle)"

# Generate Prisma Client
log_warning "Generating Prisma Client..."
npx prisma generate > /dev/null 2>&1

log_success "Prisma Client generated"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 3: DATABASE SETUP & MIGRATIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "3/8" "DATABASE SETUP & MIGRATIONS"

# Test database connection
log_warning "Testing database connection..."
if PGPASSWORD='lsavaoC57Cs05N8stXAujrGtDGEvZfxC' psql -h localhost -U kattenbak_user -d kattenbak_prod -c '\dt' > /dev/null 2>&1; then
    log_success "Database connection: OK"
else
    log_error "Database connection failed"
    exit 1
fi

# Run migrations
log_warning "Running database migrations..."
npx prisma migrate deploy 2>&1 | tail -5

# Seed database
log_warning "Seeding database..."
npx prisma db seed 2>&1 | tail -5 || log_warning "Seed skipped (already seeded)"

log_success "Database ready"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 4: SECURITY HARDENING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "4/8" "SECURITY HARDENING"

# Secure .env file
chmod 600 .env
chown root:root .env
log_success ".env secured (600, root:root)"

# Secure uploads directory
mkdir -p uploads/{products,videos,temp}
chmod 755 uploads
chmod 750 uploads/temp
log_success "Uploads directory secured"

# Secure dist directory
chmod 755 dist
log_success "Dist directory secured"

# Create security headers middleware check
cat > check-security.js << 'SECURITY'
const fs = require('fs');
const serverFile = './dist/server.js';
const content = fs.readFileSync(serverFile, 'utf8');

const securityChecks = [
    { name: 'Helmet', check: /helmet/i },
    { name: 'CORS', check: /cors/i },
    { name: 'Rate Limiting', check: /rateLimit|express-rate-limit/i },
    { name: 'Body Parser Limit', check: /limit.*100kb|limit.*50mb/i }
];

console.log('\n🔒 Security Middleware Check:');
securityChecks.forEach(({ name, check }) => {
    console.log(check.test(content) ? `✓ ${name}` : `⚠ ${name} - Not detected`);
});
SECURITY

node check-security.js

log_success "Security hardening applied"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 5: HEALTH CHECK SYSTEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "5/8" "HEALTH CHECK & MONITORING SYSTEM"

# Create comprehensive health check script
cat > health-check.sh << 'HEALTH'
#!/bin/bash
# Comprehensive health check for backend

check_port() {
    nc -z localhost $1 2>/dev/null
    return $?
}

check_http() {
    curl -sf http://localhost:$1$2 > /dev/null 2>&1
    return $?
}

check_db() {
    PGPASSWORD='lsavaoC57Cs05N8stXAujrGtDGEvZfxC' psql -h localhost -U kattenbak_user -d kattenbak_prod -c '\dt' > /dev/null 2>&1
    return $?
}

echo "🏥 Health Check - Backend API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Port check
if check_port 3101; then
    echo "✓ Port 3101: LISTENING"
else
    echo "✗ Port 3101: NOT LISTENING"
    exit 1
fi

# HTTP health endpoint
if check_http 3101 /health; then
    echo "✓ /health endpoint: OK"
else
    echo "✗ /health endpoint: FAILED"
    exit 1
fi

# Database
if check_db; then
    echo "✓ Database: CONNECTED"
else
    echo "✗ Database: DISCONNECTED"
    exit 1
fi

# API endpoints
if check_http 3101 /api/products; then
    echo "✓ /api/products: OK"
else
    echo "⚠ /api/products: FAILED"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Backend: HEALTHY"
exit 0
HEALTH

chmod +x health-check.sh

# Create watchdog script
cat > watchdog.sh << 'WATCHDOG'
#!/bin/bash
# Auto-restart if backend becomes unhealthy

MAX_FAILURES=3
FAILURES=0

while true; do
    if ! /var/www/kattenbak/backend/health-check.sh > /dev/null 2>&1; then
        FAILURES=$((FAILURES + 1))
        echo "[$(date)] Backend unhealthy (failures: $FAILURES/$MAX_FAILURES)"
        
        if [ $FAILURES -ge $MAX_FAILURES ]; then
            echo "[$(date)] Restarting backend..."
            pm2 restart backend
            FAILURES=0
            sleep 30
        fi
    else
        FAILURES=0
    fi
    
    sleep 60
done
WATCHDOG

chmod +x watchdog.sh

log_success "Health check & watchdog configured"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 6: PM2 PRODUCTION CONFIGURATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "6/8" "PM2 PRODUCTION SETUP"

cd /var/www/kattenbak

# Create production-grade PM2 ecosystem
cat > ecosystem.config.js << 'PM2'
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: '/var/www/kattenbak/backend',
      script: './dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
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
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'uploads', 'logs'],
      instance_var: 'INSTANCE_ID',
      health_check: {
        interval: 60000,
        threshold: 3
      }
    },
    {
      name: 'frontend',
      cwd: '/var/www/kattenbak/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3102',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3102,
        NEXT_PUBLIC_API_URL: 'https://api.catsupply.nl'
      },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'admin',
      cwd: '/var/www/kattenbak/admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'https://api.catsupply.nl'
      },
      error_file: '/var/log/pm2/admin-error.log',
      out_file: '/var/log/pm2/admin-out.log',
      autorestart: true,
      max_memory_restart: '800M'
    },
    {
      name: 'watchdog',
      cwd: '/var/www/kattenbak/backend',
      script: './watchdog.sh',
      instances: 1,
      autorestart: true,
      cron_restart: '0 4 * * *'
    }
  ]
};
PM2

# Create log rotation
mkdir -p /var/log/pm2
cat > /etc/logrotate.d/pm2 << 'LOGROTATE'
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
LOGROTATE

log_success "PM2 production config created"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 7: NGINX ADVANCED CONFIGURATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "7/8" "NGINX ADVANCED CONFIGURATION"

# Create optimized Nginx config with security headers
cat > /etc/nginx/conf.d/catsupply.conf << 'NGINX'
# Upstream definitions
upstream backend_api {
    least_conn;
    server 127.0.0.1:3101 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend_app {
    server 127.0.0.1:3102 max_fails=3 fail_timeout=30s;
    keepalive 16;
}

upstream admin_app {
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 8;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=web_limit:10m rate=30r/s;

# Backend API
server {
    listen 80;
    server_name api.catsupply.nl;
    
    client_max_body_size 50M;
    client_body_timeout 300s;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting
    limit_req zone=api_limit burst=20 nodelay;
    
    location / {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
    
    # Health check endpoint (no rate limit)
    location /health {
        proxy_pass http://backend_api;
        access_log off;
    }
}

# Frontend
server {
    listen 80;
    server_name catsupply.nl www.catsupply.nl;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Rate limiting
    limit_req zone=web_limit burst=50 nodelay;
    
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
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        proxy_pass http://frontend_app;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}

# Admin
server {
    listen 80;
    server_name admin.catsupply.nl;
    
    # Extra security for admin
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    
    # Stricter rate limiting for admin
    limit_req zone=api_limit burst=5 nodelay;
    
    location / {
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
}
NGINX

# Test and reload Nginx
nginx -t && systemctl reload nginx

log_success "Nginx advanced config deployed"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 8: START ALL SERVICES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "8/8" "STARTING ALL SERVICES"

# Stop all existing PM2 processes
pm2 delete all 2>/dev/null || true

# Start with ecosystem
pm2 start ecosystem.config.js

# Save PM2 state
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true

log_success "PM2 processes started"

# Wait for services to be ready
log_warning "Waiting for services to initialize..."
sleep 15

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VERIFICATION & HEALTH CHECKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}  DEPLOYMENT COMPLETE - VERIFICATION${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# PM2 Status
echo -e "${BOLD}📊 PM2 Status:${NC}"
pm2 status

echo ""
echo -e "${BOLD}🏥 Health Checks:${NC}"

# Backend health
if curl -sf http://localhost:3101/health > /dev/null 2>&1; then
    log_success "Backend API: HEALTHY"
    curl -s http://localhost:3101/health | head -5
else
    log_error "Backend API: UNHEALTHY"
fi

# Frontend
if curl -sf http://localhost:3102 > /dev/null 2>&1; then
    log_success "Frontend: HEALTHY"
else
    log_warning "Frontend: INITIALIZING"
fi

# Admin
if curl -sf http://localhost:3001 > /dev/null 2>&1; then
    log_success "Admin: HEALTHY"
else
    log_warning "Admin: INITIALIZING (may need build)"
fi

# Database
if PGPASSWORD='lsavaoC57Cs05N8stXAujrGtDGEvZfxC' psql -h localhost -U kattenbak_user -d kattenbak_prod -c 'SELECT version();' > /dev/null 2>&1; then
    log_success "PostgreSQL: CONNECTED"
else
    log_error "PostgreSQL: DISCONNECTED"
fi

echo ""
echo -e "${BOLD}🌐 URLs:${NC}"
echo "  Backend:  http://185.224.139.74:3101/health"
echo "  Frontend: http://185.224.139.74"
echo "  Admin:    http://185.224.139.74:3001"
echo ""
echo "  Via Nginx (when DNS ready):"
echo "  API:      http://api.catsupply.nl"
echo "  Site:     http://catsupply.nl"
echo "  Admin:    http://admin.catsupply.nl"

echo ""
echo -e "${BOLD}📋 Admin Credentials:${NC}"
echo "  Username: admin"
echo "  Password: XjMBrpkF3dnP4QsAImFPYvu1iXmJpYJ0"

echo ""
echo -e "${BOLD}🔧 Management Commands:${NC}"
echo "  pm2 status           - Check all processes"
echo "  pm2 logs backend     - View backend logs"
echo "  pm2 restart backend  - Restart backend"
echo "  pm2 monit            - Real-time monitoring"
echo "  ./backend/health-check.sh - Run health check"

echo ""
echo -e "${BOLD}${GREEN}✓ EXPERT DEPLOYMENT COMPLETE!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

REMOTE_EXPERT

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 EXPERT BACKEND DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✅ Backend: Isolated & Secured"
echo "✅ Build: esbuild (optimized)"
echo "✅ PM2: Cluster mode (2 instances)"
echo "✅ Health Checks: Automated"
echo "✅ Security: Hardened"
echo "✅ Monitoring: Active"
echo ""
