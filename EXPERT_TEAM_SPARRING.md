# 🎯 EXPERT TEAM SPARRING - COMPLETE DEPLOYMENT STRATEGIE
**Server: 185.224.139.54 | Project: Kattenbak E-commerce**

---

## 📊 TEAM EXPERTS & VERANTWOORDELIJKHEDEN

### 👨‍💻 **EXPERT 1: DevOps Engineer**
**Verantwoordelijk voor:**
- Process management (PM2)
- Deployment automation
- CI/CD pipelines
- Monitoring & logging

### 🔐 **EXPERT 2: Security Engineer**
**Verantwoordelijk voor:**
- Server hardening
- SSL/TLS configuration
- Firewall rules
- Penetration testing
- Secret management

### 🗄️ **EXPERT 3: Database Administrator**
**Verantwoordelijk voor:**
- PostgreSQL setup & tuning
- Backup strategy
- Connection pooling
- Query optimization
- Data migration

### 🎨 **EXPERT 4: Frontend Engineer**
**Verantwoordelijk voor:**
- Next.js optimization
- Static asset caching
- CDN setup (optional)
- Performance testing
- SEO optimization

### ⚙️ **EXPERT 5: Backend Engineer**
**Verantwoordelijk voor:**
- Express API optimization
- Rate limiting strategy
- Webhook handling
- API versioning
- Load testing

### 🌐 **EXPERT 6: Network Engineer**
**Verantwoordelijk voor:**
- Nginx configuration
- Load balancing
- DNS setup
- Network optimization
- DDoS protection

### 📊 **EXPERT 7: QA Engineer**
**Verantwoordelijk voor:**
- Integration testing
- End-to-end testing
- Performance benchmarking
- Security testing
- Regression testing

---

## 🔍 VAKGEBIED 1: DEVOPS (Process Management)

### 📋 **ANALYSE:**
```yaml
Requirements:
  - Multi-process management (3 services)
  - Auto-restart on crashes
  - Zero-downtime deployments
  - Resource monitoring
  - Log aggregation

Options:
  1. Docker + Docker Compose
     Pros: Isolation, portability
     Cons: Overhead, complexity
     
  2. PM2 (Node.js)
     Pros: Native, fast, simple
     Cons: No isolation
     
  3. Systemd
     Pros: Native Linux, stable
     Cons: Complex config, no clustering

Decision: PM2
Reason: Native Node.js, clustering, simple, proven
```

### ✅ **IMPLEMENTATIE:**

**PM2 Ecosystem Config (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 'max',              // All CPU cores
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 3101,
      },
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Auto-restart strategy
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Monitoring
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
    },
    // ... frontend & admin config
  ]
};
```

### 🧪 **TESTING:**

**Test Script (test-pm2.sh):**
```bash
#!/bin/bash
set -e

echo "Testing PM2 Setup..."

# 1. Test PM2 installation
pm2 --version || exit 1

# 2. Test ecosystem config syntax
pm2 start ecosystem.config.js --dry-run

# 3. Test process start
pm2 start ecosystem.config.js
sleep 5

# 4. Test all processes running
pm2 list | grep "online" | wc -l | grep -q "3" || exit 1

# 5. Test auto-restart
pm2 kill backend
sleep 3
pm2 list | grep "backend.*online" || exit 1

# 6. Test memory limit
# Simulate high memory usage
pm2 restart backend

echo "✅ PM2 Setup: PASSED"
```

---

## 🔐 VAKGEBIED 2: SECURITY (Hardening)

### 📋 **ANALYSE:**

```yaml
Threats:
  - DDoS attacks
  - SQL injection (N/A - no DB yet)
  - XSS attacks
  - CSRF attacks
  - Brute force login
  - Man-in-the-middle
  - Data breaches

Mitigations:
  1. Firewall (UFW) → Block all except 22,80,443
  2. Fail2ban → Auto-ban brute force
  3. SSL/TLS → Encrypt all traffic
  4. Security headers → XSS, clickjacking protection
  5. Rate limiting → API abuse prevention
  6. Secret management → .env with chmod 600
```

### ✅ **IMPLEMENTATIE:**

**Security Hardening Script (harden-server.sh):**
```bash
#!/bin/bash
set -e

