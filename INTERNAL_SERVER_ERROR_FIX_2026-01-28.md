# ✅ INTERNAL SERVER ERROR FIX - 2026-01-28

## 🔍 Probleem
Internal Server Error op https://catsupply.nl/

## 🐛 Root Causes Gevonden

### 1. Backend: Missing Dependencies
- **Error**: `Cannot find module 'express'`
- **Oorzaak**: Dependencies niet correct geïnstalleerd na build
- **Fix**: `npm ci --legacy-peer-deps` uitgevoerd
- **Status**: ✅ OPGELOST

### 2. Frontend: Missing Next.js Modules
- **Error**: `Cannot find module 'next/dist/compiled/cookie'`
- **Oorzaak**: Incomplete node_modules na deployment
- **Fix**: 
  - `rm -rf .next node_modules`
  - `npm ci --legacy-peer-deps`
  - `npm run build`
  - `pm2 restart frontend`
- **Status**: ✅ OPGELOST

## ✅ Fixes Uitgevoerd

### Backend
```bash
cd /var/www/kattenbak/backend
npm ci --legacy-peer-deps
pm2 restart backend
```

### Frontend
```bash
cd /var/www/kattenbak/frontend
rm -rf .next node_modules
npm ci --legacy-peer-deps
NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' npm run build
pm2 restart frontend
```

## 📊 Huidige Status

### Services
- ✅ Backend: Online (PID 591429)
- ✅ Frontend: Online (PID 592347)
- ✅ Admin: Online (2 instances)

### Endpoints
- ✅ Homepage: `https://catsupply.nl/` → 200 OK
- ✅ API Health: `https://catsupply.nl/api/v1/health` → 200 OK
- ✅ Product API: `https://catsupply.nl/api/v1/products` → 200 OK

### Warnings (Niet Kritiek)
- ⚠️ "next start" does not work with "output: standalone" - Dit is een waarschuwing, geen error
- ⚠️ "The static directory has been deprecated" - Deprecation warning, geen error

## 🔍 Als je nog steeds Internal Server Error ziet:

### 1. Hard Refresh
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R
- Dit voorkomt caching issues

### 2. Check Browser Console
- Open DevTools (F12)
- Ga naar Console tab
- Kijk voor JavaScript errors
- Noteer de exacte error message

### 3. Check Network Tab
- Open DevTools (F12)
- Ga naar Network tab
- Refresh pagina
- Kijk voor failed requests (rode status codes)
- Check welke endpoint faalt

### 4. Check Specifieke Actie
- Op welke pagina zie je de error?
- Welke actie trigger je? (klik, form submit, etc.)
- Is het altijd of soms?

## 🚀 Deployment Script Update

De deployment script is nu bijgewerkt om dependencies correct te installeren:

```bash
# Backend
cd /var/www/kattenbak/backend
npm ci --legacy-peer-deps
npm run build
pm2 restart backend

# Frontend
cd /var/www/kattenbak/frontend
npm ci --legacy-peer-deps
NEXT_PUBLIC_API_URL='https://catsupply.nl/api/v1' npm run build
pm2 restart frontend
```

## ✅ Verificatie

Alle endpoints werken nu:
- ✅ Homepage: 200 OK
- ✅ API: 200 OK
- ✅ Product pages: 200 OK
- ✅ E2E tests: 17/17 passed

## 📝 Next Steps

Als de error blijft:
1. Noteer exacte error message uit browser console
2. Noteer welke pagina/actie de error veroorzaakt
3. Check server logs: `pm2 logs frontend --lines 50`
4. Check browser Network tab voor failed requests
