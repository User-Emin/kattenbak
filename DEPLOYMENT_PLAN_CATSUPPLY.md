# 🚀 SECURE DEPLOYMENT PLAN - catsupply.nl

## ⚠️ CURRENT STATUS

```
❌ catsupply.nl - Connection Refused
📍 Server: 185.224.139.54
🔒 Security: Maximum priority
👥 Team: Expert-level deployment required
```

---

## 🎯 DEPLOYMENT STRATEGY - TEAM APPROACH

### **Team Roles & Responsibilities:**

#### **1. Infrastructure Expert (DevOps)**
**Verantwoordelijk voor:**
- ✅ Server hardening & security
- ✅ Firewall (UFW) configuratie
- ✅ SSH key authentication (disable password)
- ✅ Fail2ban setup (brute force protection)
- ✅ System updates & patches
- ✅ Monitoring & alerting

**Checklist:**
```bash
□ SSH key-only authentication
□ UFW firewall (allow 22, 80, 443)
□ Fail2ban installed & configured
□ Root login disabled
□ Sudo user with limited privileges
□ System packages updated
□ Automatic security updates enabled
□ Log monitoring (fail2ban, auth.log)
```

---

#### **2. Network Expert (DNS & SSL)**
**Verantwoordelijk voor:**
- ✅ DNS A-record naar 185.224.139.54
- ✅ Subdomain records (api., admin., www.)
- ✅ SSL certificates (Let's Encrypt)
- ✅ Certificate auto-renewal
- ✅ HTTPS enforcement (redirect HTTP → HTTPS)
- ✅ SSL security headers (HSTS, CSP)

**Checklist:**
```bash
□ DNS A-record: catsupply.nl → 185.224.139.54
□ DNS A-record: www.catsupply.nl → 185.224.139.54
□ DNS A-record: api.catsupply.nl → 185.224.139.54
□ DNS A-record: admin.catsupply.nl → 185.224.139.54
□ SSL cert: certbot --nginx -d catsupply.nl -d www.catsupply.nl
□ SSL cert: certbot --nginx -d api.catsupply.nl
□ SSL cert: certbot --nginx -d admin.catsupply.nl
□ Auto-renewal: certbot renew --dry-run
□ HTTPS redirect configured
□ Security headers: HSTS, X-Frame-Options, CSP
```

---

#### **3. Database Expert (PostgreSQL)**
**Verantwoordelijk voor:**
- ✅ PostgreSQL installation & configuration
- ✅ Production database creation
- ✅ Database user with limited privileges
- ✅ Secure password generation
- ✅ Database backups (automated daily)
- ✅ Connection pooling optimization
- ✅ Performance tuning

**Checklist:**
```bash
□ PostgreSQL 14+ installed
□ Database: kattenbak_prod created
□ User: kattenbak_prod_user (random secure password)
□ Password: Stored in .env only (not in code)
□ Privileges: GRANT only on kattenbak_prod
□ pg_hba.conf: Restrict to localhost
□ Backup script: Daily automated backups
□ Backup retention: 30 days
□ Connection limit: Set max_connections
□ Prisma connection pool: Optimized
```

---

#### **4. Application Expert (Node.js & PM2)**
**Verantwoordelijk voor:**
- ✅ Node.js installation (LTS version)
- ✅ PM2 process manager setup
- ✅ Application builds (backend, frontend, admin)
- ✅ Environment variables (secure .env)
- ✅ PM2 clustering for backend
- ✅ Auto-restart on failure
- ✅ Log rotation
- ✅ Memory limits

**Checklist:**
```bash
□ Node.js 20 LTS installed
□ PM2 installed globally
□ PM2 ecosystem.config.js configured
□ Backend: PM2 cluster mode (4 instances)
□ Frontend: PM2 production build
□ Admin: PM2 production build
□ .env.production: All secrets configured
□ PM2 startup: Auto-start on reboot
□ PM2 logs: Rotated daily
□ Memory limits: Set per process
□ Health checks: PM2 monitoring
```

---

#### **5. Web Server Expert (Nginx)**
**Verantwoordelijk voor:**
- ✅ Nginx installation & optimization
- ✅ Reverse proxy configuration
- ✅ Rate limiting (DDoS protection)
- ✅ Gzip compression
- ✅ Static file caching
- ✅ Security headers
- ✅ Admin IP whitelisting (optional)
- ✅ Load balancing

**Checklist:**
```bash
□ Nginx installed & enabled
□ Server block: catsupply.nl → :3000 (frontend)
□ Server block: api.catsupply.nl → :3101 (backend)
□ Server block: admin.catsupply.nl → :3001 (admin)
□ Rate limiting: 10 req/sec per IP
□ Gzip compression: Enabled
□ Client max body: 10M (file uploads)
□ Security headers: Set
□ Admin whitelist: Optional (your IP only)
□ SSL configured: All domains
□ HTTP → HTTPS redirect: Enforced
```

---

#### **6. Security Expert (Application Security)**
**Verantwoordelijk voor:**
- ✅ JWT secret generation (strong random)
- ✅ Session secret generation
- ✅ API key security (Mollie, MyParcel)
- ✅ CORS configuration (strict)
- ✅ hCaptcha verification
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection
- ✅ Secrets management (never commit .env)

**Checklist:**
```bash
□ JWT_SECRET: 64+ random chars (openssl rand -hex 32)
□ SESSION_SECRET: 64+ random chars
□ MOLLIE_API_KEY: Live key (secure storage)
□ MYPARCEL_API_KEY: Production key
□ HCAPTCHA_SECRET: Server-side only
□ CORS: Only catsupply.nl origin
□ Rate limiting: API endpoints
□ Input validation: All endpoints (Zod)
□ SQL injection: Prisma parameterized queries
□ XSS: React auto-escaping + CSP header
□ CSRF: Token validation for forms
□ .env.production: Never committed to Git
□ Secrets rotation: Every 90 days
```

---

## 🔐 DEPLOYMENT CHECKLIST - SEQUENTIAL STEPS

### **Phase 1: Server Preparation (Infrastructure Expert)**
```bash
# 1. Connect to server
ssh root@185.224.139.54

# 2. Create deploy user
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# 3. Setup SSH key
# (On local machine)
ssh-keygen -t ed25519 -C "deploy@catsupply.nl" -f ~/.ssh/catsupply_deploy
ssh-copy-id -i ~/.ssh/catsupply_deploy.pub deploy@185.224.139.54

# 4. Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
# Set: PermitRootLogin no
sudo systemctl restart sshd

# 5. Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 6. Install fail2ban
sudo yum install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 7. Update system
sudo yum update -y
```

---

### **Phase 2: DNS Configuration (Network Expert)**
```bash
# Configure at your DNS provider (e.g., TransIP, Cloudflare)

# A Records:
catsupply.nl          → 185.224.139.54
www.catsupply.nl      → 185.224.139.54
api.catsupply.nl      → 185.224.139.54
admin.catsupply.nl    → 185.224.139.54

# TTL: 300 (5 minutes for quick updates)

# Verify DNS propagation:
dig catsupply.nl +short
dig api.catsupply.nl +short
dig admin.catsupply.nl +short
```

---

### **Phase 3: Database Setup (Database Expert)**
```bash
# 1. Install PostgreSQL
sudo yum install postgresql14-server postgresql14 -y
sudo postgresql-14-setup initdb
sudo systemctl enable postgresql-14
sudo systemctl start postgresql-14

# 2. Create production database
sudo -u postgres psql <<EOF
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_prod_user WITH ENCRYPTED PASSWORD '$(openssl rand -hex 32)';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_prod_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_prod_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kattenbak_prod_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kattenbak_prod_user;
EOF

# 3. Configure pg_hba.conf (localhost only)
sudo nano /var/lib/pgsql/14/data/pg_hba.conf
# Add: host kattenbak_prod kattenbak_prod_user 127.0.0.1/32 md5

# 4. Restart PostgreSQL
sudo systemctl restart postgresql-14

# 5. Setup backup script
sudo nano /home/deploy/backup-db.sh
```

---

### **Phase 4: Application Setup (Application Expert)**
```bash
# 1. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install nodejs -y

# 2. Install PM2
sudo npm install -g pm2

# 3. Clone repository
cd /home/deploy
git clone https://github.com/User-Emin/kattenbak.git
cd kattenbak

# 4. Create .env.production files
# (Use secure-env-setup.sh script)

# 5. Install dependencies
cd backend && npm ci --production
cd ../frontend && npm ci --production
cd ../admin-next && npm ci --production

# 6. Build applications
cd backend && npm run build
cd ../frontend && npm run build
cd ../admin-next && npm run build

# 7. Run migrations
cd backend && npx prisma migrate deploy

# 8. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### **Phase 5: Nginx Configuration (Web Server Expert)**
```bash
# 1. Install Nginx
sudo yum install nginx -y

# 2. Configure server blocks
sudo nano /etc/nginx/conf.d/catsupply.conf
# (Use nginx-production.conf template)

# 3. Test configuration
sudo nginx -t

# 4. Enable & start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

### **Phase 6: SSL Certificates (Network Expert)**
```bash
# 1. Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# 2. Obtain certificates
sudo certbot --nginx \
  -d catsupply.nl \
  -d www.catsupply.nl \
  --non-interactive \
  --agree-tos \
  -m admin@catsupply.nl

sudo certbot --nginx \
  -d api.catsupply.nl \
  --non-interactive \
  --agree-tos \
  -m admin@catsupply.nl

sudo certbot --nginx \
  -d admin.catsupply.nl \
  --non-interactive \
  --agree-tos \
  -m admin@catsupply.nl

# 3. Test auto-renewal
sudo certbot renew --dry-run

# 4. Setup auto-renewal cron
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet
```

---

### **Phase 7: Security Hardening (Security Expert)**
```bash
# 1. Generate secrets
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# 2. Update .env.production
# (Never commit to Git!)

# 3. Set file permissions
chmod 600 /home/deploy/kattenbak/*/.env.production
chown deploy:deploy /home/deploy/kattenbak/*/.env.production

# 4. Configure CORS
# (In backend/src/index.ts - allow only catsupply.nl)

# 5. Setup log monitoring
sudo nano /etc/fail2ban/jail.local
# Monitor: nginx, ssh, auth

# 6. Enable security headers
# (In Nginx config)
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000";
```

---

## 📊 VERIFICATION CHECKLIST

### **After Deployment:**
```bash
# 1. DNS
✓ dig catsupply.nl → 185.224.139.54

# 2. SSL
✓ curl https://catsupply.nl (200 OK)
✓ curl https://api.catsupply.nl/health (200 OK)
✓ curl https://admin.catsupply.nl (200 OK)

# 3. Services
✓ pm2 status (all running)
✓ sudo systemctl status nginx (active)
✓ sudo systemctl status postgresql-14 (active)

# 4. Security
✓ ssh deploy@185.224.139.54 (key only)
✓ sudo ufw status (active)
✓ sudo fail2ban-client status (running)

# 5. Application
✓ Visit https://catsupply.nl (homepage loads)
✓ Test product pages
✓ Test cart & checkout
✓ Test admin login
✓ Check console (no errors)

# 6. Performance
✓ curl -I https://catsupply.nl (check headers)
✓ Check load time (<2 seconds)
✓ Test API response time (<100ms)
```

---

## 🚨 TROUBLESHOOTING

### **Connection Refused:**
```bash
# Check DNS
dig catsupply.nl

# Check server reachability
ping 185.224.139.54

# Check ports
nmap -p 80,443 185.224.139.54

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check application
pm2 status
pm2 logs
```

### **SSL Issues:**
```bash
# Check certificate
openssl s_client -connect catsupply.nl:443

# Renew certificate
sudo certbot renew --force-renewal

# Check Nginx SSL config
sudo nginx -t
```

### **Application Errors:**
```bash
# Check logs
pm2 logs backend
pm2 logs frontend
tail -f /var/log/nginx/error.log

# Check database
sudo -u postgres psql -d kattenbak_prod -c "SELECT 1"

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

---

## 📝 DEPLOYMENT SCRIPTS NEEDED

### **1. `deploy-to-server.sh`**
- Full automated deployment
- SSH connection
- Git pull
- Build applications
- Run migrations
- PM2 restart
- Nginx reload

### **2. `setup-production-env.sh`**
- Generate secure secrets
- Create .env.production files
- Set correct permissions
- Validate configuration

### **3. `nginx-production.conf`**
- Complete Nginx configuration
- All server blocks
- SSL settings
- Security headers
- Rate limiting

### **4. `ecosystem.config.js`**
- PM2 configuration
- Backend (cluster mode)
- Frontend (production)
- Admin (production)
- Environment variables
- Log rotation

### **5. `backup-database.sh`**
- Daily database backup
- Compressed with timestamp
- Retention policy (30 days)
- Upload to remote storage (optional)

---

## 🎯 IMMEDIATE ACTION REQUIRED

### **Step 1: DNS Configuration (CRITICAL)**
```
⚠️ catsupply.nl currently has NO DNS record
Action: Add A-record → 185.224.139.54
Time: 5-30 minutes for propagation
```

### **Step 2: Server Access**
```
⚠️ SSH key not configured
Action: Setup SSH key authentication
Command: ssh-keygen + ssh-copy-id
```

### **Step 3: Deployment**
```
⚠️ Nothing deployed on server yet
Action: Run automated deployment script
Time: 15-30 minutes
```

---

## ✨ SUCCESS CRITERIA

```
✅ catsupply.nl accessible (HTTPS)
✅ Products load correctly
✅ Cart & checkout functional
✅ Admin panel accessible
✅ API endpoints responding
✅ SSL certificates valid
✅ Security headers set
✅ Firewall active
✅ Monitoring enabled
✅ Backups configured
✅ No errors in console
✅ Load time <2 seconds
```

---

## 🔒 SECURITY SUMMARY

**Infrastructure:**
- ✅ SSH key-only authentication
- ✅ UFW firewall (ports 22, 80, 443)
- ✅ Fail2ban (brute force protection)
- ✅ Root login disabled
- ✅ System updates automated

**Network:**
- ✅ HTTPS enforced (all domains)
- ✅ SSL certificates (Let's Encrypt)
- ✅ Auto-renewal configured
- ✅ Security headers (HSTS, CSP, etc.)

**Application:**
- ✅ Environment secrets (strong random)
- ✅ CORS restricted (catsupply.nl only)
- ✅ Rate limiting (API + Nginx)
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React + CSP)

**Database:**
- ✅ User with limited privileges
- ✅ Localhost-only connections
- ✅ Secure password (64+ chars)
- ✅ Daily automated backups
- ✅ Connection pooling optimized

**Monitoring:**
- ✅ PM2 monitoring (CPU, memory)
- ✅ Log rotation configured
- ✅ Fail2ban alerts
- ✅ SSL expiry monitoring

---

## 👥 TEAM COORDINATION

**Communication:**
- Daily standups (progress check)
- Shared documentation (this file)
- Issue tracking (GitHub Issues)
- Emergency contacts (phone/email)

**Handoffs:**
- Infrastructure → Network (server ready → DNS setup)
- Network → Database (SSL ready → DB setup)
- Database → Application (DB ready → app deploy)
- Application → Web Server (apps built → Nginx config)
- Web Server → Security (Nginx ready → hardening)

**Success Metrics:**
- Each phase: ✅ Checklist complete
- Each expert: 📋 Documentation updated
- Final: 🎉 Full site accessible & secure

---

**Created by:** Kattenbak Development Team
**Date:** December 10, 2025
**Version:** 1.0
**Status:** READY FOR DEPLOYMENT
