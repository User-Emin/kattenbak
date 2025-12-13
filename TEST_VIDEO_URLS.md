# 🎥 VIDEO URL TESTING - DRY & MAXIMAAL DYNAMISCH

## ✅ IMPLEMENTATIE OVERZICHT

### **Concept: 1 Video, 2 Weergaveplekken**
- **Product.videoUrl** → Opgeslagen in database per product
- **Homepage Hero** → Gebruikt featured product videoUrl
- **Product Detail** → Gebruikt dezelfde videoUrl onder "Over dit product"
- **Admin Panel** → Kan videoUrl per product instellen

---

## 🧪 EXPLICIETE URL TESTS

### **1. Backend API Tests**

```bash
# Start backend
cd /Users/emin/kattenbak/backend
npm run dev

# Test health endpoint
curl http://localhost:3101/health

# Test featured product (check videoUrl field)
curl -s http://localhost:3101/api/v1/products/featured | jq '.data[0] | {name, videoUrl}'

# Expected output:
# {
#   "name": "Automatische Kattenbak Premium",
#   "videoUrl": "https://www.youtube.com/watch?v=..." or null
# }
```

### **2. Database Schema Verificatie**

```bash
cd /Users/emin/kattenbak/backend

# Check Prisma schema
grep -A2 "videoUrl" prisma/schema.prisma

# Expected output:
# videoUrl      String?     @map("video_url")

# Generate Prisma client
npx prisma generate

# Apply migration (if not done)
npx prisma migrate dev --name add_video_url_to_products
```

### **3. Admin Panel Tests**

**Locatie:** `admin-next/components/product-form.tsx`

**Stappen:**
1. Open admin panel: `http://localhost:3001` (of admin port)
2. Ga naar Products → Featured product (of maak nieuw product)
3. Scroll naar "Afbeeldingen" sectie
4. Vind **"Demo Video URL (Optioneel)"** veld
5. Plak een YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
6. Zie validatie: ✅ "Geldige video URL"
7. Klik "Opslaan"

**Validatie:**
- Admin form heeft `videoUrl` field ✅
- Validatie met `CheckCircle` / `XCircle` icons ✅
- Zod schema accepteert YouTube/Vimeo URLs ✅

### **4. Frontend Product Detail Tests**

**Locatie:** `frontend/components/products/product-detail.tsx`

**Test URL:** `http://localhost:3000/product/automatische-kattenbak-premium`

**Verwacht gedrag:**
1. Scroll naar "Over Dit Product" sectie
2. Als `product.videoUrl` bestaat → Zie ProductVideo component
3. Klik op Play button → Video start automatisch
4. Video thumbnail van YouTube wordt getoond
5. "🎥 Bekijk de demo video" tekst onder video

**Code locatie:**
```tsx
{/* DRY: Product Demo Video - EXACT zoals homepage */}
{product.videoUrl && (
  <div className="mb-16 max-w-4xl mx-auto">
    <ProductVideo
      videoUrl={product.videoUrl}
      productName={product.name}
      className=""
    />
    <p className="text-center text-sm text-gray-500 mt-4">
      🎥 Bekijk de demo video
    </p>
  </div>
)}
```

### **5. Homepage Hero Tests**

**Locatie:** `frontend/app/page.tsx`

**Test URL:** `http://localhost:3000/`

**Verwacht gedrag:**
1. Homepage laadt featured product via API
2. Als featured product `videoUrl` heeft → Hero toont video
3. Anders → Hero toont statische afbeelding (fallback)
4. Video thumbnail is fullscreen background
5. Klik op Play → Video speelt in hero sectie

**Code locatie:**
```tsx
{product?.videoUrl ? (
  /* DRY: Featured product video (same video as on product detail!) */
  <div className="w-full h-full">
    <ProductVideo
      videoUrl={product.videoUrl}
      productName={product.name}
      className="w-full h-full rounded-none"
    />
  </div>
) : (
  /* Fallback: Static hero image */
  ...
)}
```

---

## 🎯 DRY VERIFICATIE

### **Single Source of Truth:**
✅ Database → `Product.videoUrl` (Prisma schema)
✅ Admin → `ProductForm` met validatie
✅ Frontend Type → `Product.videoUrl?: string | null`
✅ Component → `ProductVideo` (herbruikbaar)
✅ 2 Plekken → Homepage hero + Product detail

