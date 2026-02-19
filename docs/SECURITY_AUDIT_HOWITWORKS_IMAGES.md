# Security Audit: Hoe werkt het – geüploade afbeeldingen

**Datum:** 2025-02-17  
**Scope:** Productbewerking howItWorksImages → productdetail (accordion + standaard sectie)

## Overeenkomst met SECURITY_POLICY.md

| Principe | Status | Verificatie |
|----------|--------|-------------|
| **2. Injection Protection** | ✅ | howItWorksImages: Zod schema valideert URL/pad (starts with / or http(s)://). Geen eval, geen raw user input in queries. |
| **2. Path Traversal** | ✅ | Validator: `z.string().refine(val => val.startsWith('/') \|\| val.startsWith('http'))`. Geen `..` of `//` in URLs. |
| **2. XSS** | ✅ | Image `src` en `alt` uit gevalideerde productdata. Geen dangerouslySetInnerHTML. |
| **7. Code Quality** | ✅ | TypeScript, config via product-page-config, geen magic values. |
| **8. Leakage** | ✅ | Geen secrets in logs. Product data via bestaande API. |

## Wijzigingen

- **Backend:** `howItWorksImages` expliciet in updatePayload (product.routes).
- **Frontend:** Images vervangen symbolen in accordion + howItWorksSteps wanneer `product.howItWorksImages[index]` aanwezig.
- **Config:** Shared `steps` (titel + beschrijving) in product-page-config; imageWrapper classes.

## Conclusie

Geen nieuwe security-risico’s. Bestaande validatie en principes blijven van kracht.
