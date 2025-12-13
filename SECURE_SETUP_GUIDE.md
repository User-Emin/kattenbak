# 🔐 SECURE SERVER SETUP - COMPLETE GUIDE

## 📋 OVERVIEW

Deze guide helpt je om:
1. **Lokaal** SSH keys te genereren
2. **Server** volledig secure op te zetten
3. **Makkelijk** in te loggen zonder password

---

## 🚀 STEP 1: GENEREER SSH KEYS (LOKAAL)

**Run dit op je lokale machine:**

```bash
cd /Users/emin/kattenbak
./generate-ssh-keys.sh
```

Dit script:
- ✅ Genereert een veilige ED25519 SSH key
- ✅ Configureert je SSH config
- ✅ Maakt een server setup script

**Je krijgt:**
- Private key: `~/.ssh/kattenbak_deploy`
- Public key: `~/.ssh/kattenbak_deploy.pub`
- SSH alias: `kattenbak-prod`

---

## 🖥️ STEP 2: EERSTE KEER INLOGGEN (MET PASSWORD)

```bash
ssh root@185.224.139.54
# Password: Pursangue66@
```

---

## ⚙️ STEP 3: SERVER SETUP SCRIPT

**Op de server, run:**

```bash
# Download setup script
curl -o setup.sh https://raw.githubusercontent.com/User-Emin/kattenbak/main/generate-ssh-keys.sh

# Of manual paste:
nano setup.sh
# Paste de inhoud van ~/setup-kattenbak-server.sh
```

**Vervang `PASTE_PUBLIC_KEY_HERE` met je public key:**

```bash
# Lokaal, copy je public key:
cat ~/.ssh/kattenbak_deploy.pub

# Op server, edit script:
nano setup.sh
# Vervang PASTE_PUBLIC_KEY_HERE met de public key
```

**Run het script:**

```bash
chmod +x setup.sh
./setup.sh
```

---

## ✅ STEP 4: TEST SSH KEY LOGIN

**Exit de server en test key-based login:**

```bash
exit

# Test nieuwe verbinding (GEEN PASSWORD!)
ssh kattenbak-prod
```

Als het werkt zie je:
```
Welcome to Ubuntu...
deployer@server:~$
```

---

## 🔐 STEP 5: SSH HARDENING (EXTRA SECURE)

**Op de server als deployer:**

```bash
# SSH hardening
sudo tee -a /etc/ssh/sshd_config << EOF

# Kattenbak Security Settings
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 20
AllowUsers deployer
EOF

# Restart SSH
sudo systemctl restart sshd
```

**Update je lokale SSH config:**

```bash
# Edit ~/.ssh/config
nano ~/.ssh/config

# Update Port van 22 naar 2222:
Host kattenbak-prod
    HostName 185.224.139.54
    User deployer
    Port 2222  # ← Change this!
    IdentityFile ~/.ssh/kattenbak_deploy
```

**Test nieuwe port:**

```bash
ssh kattenbak-prod
# Should work on port 2222!
```

---

## 🛡️ STEP 6: FAIL2BAN SETUP

**Op de server:**

```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Configure
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

# Start Fail2ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

---

## 📦 STEP 7: CLONE REPOSITORY

```bash
# On server
sudo mkdir -p /var/www/kattenbak
sudo chown deployer:deployer /var/www/kattenbak

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "deployer@kattenbak" -f ~/.ssh/github_deploy -N ""

# Display public key
cat ~/.ssh/github_deploy.pub
# Add this to GitHub: Settings > SSH keys > New SSH key

# Configure git
git config --global user.name "Kattenbak Deployer"
git config --global user.email "deploy@kattenbak.nl"

# Clone repo
cd /var/www/kattenbak
git clone git@github.com:User-Emin/kattenbak.git .
```

---

## 🗄️ STEP 8: DATABASE SETUP

```bash
# PostgreSQL
sudo -u postgres psql << EOF
CREATE DATABASE kattenbak_prod;
CREATE USER kattenbak_user WITH ENCRYPTED PASSWORD 'GENERATE_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE kattenbak_prod TO kattenbak_user;
\c kattenbak_prod
GRANT ALL ON SCHEMA public TO kattenbak_user;
EOF

