# 🔑 SSH KEY SETUP - CRITICAL

## ❌ HUIDIGE STATUS

```
Server: 185.224.139.54
Port 22: ✅ Open
Port 2222: ❌ Closed (SSH config had dit, maar werkt niet)

SSH Key: ~/.ssh/kattenbak_deploy
Status: ❌ NIET geïnstalleerd op server

Error: Permission denied (publickey)
Reden: Je public key staat NIET op de server
```

---

## 🎯 OPLOSSING - 3 OPTIES

### **OPTIE 1: Via Control Panel (MAKKELIJKST)** ⭐

**Stappen:**

1. **Log in op je hosting control panel:**
   - URL: Meestal iets als `panel.transip.nl` of `console.hetzner.com`
   - Of vraag je hosting provider

2. **Ga naar SSH Keys sectie:**
   - Zoek naar: "SSH Keys", "Security", "Access Keys"
   - Klik op "Add SSH Key" of "Upload Public Key"

3. **Plak deze public key:**

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICwuT7YwPyKOoFKKK6qQZxnr4GNQR5jWzjVGZb4BQq2+ deploy@catsupply.nl
```

4. **Save & Wait:**
   - Sla op
   - Wacht 1-2 minuten
   - Test: `ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.54`

---

### **OPTIE 2: Via Password Login (ALS ENABLED)**

**Stappen:**

```bash
# 1. Connect met password
ssh root@185.224.139.54
# Voer root password in

# 2. Op de server:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys

# 3. Plak deze key HELEMAAL op 1 regel:
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICwuT7YwPyKOoFKKK6qQZxnr4GNQR5jWzjVGZb4BQq2+ deploy@catsupply.nl

# 4. Save & exit (Ctrl+X, Y, Enter)

# 5. Set permissions
chmod 600 ~/.ssh/authorized_keys

# 6. Exit & test
exit
ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.54
```

---

### **OPTIE 3: Nieuwe Key Maken via Control Panel**

Als je geen toegang hebt tot de huidige key:

```bash
# 1. Generate nieuwe key
ssh-keygen -t ed25519 -f ~/.ssh/kattenbak_server -C "kattenbak-server"

# 2. Kopieer public key
cat ~/.ssh/kattenbak_server.pub

# 3. Upload via control panel (zie Optie 1)

# 4. Update SSH config
nano ~/.ssh/config
```

Update config naar:
```
Host kattenbak-prod
    HostName 185.224.139.54
    User root
    Port 22
    IdentityFile ~/.ssh/kattenbak_server
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

---

## 🔍 HUIDIGE SITUATIE CHECK

### **Server Bereikbaar?**
```bash
ping 185.224.139.54
# ✅ YES: 64 bytes from 185.224.139.54: time=14.693 ms

nc -zv 185.224.139.54 22
# ✅ YES: Connection succeeded
```

### **Is er al iets deployed?**
```
❓ ONBEKEND - kunnen niet inloggen om te checken
```

Mogelijkheden:
1. ✅ Server is al geconfigureerd, alleen SSH key mist
2. ❌ Server is leeg, moet nog volledig deployen
3. ⚠️ Er draait iets, maar niet kattenbak project

---

## 🚀 NA SSH KEY INSTALLATIE

### **Test Connectie:**
```bash
ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.54

# Of met SSH config alias:
ssh kattenbak-prod
```

### **Check Server Status:**
```bash
# Connect
ssh kattenbak-prod

# Check wat er draait
pm2 list
systemctl status nginx
systemctl status postgresql
ls -la ~/kattenbak
netstat -tlnp | grep LISTEN
```

### **Als NIETS draait:**
```bash
# Run deployment
./deploy-production.sh
```

### **Als WEL iets draait:**
```bash
# Check waarom DNS niet klopt
dig catsupply.nl
# Als wrong IP → fix DNS (zie DNS_ISSUE_CRITICAL.md)

# Check Nginx config
cat /etc/nginx/conf.d/catsupply.conf

# Check SSL
certbot certificates

# Restart services if needed
pm2 restart all
systemctl restart nginx
```

