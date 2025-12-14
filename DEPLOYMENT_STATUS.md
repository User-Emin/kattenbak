# 🚀 COMPLETE DEPLOYMENT INSTRUCTIES - catsupply.nl

**Status:** Lokaal volledig getest ✅  
**Server:** 185.224.139.54  
**Datum:** $(date)

## ⚠️ SSH ACCESS VEREIST

De deployment is **volledig klaar**, maar we hebben SSH access nodig naar de server.

### OPTIE 1: SSH Key Installeren (AANBEVOLEN) 🔑

```bash
# 1. Toon je public key
cat ~/.ssh/kattenbak_deploy.pub

# 2. Kopieer de output (begint met "ssh-ed25519 ...")

# 3. Log in op de server met je huidige credentials
#    (via hosting control panel, of bestaand account)

# 4. Voeg de key toe:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_JE_PUBLIC_KEY_HIER" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 5. Test de connectie:
ssh -i ~/.ssh/kattenbak_deploy -p 22 deployer@185.224.139.54
```

### OPTIE 2: Root Access (Tijdelijk) 🔓

Als je root wachtwoord hebt:

```bash
# Login als root en voer deployment handmatig uit
ssh root@185.224.139.54

# Op de server:
curl -o- https://raw.githubusercontent.com/User-Emin/kattenbak/main/server-setup.sh | bash
```

---

## 📋 WAT IS ER KLAAR?

### ✅ Lokaal Volledig Getest
- Backend: http://localhost:3101 ✅
- Frontend: http://localhost:3102 ✅  
- Admin: http://localhost:3001 ✅
- Database: PostgreSQL ✅
- API endpoints: Werkend ✅

### ✅ Production Environment
- **backend/.env.production** → Gegenereerd met sterke credentials
- **Credentials bestand:** `QUICK_DEPLOY_CREDENTIALS.txt`
- Test credentials voor Mollie/Email (update later naar production keys)

