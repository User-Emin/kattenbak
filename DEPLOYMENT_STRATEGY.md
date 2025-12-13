# 🚀 DEPLOYMENT STRATEGY - TEAM SPARRING
**Server: 185.224.139.54**
**Project: Kattenbak E-commerce Platform**

---

## 📋 TEAM SPARRING: DEPLOYMENT OPTIES

### ✅ OPTIE 1: DOCKER (RECOMMENDED)

**Voordelen:**
- ✅ Isolated environments (frontend, backend, admin gescheiden)
- ✅ Easy scaling (elk service apart schalen)
- ✅ Consistent deploys (werkt overal hetzelfde)
- ✅ Zero-downtime updates (rolling updates)
- ✅ Resource management (CPU/memory limits)
- ✅ CI/CD friendly (docker-compose up -d)

**Nadelen:**
- ⚠️ Overhead (extra layer, ~100-200MB RAM per container)
- ⚠️ Learning curve voor team
- ⚠️ Complexiteit bij debugging

**Best voor:**
- Teams die al Docker kennen
- Apps met multiple services (frontend/backend/admin)
- Scaling nodig (meer dan 1000 req/min)

---

### ✅ OPTIE 2: PM2 (SIMPLE & DIRECT)

**Voordelen:**
- ✅ Zero overhead (native Node.js)
- ✅ Simple setup (pm2 start ecosystem.config.js)
- ✅ Process management (auto-restart, monitoring)
- ✅ Log management (pm2 logs)
- ✅ Cluster mode (multi-core support)
- ✅ Fast deploys (no container rebuild)

**Nadelen:**
- ⚠️ Manual dependency management (Node versies)
- ⚠️ Geen isolation tussen services
- ⚠️ Manual nginx setup voor routing

**Best voor:**
- Small teams
- Direct control over server
- Fast iteration zonder container overhead

---

### ✅ OPTIE 3: HYBRID (PM2 + DOCKER FOR DB/REDIS)

**Voordelen:**
- ✅ Best of both worlds
- ✅ Node apps direct op PM2 (fast)
- ✅ Database/Redis in Docker (isolated)
- ✅ Easy to maintain
- ✅ Resource efficient

**Nadelen:**
- ⚠️ Mixed setup (team moet beide kennen)

---

## 🎯 RECOMMENDATION: PM2 VOOR DEZE SETUP

**Waarom PM2:**
1. **Jouw setup** → Frontend/Backend/Admin zijn relatief klein
2. **Performance** → Geen Docker overhead nodig
3. **Fast deploys** → `git pull && npm run build && pm2 restart`
4. **Simplicity** → Team kent Node.js al
5. **Scaling** → PM2 cluster mode is genoeg voor 10K+ req/min

**Met Nginx reverse proxy:**
```
Nginx (PORT 80/443)
  ├─> Frontend (PORT 3100) → PM2
  ├─> Backend  (PORT 3101) → PM2
  └─> Admin    (PORT 3002) → PM2
```

---

## 🔐 SECURITY CHECKLIST (ABSOLUUT SECURE)

### 1. **SERVER HARDENING**
```bash
# Firewall (ufw)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Fail2ban (brute force protection)
sudo apt install fail2ban
sudo systemctl enable fail2ban

# SSH security
sudo nano /etc/ssh/sshd_config
  PermitRootLogin no
  PasswordAuthentication no  # Use SSH keys only
  Port 2222                   # Change default port
```

### 2. **SSL/TLS (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d jouwdomein.nl -d www.jouwdomein.nl
```

### 3. **ENVIRONMENT VARIABLES**
```bash
# Store in /var/www/kattenbak/.env
# NEVER commit to git
# Use .env.production with ONLY production values
```

### 4. **RATE LIMITING**
- ✅ Already in backend (ratelimit.middleware.ts)
- ✅ Extra layer in Nginx (limit_req_zone)

### 5. **SECRETS MANAGEMENT**
```bash
# Option A: .env files (chmod 600)
chmod 600 /var/www/kattenbak/backend/.env

# Option B: HashiCorp Vault (advanced)
# Option C: AWS Secrets Manager (if on AWS)
```

---

## 📊 PERFORMANCE OPTIMIZATION

### 1. **PM2 CLUSTER MODE**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/server.js',
      instances: 'max',        // Use all CPU cores
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3101
      }
    },
    {
      name: 'frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 2,            // 2 instances genoeg
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3100
      }
    }
  ]
};
```

### 2. **NGINX CACHING**
```nginx
# Static assets caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 3. **REDIS CACHING**
```bash
# Install Redis for caching
sudo apt install redis-server
sudo systemctl enable redis-server

# Backend already configured for Redis (redis.config.ts)
```

---

## 🚀 CI/CD SETUP (GITHUB ACTIONS)

### **Option A: GitHub Actions (Recommended)**

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: 185.224.139.54
          username: deployer
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/kattenbak
            git pull origin main
            
            # Backend
            cd backend
            npm install --production
            npm run build
            pm2 restart backend
            
            # Frontend
            cd ../frontend
            npm install --production
            npm run build
            pm2 restart frontend
            
            # Admin
            cd ../admin
            npm install --production
            npm run build
            pm2 restart admin

      - name: Health Check
        run: |
          curl -f https://api.jouwdomein.nl/health || exit 1
```

### **Option B: Simple Deploy Script**
```bash
#!/bin/bash
# deploy.sh - Run on server after git pull

set -e  # Exit on error

echo "🚀 Deploying Kattenbak..."

# Pull latest code
git pull origin main

# Backend
cd backend
npm install --production
npm run build
pm2 restart backend

# Frontend
cd ../frontend
npm install --production
npm run build
pm2 restart frontend

# Admin
cd ../admin
npm install --production
npm run build
pm2 restart admin

echo "✅ Deployment complete!"
pm2 status
```