---

## 📋 DEPLOYMENT CHECKLIST

### **Stap 1: SSH Toegang** ⬅️ JE BENT HIER
```bash
☐ SSH key geüpload via control panel
☐ Test: ssh kattenbak-prod
☐ Success: Ingelogd op server
```

### **Stap 2: Check Huidige Status**
```bash
☐ Check: pm2 list
☐ Check: nginx status
☐ Check: PostgreSQL status
☐ Check: /home/*/kattenbak directory
☐ Conclusie: Leeg OF al iets deployed
```

### **Stap 3A: Als Server LEEG**
```bash
☐ Run: ./deploy-production.sh
☐ Volg deployment script
☐ Wacht ~30 minuten
☐ Verify: https://catsupply.nl
```

### **Stap 3B: Als Server AL DEPLOYED**
```bash
☐ Check DNS: dig catsupply.nl
☐ Fix DNS if wrong IP
☐ Check Nginx logs: tail -f /var/log/nginx/error.log
☐ Check PM2 logs: pm2 logs
☐ Restart if needed: pm2 restart all
```

---

## 🔐 SECURITY NOTES

### **SSH Key Locatie:**
```
Private key: ~/.ssh/kattenbak_deploy (NEVER share!)
Public key:  ~/.ssh/kattenbak_deploy.pub (safe to share)
```

### **Public Key Format:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICwuT7YwPyKOoFKKK6qQZxnr4GNQR5jWzjVGZb4BQq2+ deploy@catsupply.nl
```

**Let op:**
- ✅ Hele key op 1 regel
- ✅ Begint met `ssh-ed25519`
- ✅ Eindigt met comment (deploy@catsupply.nl)
- ❌ GEEN line breaks
- ❌ GEEN extra spaties

---

## 🧪 TROUBLESHOOTING

### **Error: Permission denied (publickey)**
```
Oorzaak: Public key niet op server
Fix: Upload key via control panel (Optie 1)
```

### **Error: Connection refused (port 2222)**
```
Oorzaak: Port 2222 niet open/gebruikt
Fix: Gebruik port 22 in SSH config
```

### **Error: Host key verification failed**
```
Fix: ssh-keygen -R 185.224.139.54
Dan: ssh kattenbak-prod (accept fingerprint)
```

### **Error: No route to host**
```
Oorzaak: Server firewall blokkeert je IP
Fix: Whitelist je IP in server firewall/control panel
```

---

## 📞 NEXT STEPS

### **DIRECT NU:**

1. **Upload SSH key via control panel** (5 minuten)
   - Log in bij hosting provider
   - Ga naar SSH keys sectie
   - Plak public key (zie boven)
   - Save

2. **Test connectie** (1 minuut)
   ```bash
   ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.54
   # OF
   ssh kattenbak-prod
   ```

3. **Check server status** (2 minuten)
   ```bash
   pm2 list
   systemctl status nginx
   ls -la ~/kattenbak
   ```

4. **Deploy of Fix** (30-60 minuten)
   - Als leeg: `./deploy-production.sh`
   - Als deployed: Check DNS + restart services

---

## ✅ SUCCESS CRITERIA

```
✅ SSH connection successful
✅ Can login to server
✅ Can check running services
✅ Can deploy or update application
✅ catsupply.nl accessible (after deployment)
```

---

## 📊 CURRENT STATUS

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  🔑 SSH KEY SETUP REQUIRED                            │
│                                                        │
│  Server: 185.224.139.54 ✅ Reachable                  │
│  SSH Port 22: ✅ Open                                 │
│  SSH Key: ❌ Not installed on server                  │
│                                                        │
│  ACTION: Upload public key via control panel         │
│                                                        │
│  Public Key:                                          │
│  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICw...          │
│                                                        │
│  After: Run ./connect-to-server.sh to check status   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Priority:** 🔴 CRITICAL - Blocking deployment
**Time:** 5 minutes to upload key
**Next:** Upload key → Test → Deploy
