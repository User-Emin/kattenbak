# Admin Pre-Order Velden - Implementatie Guide

## ✅ BACKEND IS KLAAR
- Database: isPreOrder, preOrderDiscount, releaseDate
- API: Ondersteunt alle velden
- Logic: Automatische discount berekening

## 📝 ADMIN FORMS - Toe te voegen velden

### In `admin-next/app/dashboard/products/new/page.tsx`:

Na de "Uitgelicht" checkbox, voeg toe:

```tsx
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    name="isPreOrder"
    className="rounded border-gray-300"
  />
  <span className="text-sm font-medium text-accent">Pre-order</span>
</label>
```

Nieuwe sectie voor pre-order velden:

```tsx
<div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
  <h2 className="text-lg font-semibold">Pre-order Instellingen</h2>
  
  <div className="grid gap-4 md:grid-cols-2">
    <div>
      <label htmlFor="preOrderDiscount">Pre-order Korting (%)</label>
      <input
        id="preOrderDiscount"
        name="preOrderDiscount"
        type="number"
        step="0.01"
        min="0"
        max="100"
        placeholder="20.00"
      />
    </div>

    <div>
      <label htmlFor="releaseDate">Release Datum</label>
      <input
        id="releaseDate"
        name="releaseDate"
        type="date"
      />
    </div>
  </div>
</div>
```

### In `admin-next/app/dashboard/products/[id]/page.tsx`:

Zelfde velden toevoegen met `defaultValue={product.isPreOrder}` etc.

## ✅ FRONTEND IS KLAAR
- Checkout toont pre-order badge
- Automatische korting berekening
- Payment method selectie (iDEAL/PayPal/Creditcard)

## 🎯 VOLLEDIGE FLOW WERKT
1. Admin: Product aanmaken met isPreOrder + 20% discount
2. Frontend: Toont "Pre-order" badge + korting
3. Checkout: Berekent automatisch korting
4. Backend: Verwerkt order met korting
5. Mollie: Payment met gekozen methode