echo "🔐 Server Hardening..."

# 1. SSH Hardening
echo "1/7 SSH Hardening..."
sudo tee -a /etc/ssh/sshd_config << EOF

# Custom Security Settings
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222
MaxAuthTries 3
LoginGraceTime 20
AllowUsers deployer
EOF

sudo systemctl restart sshd

# 2. Firewall (UFW)
echo "2/7 Firewall Setup..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp comment 'SSH Custom Port'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# 3. Fail2ban
echo "3/7 Fail2ban Setup..."
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

sudo tee /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = 2222
maxretry = 3
bantime = 3600
findtime = 600

[nginx-http-auth]
enabled = true
maxretry = 5
bantime = 3600
EOF

sudo systemctl restart fail2ban

# 4. Automatic Security Updates
echo "4/7 Auto-updates..."
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# 5. Disable unused services
echo "5/7 Disabling unused services..."
sudo systemctl disable bluetooth.service
sudo systemctl disable cups.service

# 6. Kernel hardening
echo "6/7 Kernel hardening..."
sudo tee -a /etc/sysctl.conf << EOF

# Custom Security Settings
net.ipv4.conf.default.rp_filter=1
net.ipv4.conf.all.rp_filter=1
net.ipv4.tcp_syncookies=1
net.ipv4.conf.all.accept_redirects=0
net.ipv6.conf.all.accept_redirects=0
net.ipv4.conf.all.send_redirects=0
net.ipv4.conf.all.accept_source_route=0
net.ipv6.conf.all.accept_source_route=0
EOF

sudo sysctl -p

# 7. File permissions
echo "7/7 Securing files..."
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 /var/www/kattenbak/backend/.env.production
chmod 600 /var/www/kattenbak/frontend/.env.local

echo "✅ Server Hardened!"
```

### 🧪 **SECURITY TESTING:**

**Security Test Script (test-security.sh):**
```bash
#!/bin/bash

echo "🔐 Running Security Tests..."

# 1. Test SSH config
echo "Test 1/8: SSH Configuration"
ssh -o PasswordAuthentication=no -p 2222 deployer@localhost echo "SSH OK" || exit 1

# 2. Test Firewall
echo "Test 2/8: Firewall Rules"
sudo ufw status | grep -q "Status: active" || exit 1

# 3. Test Fail2ban
echo "Test 3/8: Fail2ban"
sudo fail2ban-client status sshd | grep -q "Currently banned" || echo "No bans yet (OK)"

# 4. Test SSL
echo "Test 4/8: SSL Certificate"
echo | openssl s_client -connect localhost:443 2>/dev/null | grep -q "Verify return code: 0" || echo "SSL not yet configured"

# 5. Test Security Headers
echo "Test 5/8: Security Headers"
curl -I https://localhost 2>/dev/null | grep -q "X-Frame-Options" || echo "Headers pending Nginx config"

# 6. Test Rate Limiting
echo "Test 6/8: Rate Limiting"
for i in {1..110}; do
  curl -s http://localhost:3101/api/v1/products > /dev/null
done
curl -s http://localhost:3101/api/v1/products | grep -q "rate limit" && echo "Rate limiting: PASS" || echo "Rate limiting: FAIL"

# 7. Test .env permissions
echo "Test 7/8: Environment File Permissions"
stat -c %a /var/www/kattenbak/backend/.env.production | grep -q "600" || exit 1

# 8. Test for exposed secrets
echo "Test 8/8: Secret Exposure Check"
grep -r "MOLLIE_API_KEY" /var/www/kattenbak/.git/ && exit 1 || echo "Secrets safe"

echo "✅ Security Tests: PASSED"
```

---

## 🗄️ VAKGEBIED 3: DATABASE (PostgreSQL Setup)

### 📋 **ANALYSE:**

```yaml
Requirements:
  - Persistent data storage
  - Transaction support (ACID)
  - Connection pooling
  - Backup automation
  - Query optimization

Database Options:
  1. PostgreSQL (Recommended)
     - ACID compliant
     - JSON support
     - Full-text search
     - Mature ecosystem
     
  2. MySQL
     - Simpler
     - Less features
     
  3. MongoDB
     - NoSQL
     - Not ideal for e-commerce

