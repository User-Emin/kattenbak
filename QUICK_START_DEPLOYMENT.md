# 🚀 DIRECT DEPLOYMENT INSTRUCTIES

## ⚡ SNELSTE WEG NAAR LIVE

### OPTIE 1: SSH Key Upload + Automated (BEST) 🔑

```bash
# 1. Toon je public key
cat ~/.ssh/kattenbak_deploy.pub

# Output:
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIspvSUPUZfCMBv/vgKn+g1vZNCKf063osxpErBYgSKh deploy@kattenbak

# 2. Log in op server via je hosting control panel

# 3. Voeg key toe (kies één methode):

## Als deployer user:
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIspvSUPUZfCMBv/vgKn+g1vZNCKf063osxpErBYgSKh deploy@kattenbak" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

## Als root user (en deployer aanmaken):
useradd -m -s /bin/bash deployer
mkdir -p /home/deployer/.ssh && chmod 700 /home/deployer/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIspvSUPUZfCMBv/vgKn+g1vZNCKf063osxpErBYgSKh deploy@kattenbak" > /home/deployer/.ssh/authorized_keys
chown -R deployer:deployer /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys

# 4. Test SSH (op je lokale machine):
ssh -i ~/.ssh/kattenbak_deploy deployer@185.224.139.54

# 5. Als SSH werkt, deploy volledig automatisch:
cd /Users/emin/kattenbak
./deploy-catsupply-complete.sh
```

---

### OPTIE 2: Direct Server Script (MANUAL) 📋

**Als SSH niet direct werkt, run dit DIRECT op de server:**

```bash
# 1. Log in op server via hosting control panel

# 2. Download en run setup script:
curl -o setup.sh https://raw.githubusercontent.com/User-Emin/kattenbak/main/server-direct-setup.sh
chmod +x setup.sh
./setup.sh

# Of kopieer het script handmatig:
# - Open: /Users/emin/kattenbak/server-direct-setup.sh
# - Kopieer complete inhoud
# - Plak op server in nieuw bestand
# - Run: bash setup.sh
```

**Dit script doet ALLES:**
- ✅ Installeert Node.js, PostgreSQL, Nginx, PM2, Certbot
- ✅ Clone repository van GitHub
- ✅ Setup database met je credentials
- ✅ Build alle applicaties
- ✅ Configureer Nginx
- ✅ Start met PM2
- ✅ Configure firewall

**Duurt:** ~10-15 minuten

---

## 🔐 CREDENTIALS

### Database (op server):
```
Host:     localhost:5432
Database: kattenbak_prod
User:     kattenbak_user
Password: lsavaoC57Cs05N8stXAujrGtDGEvZfxC
```

### Admin Panel:
```
URL:      https://admin.catsupply.nl
Username: admin
Password: XjMBrpkF3dnP4QsAImFPYvu1iXmJpYJ0
```

---

## 🔒 NA DEPLOYMENT: SSL SETUP

**Run dit op de server om HTTPS in te schakelen:**

```bash
sudo certbot --nginx \
  -d catsupply.nl \
  -d www.catsupply.nl \
  -d api.catsupply.nl \
  -d admin.catsupply.nl
```

**Je email voor SSL:**
```
# Certbot vraagt om email voor notifications
# Gebruik je eigen email
```

**Auto-renewal is automatisch geconfigureerd!** ✅

---

## 📊 VERIFY DEPLOYMENT

```bash
# Check PM2 status
pm2 status
pm2 logs

# Test endpoints
curl http://localhost:3101/health
curl http://localhost:3102
curl http://localhost:3001

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo firewall-cmd --list-all
```

---

## 🎯 EXPECTED RESULT

```
✅ http://catsupply.nl          → Frontend
✅ http://api.catsupply.nl      → Backend API
✅ http://admin.catsupply.nl    → Admin Panel

After SSL:
✅ https://catsupply.nl         → Frontend (SECURE)
✅ https://api.catsupply.nl     → Backend API (SECURE)
✅ https://admin.catsupply.nl   → Admin Panel (SECURE)
```

---

## ⚠️ BELANGRIJKE UPDATES

**Na deployment, update deze credentials in `/var/www/kattenbak/backend/.env`:**

```bash
# Edit environment
nano /var/www/kattenbak/backend/.env

# Update:
MOLLIE_API_KEY="live_XXXXXXXX"    # Get from Mollie dashboard
SMTP_PASS="real_password"         # Real email credentials
HCAPTCHA_SECRET="real_secret"     # From hCaptcha dashboard
MYPARCEL_API_KEY="real_key"       # From MyParcel

# Restart
pm2 restart all
```

---

## 🔧 TROUBLESHOOTING

### Backend niet starting
```bash
pm2 logs backend
# Check database connection in logs
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection failed
```bash
# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"

# Reset password if needed
sudo -u postgres psql
ALTER USER kattenbak_user WITH PASSWORD 'lsavaoC57Cs05N8stXAujrGtDGEvZfxC';
\q
```

### Firewall blocking
```bash
# Check firewall
sudo firewall-cmd --list-all

# Open ports if needed
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## ✅ CHECKLIST

- [ ] SSH key uploaded OF server script running
- [ ] Applications started (pm2 status shows 3 apps)
- [ ] Nginx configured (sudo nginx -t OK)
- [ ] Firewall allows HTTP/HTTPS
- [ ] Sites accessible on HTTP
- [ ] SSL certificates installed (certbot)
- [ ] Sites accessible on HTTPS
- [ ] Admin login works
- [ ] Products visible on frontend
- [ ] API responding
- [ ] Update Mollie to LIVE key
- [ ] Update SMTP credentials
- [ ] Test checkout flow

---

## 🚀 QUICK START

**Snelste route naar LIVE:**

1. **Copy je SSH public key** (zie boven)
2. **Plak op server** in ~/.ssh/authorized_keys
3. **Run:** `./deploy-catsupply-complete.sh`
4. **Wait 10 minutes** → DONE!
5. **Run SSL:** `sudo certbot --nginx -d ...`
6. **LIVE!** 🎉

**Of als SSH issues:**

1. **Log in op server**
2. **Run:** `curl -o s.sh https://raw.githubusercontent.com/.../server-direct-setup.sh && bash s.sh`
3. **Wait 10 minutes** → DONE!
4. **Run SSL:** `sudo certbot --nginx -d ...`
5. **LIVE!** 🎉

---

**ETA tot LIVE:** ~15-20 minuten vanaf nu! ⏱️
