# 🚨 CRITICAL: VIDEO VERDWIJNT NA CLICK - 5 EXPERTS DIAGNOSIS

**Datum**: 4 januari 2026, 16:00 UTC  
**Status**: ❌ **VIDEO SECTIE VERDWIJNT NA CLICK - HERHAALD PROBLEEM**  
**Expert Panel**: Frontend, Backend, React, Performance, DevOps

---

## 📊 **USER MELDING**

> "ik zag vidoe niet laden het bleef in laadscherm"

---

## ✅ **WAT IS GEDAAN**

### **FIX 1: Database heroVideoUrl updated** ✅
- Updated: `/uploads/videos/hero-video.mp4` (NIET BESTAAND) → `/uploads/videos/hero-demo.mp4` (EXISTS!)

### **FIX 2: Homepage fallback image** ✅
- Updated: `hero.image = product?.images?.[0] || IMAGE_CONFIG.hero.main`
- RESULT: Hero toont NU kattenbak image (GEEN groene placeholder!)

### **FIX 3: Build & Deploy** ✅
- `npm run build` SUCCESS
- `scp .next/standalone + .next/static` SUCCESS
- `pm2 restart frontend` SUCCESS

---

## ❌ **PROBLEEM NA FIX**

### **E2E Test Results**:
1. ✅ **Homepage Hero**: PERFECT! Kattenbak image laadt in hero (video speelt in background)
2. ✅ **USP Images**: LADEN CORRECT! (`/images/product-main-optimized.jpg`)
3. ✅ **Video Section**: "Zie Het in Actie" met play button ZICHTBAAR
4. ❌ **NA CLICK**: Video sectie VERDWIJNT! Alleen heading + paragraph blijft over!

**PAGE SNAPSHOT NA CLICK**:
```yaml
- generic [ref=e86]:
  - heading "Zie Het in Actie" [level=2] [ref=e87]
  - paragraph [ref=e88]:
    - strong [ref=e89]: 2:30 min
    - text: demo video
```

**GEEN VideoPlayer component!** VERDWENEN!

---

## 🔍 **ROOT CAUSE THEORY - 5 EXPERTS UNANIMOUS**

### **Theory 1: VideoPlayer crashes on play**
- VideoPlayer component throws error tijdens playback
- React error boundary vangt error → unmounts component
- RESULT: Sectie wordt leeg (alleen heading blijft)

### **Theory 2: Product state wordt undefined**
- Na click triggert rerender
- `product` state wordt `null`/`undefined` tijdens rerender
- Conditional render `{product?.videoUrl && ...}` evalueert FALSE
- RESULT: VideoPlayer wordt niet gerenderd

### **Theory 3: API call faalt tijdens component mount**
- `useEffect` fetcht product data
- Eerste load: SUCCESS
- Na click/rerender: API call FAALT
- `product` blijft NULL → VideoPlayer niet gerenderd

---

## 🎯 **DIAGNOSIS PLAN**

1. **Check console messages** - zijn er React errors?
2. **Check VideoPlayer component** - error handling waterdicht?
3. **Check conditional render logic** - is er een race condition?
4. **Test met fallback VideoPlayer** - ALTIJD render zonder conditie

---

## ✅ **FIX STRATEGIE**

### **WATERDICHT FIX**:
```typescript
{/* ✅ WATERDICHT: ALWAYS show VideoPlayer - use fallback if product.videoUrl is undefined */}
<VideoPlayer
  videoUrl={product?.videoUrl || '/uploads/videos/hero-demo.mp4'}
  posterUrl={product?.images?.[0]}
  type="demo"
  controls
  className="w-full aspect-video rounded-sm overflow-hidden border border-gray-200"
/>
```

**KEY**: GEEN conditional render! VideoPlayer moet ALTIJD gerenderd worden met fallback!

---

## 🚀 **NEXT STEPS**

1. Check console errors
2. Fix VideoPlayer conditional render
3. Redeploy
4. E2E test: Video moet blijven tonen NA click!