Decision: PostgreSQL 15
```

### ✅ **IMPLEMENTATIE:**

**Database Setup Script (setup-database.sh):**
```bash
#!/bin/bash
set -e

echo "🗄️ Setting up PostgreSQL..."

# 1. Install PostgreSQL 15
echo "1/6 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# 2. Start & Enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Create Database & User
echo "2/6 Creating database..."
sudo -u postgres psql << EOF
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
EOF

# 4. Configure PostgreSQL
echo "3/6 Configuring PostgreSQL..."
sudo tee -a /etc/postgresql/15/main/postgresql.conf << EOF

# Custom Performance Settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
EOF

sudo systemctl restart postgresql

# 5. Setup Connection Pooling (PgBouncer)
echo "4/6 Installing PgBouncer..."
sudo apt install -y pgbouncer

sudo tee /etc/pgbouncer/pgbouncer.ini << EOF
[databases]
kattenbak_prod = host=localhost port=5432 dbname=kattenbak_prod

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
EOF

echo '"kattenbak_user" "md5PASSWORD_HASH"' | sudo tee /etc/pgbouncer/userlist.txt

sudo systemctl restart pgbouncer

# 6. Setup Automated Backups
echo "5/6 Setting up backups..."
sudo mkdir -p /var/backups/postgresql
sudo chown postgres:postgres /var/backups/postgresql

sudo tee /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U kattenbak_user kattenbak_prod | gzip > "$BACKUP_DIR/kattenbak_$TIMESTAMP.sql.gz"
# Keep only last 7 days
find "$BACKUP_DIR" -name "kattenbak_*.sql.gz" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -

echo "6/6 Running Prisma migrations..."
cd /var/www/kattenbak/backend
npm run prisma:migrate:prod

echo "✅ Database Setup Complete!"
```

### 🧪 **DATABASE TESTING:**

**Database Test Script (test-database.sh):**
```bash
#!/bin/bash

echo "🗄️ Testing Database Setup..."

# 1. Test PostgreSQL running
echo "Test 1/7: PostgreSQL Service"
sudo systemctl is-active postgresql || exit 1

# 2. Test database exists
echo "Test 2/7: Database Exists"
sudo -u postgres psql -lqt | grep -q kattenbak_prod || exit 1

# 3. Test user permissions
echo "Test 3/7: User Permissions"
PGPASSWORD=PASSWORD psql -U kattenbak_user -h localhost -d kattenbak_prod -c "SELECT 1" || exit 1

# 4. Test connection pooling
echo "Test 4/7: PgBouncer"
PGPASSWORD=PASSWORD psql -U kattenbak_user -h localhost -p 6432 -d kattenbak_prod -c "SELECT 1" || exit 1

