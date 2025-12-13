# 🔗 BACKEND ↔ FRONTEND KOPPELING - COMPLETE FLOW

## 📊 DYNAMISCHE ARCHITECTUUR

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                     │
│                    http://localhost:3001                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API Calls (fetch)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
│                   http://localhost:4000                     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │              ENDPOINTS (REST API)                 │    │
│  ├───────────────────────────────────────────────────┤    │
│  │                                                   │    │
│  │  POST   /api/v1/contact          → Chat          │    │
│  │  POST   /api/v1/orders           → Checkout      │    │
│  │  GET    /api/v1/products         → Producten     │    │
│  │  GET    /api/v1/admin/settings   → Site config   │    │
│  │  GET    /health                  → Health check  │    │
│  │                                                   │    │
│  └───────────────────────────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────┐    │
│  │              MIDDLEWARE STACK                     │    │
│  ├───────────────────────────────────────────────────┤    │
│  │                                                   │    │
│  │  1. CORS           → Cross-origin check          │    │
│  │  2. Helmet         → Security headers            │    │
│  │  3. Rate Limiter   → Spam prevention             │    │
│  │  4. Body Parser    → JSON parsing                │    │
│  │  5. Logger         → Request logging             │    │
│  │  6. hCaptcha       → Token verification          │    │
│  │                                                   │    │
│  └───────────────────────────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────┐    │
│  │              DATABASE (PostgreSQL)                │    │
│  ├───────────────────────────────────────────────────┤    │
│  │                                                   │    │
│  │  • Products       → Producten catalogus          │    │
│  │  • Orders         → Bestellingen                 │    │
│  │  • Settings       → Site configuratie            │    │
│  │  • [Messages]     → Contact berichten (TODO)     │    │
│  │                                                   │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ External APIs
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Mollie     │ │  hCaptcha    │ │  MyParcel    │
│  (Payment)   │ │  (Security)  │ │  (Shipping)  │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔄 CONTACT FORM FLOW (Chat)

### Frontend → Backend → Verification

```typescript
┌─────────────────────────────────────────────────────────┐
│ 1. FRONTEND: User vult chat formulier in               │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 2. COOKIE CHECK: hasConsent('functional')?             │
│    ├─ NEE → Toon cookie warning                        │
│    └─ JA  → Ga door naar captcha                       │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 3. HCAPTCHA: Generate token (invisible)                │
│    const token = await hcaptcha.execute(widgetId)      │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 4. FRONTEND API CALL:                                  │
│    POST http://localhost:4000/api/v1/contact           │
│    Body: {                                             │
│      email: "user@example.com",                        │
│      message: "Hulp nodig met bestelling",             │
│      orderNumber: "KB12345" (optional),                │
│      captchaToken: "P1_eyJ0eXAi..." ← hCaptcha token  │
│    }                                                   │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 5. BACKEND: Receive & Validate                         │
│    ├─ Zod schema validation                            │
│    ├─ Check required fields                            │
│    └─ Extract captchaToken                             │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 6. CAPTCHA VERIFICATION:                               │
│    POST https://hcaptcha.com/siteverify                │
│    Body: {                                             │
│      secret: "0x000...",  ← Backend SECRET_KEY         │
│      response: token      ← Frontend token             │
│    }                                                   │
└───────────────┬─────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
    ✅ Valid         ❌ Invalid
        │                │
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│ 7a. ACCEPT   │  │ 7b. REJECT   │
│ Save message │  │ Return 403   │
│ Return 201   │  │              │
└──────────────┘  └──────────────┘
```

**Code Koppeling:**

**Frontend** (`components/ui/chat-popup.tsx`):
```typescript
const token = await getToken(); // hCaptcha token

const response = await apiFetch(API_CONFIG.ENDPOINTS.CONTACT, {
  method: "POST",
  body: JSON.stringify({
    email,
    message,
    orderNumber,
    captchaToken: token, // ← Token naar backend
  }),
});
```

**Backend** (`routes/contact.routes.ts`):
```typescript
// Validate schema
const validatedData = contactMessageSchema.parse(req.body);

// Verify hCaptcha
const captchaResult = await verifyCaptcha(validatedData.captchaToken);

if (!captchaResult.valid) {
  return res.status(403).json({ error: 'Invalid captcha' });
}

// Save message
messages.push(newMessage);
res.status(201).json({ success: true });
```

**Captcha Middleware** (`middleware/captcha.middleware.ts`):
```typescript
export const verifyCaptcha = async (token: string) => {
  const formData = new URLSearchParams();
  formData.append('secret', SECRET_KEY);
  formData.append('response', token);

  const response = await axios.post(VERIFY_URL, formData);
  
  return {
    valid: response.data.success,
    score: response.data.score || 1.0
  };
};
```

---

## 🛒 CHECKOUT FLOW (Orders)

