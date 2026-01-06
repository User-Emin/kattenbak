# 🚀 CATSUPPLY.NL - COMPLETE SCRATCH DEPLOYMENT
## 6 EXPERTS - UNANIMOUS APPROVAL - MAXIMUM SECURITY

**Datum:** 5 januari 2026  
**Server:** 185.224.139.74 (Fresh OS Install)  
**Doel:** Enterprise-grade webshop deployment vanaf scratch

---

## 📋 DEPLOYMENT FASES (10 STAPPEN)

### ✅ FASE 1: SERVER ASSESSMENT
- [ ] OS verificatie (CentOS/Rocky/AlmaLinux)
- [ ] Resources check (CPU, RAM, Disk)
- [ ] Network connectivity
- [ ] Root access verification
- **Experts:** Infrastructure, Security

### 🔒 FASE 2: SECURITY HARDENING
- [ ] Firewall configuratie (firewalld/ufw)
- [ ] SSH hardening (key-only, disable password)
- [ ] fail2ban installatie (brute-force protection)
- [ ] Automatic security updates
- [ ] SELinux/AppArmor configuratie
- **Experts:** Security, Infrastructure, Penetration Tester

### 📦 FASE 3: DEPENDENCIES INSTALLATION
- [ ] Node.js 22 LTS (via NodeSource)
- [ ] PostgreSQL 16 (officiële repo)
- [ ] Redis/Valkey (latest stable)
- [ ] Nginx (latest stable)
- [ ] PM2 (global npm package)
- [ ] Git, build-essential, certbot
- **Experts:** DevOps, Backend, Infrastructure

### 🗄️ FASE 4: DATABASE SETUP
- [ ] PostgreSQL initialisatie
- [ ] Database user creatie (kattenbak_user)
- [ ] Database creatie (kattenbak_prod)
- [ ] Password authentication configuratie
- [ ] SSL connection enforcement
- [ ] Prisma migrations run
- [ ] Seed data import
- **Experts:** Database Architect, Backend, Security

### 📁 FASE 5: REPOSITORY SETUP
- [ ] SSH key voor GitHub deploy
- [ ] Clone repository naar /var/www/kattenbak
- [ ] .env files creatie (backend, frontend, admin)
- [ ] Permissions correctie
- [ ] Git submodule init (indien van toepassing)
- **Experts:** DevOps, Backend

### 🔨 FASE 6: APPLICATION BUILD
- [ ] Backend: npm install + TypeScript compile + tsc-alias
- [ ] Frontend: npm install + Next.js standalone build
- [ ] Admin: npm install + Next.js standalone build
- [ ] Build verification (no errors)
- [ ] Static assets verification
- **Experts:** Backend Lead, Frontend Lead, Code Quality

### 🌐 FASE 7: NGINX + SSL
- [ ] Nginx configuratie (reverse proxy)
- [ ] Upstream definitions (3101, 3102, 3001)
- [ ] HTTP → HTTPS redirect
- [ ] Let's Encrypt SSL certificate via Certbot
- [ ] SSL Labs A+ rating verification
- [ ] Security headers configuratie
- **Experts:** Infrastructure, Security, DevOps

### ⚙️ FASE 8: PM2 PROCESS MANAGEMENT
- [ ] PM2 startup configuratie
- [ ] ecosystem.config.js verificatie
- [ ] Backend start + health check
- [ ] Frontend start + health check
- [ ] Admin start + health check
- [ ] PM2 save + auto-restart configuratie
- [ ] Log rotation setup
- **Experts:** DevOps, Backend, Frontend

### 🔍 FASE 9: END-TO-END VERIFICATION
- [ ] Backend API: /api/v1/health
- [ ] Backend API: /api/v1/products
- [ ] Frontend: Homepage loading
- [ ] Frontend: Product pages
- [ ] Frontend: Navigation & routing
- [ ] Admin panel: Login toegankelijk
- [ ] Database queries werken
- [ ] SSL certificate verified
- [ ] Security headers present
- [ ] Performance metrics (response time <500ms)
- **Experts:** QA, Backend, Frontend, Security

### 🏆 FASE 10: FINAL SECURITY AUDIT
- [ ] OWASP Top 10 compliance check
- [ ] Penetration test simulation
- [ ] Secret scanning (TruffleHog)
- [ ] Dependency audit (npm audit)
- [ ] Port scan verification (only 80, 443, 22 open)
- [ ] SSL/TLS configuration test
- [ ] Rate limiting verification
- [ ] Encryption verification (TLS 1.3, AES-256-GCM)
- [ ] Expert unanimous sign-off
- **Experts:** ALL 6 (Security, Penetration Tester, DevOps, Backend, Frontend, Infrastructure)

