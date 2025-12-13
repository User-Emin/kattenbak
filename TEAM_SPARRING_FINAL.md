# 🤝 TEAM SPARRING SESSION - KATTENBAK WEBSHOP

**Datum**: 10 December 2025  
**Focus**: Maximaal DRY, Dynamisch, Strak Design, Complete Flow

---

## 👥 TEAM EXPERTS AANWEZIG:

### 1. **DevOps Engineer** (Emma)
**Focus**: Environment variables, scheiding test/productie, configuratie management

**Analyse**:
- ✅ Huidige test key is hardcoded in meerdere plekken
- ⚠️ Geen centralized config voor alle services
- ⚠️ Environment validatie gebeurt alleen in backend
- 💡 **Oplossing**: Single source of truth config file

**Recommendations**:
```typescript
// shared/config.ts - DRY centrale configuratie
export const config = {
  env: process.env.NODE_ENV || 'development',
  mollie: {
    apiKey: process.env.MOLLIE_API_KEY || 'test_ePFM8bCr6NEqN7fFq2qKS6x7KEzjJ7',
    isTest: (process.env.MOLLIE_API_KEY || '').startsWith('test_'),
    validateProduction: () => {
      if (config.env === 'production' && config.mollie.isTest) {
        throw new Error('FATAL: TEST key in PRODUCTION');
      }
    }
  },
  api: {
    backend: process.env.BACKEND_URL || 'http://localhost:3101',
    frontend: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100',
  }
};
```

---

### 2. **Frontend Architect** (David)
**Focus**: State management, cart, flow optimization

**Analyse**:
- ❌ Geen winkelwagen implementatie
- ❌ Direct naar checkout (geen cart overview)
- ⚠️ Geen state persistence (page refresh = data loss)
- 💡 **Oplossing**: Context + localStorage voor cart

**Recommendations**:
```typescript
// CartContext - DRY state management
- localStorage voor persistence
- Cookie fallback voor guest checkout gegevens
- Centralized cart logic (add, remove, update quantity)
- Automatic sync across tabs
```

---

### 3. **Graphic Designer** (Sophie)
**Focus**: Visual design, smooth separators, image fields

**Analyse**:
- ✅ Clean minimalist base is goed
- ⚠️ Separators zijn basic borders
- ⚠️ Homepage image veld kan smoother
- 💡 **Oplossing**: Floating dividers met gradient shadow

**Design System - Grijze Zwevende Strepen**:
```css
/* Signature separator style */
.separator-float {
  position: relative;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #e5e5e5 10%, 
    #e5e5e5 90%, 
    transparent 100%
  );
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

/* Smooth image container */
.image-field-smooth {
  background: linear-gradient(145deg, #fafafa 0%, #ffffff 100%);
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}
```

**Homepage Afbeelding Velden**:
- Grote hero image: Gradient background, floating shadow
- Product spotlight: Soft border, hover lift effect
- Subtle animations: Scale on hover, smooth transitions

---

### 4. **UX Designer** (Liam)
**Focus**: User flow, guest checkout, form persistence

**Analyse**:
- ✅ Direct checkout is goed voor conversie
- ❌ Geen "bekijk winkelwagen" stap
- ❌ Geen guest checkout communicatie
- ❌ Form data loss bij refresh
- 💡 **Oplossing**: Optional cart view + cookies

**Flow Optimization**:
```
OUDE FLOW:
Product → Direct Checkout → Mollie
  ❌ Geen cart overview
  ❌ Geen quantity aanpassing mogelijk

NIEUWE FLOW (Guest-first):
Product → [Add to Cart] → Cart Modal/Page (optional)
  → Checkout (no login required)
  → Form autofill from cookies
  → Mollie payment
  → Success

FEATURES:
✅ Guest checkout default
✅ Form data in cookies (7 dagen)
✅ Cart in localStorage
✅ Optional account creation (na bestelling)
```

---

### 5. **Security Expert** (Marcus)
**Focus**: Environment scheiding, data security, cookies

**Analyse**:
- ✅ Mollie key scheiding is goed opgezet
- ⚠️ Cookies moeten secure flags hebben
- ⚠️ LocalStorage kan XSS gevoelig zijn
- 💡 **Oplossing**: httpOnly waar mogelijk, sanitization

**Security Checklist**:
```typescript
// Cookie settings - Maximaal secure
const cookieOptions = {
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 dagen
  path: '/',
};

// Data sanitization
- Valideer alle form inputs (Zod schemas)
- Escape user data before storage
- Use httpOnly cookies voor sensitive data
```

---

### 6. **Backend Developer** (Priya)
**Focus**: API consistency, order flow, guest handling

**Analyse**:
- ✅ Mock API is stable
- ⚠️ Geen cart endpoints
- ⚠️ Order flow verwacht customer email (goed voor guest)
- 💡 **Oplossing**: Cart optioneel, guest checkout first-class

**API Extensions**:
```typescript
// Guest-first order flow
POST /api/v1/orders
Body: {
  items: [...],
  customerEmail: "...", // Required (guest identifier)
  customerPhone?: "...", // Optional
  shippingAddress: {...}, // Required
  saveCustomerData?: boolean // Cookie consent
}

// Optional cart sync (als user wil)
GET/POST /api/v1/cart (localStorage backup)
```

---

## 🎯 TEAM CONSENSUS - IMPLEMENTATION PLAN:

### PRIORITY 1: Environment & Config (DevOps)
- [ ] Centralized config file (`shared/env.config.ts`)
- [ ] DRY environment validation
- [ ] Single source voor Mollie key
- [ ] TypeScript types voor alle env vars