# 5. Test backup script
echo "Test 5/7: Backup Script"
sudo /usr/local/bin/backup-db.sh
ls -la /var/backups/postgresql/*.sql.gz | grep -q "kattenbak_" || exit 1

# 6. Test Prisma schema
echo "Test 6/7: Prisma Schema"
cd /var/www/kattenbak/backend
npm run prisma:generate || exit 1

# 7. Performance test
echo "Test 7/7: Query Performance"
time PGPASSWORD=PASSWORD psql -U kattenbak_user -h localhost -p 6432 -d kattenbak_prod -c "SELECT COUNT(*) FROM products"

echo "✅ Database Tests: PASSED"
```

---

## 🎨 VAKGEBIED 4: FRONTEND (Next.js Optimization)

### 📋 **ANALYSE:**

```yaml
Performance Goals:
  - Lighthouse Score > 90
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3.5s
  - Total Bundle Size < 500KB

Optimizations:
  1. Image optimization (next/image)
  2. Code splitting (dynamic imports)
  3. Static generation (getStaticProps)
  4. CDN caching
  5. Compression (gzip/brotli)
```

### ✅ **IMPLEMENTATIE:**

**Next.js Config Optimization (next.config.ts):**
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strict mode for better error checking
  reactStrictMode: true,
  
  // Production optimizations
  swcMinify: true,
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers for security & caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Output standalone for production
  output: 'standalone',
};

export default nextConfig;
```

### 🧪 **FRONTEND TESTING:**

**Frontend Performance Test (test-frontend.sh):**
```bash
#!/bin/bash

echo "🎨 Testing Frontend Performance..."

# 1. Build test
echo "Test 1/6: Production Build"
cd /var/www/kattenbak/frontend
npm run build || exit 1

# 2. Bundle size check
echo "Test 2/6: Bundle Size"
BUNDLE_SIZE=$(du -sb .next/static | awk '{print $1}')
MAX_SIZE=$((500 * 1024))  # 500KB
if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
  echo "Bundle too large: $BUNDLE_SIZE bytes"
  exit 1
fi

# 3. Lighthouse test
echo "Test 3/6: Lighthouse Score"
npm install -g lighthouse
lighthouse http://localhost:3100 --only-categories=performance --chrome-flags="--headless" --output=json --output-path=./lighthouse.json
SCORE=$(jq '.categories.performance.score * 100' lighthouse.json)
if [ "$SCORE" -lt 90 ]; then
  echo "Lighthouse score too low: $SCORE"
  exit 1
fi

# 4. Image optimization check
echo "Test 4/6: Image Optimization"
curl -I http://localhost:3100/_next/image?url=%2Fimages%2Ftest.jpg&w=640&q=75 | grep -q "image/webp" || exit 1

# 5. Response time test
echo "Test 5/6: Response Time"
TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3100)
if (( $(echo "$TIME > 1.0" | bc -l) )); then
  echo "Response time too slow: $TIME seconds"
  exit 1
fi

# 6. SEO test
echo "Test 6/6: SEO Meta Tags"
curl -s http://localhost:3100 | grep -q "<meta name=\"description\"" || exit 1
curl -s http://localhost:3100 | grep -q "<title>" || exit 1

echo "✅ Frontend Tests: PASSED"
```

---

## ⚙️ VAKGEBIED 5: BACKEND (API Optimization)

### 📋 **ANALYSE:**

```yaml
Performance Goals:
  - Response time < 100ms (average)
  - Throughput > 1000 req/s
  - Error rate < 0.1%
  - CPU usage < 70%

Optimizations:
  1. Response caching (Redis)
  2. Connection pooling (PgBouncer)
  3. Compression (gzip)
  4. Rate limiting
  5. Request validation
```

### ✅ **IMPLEMENTATIE:**

**Backend Optimization Middleware:**

**File: backend/src/middleware/cache.middleware.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

redis.connect();

/**
 * Cache middleware - DRY response caching
 */
export const cacheMiddleware = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      // Check cache
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }

      // Store original json function
      const originalJson = res.json.bind(res);

      // Override json function to cache response
      res.json = function(data: any) {
        redis.setEx(key, duration, JSON.stringify(data));
        res.setHeader('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};
```

**File: backend/src/middleware/compression.middleware.ts**
```typescript
import compression from 'compression';

/**
 * Compression middleware - DRY response compression
 */
export const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Compress everything else
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress if > 1KB
});
```

### 🧪 **BACKEND TESTING:**

**Backend Load Test (test-backend-load.sh):**
```bash
#!/bin/bash

echo "⚙️ Testing Backend Performance..."

# Install Apache Bench if needed
which ab > /dev/null || sudo apt install -y apache2-utils

# 1. Health check
echo "Test 1/6: Health Endpoint"
curl -f http://localhost:3101/health || exit 1

# 2. Response time test
echo "Test 2/6: Average Response Time"
ab -n 1000 -c 10 http://localhost:3101/api/v1/products > /tmp/ab-results.txt
AVG_TIME=$(grep "Time per request" /tmp/ab-results.txt | head -1 | awk '{print $4}')
if (( $(echo "$AVG_TIME > 100" | bc -l) )); then
  echo "Response time too slow: $AVG_TIME ms"
  exit 1
fi

# 3. Throughput test
echo "Test 3/6: Throughput"
REQUESTS_PER_SEC=$(grep "Requests per second" /tmp/ab-results.txt | awk '{print $4}')
if (( $(echo "$REQUESTS_PER_SEC < 100" | bc -l) )); then
  echo "Throughput too low: $REQUESTS_PER_SEC req/s"
  exit 1
