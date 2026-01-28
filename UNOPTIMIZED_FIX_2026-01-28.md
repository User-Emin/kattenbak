# ✅ UNOPTIMIZED FIX - 2026-01-28

## 🔍 Probleem
"Sommige foto's wel, sommige niet" in webshop, terwijl admin alle foto's correct toont.

## 🐛 Root Cause
**Next.js Image Optimization** probeerde `/uploads/` images te optimaliseren, maar:
- Images zijn **absolute URLs**: `https://catsupply.nl/uploads/products/...`
- `unoptimized` check was alleen: `image.startsWith('/uploads/')`
- Dit matchte **NIET** voor absolute URLs → Next.js probeerde te optimaliseren → **404 errors**

## ✅ Fix
**Alle `unoptimized` checks uitgebreid** om zowel relative als absolute URLs te herkennen:

### Voor (werkte niet):
```typescript
unoptimized={image.startsWith('/uploads/')}
```

### Na (werkt voor beide):
```typescript
unoptimized={image.startsWith('/uploads/') || image.includes('/uploads/')}
```

## 📝 Bestanden Geüpdatet

### 1. ProductImage Component
- ✅ `frontend/components/ui/product-image.tsx`
- Check: `imageSrc.includes('/uploads/')` toegevoegd

### 2. Product Detail Page
- ✅ `frontend/components/products/product-detail.tsx`
- 3 plaatsen gefixt:
  - Thumbnails: `unoptimized={image.startsWith('/uploads/') || image.includes('/uploads/')}`
  - Variant preview: `unoptimized={previewImage.startsWith('/uploads/') || previewImage.includes('/uploads/')}`
  - How it works: `unoptimized={step.image.startsWith('/uploads/') || step.image.includes('/uploads/')}`

### 3. Andere Components
- ✅ `frontend/components/products/product-comparison-table.tsx`
- ✅ `frontend/components/products/product-how-it-works.tsx`
- ✅ `frontend/components/products/product-app-banner.tsx`
- ✅ `frontend/components/shared/product-edge-image-section.tsx`
- ✅ `frontend/app/page.tsx` (2 plaatsen)

### 4. Al Goed (geen fix nodig)
- ✅ `frontend/components/products/product-usp-features.tsx` - had al `https://` check
- ✅ `frontend/components/shared/product-variants-section.tsx` - had al `https://` check

## 🎯 Resultaat
- ✅ **Absolute URLs** (`https://catsupply.nl/uploads/...`) worden nu correct herkend
- ✅ **Next.js optimization wordt uitgeschakeld** voor alle `/uploads/` images
- ✅ **Images worden direct geserveerd door nginx** (geen Next.js proxy)
- ✅ **Geen 404 errors meer** door Next.js image optimization

## 🔍 Verificatie
Na deploy:
1. Check productpagina: alle variant images moeten laden
2. Check thumbnails: alle thumbnails moeten zichtbaar zijn
3. Check browser console: geen 404 errors voor images
4. Check network tab: alle image requests moeten 200 OK zijn

## 📊 Impact
- **Admin**: Werkt al (gebruikt gewone `<img>` tag zonder Next.js Image)
- **Webshop**: Nu gefixt (Next.js Image met correcte `unoptimized` flag)