### PRIORITY 2: Winkelwagen (Frontend + UX)
- [ ] CartContext met localStorage
- [ ] Mini cart component (header)
- [ ] Cart page (volledig overzicht)
- [ ] Smooth grijze floating separators
- [ ] Quantity controls
- [ ] Remove items
- [ ] Continue shopping / Checkout buttons

### PRIORITY 3: Guest Checkout Flow (UX + Backend + Security)
- [ ] Cookies voor form data persistence
- [ ] Auto-fill laatste gegevens
- [ ] "Doorgaan zonder account" messaging
- [ ] Consent checkbox voor data opslag
- [ ] 7 dagen cookie expiry

### PRIORITY 4: Design Upgrade (Graphic Designer)
- [ ] Grijze zwevende strepen overal
- [ ] Smooth image velden homepage
- [ ] Hover effects (lift, shadow)
- [ ] Gradient backgrounds subtiel
- [ ] Consistent spacing (16px grid)

### PRIORITY 5: Productpagina (Frontend + Designer)
- [ ] Zwevende separators tussen secties
- [ ] Smooth "Add to Cart" animatie
- [ ] Quantity selector clean design
- [ ] Product details met strepen
- [ ] Reviews sectie (mock)

### PRIORITY 6: Complete Flow Test (Alle team)
- [ ] Product bekijken
- [ ] Add to cart (modal feedback)
- [ ] Cart page bekijken
- [ ] Quantity aanpassen
- [ ] Checkout zonder account
- [ ] Form autofill (cookies)
- [ ] Mollie redirect
- [ ] Success page

---

## 🔍 DRY ANALYSIS - Waar kan dynamisch?

### Huidige Redundantie:
1. **Environment vars** - 3x gedeclareerd (backend, frontend, admin)
2. **API URLs** - Hardcoded in meerdere files
3. **Mollie key** - In .env + hardcoded fallback
4. **Separators** - Inline border classes overal
5. **Button variants** - Goed DRY ✅
6. **Form inputs** - Kunnen DRY-er met shared component

### Acties voor Maximaal DRY:
```typescript
// 1. Shared config package
/shared/
  /config/
    env.config.ts        // Alle environment vars
    api.config.ts        // API endpoints
    design.config.ts     // Design tokens
  /components/           // Gedeelde UI
    Separator.tsx        // DRY floating separator
    FormInput.tsx        // DRY form field
  /utils/
    cookies.ts           // Cookie helpers
    localStorage.ts      // Storage helpers

// 2. Design tokens
export const designTokens = {
  colors: { /* ... */ },
  spacing: [0, 4, 8, 16, 24, 32, 48, 64], // 8px grid
  separators: {
    float: 'bg-gradient-to-r from-transparent via-gray-200 to-transparent shadow-sm'
  }
};

// 3. Dynamic form persistence
const useFormPersistence = (formName: string) => {
  // Auto save/load from cookies
  // DRY across checkout, contact, etc
};
```

---

## 🎨 DESIGN SYSTEM - Grijze Zwevende Strepen

### Component Specification:
```typescript
<Separator 
  variant="float"     // float | solid | gradient
  spacing="lg"        // sm | md | lg | xl
  fade={true}         // Fade edges
  shadow={true}       // Subtle shadow
/>

// Usage:
<section>
  <ProductInfo />
  <Separator variant="float" spacing="lg" />
  <ProductDetails />
  <Separator variant="float" spacing="lg" />
  <ProductReviews />
</section>
```

### Visual Style:
- **Kleur**: #e5e5e5 (light gray)
- **Height**: 1px
- **Gradient**: Fade aan edges (transparent → gray → transparent)
- **Shadow**: 0 1px 3px rgba(0,0,0,0.04) - zeer subtiel
- **Spacing**: 48px boven/onder (adjustable)

---

## 💾 COOKIES & PERSISTENCE STRATEGY

### Data Opslag:
```typescript
// Cart data
localStorage: 'kattenbak_cart' // { items: [...], updated: timestamp }

// Guest checkout data (met consent)
cookies: {
  'kb_customer_data': {
    firstName, lastName, email, phone, address
  },
  'kb_consent': true,
  maxAge: 7 days
}

// Preferences
localStorage: 'kb_preferences' // { theme, language, etc }
```

### Privacy:
- Consent checkbox in checkout
- Clear opt-out
- Cookie banner (GDPR compliant)
- Data auto-delete na 7 dagen

---

## ✅ TEAM AKKOORD:

**DevOps (Emma)**: ✅ "Centralized config is must-have"  
**Frontend (David)**: ✅ "CartContext + localStorage = perfect"  
**Designer (Sophie)**: ✅ "Floating separators maken het! Smooth image velden zijn next level"  
**UX (Liam)**: ✅ "Guest-first flow is conversion optimizer"  
**Security (Marcus)**: ✅ "Cookie strategy is solid, secure flags essential"  
**Backend (Priya)**: ✅ "Guest orders werken al, mini cart API is bonus"  

---

## 🚀 START IMPLEMENTATIE:

**Volgorde**:
1. Centralized environment config ← DevOps
2. Separator component ← Designer
3. Cart context + components ← Frontend
4. Guest checkout cookies ← Security + Frontend
5. Homepage image veld upgrade ← Designer
6. Productpagina separators ← Designer + Frontend
7. Complete flow test ← Heel team

**Geschatte tijd**: 2-3 uur  
**Complexity**: Medium  
**Impact**: High (conversie + UX)

---

**Team Consensus: LET'S BUILD IT! 💪**
