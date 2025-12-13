# 🖥️ SERVER SETUP GUIDE
**Server: 185.224.139.54**
**Password: Pursangue66@**

---

## 📋 STEP-BY-STEP SETUP (COPY-PASTE READY)

### 1️⃣ **INITIAL SERVER ACCESS**

```bash
# SSH into server
ssh root@185.224.139.54
# Password: Pursangue66@

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

---

### 2️⃣ **INSTALL NODE.JS 22 (LTS)**

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x
```

---

### 3️⃣ **INSTALL PM2 (PROCESS MANAGER)**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup
pm2 startup
# Follow the command it gives you (copy-paste the sudo command)

# Verify
pm2 --version
```

---

### 4️⃣ **INSTALL NGINX (WEB SERVER)**

```bash
# Install Nginx
sudo apt install -y nginx

# Start & enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo nginx -t
curl http://localhost  # Should show "Welcome to nginx"
```

---

### 5️⃣ **INSTALL REDIS (OPTIONAL - FOR CACHING)**

```bash
# Install Redis
sudo apt install -y redis-server

# Start & enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return "PONG"
```

---

### 6️⃣ **CREATE DEPLOY USER (SECURITY)**

```bash
# Create deployer user
sudo useradd -m -s /bin/bash deployer

# Set password (use strong password!)
sudo passwd deployer

# Add to sudo group
sudo usermod -aG sudo deployer

# Create web directory
sudo mkdir -p /var/www/kattenbak
sudo chown -R deployer:deployer /var/www/kattenbak

# Switch to deployer
su - deployer
```

---

### 7️⃣ **SETUP SSH KEYS (FOR GITHUB)**

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "deployer@kattenbak"
# Press Enter for all prompts (no passphrase)

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Add this to GitHub: Settings > SSH and GPG keys > New SSH key
```

---

### 8️⃣ **CLONE REPOSITORY**

```bash
# Go to web directory
cd /var/www/kattenbak

# Clone repo
git clone git@github.com:User-Emin/kattenbak.git .

# Verify
ls -la  # Should show backend, frontend, admin folders
```

---

### 9️⃣ **SETUP ENVIRONMENT FILES**

```bash
# Backend
cd /var/www/kattenbak/backend
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Production .env.production:**
```bash
NODE_ENV=production

# Server
PORT=3101
BACKEND_URL=https://api.jouwdomein.nl

# Database (setup later)
DATABASE_URL=postgresql://user:password@localhost:5432/kattenbak_prod

# JWT (generate strong secret!)
JWT_SECRET=your-super-secret-key-here-min-32-chars
JWT_EXPIRES_IN=7d

# Frontend
NEXT_PUBLIC_API_URL=https://api.jouwdomein.nl/api/v1
NEXT_PUBLIC_SITE_URL=https://jouwdomein.nl
NEXT_PUBLIC_SITE_NAME=Kattenbak

# Mollie (LIVE KEY!)
MOLLIE_API_KEY=live_YOUR_LIVE_API_KEY_HERE
MOLLIE_WEBHOOK_URL=https://api.jouwdomein.nl/api/v1/webhooks/mollie

# MyParcel
MYPARCEL_API_KEY=your_myparcel_api_key
MYPARCEL_MODE=production
MYPARCEL_WEBHOOK_URL=https://api.jouwdomein.nl/api/v1/webhooks/myparcel

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (configure your provider)
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@jouwdomein.nl
SENDGRID_API_KEY=your_sendgrid_key

# Admin
ADMIN_EMAIL=admin@jouwdomein.nl
ADMIN_PASSWORD=your-secure-admin-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGINS=https://jouwdomein.nl,https://admin.jouwdomein.nl

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

**Frontend:**
```bash
cd /var/www/kattenbak/frontend
cp .env.development .env.local
nano .env.local
```

```bash
NEXT_PUBLIC_API_URL=https://api.jouwdomein.nl/api/v1
NEXT_PUBLIC_SITE_URL=https://jouwdomein.nl
NEXT_PUBLIC_SITE_NAME=Kattenbak
```

**Secure the files:**
```bash
chmod 600 /var/www/kattenbak/backend/.env.production
chmod 600 /var/www/kattenbak/frontend/.env.local
```

---

### 🔟 **BUILD & START SERVICES**

```bash
# Go to project root
cd /var/www/kattenbak

# Build backend
cd backend
npm install --production
npm run build
cd ..

# Build frontend
cd frontend
npm install --production
npm run build
cd ..

# Build admin
cd admin
npm install --production
npm run build
cd ..

# Start all services with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Check status
pm2 status
```

---

### 1️⃣1️⃣ **CONFIGURE NGINX**

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/kattenbak
```

**Paste this config:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name jouwdomein.nl www.jouwdomein.nl api.jouwdomein.nl admin.jouwdomein.nl;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name jouwdomein.nl www.jouwdomein.nl;
    
    # SSL (Let's Encrypt - setup in next step)
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.jouwdomein.nl;
    
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Panel
server {
    listen 443 ssl http2;
    server_name admin.jouwdomein.nl;
    
    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

**Enable the site:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/kattenbak /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### 1️⃣2️⃣ **SETUP SSL (LET'S ENCRYPT)**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d jouwdomein.nl -d www.jouwdomein.nl -d api.jouwdomein.nl -d admin.jouwdomein.nl

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect (option 2)

# Verify auto-renewal
sudo certbot renew --dry-run
```

---

### 1️⃣3️⃣ **FIREWALL SETUP (UFW)**

```bash
# Setup firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

### 1️⃣4️⃣ **FAIL2BAN (BRUTE FORCE PROTECTION)**

```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Start & enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

---

### 1️⃣5️⃣ **FINAL CHECKS**

```bash
# Check all services
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check Redis
redis-cli ping

# Test endpoints
curl https://jouwdomein.nl
curl https://api.jouwdomein.nl/health
curl https://admin.jouwdomein.nl

# View logs
pm2 logs --lines 50
```

---

## ✅ DONE! SERVER IS READY!

**Your services are now running:**
- 🌐 Frontend: https://jouwdomein.nl
- 🔌 Backend: https://api.jouwdomein.nl
- 👨‍💼 Admin: https://admin.jouwdomein.nl

---

## 🔄 DEPLOYMENT WORKFLOW

### **Deploy New Version:**
```bash
ssh deployer@185.224.139.54
cd /var/www/kattenbak
./deploy-production.sh
```

### **View Logs:**
```bash
pm2 logs
pm2 logs kattenbak-backend
pm2 logs kattenbak-frontend
```

### **Restart Service:**
```bash
pm2 restart kattenbak-backend
pm2 restart kattenbak-frontend
pm2 restart kattenbak-admin
```

### **Monitor:**
```bash
pm2 monit
pm2 status
```

---

## 🆘 TROUBLESHOOTING

### **Service won't start:**
```bash
pm2 logs kattenbak-backend --lines 50
pm2 describe kattenbak-backend
```

### **Nginx error:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### **Port already in use:**
```bash
sudo lsof -i :3101
sudo kill -9 <PID>
pm2 restart all
```

---

**Server is ready for production! 🚀**