# Generate strong password
openssl rand -base64 32
# Save this password!
```

---

## ⚙️ STEP 9: ENVIRONMENT FILES

```bash
# Backend
cd /var/www/kattenbak/backend
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**IMPORTANT:** Update deze values:
```bash
NODE_ENV=production
PORT=3101
DATABASE_URL=postgresql://kattenbak_user:YOUR_PASSWORD@localhost:5432/kattenbak_prod
JWT_SECRET=$(openssl rand -base64 64)
MOLLIE_API_KEY=live_YOUR_LIVE_KEY
```

```bash
# Frontend
cd /var/www/kattenbak/frontend
cp .env.development .env.local

nano .env.local
```

```bash
NEXT_PUBLIC_API_URL=https://api.jouwdomein.nl/api/v1
NEXT_PUBLIC_SITE_URL=https://jouwdomein.nl
```

**Secure permissions:**
```bash
chmod 600 /var/www/kattenbak/backend/.env.production
chmod 600 /var/www/kattenbak/frontend/.env.local
```

---

## 🚀 STEP 10: BUILD & START

```bash
cd /var/www/kattenbak

# Backend
cd backend
npm install --production
npm run build
cd ..

# Frontend  
cd frontend
npm install --production
npm run build
cd ..

# Admin
cd admin
npm install --production
npm run build
cd ..

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Run the command it gives you
```

---

## 🌐 STEP 11: NGINX CONFIGURATION

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/kattenbak
```

**Paste this (temporary, before SSL):**

```nginx
server {
    listen 80;
    server_name jouwdomein.nl www.jouwdomein.nl;
    
    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.jouwdomein.nl;
    
    location / {
        proxy_pass http://localhost:3101;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name admin.jouwdomein.nl;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
    }
}
```

**Enable & test:**

```bash
sudo ln -s /etc/nginx/sites-available/kattenbak /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 STEP 12: SSL CERTIFICATES

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx \
  -d jouwdomein.nl \
  -d www.jouwdomein.nl \
  -d api.jouwdomein.nl \
  -d admin.jouwdomein.nl

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ STEP 13: VERIFY EVERYTHING

```bash
# Check PM2
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# Check Redis
redis-cli ping

# Test endpoints
curl http://localhost:3101/health
curl http://localhost:3100
curl http://localhost:3002

# Test external
curl https://api.jouwdomein.nl/health
curl https://jouwdomein.nl
```

---

## 🎯 QUICK REFERENCE

### Connect to Server:
```bash
ssh kattenbak-prod
```

### Deploy New Version:
```bash
ssh kattenbak-prod
cd /var/www/kattenbak
./deploy-production.sh
```

### View Logs:
```bash
pm2 logs
pm2 logs backend
pm2 logs frontend
```

### Restart Services:
```bash
pm2 restart all
pm2 restart backend
pm2 restart frontend
```

### Check Status:
```bash
pm2 status
pm2 monit
```

---

## 🆘 TROUBLESHOOTING

### Can't connect with SSH key:
```bash
# Check permissions
ls -la ~/.ssh/kattenbak_deploy
# Should be -rw-------

# Fix if needed
chmod 600 ~/.ssh/kattenbak_deploy
```

### PM2 service not starting:
```bash
pm2 logs <service-name>
pm2 describe <service-name>
```

### Nginx error:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection error:
```bash
# Test connection
PGPASSWORD=your_password psql -U kattenbak_user -h localhost -d kattenbak_prod -c "SELECT 1"
```

---

## 🔐 SECURITY CHECKLIST

- ✅ SSH key-only authentication
- ✅ Non-standard SSH port (2222)
- ✅ Firewall (UFW) active
- ✅ Fail2ban protecting SSH
- ✅ Root login disabled
- ✅ SSL/TLS certificates
- ✅ Environment files secured (chmod 600)
- ✅ Strong database password
- ✅ JWT secret generated
- ✅ CORS configured
- ✅ Rate limiting active

---

**SERVER IS FULLY SECURE & READY! 🚀**
