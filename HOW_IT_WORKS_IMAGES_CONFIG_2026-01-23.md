# ✅ "Hoe werkt het?" Afbeeldingen Configuratie - 2026-01-23

## Implementatie Voltooid

**Status**: ✅ **PRODUCTION READY**

---

## 🎯 Functionaliteit

### Aparte Configuratie voor "Hoe werkt het?" Afbeeldingen

De "Hoe werkt het?" sectie heeft nu een **aparte configuratie** voor afbeeldingen, volledig los van:
- ❌ Product afbeeldingen (`images`)
- ❌ Variant afbeeldingen (`variants[].images`)

### ✅ Nieuwe Database Veld

**Veld**: `how_it_works_images` (JSONB array)
- **Type**: Array van strings (image URLs)
- **Max**: 6 afbeeldingen (voor 6 stappen)
- **Default**: `[]` (leeg array)

**Migratie**: `20260123120000_add_how_it_works_images`

---

## 📋 Admin UI

### Locatie
**Admin Panel** → **Producten** → **Product Bewerken** → **"Hoe werkt het? Afbeeldingen"** sectie

### Functionaliteit
- ✅ Aparte upload sectie voor "Hoe werkt het?" afbeeldingen
- ✅ Maximaal 6 afbeeldingen (voor 6 stappen)
- ✅ Duidelijke beschrijving per stap:
  - Stap 1: Stekker erin en klaarzetten
  - Stap 2: Grit toevoegen tot MAX lijn
  - Stap 3: Afvalzak plaatsen over bak
  - Stap 4: Aanzetten en klaar
  - Stap 5: Timer instellen via app
  - Stap 6: Klaar! Automatisch schoon
- ✅ Optioneel (niet verplicht)
- ✅ Volledig los van product/variant afbeeldingen

---

## 🔧 Technische Implementatie

### Database Schema
```prisma
model Product {
  // ... andere velden
  images Json @default("[]")
  howItWorksImages Json @default("[]") @map("how_it_works_images")
  // ... andere velden
}
```

### Admin Types
```typescript
export interface Product {
  // ... andere velden
  images: string[];
  howItWorksImages?: string[]; // Max 6
  // ... andere velden
}
```

### Frontend Types
```typescript
export interface Product {
  // ... andere velden
  images: string[];
  howItWorksImages?: string[] | null;
  // ... andere velden
}
```

### Backend Validatie
```typescript
howItWorksImages: z.array(
  z.string()
    .min(1)
    .refine((val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'))
).max(6).optional().default([])
```

---

## 🎨 Frontend Gebruik

### ProductHowItWorks Component
```typescript
<ProductHowItWorks 
  howItWorksImages={product.howItWorksImages || null} 
/>
```

### Stappen Mapping
- Stap 1 → `howItWorksImages[0]`
- Stap 2 → `howItWorksImages[1]`
- Stap 3 → `howItWorksImages[2]`
- Stap 4 → `howItWorksImages[3]`
- Stap 5 → `howItWorksImages[4]`
- Stap 6 → `howItWorksImages[5]`

**Fallback**: Als `howItWorksImages` leeg is of niet bestaat, worden geen afbeeldingen getoond (alleen iconen).

---

## ✅ Voordelen

1. **Volledig Los van Variant Afbeeldingen**
   - Variant afbeeldingen blijven voor variant selectie
   - "Hoe werkt het?" afbeeldingen zijn specifiek voor stappen

2. **Geen Hardcode**
   - Alles dynamisch via admin panel
   - Perfect aansluitend op codebase systeem

3. **Flexibel**
   - Optioneel (niet verplicht)
   - Max 6 afbeeldingen (voor 6 stappen)
   - Kan per product verschillend zijn

4. **Maintainable**
   - Duidelijke scheiding van concerns
   - Eenvoudig te beheren via admin UI

---

## 📝 Gebruik Instructies

### Admin Panel
1. Ga naar **Producten** → Selecteer product → **Bewerken**
2. Scroll naar **"Hoe werkt het? Afbeeldingen"** sectie
3. Upload maximaal 6 afbeeldingen (één per stap)
4. **Opslaan**

### Resultaat
- Afbeeldingen verschijnen automatisch in de "Hoe werkt het?" sectie op de product detail pagina
- Elke stap toont de corresponderende afbeelding (indien geüpload)
- Als geen afbeeldingen geüpload zijn, worden alleen iconen getoond

---

## ✅ Deployment Status

- ✅ Database migratie uitgevoerd
- ✅ Backend API ondersteunt `howItWorksImages`
- ✅ Admin UI heeft upload sectie
- ✅ Frontend component gebruikt `howItWorksImages`
- ✅ Alle services gedeployed en online

---

**Datum**: 2026-01-23  
**Status**: ✅ **PRODUCTION READY**