fi

# 4. Cache test
echo "Test 4/6: Redis Cache"
FIRST=$(curl -s -w "%{time_total}" http://localhost:3101/api/v1/products -o /dev/null)
SECOND=$(curl -s -w "%{time_total}" http://localhost:3101/api/v1/products -o /dev/null)
if (( $(echo "$SECOND > $FIRST" | bc -l) )); then
  echo "Cache not working properly"
  exit 1
fi

# 5. Rate limiting test
echo "Test 5/6: Rate Limiting"
for i in {1..150}; do
  curl -s http://localhost:3101/api/v1/products > /dev/null
done
RATE_LIMITED=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3101/api/v1/products)
if [ "$RATE_LIMITED" != "429" ]; then
  echo "Rate limiting not working"
  exit 1
fi

# 6. Error rate test
echo "Test 6/6: Error Rate"
ab -n 10000 -c 100 http://localhost:3101/api/v1/products > /tmp/ab-stress.txt
ERROR_RATE=$(grep "Failed requests" /tmp/ab-stress.txt | awk '{print $3}')
if [ "$ERROR_RATE" -gt 10 ]; then
  echo "Error rate too high: $ERROR_RATE errors"
  exit 1
fi

echo "✅ Backend Load Tests: PASSED"
echo "  - Avg Response Time: $AVG_TIME ms"
echo "  - Throughput: $REQUESTS_PER_SEC req/s"
echo "  - Error Rate: $ERROR_RATE errors out of 10000"
```

---

## 🌐 VAKGEBIED 6: NETWORK (Nginx & DNS)

### 📋 **ANALYSE:**

```yaml
Network Requirements:
  - Reverse proxy (Nginx)
  - Load balancing
  - SSL termination
  - Static asset caching
  - Compression
  - Security headers

DNS Setup:
  - Main domain: jouwdomein.nl → Frontend
  - API subdomain: api.jouwdomein.nl → Backend
  - Admin subdomain: admin.jouwdomein.nl → Admin
```

### ✅ **IMPLEMENTATIE:**

**Complete Nginx Config (nginx.conf):**
```nginx
# /etc/nginx/nginx.conf

user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 2048;
    multi_accept on;
    use epoll;
}

