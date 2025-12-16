# Z-INDEX LAYERING HIERARCHY

## DRY: Single Source of Truth voor Z-index waarden

### Layer Definitie (van laag naar hoog):
```
z-0     → Base content
z-10    → Elevated content
z-20    → Dropdowns, tooltips
z-30    → Navbar, header
z-40    → Sticky Cart Bar ✓
z-50    → Floating elements
z-100   → Chat Button ✓
z-110   → Chat Modal Overlay ✓
z-120   → Chat Modal Content ✓
```

### Component Z-Index Mapping:

**Sticky Cart Bar:** `z-40`
- Fixed bottom bar op productpagina
- Toont bij scroll down
- Onder chat button

**Chat Button:** `z-[100]`
- Fixed bottom-24 (mobiel) / bottom-8 (desktop)
- Altijd zichtbaar
- Boven sticky cart bar
- Moves up op mobiel (bottom-24) om overlap te voorkomen

**Chat Modal:**
- Overlay: `z-[110]`
- Content: `z-[120]`
- Volledig scherm centered modal

### Overlap Prevention:
- ✅ Chat button: bottom-24 op mobiel (boven sticky cart)
- ✅ Chat button: bottom-8 op desktop (sticky cart is smaller)
- ✅ Z-index: Chat (100) > Sticky Cart (40)
- ✅ Smooth transitions (300ms)

### Testing:
1. Open productpagina
2. Scroll naar beneden
3. Sticky cart verschijnt
4. Chat button blijft zichtbaar en klikbaar
5. Geen overlap

Last updated: Dec 16, 2025
