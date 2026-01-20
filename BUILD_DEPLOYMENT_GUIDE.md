# 🔧 BUILD & DEPLOYMENT GUIDE - KATTENBAK PROJECT

## 📋 WANNEER BUILD NODIG?

### 🔴 BACKEND BUILD (`npm run build`) - **ALTIJD NODIG**

**Wanneer:**
- ✅ **Na elke code wijziging** in `backend/src/`
- ✅ **Na TypeScript wijzigingen** (types, interfaces)
- ✅ **Na nieuwe dependencies** (`npm install`)
- ✅ **Na Prisma schema wijzigingen** (`prisma generate` + build)
- ✅ **Voor productie deployment**

**Waarom:**
- Backend draait **TypeScript → JavaScript** (gecompileerd)
- PM2 start `dist/server-database.js` (gecompileerde versie)
- **Zonder build = oude code draait**

**Commando:**
```bash
cd backend
npm run build        # TypeScript → JavaScript
pm2 restart backend  # Start nieuwe build
```

**PM2 Config:**
```javascript
script: 'dist/server-database.js'  // ← Gebruikt GEcompileerde versie
```

---

### 🟢 FRONTEND BUILD (`npm run build`) - **ALTIJD NODIG**

**Wanneer:**
- ✅ **Na elke code wijziging** in `frontend/`
- ✅ **Na component wijzigingen** (React/Next.js)
- ✅ **Na styling wijzigingen** (CSS/Tailwind)
- ✅ **Na nieuwe dependencies** (`npm install`)
- ✅ **Voor productie deployment**

**Waarom:**
- Next.js **pre-renders** pages tijdens build
- **Static assets** worden geoptimaliseerd
- PM2 start `.next/` folder (gebuild versie)
- **Zonder build = oude UI/functionaliteit**

**Commando:**
```bash
cd frontend
npm run build        # Next.js build (pre-render + optimize)
pm2 restart frontend # Start nieuwe build
```

**Next.js Build Output:**
- `.next/` folder (gebuild versie)
- Static assets geoptimaliseerd
- Pages pre-rendered

---

## 🚀 DEPLOYMENT FLOW

### **1. Code Wijziging**
```bash
# Wijzig code in backend/src/ of frontend/
git add .
git commit -m "Fix: ..."
git push origin main
```

### **2. Server: Pull & Build**
```bash
# SSH naar server
ssh root@185.224.139.74

# Pull latest code
cd /var/www/kattenbak
git pull origin main

# BACKEND BUILD (altijd nodig)
cd backend
npm install          # Nieuwe dependencies?
npm run build        # TypeScript → JavaScript
pm2 restart backend  # Start nieuwe build

# FRONTEND BUILD (altijd nodig)
cd ../frontend
npm install          # Nieuwe dependencies?
npm run build        # Next.js build
pm2 restart frontend # Start nieuwe build
```

### **3. Verificatie**
```bash
# Check services
pm2 list

# Check health
curl https://catsupply.nl/api/v1/health
```

---

## ⚠️ BELANGRIJK

### **Backend:**
- ❌ **NOOIT** `npm run dev` in productie (gebruikt `tsx watch`)
- ✅ **ALTIJD** `npm run build` → `pm2 restart`
- ✅ PM2 draait **gecompileerde** `dist/server-database.js`

### **Frontend:**
- ❌ **NOOIT** `npm run dev` in productie (development server)
- ✅ **ALTIJD** `npm run build` → `pm2 restart`
- ✅ PM2 draait **gebuild** `.next/` folder

### **Admin Panel:**
- ✅ Zelfde als frontend (Next.js)
- ✅ Build nodig na wijzigingen
- ✅ PM2 draait gebuild versie

---

## 📊 PROJECT SPECIFIEK

### **Backend:**
- **TypeScript** → compileert naar `dist/`
- **PM2 script:** `dist/server-database.js`
- **Port:** 3101
- **Build tijd:** ~30-60 seconden

### **Frontend:**
- **Next.js 15** → build naar `.next/`
- **PM2 script:** `next start` (gebruikt `.next/`)
- **Port:** 3102
- **Build tijd:** ~2-5 minuten

### **Admin Panel:**
- **Next.js** → build naar `.next/`
- **PM2 script:** `next start`
- **Port:** 3103
- **Base path:** `/admin`

---

## ✅ QUICK REFERENCE

| Wijziging | Backend Build? | Frontend Build? |
|-----------|----------------|-----------------|
| Backend code (`backend/src/`) | ✅ **JA** | ❌ Nee |
| Frontend code (`frontend/`) | ❌ Nee | ✅ **JA** |
| Admin code (`admin-next/`) | ❌ Nee | ✅ **JA** |
| Dependencies (`package.json`) | ✅ **JA** | ✅ **JA** |
| Prisma schema | ✅ **JA** | ❌ Nee |
| Config files | ✅ **JA** | ✅ **JA** |
| Static assets | ❌ Nee | ✅ **JA** |

---

## 🎯 SAMENVATTING

**Backend Build:** ✅ **ALTIJD** na code wijzigingen (TypeScript compileert)
**Frontend Build:** ✅ **ALTIJD** na code wijzigingen (Next.js pre-renders)

**Regel:** 
- Code wijziging → Build → PM2 restart
- **Zonder build = oude code draait!**
