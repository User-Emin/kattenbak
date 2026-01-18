# 🚀 PRODUCTION DEPLOYMENT INSTRUCTIONS

**Datum:** 18 januari 2026  
**Doel:** Deploy nieuwe versie naar catsupply.nl - 100% identiek, CPU-vriendelijk

---

## ⚠️  BELANGRIJK

**Meld NIET voordat alles volledig is geverifieerd:**
- ✅ Standalone build uploaded
- ✅ PM2 restarted
- ✅ HTTP 200 OK
- ✅ Logo accessible
- ✅ CPU-vriendelijk (geen build processes)
- ✅ Nieuwe versie actief

---

## 🚀 DEPLOYMENT STAP VOOR STAP

### Stap 1: Build lokaal (CPU-vriendelijk)
```bash
cd /Users/emin/kattenbak/frontend
npm run build
# ✅ Build op lokale machine (geen server CPU)
```

### Stap 2: Deploy en verifiëren
```bash
cd /Users/emin/kattenbak

# Set server credentials
export SERVER_HOST=catsupply.nl
export SERVER_USER=root  # of andere user

# Deploy en verifiëren (script doet alles en meldt pas als alles geverifieerd is)
./scripts/deploy-and-verify-production.sh
```

### Stap 3: Volledige verificatie (script doet automatisch)
Het script verifieert:
1. ✅ Local build successful
2. ✅ Upload successful
3. ✅ Server-side verification (BEFORE restart)
4. ✅ PM2 restart successful
5. ✅ HTTP 200 OK (https://catsupply.nl)
6. ✅ Logo HTTP 200 OK
7. ✅ PM2 status: Online
8. ✅ CPU usage: <5% (CPU-vriendelijk)
9. ✅ No build processes (CPU-vriendelijk)
10. ✅ Standalone build exists on server
11. ✅ Logo exists on server

---

## ✅ VERIFICATION CHECKLIST

### Pre-deployment:
- [x] Standalone build completed locally
- [x] Logo exists locally (1.9 KB)
- [x] PM2 config updated (standalone path)
- [x] Code changes verified (zwart design)

### Post-deployment (automatisch via script):
- [ ] Standalone build uploaded to server
- [ ] Logo uploaded to server
- [ ] PM2 config uploaded to server
- [ ] PM2 restarted successfully
- [ ] HTTP 200 OK (https://catsupply.nl)
- [ ] Logo HTTP 200 OK
- [ ] PM2 status: Online
- [ ] CPU <5% (CPU-vriendelijk)
- [ ] No build processes (CPU-vriendelijk)
- [ ] Standalone build verified on server
- [ ] Logo verified on server

---

## 🔍 MANUELE VERIFICATIE (als script klaar is)

### 1. Check HTTP status:
```bash
curl -I https://catsupply.nl
# ✅ Expected: HTTP/2 200
```

### 2. Check logo:
```bash
curl -I https://catsupply.nl/logos/logo.webp
# ✅ Expected: HTTP/2 200
```

### 3. Check PM2 status (op server):
```bash
ssh root@catsupply.nl "cd /var/www/kattenbak && pm2 list | grep frontend"
# ✅ Expected: online
```

### 4. Check CPU usage (op server):
```bash
ssh root@catsupply.nl "cd /var/www/kattenbak && pm2 monit"
# ✅ Expected: CPU <1% (runtime)
```

### 5. Check geen build processes (op server):
```bash
ssh root@catsupply.nl "ps aux | grep -E 'npm run build|next build' | grep -v grep"
# ✅ Expected: geen output (geen build processes)
```

---

## ✅ CONCLUSIE

**Script meldt pas als alles volledig is geverifieerd:**
- ✅ Deployment successful
- ✅ HTTP 200 OK
- ✅ CPU-vriendelijk
- ✅ Nieuwe versie actief

**⚠️  MELD NIET VOORDAT SCRIPT "DEPLOYMENT SUCCESSFUL!" MELDT!**