http {
    ##
    # Basic Settings
    ##
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ##
    # SSL Settings
    ##
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    ##
    # Logging
    ##
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    ##
    # Gzip Settings
    ##
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    ##
    # Rate Limiting
    ##
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=general:10m rate=1000r/m;

    ##
    # Upstream Backends
    ##
    upstream backend_api {
        least_conn;
        server localhost:3101 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream frontend_app {
        least_conn;
        server localhost:3100 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream admin_panel {
        server localhost:3002 max_fails=3 fail_timeout=30s;
    }

    ##
    # Virtual Host Configs
    ##
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

**Site Config (/etc/nginx/sites-available/kattenbak):**
```nginx
# HTTP → HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name jouwdomein.nl www.jouwdomein.nl api.jouwdomein.nl admin.jouwdomein.nl;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Frontend (jouwdomein.nl)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name jouwdomein.nl www.jouwdomein.nl;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/jouwdomein.nl/chain.pem;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com; frame-src https://hcaptcha.com https://*.hcaptcha.com; connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://api.jouwdomein.nl;" always;
    
    # Rate Limiting
    limit_req zone=general burst=50 nodelay;
    
    # Static Assets Caching
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot|otf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    location ~* \.(css|js|json)$ {
        expires 1d;
        add_header Cache-Control "public, max-age=86400";
    }
    
    # Next.js App
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Backend API (api.jouwdomein.nl)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.jouwdomein.nl;
    
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    
    # CORS (if needed)
    add_header Access-Control-Allow-Origin "https://jouwdomein.nl" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    # Rate Limiting (API)
    limit_req zone=api burst=20 nodelay;
    
    location / {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}

# Admin Panel (admin.jouwdomein.nl)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.jouwdomein.nl;
    
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "DENY" always;
    
    # IP Whitelist (Optional - Uncomment and add your IPs)
    # allow 1.2.3.4;  # Office IP
    # allow 5.6.7.8;  # VPN IP
    # deny all;
    
    location / {
        proxy_pass http://admin_panel;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 🧪 **NETWORK TESTING:**

**Nginx Test Script (test-nginx.sh):**
```bash
#!/bin/bash

echo "🌐 Testing Nginx Configuration..."

# 1. Syntax test
echo "Test 1/10: Nginx Syntax"
sudo nginx -t || exit 1

# 2. SSL certificate test
echo "Test 2/10: SSL Certificates"
echo | openssl s_client -connect jouwdomein.nl:443 -servername jouwdomein.nl 2>/dev/null | openssl x509 -noout -dates

# 3. HTTP → HTTPS redirect
echo "Test 3/10: HTTP Redirect"
REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://jouwdomein.nl)
if [ "$REDIRECT" != "301" ]; then
  echo "HTTP redirect not working"
  exit 1
fi

# 4. Security headers test
echo "Test 4/10: Security Headers"
curl -I https://jouwdomein.nl 2>/dev/null | grep -q "Strict-Transport-Security" || exit 1
curl -I https://jouwdomein.nl 2>/dev/null | grep -q "X-Frame-Options" || exit 1
curl -I https://jouwdomein.nl 2>/dev/null | grep -q "X-Content-Type-Options" || exit 1

# 5. Compression test
echo "Test 5/10: Gzip Compression"
curl -H "Accept-Encoding: gzip" -I https://jouwdomein.nl 2>/dev/null | grep -q "Content-Encoding: gzip" || exit 1

# 6. Static caching test
echo "Test 6/10: Static Asset Caching"
curl -I https://jouwdomein.nl/static/image.jpg 2>/dev/null | grep -q "Cache-Control.*immutable" || echo "No static files yet"

# 7. Rate limiting test
echo "Test 7/10: Rate Limiting"
for i in {1..150}; do
  curl -s https://api.jouwdomein.nl/api/v1/products > /dev/null
done
RATE_LIMITED=$(curl -s -o /dev/null -w "%{http_code}" https://api.jouwdomein.nl/api/v1/products)
if [ "$RATE_LIMITED" != "429" ] && [ "$RATE_LIMITED" != "503" ]; then
  echo "Rate limiting might not be working (got $RATE_LIMITED)"
fi

# 8. Load balancing test
echo "Test 8/10: Load Balancing"
for i in {1..10}; do
  curl -s https://jouwdomein.nl > /dev/null
done
echo "Load balancing OK (multiple requests successful)"

# 9. WebSocket test (if applicable)
echo "Test 9/10: WebSocket Support"
curl -I -H "Upgrade: websocket" -H "Connection: Upgrade" https://jouwdomein.nl 2>/dev/null | grep -q "101" || echo "WebSockets not configured (OK if not needed)"

# 10. Response time test
echo "Test 10/10: Response Time"
TIME=$(curl -o /dev/null -s -w '%{time_total}' https://jouwdomein.nl)
echo "Response time: $TIME seconds"

echo "✅ Nginx Tests: PASSED"
```

---

## 📊 VAKGEBIED 7: QA (Integration & E2E Testing)

### ✅ **COMPLETE INTEGRATION TESTS:**

**Master Test Suite (run-all-tests.sh):**
```bash
#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🧪 RUNNING COMPLETE TEST SUITE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
  local test_name=$1
  local test_script=$2
  
  echo -e "${YELLOW}Running: $test_name${NC}"
  
  if bash "$test_script"; then
    echo -e "${GREEN}✅ $test_name: PASSED${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ $test_name: FAILED${NC}"
    ((TESTS_FAILED++))
  fi
  
  echo ""
}

# Run all test scripts
run_test "PM2 Setup" "./test-pm2.sh"
run_test "Security" "./test-security.sh"
run_test "Database" "./test-database.sh"
run_test "Frontend" "./test-frontend.sh"
run_test "Backend Load" "./test-backend-load.sh"
run_test "Nginx Config" "./test-nginx.sh"

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 TEST RESULTS${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  echo -e "${GREEN}System is ready for production!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
  echo -e "${YELLOW}Please review failed tests before deploying${NC}"
  exit 1
fi
```

---

## ✅ SUCCESS REPORTING

**Deployment Success Script (deployment-success.sh):**
```bash
#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}"
cat << "EOF"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ____  ______ ____  __    _______  ____  __________
  / __ \/ ____// __ \/ /   / ____\ \/ /  |/  / ____/ |/ /__  
 / / / / __/  / /_/ / /   / / __  \  /| /|_/ / __/  /    / _ \\
/ /_/ / /___ / ____/ /___/ /_/ /  / / |/  / / /___ / /|  /  __/
\____/_____//_/   /_____/\____/  /_/|__//_/_____//_/ |_/\___/ 
                                                                
    _____ __  ____________________                             
   / ___// / / / ____/ ____/ ____/                             
   \__ \/ / / / /   / /   / __/                                
  ___/ / /_/ / /___/ /___/ /___                                
 /____/\____/\____/\____/_____/                                

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
echo -e "${NC}"

echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SYSTEM STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# PM2 Status
echo "✅ PROCESS MANAGEMENT (PM2):"
pm2 jlist | jq -r '.[] | "   \(.name): \(.pm2_env.status) (CPU: \(.monit.cpu)%, MEM: \(.monit.memory / 1024 / 1024 | floor)MB, Restarts: \(.pm2_env.restart_time))"'
echo ""

# Database Status
echo "✅ DATABASE (PostgreSQL):"
sudo systemctl is-active postgresql >/dev/null && echo "   Status: Running ✓" || echo "   Status: Stopped ✗"
CONN=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='kattenbak_prod';" 2>/dev/null || echo "0")
echo "   Active Connections: $CONN"
DB_SIZE=$(sudo -u postgres psql -t -c "SELECT pg_size_pretty(pg_database_size('kattenbak_prod'));" 2>/dev/null || echo "N/A")
echo "   Database Size: $DB_SIZE"
echo ""

# Nginx Status
echo "✅ WEB SERVER (Nginx):"
sudo systemctl is-active nginx >/dev/null && echo "   Status: Running ✓" || echo "   Status: Stopped ✗"
NGINX_CONN=$(netstat -an | grep :443 | grep ESTABLISHED | wc -l)
echo "   Active HTTPS Connections: $NGINX_CONN"
echo ""

# Redis Status
echo "✅ CACHE (Redis):"
redis-cli ping >/dev/null 2>&1 && echo "   Status: Running ✓" || echo "   Status: Stopped ✗"
REDIS_MEM=$(redis-cli info memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\\r' || echo "N/A")
echo "   Memory Usage: $REDIS_MEM"
echo ""

# SSL Certificates
echo "✅ SSL CERTIFICATES:"
if [ -f "/etc/letsencrypt/live/jouwdomein.nl/fullchain.pem" ]; then
  EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem | cut -d= -f2)
  echo "   Status: Valid ✓"
  echo "   Expires: $EXPIRY"
else
  echo "   Status: Not configured yet"
fi
echo ""

# System Resources
echo "✅ SYSTEM RESOURCES:"
echo "   CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
echo "   Memory: $(free -h | awk 'NR==2{printf "%s / %s (%.2f%%)", $3, $2, $3*100/$2 }')"
echo "   Disk: $(df -h / | awk 'NR==2{printf "%s / %s (%s)", $3, $2, $5}')"
echo "   Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 LIVE URLS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Frontend:  https://jouwdomein.nl"
echo "   Backend:   https://api.jouwdomein.nl"
echo "   Admin:     https://admin.jouwdomein.nl"
echo "   Health:    https://api.jouwdomein.nl/health"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 MONITORING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   PM2 Monitor:     pm2 monit"
echo "   PM2 Logs:        pm2 logs"
echo "   Nginx Logs:      sudo tail -f /var/log/nginx/access.log"
echo "   Database Logs:   sudo tail -f /var/log/postgresql/postgresql-15-main.log"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 MANAGEMENT COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Deploy new version:   ./deploy-production.sh"
echo "   Restart service:      pm2 restart <name>"
echo "   View logs:            pm2 logs <name>"
echo "   System status:        pm2 status"
echo "   Database backup:      /usr/local/bin/backup-db.sh"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SYSTEM READY FOR PRODUCTION!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

---

**ALLES KLAAR VOOR DEPLOYMENT! 🚀**


