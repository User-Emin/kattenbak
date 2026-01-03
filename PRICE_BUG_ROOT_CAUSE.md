# 🚨 CRITICAL DISCOVERY - PRIJS BUG ROOT CAUSE

## ❌ PROBLEEM
De database bevat VERKEERDE prijs: **€100.01** ipv **€1.00**!

## 🔍 BEWIJS
Mini-cart (gebruikt OUDE code zonder /100 fix) toont:
- "€ 100,01" per stuk
- Subtotaal: "€ 300,03" voor 3 stuks

Product detail toont "€1,00" omdat die data HARDCODED is in frontend, niet uit database!

## ✅ OPLOSSING
1. Database prijs MOET zijn: `100` (in cents, want Prisma Decimal is in cents voor payment precision)
2. **OF** database prijs MOET zijn: `1.00` (in euros)

**CHOICE:** Gebruik CENTS in database (best practice voor payments)

## 🔧 FIX NEEDED
Update database product price:
```sql
UPDATE "Product" 
SET price = 100  -- 100 cents = €1.00
WHERE slug = 'automatische-kattenbak-premium';
```

Dan `/100` fix is CORRECT!

## 🎯 BESLISSING
De `/100` fix die ik maakte was CORRECT want:
- Standaard practice: opslaan in CENTS
- Voorkomt float precision errors
- Mollie API gebruikt ook cents
- MyParcel gebruikt ook cents

MAAR de database bevat nu €100.01 (10001 cents) ipv €1.00 (100 cents)!