```typescript
┌─────────────────────────────────────────────────────────┐
│ 1. FRONTEND: User vult checkout form in                │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 2. VALIDATION: Check form data + cookies               │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 3. FRONTEND API CALL:                                  │
│    POST http://localhost:4000/api/v1/orders            │
│    Body: {                                             │
│      items: [{                                         │
│        productId: "1",                                 │
│        quantity: 1,                                    │
│        price: 299.95                                   │
│      }],                                               │
│      customer: {                                       │
│        firstName: "Jan",                               │
│        lastName: "Jansen",                             │
│        email: "jan@example.com",                       │
│        phone: "0612345678"                             │
│      },                                                │
│      shipping: {                                       │
│        address: "Straat 123",                          │
│        city: "Amsterdam",                              │
│        postalCode: "1012AB",                           │
│        country: "NL"                                   │
│      },                                                │
│      paymentMethod: "ideal"                            │
│    }                                                   │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 4. BACKEND: Create Order                               │
│    ├─ Zod schema validation                            │
│    ├─ Calculate totals                                 │
│    ├─ Save to database (Prisma)                        │
│    └─ Generate order number                            │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 5. MOLLIE PAYMENT:                                     │
│    POST https://api.mollie.com/v2/payments             │
│    Body: {                                             │
│      amount: { value: "299.95", currency: "EUR" },    │
│      description: "Order KB12345",                     │
│      redirectUrl: "http://localhost:3001/success",    │
│      webhookUrl: "http://yourdomain.com/webhook",     │
│      method: "ideal"                                   │
│    }                                                   │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 6. RETURN TO FRONTEND:                                 │
│    Response: {                                         │
│      success: true,                                    │
│      data: {                                           │
│        order: { id, orderNumber, ... },                │
│        paymentUrl: "https://mollie.com/checkout/..."  │
│      }                                                 │
│    }                                                   │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ 7. REDIRECT: window.location.href = paymentUrl         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 API CONFIGURATION (DRY)

**Frontend** (`lib/config.ts`):
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:4000',
  ENDPOINTS: {
    CONTACT: '/api/v1/contact',
    ORDERS: '/api/v1/orders',
    PRODUCTS: '/api/v1/products',
    SETTINGS: '/api/v1/admin/settings',
  },
  TIMEOUT: 10000,
};

// DRY: Centralized fetch helper
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
};
```

**Backend** (`server.ts`):
```typescript
// Import routes
import contactRoutes from './routes/contact.routes';
import ordersRoutes from './routes/orders.routes';
import productsRoutes from './routes/products.routes';

// Register routes
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/products', productsRoutes);
```

---

## 🛡️ SECURITY LAYERS

```
┌────────────────────────────────────────────┐
│  1. FRONTEND                               │
│     ├─ Cookie consent check                │
│     ├─ Form validation                     │
│     ├─ hCaptcha token generation           │
│     └─ HTTPS (production)                  │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│  2. NETWORK                                │
│     ├─ CORS policy                         │
│     ├─ Rate limiting                       │
│     └─ Request logging                     │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│  3. BACKEND                                │
│     ├─ Schema validation (Zod)             │
│     ├─ hCaptcha verification               │
│     ├─ SQL injection prevention (Prisma)   │
│     ├─ XSS sanitization                    │
│     └─ Error sanitization                  │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│  4. DATABASE                               │
│     ├─ Prepared statements                 │
│     ├─ Access control                      │
│     └─ Encrypted connections               │
└────────────────────────────────────────────┘
```

---

## ✅ DYNAMISCHE FEATURES

### 1. **Site Settings (Admin → Frontend)**
```typescript
// Backend: Store in database
PUT /api/v1/admin/settings
Body: {
  hero: { title: "...", subtitle: "..." },
  usps: { feature1: "...", feature2: "..." }
}

// Frontend: Fetch dynamically
const settings = await apiFetch(API_CONFIG.ENDPOINTS.SETTINGS);
<h1>{settings.hero.title}</h1>
```

### 2. **Products (Database → Frontend)**
```typescript
// Backend: Fetch from database
GET /api/v1/products
Response: [{ id, name, price, image, ... }]

// Frontend: Display dynamically
const products = await productsApi.getAll();
products.map(product => <ProductCard {...product} />)
```

### 3. **Orders (Frontend → Database → Mollie)**
```typescript
// Frontend: Submit order
const result = await ordersApi.create(orderData);

// Backend: Save to database + Create Mollie payment
const order = await prisma.order.create({ ... });
const payment = await mollieClient.payments.create({ ... });

// Return payment URL to frontend
return { order, paymentUrl: payment._links.checkout.href };
```

---

## 📊 MONITORING & DEBUGGING

**Development Console:**
```bash
# Frontend logs (browser console)
✅ hCaptcha widget initialized
🔄 Executing hCaptcha...
✅ hCaptcha token received
📤 Sending to backend...

# Backend logs (terminal)
📧 Nieuw contact bericht: { id: "MSG-...", email: "..." }
✅ hCaptcha verified (GDPR compliant): { score: 1.0 }
```

**Production Monitoring:**
```typescript
// Log all API calls
app.use(requestLogger);

// Track errors
app.use(errorHandler);

// Health check endpoint
GET /health
Response: {
  success: true,
  database: "connected",
  redis: "connected",
  version: "1.0.0"
}
```

---

## ✅ STATUS

✅ **Frontend ↔ Backend:** Volledig gekoppeld  
✅ **Security:** Multi-layer protection  
✅ **Dynamisch:** Database-driven content  
✅ **GDPR:** Cookie consent + data privacy  
✅ **DRY:** Centralized configs + reusable helpers  
✅ **Monitoring:** Comprehensive logging  

**Backend is volledig zichtbaar en dynamisch gekoppeld!** 🔗
