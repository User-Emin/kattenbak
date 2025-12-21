# 🔍 HARDCODE ANALYSE - Product Detail Page

## GEVONDEN HARDCODED WAARDEN:

### 1. KLEUREN (Hardcoded)
- `bg-white` - Meerdere plekken
- `border-gray-200`, `border-gray-300` - Borders
- `text-gray-900`, `text-gray-600` - Typography
- `bg-red-100`, `text-red-700` - Discount badge
- `text-green-600` - Check icons
- `#f75d0a`, `#e65400` - Inline hex codes (MOET WEG!)

### 2. SPACING (Hardcoded)
- `space-y-3`, `space-y-4`, `space-y-6` - Inconsistent
- `gap-2`, `gap-6` - Direct values
- `p-4`, `px-4`, `py-6` - Padding hardcoded
- `mb-2`, `mb-3`, `mb-4` - Margins hardcoded

### 3. TYPOGRAPHY (Hardcoded)
- `text-xs`, `text-sm`, `text-lg`, `text-2xl`, `text-3xl` - Direct sizes
- `font-bold`, `font-medium` - Weights hardcoded
- `leading-relaxed` - Line height

### 4. BORDERS & ROUNDING (Hardcoded)
- `border`, `border-2` - Widths
- `rounded-none` - Explicit no-rounding
- `overflow-hidden` - Scattered

### 5. DIMENSIONS (Hardcoded)
- `w-10`, `w-12`, `w-16`, `h-12`, `h-16` - Specific sizes
- `max-w-6xl`, `max-w-4xl` - Container widths
- `aspect-square` - Ratios

### 6. SHADOWS & EFFECTS (Hardcoded)
- `shadow-md` - Shadow depth
- `animate-bounce` - Animation

## OPLOSSING: GEBRUIK DESIGN TOKENS

```typescript
// shared/design-tokens.ts GEBRUIKEN!
- colors.primary, colors.secondary
- colors.brand.DEFAULT, colors.accent.DEFAULT
- spacing.xs, spacing.sm, spacing.md, etc.
- fontSize.xs, fontSize.sm, etc.
- borderRadius.sm, borderRadius.md
```

## BELANGRIJKSTE WIJZIGINGEN:

1. **Achtergrond**: Moet expliciet `#FFFFFF` zijn (nu implicit)
2. **Titel font-weight**: Van `font-bold` naar `font-semibold` of `font-medium`
3. **Kaarten**: VOLLEDIG WEG (nog borders aanwezig)
4. **Inline hex**: `bg-[#f75d0a]` moet `bg-accent` worden
5. **Spacing**: Gebruik design tokens consistent

## STATUS: 🔴 VEEL HARDCODE AANWEZIG