---

## 🛡️ EXPERT TEAM ROLES

### 1. **Expert Security Specialist**
- Verantwoordelijk voor: Encryption, authentication, security headers, secret management
- Sign-off vereist op: Fase 2, 4, 7, 9, 10

### 2. **Expert Penetration Tester**
- Verantwoordelijk voor: OWASP compliance, injection prevention, attack surface analysis
- Sign-off vereist op: Fase 2, 9, 10

### 3. **Expert Infrastructure Engineer**
- Verantwoordelijk voor: Server setup, Nginx, firewall, system services
- Sign-off vereist op: Fase 1, 2, 3, 7, 9

### 4. **Expert Backend Lead**
- Verantwoordelijk voor: Backend build, database, API endpoints, TypeScript
- Sign-off vereist op: Fase 3, 4, 5, 6, 8, 9

### 5. **Expert Frontend Lead**
- Verantwoordelijk voor: Frontend/Admin build, Next.js standalone, UI/UX
- Sign-off vereist op: Fase 6, 8, 9

### 6. **Expert DevOps Engineer**
- Verantwoordelijk voor: CI/CD, PM2, deployment automation, monitoring
- Sign-off vereist op: Fase 3, 5, 7, 8, 9, 10

---

## 📊 SUCCESS CRITERIA

### Minimum Requirements (ALL MUST PASS):
- ✅ HTTPS werkt met Let's Encrypt certificate (A+ rating)
- ✅ Backend API responds <500ms op /health
- ✅ Frontend homepage laadt volledig in <2s
- ✅ Database queries succesvol (product data zichtbaar)
- ✅ PM2 processes online (0 crashes in 10 min)
- ✅ Security headers present (HSTS, CSP, X-Frame-Options, etc.)
- ✅ No critical npm vulnerabilities
- ✅ Firewall actief (alleen 22, 80, 443 open)
- ✅ fail2ban actief (SSH brute-force protection)
- ✅ Automatic updates configured

### Performance Targets:
- API response time: <200ms (p95)
- Frontend TTFB: <500ms
- Database query time: <100ms
- Memory usage: <1GB totaal
- CPU idle: >80%

### Security Targets:
- SSL Labs: A+ rating
- SecurityHeaders.com: A rating
- Mozilla Observatory: A+ rating
- npm audit: 0 critical, 0 high
- Port scan: Only 22, 80, 443 visible

---

## 🚀 DEPLOYMENT COMMANDS (REFERENCE)

### Server Hardening
```bash
# Firewall
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# fail2ban
dnf install -y fail2ban
systemctl enable fail2ban --now
```

### Dependencies
```bash
# Node.js 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs

# PostgreSQL 16
dnf install -y postgresql16-server postgresql16-contrib
/usr/pgsql-16/bin/postgresql-16-setup initdb
systemctl enable postgresql-16 --now

# Redis/Valkey
dnf install -y valkey
systemctl enable valkey --now

# Nginx
dnf install -y nginx
systemctl enable nginx --now
```

### Application Build
```bash
cd /var/www/kattenbak

# Backend
cd backend
npm ci --production=false
npx tsc -p tsconfig.json
npx tsc-alias -p tsconfig.json

# Frontend
cd ../frontend
npm ci --production=false
npm run build

# Admin
cd ../admin-next
npm ci --production=false
npm run build
```

### PM2
```bash
npm install -g pm2
cd /var/www/kattenbak
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### SSL Certificate
```bash
dnf install -y certbot python3-certbot-nginx
certbot --nginx -d catsupply.nl -d www.catsupply.nl --non-interactive --agree-tos -m admin@catsupply.nl
```

---

## 📞 ROLLBACK PLAN

In geval van deployment failure:
1. Stop PM2 processes: `pm2 stop all`
2. Restore database backup (indien gemaakt)
3. Revert Nginx config: `cp /etc/nginx/conf.d/catsupply.conf.backup /etc/nginx/conf.d/catsupply.conf`
4. Restart services: `systemctl restart nginx`
5. Investigate logs: `pm2 logs`, `journalctl -u nginx`, `/var/log/postgresql/`

---

## ✅ FINAL SIGN-OFF

Elke fase moet unanime goedkeuring krijgen van relevante experts voordat we doorgaan naar de volgende fase.

**Deployment Start:** 5 januari 2026  
**Expected Duration:** 60-90 minuten  
**Zero Downtime Required:** Ja (na eerste deploy)

---

**DEPLOYMENT STATUS: STARTING...**

