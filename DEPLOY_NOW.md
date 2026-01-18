# 🚀 DEPLOY NAAR PRODUCTIE - INSTRUCTIES

**Datum:** 18 januari 2026  
**Doel:** Deploy nieuwe versie naar catsupply.nl met volledige verificatie

---

## ⚠️  BELANGRIJK

**Script meldt pas als alles volledig is geverifieerd:**
- ✅ Standalone build uploaded
- ✅ PM2 restarted
- ✅ HTTP 200 OK
- ✅ Logo accessible
- ✅ CPU-vriendelijk (geen build processes)
- ✅ Nieuwe versie actief

---

## 🚀 DEPLOY STAP VOOR STAP

### Stap 1: Set server credentials
```bash
export SERVER_HOST=185.224.139.74
export SERVER_USER=root

# Of maak .env.server aan:
cat > .env.server << 'EOFENV'
export SERVER_HOST=185.224.139.74
export SERVER_USER=root
EOFENV
```

### Stap 2: Deploy en verifiëren
```bash
cd /Users/emin/kattenbak
./scripts/deploy-production-with-verification.sh
```

---

## ✅ WAT HET SCRIPT DOET

1. ✅ Build lokaal (CPU-vriendelijk: geen server CPU)
2. ✅ Verifieer lokale build
3. ✅ Upload naar server (standalone + logo + PM2 config)
4. ✅ Server-side verificatie (BEFORE restart)
5. ✅ Restart PM2 (CPU-vriendelijk: gebruikt pre-built standalone)
6. ✅ Wacht op server (10 seconden)
7. ✅ HTTP verificatie (https://catsupply.nl)
8. ✅ Logo HTTP verificatie
9. ✅ Server-side verificatie (AFTER restart)
10. ✅ CPU-vriendelijk verificatie
11. ✅ Geen build processes verificatie
12. ✅ Meldt pas als alles geverifieerd is

---

## ✅ VERIFICATIE CHECKLIST

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

## ✅ CONCLUSIE

**Script is ready voor deployment!**

Run:
```bash
export SERVER_HOST=185.224.139.74
export SERVER_USER=root
./scripts/deploy-production-with-verification.sh
```

**⚠️  Script meldt pas als alles volledig is geverifieerd!**