### ✅ Deployment Script
- **deploy-catsupply-complete.sh** → Complete automated deployment:
  - ✅ Server setup (Node.js, PostgreSQL, Nginx, PM2, Certbot)
  - ✅ Application deployment
  - ✅ SSL certificates (Let's Encrypt)
  - ✅ Security hardening (firewall, SSH, permissions)
  - ✅ PM2 process management met auto-restart
  - ✅ Nginx reverse proxy configuratie

---

## 🎯 DEPLOYMENT STAPPEN

### ZODRA SSH WERKT:

```bash
# 1. Test SSH connectie
ssh -i ~/.ssh/kattenbak_deploy -p 22 deployer@185.224.139.54

# 2. Run deployment (volledig geautomatiseerd!)
cd /Users/emin/kattenbak
./deploy-catsupply-complete.sh

# Het script doet ALLES automatisch:
# ✓ Installeert alle dependencies
# ✓ Setup database
# ✓ Build applicaties
# ✓ Deploy naar server
# ✓ Configureer Nginx
# ✓ Setup SSL (Let's Encrypt)
# ✓ Configure firewall
# ✓ Start met PM2
```

### Script Fases:

1. **PHASE 1:** Lokale verificatie ✅ (DONE)
2. **PHASE 2:** Server connectiviteit (needs SSH)
3. **PHASE 3:** Server setup (automated)
4. **PHASE 4:** Deploy application (automated)
5. **PHASE 5:** Nginx configuration (automated)
6. **PHASE 6:** PM2 process management (automated)
7. **PHASE 7:** SSL certificates (automated)
8. **PHASE 8:** Security hardening (automated)
9. **PHASE 9:** Verification & testing (automated)

---

## 🔐 CREDENTIALS

### Admin Panel
```
URL:      https://admin.catsupply.nl
Username: admin
Password: [zie QUICK_DEPLOY_CREDENTIALS.txt]
```

### Database (op server)
```
Host:     localhost
Port:     5432
Database: kattenbak_prod
User:     kattenbak_user
Password: [zie QUICK_DEPLOY_CREDENTIALS.txt]
```

### SSH
```
Server:   185.224.139.54
Port:     22 (of 2222 na security hardening)
User:     deployer (of root)
Key:      ~/.ssh/kattenbak_deploy
```

---

## 🌐 VERWACHTE RESULTAAT

Na succesvolle deployment:

```
✅ https://catsupply.nl          → Frontend (Next.js)
✅ https://api.catsupply.nl      → Backend API
✅ https://admin.catsupply.nl    → Admin Panel
✅ SSL certificates              → Let's Encrypt (auto-renew)
✅ Firewall                      → UFW/firewalld configured
✅ Process management            → PM2 met auto-restart
✅ Database                      → PostgreSQL met migrations
```

---

## 🛠️ HANDMATIGE DEPLOYMENT (Als SSH Issues Blijven)

### Server Setup Script

Save dit als `server-manual-setup.sh` op de server:

```bash
#!/bin/bash
set -e

# Update system
sudo dnf update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Install PostgreSQL
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# Create database
sudo -u postgres psql << 'EOF'
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD 'lsavaoC57Cs05N8stXAujrGtDGEvZfxC';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
EOF

# Install Nginx & Certbot
sudo dnf install -y nginx certbot python3-certbot-nginx

# Install PM2
sudo npm install -g pm2

# Clone repository
mkdir -p /var/www
cd /var/www
git clone https://github.com/User-Emin/kattenbak.git
cd kattenbak

# Install dependencies
cd backend && npm install --production && npx prisma generate && cd ..
cd frontend && npm install && npm run build && cd ..
cd admin-next && npm install && npm run build && cd ..

# Setup environment
# Upload backend/.env.production via SFTP

# Run migrations
cd backend
npx prisma migrate deploy
cd ..

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
sudo cp nginx-config.conf /etc/nginx/conf.d/catsupply.conf
sudo nginx -t
sudo systemctl enable --now nginx

# SSL
sudo certbot --nginx -d catsupply.nl -d www.catsupply.nl -d api.catsupply.nl -d admin.catsupply.nl

echo "✅ Deployment complete!"
```

---

## 📞 NEXT STEPS

### IMMEDIATE:
1. **Setup SSH access** → Installeer ~/.ssh/kattenbak_deploy.pub op server
2. **Test SSH:** `ssh -i ~/.ssh/kattenbak_deploy deployer@185.224.139.54`
3. **Run deployment:** `./deploy-catsupply-complete.sh`

### AFTER DEPLOYMENT:
1. Update Mollie API key naar **LIVE** key in backend/.env.production
2. Setup production SMTP credentials
3. Configure hCaptcha production keys
4. Test volledige checkout flow
5. Setup monitoring (PM2, Nginx logs)

---

## 🔧 TROUBLESHOOTING

### SSH Connection Refused (Port 2222)
→ Server gebruikt waarschijnlijk standaard port 22  
→ Try: `ssh deployer@185.224.139.54` (zonder -p 2222)

### Permission Denied (publickey)
→ SSH key niet geïnstalleerd op server  
→ Upload ~/.ssh/kattenbak_deploy.pub naar server  
→ Of gebruik wachtwoord auth tijdelijk

### DNS Not Resolving
→ Check DNS records bij provider:
```
A    catsupply.nl       → 185.224.139.54
A    www.catsupply.nl   → 185.224.139.54
A    api.catsupply.nl   → 185.224.139.54
A    admin.catsupply.nl → 185.224.139.54
```

### Application Not Starting
→ Check PM2 logs: `pm2 logs`  
→ Check Nginx: `sudo nginx -t`  
→ Check firewall: `sudo firewall-cmd --list-all`

---

## 📚 AVAILABLE SCRIPTS

```bash
# Environment setup
./setup-production-env.sh        # Interactive wizard
./quick-setup-env.sh             # Quick auto-generate

# Deployment
./deploy-catsupply-complete.sh   # Complete automated deployment

# Local testing
./START-SERVERS.sh               # Start all local services
```

---

## ✅ STATUS

- [x] Lokale servers draaien
- [x] Lokale API's getest
- [x] Production environment gegenereerd
- [x] Deployment script klaar
- [x] Credentials beveiligd opgeslagen
- [ ] SSH access naar server **← BLOCKER**
- [ ] Deployment uitgevoerd
- [ ] SSL geconfigureerd
- [ ] Production live

**Volgende stap:** Setup SSH access en run `./deploy-catsupply-complete.sh` 🚀

---

**Generated:** $(date)  
**Location:** /Users/emin/kattenbak/DEPLOYMENT_STATUS.md