---

## 📦 DIRECTORY STRUCTURE ON SERVER

```
/var/www/kattenbak/
├── backend/
│   ├── dist/               # Compiled TypeScript
│   ├── src/
│   ├── .env.production     # Production secrets
│   └── package.json
├── frontend/
│   ├── .next/              # Next.js build
│   ├── app/
│   ├── .env.local          # Production config
│   └── package.json
├── admin/
│   ├── build/              # React build
│   ├── src/
│   └── package.json
├── logs/                   # PM2 logs
├── ecosystem.config.js     # PM2 config
└── deploy.sh              # Deploy script
```

---

## 🔄 DEPLOYMENT WORKFLOW

### **DAILY DEVELOPMENT:**
1. Developer pushes to `main` branch
2. GitHub Actions triggers automatically
3. Server pulls latest code
4. Build & restart services
5. Health check verifies deployment
6. Rollback if health check fails

### **MANUAL DEPLOYMENT:**
```bash
# On server
cd /var/www/kattenbak
./deploy.sh

# Check status
pm2 status
pm2 logs --lines 50
```

### **ROLLBACK:**
```bash
# Rollback to previous commit
git reset --hard HEAD~1
./deploy.sh
```

---

## 📊 MONITORING & LOGGING

### **1. PM2 Monitoring**
```bash
# Real-time monitoring
pm2 monit

# Web dashboard (optional)
pm2 plus  # Free tier available
```

### **2. Nginx Access Logs**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### **3. Application Logs**
```bash
pm2 logs backend --lines 100
pm2 logs frontend --lines 100
pm2 logs admin --lines 100
```

### **4. Uptime Monitoring**
- **UptimeRobot** (free, 5 min checks)
- **Pingdom** (paid, advanced)
- **Self-hosted:** Use backend health endpoint

---

## 💰 COST OPTIMIZATION

### **Server Requirements:**
```
MINIMUM (Development/Testing):
- 2 CPU cores
- 4GB RAM
- 50GB SSD
- Cost: ~€10-15/month (Hetzner, DigitalOcean)

RECOMMENDED (Production):
- 4 CPU cores
- 8GB RAM
- 100GB SSD
- Cost: ~€20-30/month

HIGH TRAFFIC (10K+ req/min):
- 8 CPU cores
- 16GB RAM
- 200GB SSD
- Cost: ~€60-80/month
```

---

## 🎯 SETUP STEPS (EXPERT TEAM APPROACH)

### **EXPERT 1: SERVER ENGINEER**
```bash
# Initial server setup
sudo apt update && sudo apt upgrade -y
sudo apt install nginx nodejs npm redis-server git ufw fail2ban

# Node.js 22 (latest LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# Setup user & directory
sudo useradd -m -s /bin/bash deployer
sudo mkdir -p /var/www/kattenbak
sudo chown deployer:deployer /var/www/kattenbak
```

### **EXPERT 2: SECURITY ENGINEER**
```bash
# SSH hardening
sudo nano /etc/ssh/sshd_config
sudo systemctl restart ssh

# Firewall
sudo ufw setup (see above)

# SSL certificates
sudo certbot --nginx

# Fail2ban
sudo systemctl enable fail2ban
```

### **EXPERT 3: DEVOPS ENGINEER**
```bash
# Clone repo
cd /var/www/kattenbak
git clone https://github.com/User-Emin/kattenbak.git .

# Setup .env files
cp backend/.env.example backend/.env.production
cp frontend/.env.development frontend/.env.local

# Build & start
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
cd ../admin && npm install && npm run build

# PM2 setup
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **EXPERT 4: FRONTEND ENGINEER**
```bash
# Nginx config
sudo nano /etc/nginx/sites-available/kattenbak
# (See nginx config below)
sudo ln -s /etc/nginx/sites-available/kattenbak /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📝 NGINX CONFIGURATION

```nginx
# /etc/nginx/sites-available/kattenbak

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name jouwdomein.nl www.jouwdomein.nl;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    server_name jouwdomein.nl www.jouwdomein.nl;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Backend API
server {
    listen 443 ssl http2;
    server_name api.jouwdomein.nl;
    
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    
    # Backend
    location / {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}

# HTTPS - Admin
server {
    listen 443 ssl http2;
    server_name admin.jouwdomein.nl;
    
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    
    # Admin panel
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # IP whitelist (optional - extra security)
        # allow 1.2.3.4;  # Your office IP
        # deny all;
    }
}
```

---

## ✅ FINAL RECOMMENDATION: **PM2 + NGINX + GITHUB ACTIONS**

**Why:**
1. ✅ Simple setup - team knows Node.js
2. ✅ Fast deploys - no Docker rebuild time
3. ✅ Resource efficient - no container overhead
4. ✅ Auto-scaling - PM2 cluster mode
5. ✅ Zero downtime - PM2 graceful reload
6. ✅ Easy debugging - direct access to processes
7. ✅ Proven stack - millions use PM2 in production

**Verdict:** Perfect voor deze setup! Docker zou overengineering zijn.

---

## 📞 NEXT STEPS

1. **Server Engineer:** Setup server (1 hour)
2. **Security Engineer:** Harden & SSL (1 hour)
3. **DevOps Engineer:** Deploy app (2 hours)
4. **Frontend Engineer:** Configure Nginx (1 hour)

**Total setup time:** ~5 hours voor complete production deployment

---

**Questions? Let's deploy! 🚀**
