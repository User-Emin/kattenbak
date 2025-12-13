# ✅ DESIGN UPDATES - ZONDER REDUNDANTIE

## 🎨 USP Kaarten (Waarom Kiezen)

### ❌ OUD:
- Border rondom kaarten
- Gekleurde cirkel achter icon
- Lichter grijs voor separators

### ✅ NIEUW:
```tsx
<div className="group text-center">
  {/* Icon direct op achtergrond */}
  <div className="text-accent mb-6">
    <Truck className="h-12 w-12" />
  </div>
  
  <h3>Gratis Verzending</h3>
  
  {/* Donkere grijze scheidingslijn */}
  <div className="w-16 h-px bg-gray-400 mx-auto my-4" />
  
  <p>Morgen in huis</p>
</div>
```

**Kenmerken:**
- ✅ Geen border/kaart achtergrond
- ✅ Icon direct zichtbaar (#2ab8b8)
- ✅ Donkerdere grijze lijn (gray-400)
- ✅ Clean & minimalistisch
- ✅ Hover scale op icon

---

## 🔧 Separator Component

**Kleur Update:**
```tsx
// OUD: via-gray-200
// NIEUW: via-gray-400 (donkerder)

const VARIANT_STYLES = {
  float: 'bg-gradient-to-r from-transparent via-gray-400 to-transparent',
  solid: 'bg-gray-400',
  gradient: 'bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300',
};
```

---

## 📦 Product Detail Page

**Features Sectie:**
```tsx
<div className="flex items-start gap-4">
  {/* Icon direct op achtergrond */}
  <div className="text-accent mt-1">
    <Truck className="h-8 w-8" />
  </div>
  
  <div>
    <h3>Gratis Verzending</h3>
    {/* Donkere grijze lijn */}
    <div className="w-12 h-px bg-gray-400 my-2" />
    <p>Morgen in huis</p>
  </div>
</div>
```

**Wijzigingen:**
- ✅ Geen cirkel achtergrond
- ✅ Icon in accent color
- ✅ Donkere grijze separator
- ✅ Compactere tekst

---

## 🎯 Resultaat

**Consistentie:**
- Icons altijd direct op achtergrond (geen cirkels/vlakken)
- Separators altijd gray-400 (donkerder)
- Teksten compact en to-the-point
- Accent color #2ab8b8 voor alle icons

**Zero Redundantie:**
- Alle separators gebruiken `bg-gray-400`
- Alle icons zonder extra wrapper
- DRY principle overal toegepast
