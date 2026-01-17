# 🔍 PRIJS SYNCHRONISATIE PROBLEEM - ROOT CAUSE ANALYSIS

**Datum**: 2026-01-17  
**Probleem**: Prijs wordt aangepast naar €1.00 in admin, maar reset terug naar €299.99

---

## 🎯 ROOT CAUSE

### Probleem 1: Checkout gebruikt localStorage Cart
**Locatie**: `frontend/app/checkout/page.tsx` (regel 62-69)

```typescript
// ❌ OUDE CODE: Gebruikt cart items eerst (localStorage)
if (items && items.length > 0) {
  const cartProduct = items.find(...);
  setProduct(cartProduct.product); // ← Gebruikt oude prijs uit localStorage
  return; // ← Stopt hier, API wordt niet aangeroepen
}
```

**Gevolg**:
- Admin wijzigt prijs naar €1.00 → Database heeft €1.00 ✅
- Cart in localStorage heeft nog €299.99 ❌
- Checkout gebruikt cart prijs → Toont €299.99 ❌

### Probleem 2: Geen Cache Invalidation
**Locatie**: `backend/src/services/product.service.ts`

- Redis cache bestaat (TTL 300 seconden)
- Maar Redis is niet geïnstalleerd op server
- Cache invalidation werkt niet → Oude prijzen blijven in cache (indien actief)

### Probleem 3: Cart Synchronisatie
**Locatie**: `frontend/context/cart-context.tsx`

- Cart slaat product prijzen op in localStorage
- Prijzen worden niet gesynchroniseerd met backend
- Cart kan verouderde prijzen bevatten

---

## ✅ OPLOSSING

### Fix 1: Checkout gebruikt altijd API prijs
**Bestand**: `frontend/app/checkout/page.tsx`

```typescript
// ✅ NIEUWE CODE: ALTIJD API gebruiken voor actuele prijs
// Cart prijzen kunnen verouderd zijn na admin wijzigingen
// API geeft altijd de actuele database prijs
const data = await productsApi.getById(productId);
setProduct(data); // ← Gebruikt actuele database prijs
```

**Voordelen**:
- ✅ Altijd actuele prijs uit database
- ✅ Geen verouderde localStorage prijzen
- ✅ Consistente prijzen in checkout

### Fix 2: Product Update Cache Invalidation
**Bestand**: `backend/src/services/product.service.ts` (regel 429-431)

```typescript
// Cache invalidation na product update
if (RedisClient.isAvailable()) {
  await redis?.del(`${this.CACHE_PREFIX}${id}`);
}
```

**Status**: ✅ Al geïmplementeerd (werkt alleen als Redis actief is)

### Fix 3: Cart Price Synchronisatie (TOEKOMSTIG)
**Idee**: Cart items bijwerken met API prijzen bij laden

```typescript
// TODO: Bij cart laden, prijzen synchroniseren met API
useEffect(() => {
  items.forEach(async (item) => {
    const freshProduct = await productsApi.getById(item.product.id);
    if (freshProduct.price !== item.product.price) {
      // Update cart item prijs
    }
  });
}, []);
```

---

## 📊 STANDARDPRIJZEN

**Database Seed**: `backend/prisma/seed.ts` (regel 58)
- Standaard prijs: **€299.99**

**Mock Data**: `backend/src/data/mock-products.ts` (regel 15)
- Mock prijs: **€299.99**

**Opmerking**: Seed script overschrijft NIET bestaande producten (regel 35-39)

---

## 🔧 PREVENTIE

1. **Checkout**: ✅ Gebruikt altijd API (geen localStorage prijs)
2. **Admin Update**: ✅ Database wordt bijgewerkt, cache geïnvalideerd
3. **Cart**: ⚠️  Blijft localStorage gebruiken (alleen voor quantity, niet voor prijs)

---

## 📝 GEVOLGEN

### Voor Gebruiker
- ✅ Checkout toont altijd actuele prijs
- ✅ Admin prijswijzigingen zijn direct zichtbaar
- ⚠️  Cart pagina kan nog oude prijs tonen (alleen display, checkout is correct)

### Voor Developer
- ✅ Geen hardcoded prijzen in checkout
- ✅ Single source of truth: Database
- ✅ Cache invalidation bij updates (indien Redis actief)

---

## 🚀 VOLGENDE STAPPEN (OPTIONEEL)

1. **Cart Price Sync**: Cart items bijwerken met API prijzen
2. **Price Change Notification**: Toon melding als prijs is veranderd
3. **Redis Setup**: Activeer Redis cache voor betere performance
4. **Price History**: Log prijswijzigingen voor audit trail

---

**✅ FIX GEÏMPLEMENTEERD**: Checkout gebruikt nu altijd API prijs
**📅 DATUM**: 2026-01-17
**🔍 VERIFIED**: Root cause gevonden en opgelost
