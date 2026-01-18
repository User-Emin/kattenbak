# ⚠️ PRODUCT DETAIL FIX - REBUILD REQUIRED

**Date:** 2026-01-18 20:00 UTC  
**Issue:** Product detail pagina laadt niet (JavaScript chunks mismatch)  
**Status:** ⚠️ **REBUILD VIA GITHUB ACTIONS REQUIRED**

---

## 🚨 **PROBLEEM**

### **Product Detail Pagina:**
- ❌ **Leeg** (geen content)
- ❌ **JavaScript chunks 404 errors**
- ❌ **Build version mismatch**

### **Root Cause:**
**Build version mismatch** - HTML en chunks uit verschillende builds:
- **HTML verwijst naar:** `main-app-96256b126d28a158.js`
- **Server heeft:** `main-app-69c1fd70a1bb090b.js`

**Console Errors:**
```
404: /_next/static/chunks/main-app-96256b126d28a158.js
404: /_next/static/chunks/app/product/[slug]/page-bb0cd766a1e4a8a5.js
404: /_next/static/chunks/547-7825450d24c00070.js
404: /_next/static/chunks/610-7836d4661f7fbf01.js
```

---

## ✅ **OPLOSSING: GITHUB ACTIONS REBUILD**

### **CPU-Vriendelijk (Geen Build op Server):**
1. **GitHub Actions** bouwt frontend (CPU in cloud, niet op server)
2. **Pre-built artifacts** naar server (geen build op server)
3. **Static files synced** (chunks, CSS, JS, public assets)
4. **Consistent build-ID** (HTML en chunks matchen)

### **Actie Vereist:**
**Trigger GitHub Actions rebuild:**
1. Push commit naar `main` branch
2. GitHub Actions bouwt automatisch
3. Pre-built artifacts worden gedownload
4. Server ontvangt gesynced build (HTML + chunks)
5. Product detail pagina werkt weer

---

## 🔧 **TECHNISCHE DETAILS**

### **Product Detail Component:**
- **Location:** `frontend/app/product/[slug]/page.tsx`
- **Type:** Client-side rendered (`"use client"` in ProductDetail)
- **Requires:** JavaScript chunks om te renderen
- **Current:** Chunks mismatch → pagina laadt niet

### **Standalone Deployment:**
- ✅ **CPU-friendly:** Pre-built artifacts (geen server build)
- ✅ **Static files synced:** Chunks, CSS, JS, public assets
- ✅ **Workflow:** `.github/workflows/production-deploy.yml`

---

## 📋 **VERIFICATION AFTER REBUILD**

Na rebuild via GitHub Actions:
1. ✅ HTML en chunks hebben zelfde build-ID
2. ✅ Product detail pagina laadt volledig
3. ✅ JavaScript chunks beschikbaar (404 errors weg)
4. ✅ Content zichtbaar (headings, images, text)
5. ✅ No data loss (uploads preserved)

---

## ⚠️ **ALTERNATIEVEN (NIET AANBEVOLEN)**

### **1. Server-Side Rebuild (NIET CPU-VRIENDELIJK):**
```bash
cd /var/www/kattenbak/frontend
npm run build  # ❌ Gebruikt server CPU (~2 min)
```
- ❌ **Niet CPU-vriendelijk** (build op server)
- ❌ **Tegenstandalone deployment strategie**
- ✅ **Sneller** (2 min vs 5-10 min)

### **2. Chunks Kopiëren (WERKT NIET):**
- ❌ **Chunks hebben hash-based namen** (inhoud-specific)
- ❌ **HTML verwacht andere chunks** (verschillende build-ID)
- ❌ **Inhoud mismatch** (chunks zijn build-specifiek)

---

## ✅ **AANBEVOLEN ACTIE**

**Trigger GitHub Actions rebuild** (CPU-vriendelijk, binnen eisen):

1. **Commit wijziging:**
   ```bash
   git commit --allow-empty -m "Trigger rebuild for product detail fix"
   git push origin main
   ```

2. **GitHub Actions draait automatisch:**
   - ✅ Build op GitHub (niet op server)
   - ✅ Pre-built artifacts naar server
   - ✅ Static files gesynced
   - ✅ Consistent build-ID

3. **Verificatie na 5-10 minuten:**
   - ✅ Product detail pagina laadt
   - ✅ JavaScript chunks beschikbaar
   - ✅ Content volledig zichtbaar

---

## 🎯 **EISEN COMPLIANCE**

✅ **CPU-Vriendelijk:** Build op GitHub (niet op server)  
✅ **Standalone:** Pre-built artifacts (zero server build)  
✅ **No Data Loss:** Uploads excluded from rsync  
✅ **E2E Compatible:** Alle checks blijven werken  

---

**Status:** ⚠️ **REBUILD REQUIRED VIA GITHUB ACTIONS**  
**Estimated Time:** 5-10 minutes (GitHub Actions build)  
**CPU Impact:** ✅ **ZERO** (build op GitHub, niet op server)