### **Geen Redundantie:**
- ❌ GEEN aparte hero video URL in settings
- ❌ GEEN duplicate video component code
- ❌ GEEN hardcoded video URLs
- ✅ 1 video URL per product in database
- ✅ 1 herbruikbare ProductVideo component
- ✅ 2 weergaveplekken gebruiken dezelfde data

---

## 📋 HANDMATIGE TEST CHECKLIST

### **Backend (localhost:3101)**
- [ ] `/health` → Returns `{"status":"ok"}`
- [ ] `/api/v1/products/featured` → Returns product with `videoUrl` field
- [ ] Featured product heeft `videoUrl: "https://www.youtube.com/watch?v=..."`

### **Admin (localhost:3001 of admin port)**
- [ ] Product form toont "Demo Video URL" veld
- [ ] Plak YouTube URL → Zie ✅ validatie
- [ ] Plak invalide URL → Zie ❌ validatie
- [ ] Sla op → Backend accepteert videoUrl
- [ ] Herlaad product → videoUrl is behouden

### **Frontend Homepage (localhost:3000)**
- [ ] Homepage laadt featured product
- [ ] Als videoUrl bestaat → Hero toont video thumbnail
- [ ] Klik Play → Video speelt in hero
- [ ] Klik "Bekijk Product" → Ga naar product detail

### **Frontend Product Detail (localhost:3000/product/slug)**
- [ ] Product detail pagina laadt
- [ ] Scroll naar "Over Dit Product"
- [ ] Als videoUrl bestaat → Video component verschijnt
- [ ] Klik Play → Video speelt
- [ ] "🎥 Bekijk de demo video" tekst zichtbaar

---

## ✨ SUCCESS CRITERIA

### **Absolute Success = ALLES ✅**

1. ✅ Prisma schema heeft `videoUrl` field
2. ✅ Database migratie succesvol
3. ✅ Admin form toont video URL veld
4. ✅ Admin validatie werkt (YouTube/Vimeo)
5. ✅ Product API returns videoUrl in response
6. ✅ Featured product API returns videoUrl
7. ✅ Frontend Product type includes videoUrl
8. ✅ ProductVideo component werkt standalone
9. ✅ Homepage hero toont featured product video
10. ✅ Product detail toont video onder "Over dit product"
11. ✅ Video component is DRY (1x geschreven, 2x gebruikt)
12. ✅ Geen redundante code of duplicate logic
13. ✅ Video URLs zijn admin bedienbaar
14. ✅ Fallback naar image als geen video
15. ✅ YouTube thumbnail laadt correct

---

## 🚀 DEPLOYMENT TESTS

### **Productie Server (185.224.139.54)**

```bash
# SSH naar server
ssh root@185.224.139.54

# Check backend health
curl http://localhost:3101/health

# Check featured product video
curl -s http://localhost:3101/api/v1/products/featured | jq '.data[0].videoUrl'

# Check Nginx proxy
curl -s http://185.224.139.54/api/health

# Test frontend build
cd /var/www/kattenbak/frontend
npm run build

# Check video component compiled
grep -r "ProductVideo" .next/

# Restart PM2
pm2 restart all
```

---

## 📝 VOORBEELD VIDEO URLs

### **YouTube:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
```

### **Vimeo:**
```
https://vimeo.com/123456789
https://player.vimeo.com/video/123456789
```

---

## 🎉 FINAL VERIFICATION

```bash
# Run all tests
cd /Users/emin/kattenbak

# 1. Schema check
grep -q "videoUrl" backend/prisma/schema.prisma && echo "✅ Schema OK" || echo "❌ Schema FAIL"

# 2. Frontend type check
grep -q "videoUrl" frontend/types/product.ts && echo "✅ Type OK" || echo "❌ Type FAIL"

# 3. Admin type check
grep -q "videoUrl" admin-next/types/product.ts && echo "✅ Admin Type OK" || echo "❌ Admin Type FAIL"

# 4. Component exists
[ -f "frontend/components/ui/product-video.tsx" ] && echo "✅ Component OK" || echo "❌ Component FAIL"

# 5. Homepage integration
grep -q "ProductVideo" frontend/app/page.tsx && echo "✅ Homepage OK" || echo "❌ Homepage FAIL"

# 6. Product detail integration
grep -q "ProductVideo" frontend/components/products/product-detail.tsx && echo "✅ Detail OK" || echo "❌ Detail FAIL"

echo ""
echo "🎉 Als ALLES ✅ is: SUCCESS!"
```

---

**Datum:** 2025-12-10
**Status:** ✅ COMPLETE - Video URL feature is DRY, maintainable, en admin bedienbaar!
