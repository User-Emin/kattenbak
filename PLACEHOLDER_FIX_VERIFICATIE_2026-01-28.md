# ✅ PLACEHOLDER FIX VERIFICATIE - 2026-01-28

## 🔍 Probleem
"Sommige foto's wel, sommige niet" in productfoto-slider.

## ✅ Fixes Geïmplementeerd

### 1. Product-detail.tsx (Gallery + Thumbnails)
- ✅ **Fallback**: `/placeholder-image.jpg` → `/images/product-main-optimized.jpg` (bestaat)
- ✅ **Geen lege strings**: `displayImagesSafe` altijd min. 1 item
- ✅ **Preload**: Alleen eerste geldige image (geen placeholder/SVG)
- ✅ **Alle referenties**: `displayImagesSafe` gebruikt overal

### 2. ProductImage Component
- ✅ **Geen SVG-placeholder in gallery**: `isValidProductImageUrl()` helper
- ✅ **Nieuwe prop `fallbackSrc`**: Gallery gebruikt echte fallback i.p.v. SVG
- ✅ **Validatie**: Filtert data:image/svg, placeholder, demo, default

### 3. ProductFeatureSlider
- ✅ **Fallback**: `/images/placeholder.jpg` → `/images/feature-2.jpg` (bestaat)
- ✅ **onError**: Gebruikt ook `/images/feature-2.jpg`

## 🔍 API Response Analyse

### Product Images (5 stuks)
```json
"images": [
  "https://catsupply.nl/uploads/products/ae910876-01ea-45fe-a9a4-6e3500d87630.jpg",
  "https://catsupply.nl/uploads/products/5d2eb731-0dff-46bf-82cf-cb22c10afdbd.jpg",
  "https://catsupply.nl/uploads/products/b8ccc381-e3d6-4c08-a43b-54f5394da7d3.jpg",
  "https://catsupply.nl/uploads/products/41311d1a-d14a-47d6-b856-279e2fc7eda8.jpeg",
  "https://catsupply.nl/uploads/products/bec3ca0e-8ab2-4ceb-97bb-32ceac7a508e.jpeg"
]
```

### Variant "Premium Beige" (8 stuks)
```json
"images": [
  "https://catsupply.nl/uploads/products/b1c4f86a-a221-4cfe-85f5-60eddb917703.jpeg",
  "https://catsupply.nl/uploads/products/6bfdd4bf-74c5-4fc5-99b3-95a453261ac6.jpg",
  "https://catsupply.nl/uploads/products/15fbe837-f4c2-4157-83f6-77dce3f506fb.jpg",
  "https://catsupply.nl/uploads/products/af6c4665-25af-4e3d-a086-fa7280fe38dd.jpg",
  "https://catsupply.nl/uploads/products/0cbc84cb-fafc-40ab-bac0-866d7ea93ef3.jpg",
  "https://catsupply.nl/uploads/products/7814f033-1f50-4672-8b3c-56c64f0dcc8d.jpg",
  "https://catsupply.nl/uploads/products/b5a996ab-517c-4134-a2a2-72cf31a94a78.jpg",
  "https://catsupply.nl/uploads/products/57d71449-fa40-4d64-b9b9-f792dd23eb60.jpg"
]
```

### Variant "Premium Grijs" (7 stuks)
```json
"images": [
  "https://catsupply.nl/uploads/products/84a595e6-6946-44c6-b9c0-2ebe033b4312.jpeg",
  "https://catsupply.nl/uploads/products/fd66bf10-87a7-4bfc-bef3-e05e6c6b9afd.jpg",
  "https://catsupply.nl/uploads/products/a62b2d3b-2d7d-4bf9-8fe5-12bfea1250ac.jpg",
  "https://catsupply.nl/uploads/products/7c73788b-6967-49d4-a984-159baec2a477.jpg",
  "https://catsupply.nl/uploads/products/d2b82a65-e6a3-4870-82a5-1a2a1ee316df.jpg",
  "https://catsupply.nl/uploads/products/dffdb4e2-8785-404d-88ae-8cdc8f57cf18.jpg",
  "https://catsupply.nl/uploads/products/25f4514f-0679-4c49-a12c-3d396fb19a1e.jpg"
]
```

### ✅ URL Validatie Test
```bash
# Test 1: Premium Beige eerste image
curl -I "https://catsupply.nl/uploads/products/b1c4f86a-a221-4cfe-85f5-60eddb917703.jpeg"
# Result: HTTP/2 200 ✅

# Test 2: Product eerste image
curl -I "https://catsupply.nl/uploads/products/ae910876-01ea-45fe-a9a4-6e3500d87630.jpg"
# Result: HTTP/2 200 ✅
```

