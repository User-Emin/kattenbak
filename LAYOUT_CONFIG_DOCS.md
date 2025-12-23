# 🎯 LAYOUT CONFIG - NAVBAR & LOGO SIZING

## DRY: Single Source of Truth

**Locatie:** `frontend/lib/layout-config.ts`

## 📐 CONFIG STRUCTURE

```typescript
export const LAYOUT_CONFIG = {
  navbar: {
    height: 'h-16',        // FIXED - NEVER changes
    heightPx: 64,          // Pixels for calculations
    background: 'bg-brand',
    shadow: 'shadow-md',
  },
  
  logo: {
    height: 'h-24',        // DYNAMIC - easily adjustable
    heightPx: 96,
    width: 300,
    negativeMargin: '-my-4', // Auto-calculated
    zIndex: 'relative z-10',
  }
}
```

## 🎨 HOE HET WERKT

### 1. **Navbar = FIXED HEIGHT**
```tsx
<div className={`${LAYOUT_CONFIG.navbar.height}`}>
  // Always h-16 (64px)
  // Logo size doesn't affect navbar
</div>
```

### 2. **Logo = DYNAMIC SIZE**
```tsx
<Link className={`${LAYOUT_CONFIG.logo.negativeMargin}`}>
  <Image className={`${LAYOUT_CONFIG.logo.height}`} />
  // Logo h-24 steekt uit met -my-4
</Link>
```

### 3. **Negatieve Margin Berekening**
```
Logo:   96px (h-24)
Navbar: 64px (h-16)
Diff:   32px

Margin: -32px / 2 = -16px = -my-4
```

## ✅ VOORDELEN

1. **Single Source**: Alle maten in 1 file
2. **Navbar onafhankelijk**: Logo change ≠ navbar change
3. **Easy updates**: Pas config aan, klaar!
4. **Type-safe**: TypeScript export
5. **DRY**: No duplication

## 🔧 HOE LOGO GROOTTE AANPASSEN

**In `layout-config.ts`:**
```typescript
logo: {
  height: 'h-28',  // ← Change hier!
  heightPx: 112,   // ← Update px
  negativeMargin: '-my-6', // ← Update margin
}
```

**Formula:**
```
negativeMargin = -(logoHeightPx - navbarHeightPx) / 2 / 4
```

## 📊 HUIDIGE CONFIGURATIE

| Element | Value | Effect |
|---------|-------|--------|
| Navbar height | h-16 (64px) | FIXED |
| Logo height | h-24 (96px) | Dynamic |
| Logo margin | -my-4 (-16px) | Steekt uit |
| Logo z-index | z-10 | Boven content |

## 🚀 USAGE IN CODE

```tsx
import { LAYOUT_CONFIG } from "@/lib/layout-config";

<header className={LAYOUT_CONFIG.navbar.background}>
  <div className={LAYOUT_CONFIG.navbar.height}>
    <Link className={LAYOUT_CONFIG.logo.negativeMargin}>
      <Image className={LAYOUT_CONFIG.logo.height} />
    </Link>
  </div>
</header>
```

**Result:** 
- ✅ Navbar ALTIJD h-16
- ✅ Logo dynamisch aanpasbaar
- ✅ Centralized config
- ✅ Type-safe