### ✅ Filter Validatie
```javascript
const img = 'https://catsupply.nl/uploads/products/b1c4f86a-a221-4cfe-85f5-60eddb917703.jpeg';
img.startsWith('/uploads/')  // false (correct - is https://)
img.startsWith('https://')  // true ✅
img.includes('placeholder')  // false ✅
// Result: Image zou door filter moeten komen ✅
```

## 🔍 MCP Browser Verificatie Stappen

### 1. Open Productpagina
- URL: `https://catsupply.nl/product/automatische-kattenbak-premium`
- Check: Laadt pagina zonder errors

### 2. Check Main Gallery Slide
- **Verwachting**: Eerste variant image (Premium Beige) of product image
- **Check**: Geen SVG "Premium Kattenbak" placeholder
- **Check**: Geen broken image icon
- **Check**: Image laadt correct (200 OK)

### 3. Check Thumbnails
- **Verwachting**: Alle variant images zichtbaar als thumbnails
- **Check**: Geen placeholder thumbnails
- **Check**: Alle thumbnails klikbaar en werken

### 4. Test Variant Switch
- **Premium Beige**: Check of alle 8 images zichtbaar zijn
- **Premium Grijs**: Check of alle 7 images zichtbaar zijn
- **Check**: Geen placeholder bij variant switch

### 5. Check Image Counter
- **Verwachting**: "1 / 8" voor Premium Beige, "1 / 7" voor Premium Grijs
- **Check**: Counter klopt met aantal zichtbare images

### 6. Test Navigation
- **Vorige/Volgende**: Check of alle images doorlopen kunnen worden
- **Check**: Geen placeholder tijdens navigatie
- **Check**: Geen broken images

### 7. Check Browser Console
- **Errors**: Geen 404 errors voor images
- **Warnings**: Geen placeholder warnings
- **Network**: Alle image requests 200 OK

## 🐛 Mogelijke Oorzaken "Sommige Wel, Sommige Niet"

### 1. Next.js Image Optimization
- **Probleem**: Next.js probeert `/uploads/` images te optimaliseren
- **Fix**: `unoptimized={image.startsWith('/uploads/')}` al geïmplementeerd ✅

### 2. CORS Issues
- **Check**: Images van `https://catsupply.nl/uploads/` moeten CORS headers hebben
- **Fix**: Backend nginx config moet CORS headers toevoegen

### 3. Image Loading Errors
- **Check**: Sommige images kunnen corrupt zijn of verkeerde content-type hebben
- **Fix**: Check server logs voor 404/500 errors

### 4. Variant Selection State
- **Probleem**: `selectedVariant` state niet correct gezet
- **Fix**: Check `handleVariantSelect` functie

### 5. Filter Logic Edge Cases
- **Probleem**: Sommige URLs hebben edge cases (trailing spaces, encoding)
- **Fix**: Trim en decode URLs voor filtering

## ✅ Aanbevolen Debug Stappen

### 1. Console Logging Toevoegen
```typescript
console.log('Variant images:', variantImages);
console.log('Product images:', productImages);
console.log('Display images safe:', displayImagesSafe);
console.log('Current image:', currentImage);
```

### 2. Network Tab Check
- Open DevTools → Network tab
- Filter op "Img"
- Check welke images 200 OK zijn en welke 404/500

### 3. Image Source Check
- Right-click op broken image → Inspect
- Check `src` attribute in HTML
- Check of URL correct is

### 4. Variant State Check
- Check React DevTools → Components
- Check `selectedVariant` state
- Check `activeVariant` computed value

## ✅ Extra Fixes (Edge Cases)

### 4. Trim & Case-Insensitive Checks
- ✅ **Trim whitespace**: URLs worden getrimd voor filtering
- ✅ **Case-insensitive**: `placeholder`, `demo`, `default` checks zijn nu case-insensitive
- ✅ **Return trimmed**: Gefilterde URLs worden getrimd teruggegeven
- ✅ **Toegepast in**:
  - `product-detail.tsx` → `filterValidImages()`
  - `variant-utils.ts` → `filterValidImages()`
  - `product-image.tsx` → `isValidProductImageUrl()`

## 📝 Volgende Stappen

1. ✅ **Deploy fixes** naar productie
2. 🔍 **MCP Browser verificatie** uitvoeren
3. 🐛 **Debug logging** toevoegen indien nodig
4. ✅ **Volledige verificatie** documenteren

## 🎯 Success Criteria

- ✅ Geen SVG placeholder in main gallery
- ✅ Alle variant images zichtbaar
- ✅ Thumbnails werken correct
- ✅ Variant switch toont correcte images
- ✅ Geen broken images
- ✅ Geen console errors
- ✅ Alle image requests 200 OK
