# 🔧 ENVIRONMENT VARIABLES GUIDE

**Maximaal Dynamisch & Maintainable**  
**DRY: Single Source of Truth per Environment**

---

## 📋 ENVIRONMENT FILES

### Development
```
/frontend/.env.development          ← Frontend development
/frontend/.env                      ← Frontend shared
/admin-next/.env.local              ← Admin development  
/backend/.env                       ← Backend development
```

### Production (Create These)
```
/frontend/.env.production           ← Frontend production
/admin-next/.env.production         ← Admin production
/backend/.env.production            ← Backend production
```

---

## 🎯 REQUIRED VARIABLES

### Frontend (`.env.development` / `.env.production`)

```env
# API Connection
NEXT_PUBLIC_API_URL=http://localhost:4000

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3102

# hCaptcha (GDPR)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-site-key-here
```

**Production Example:**
```env
NEXT_PUBLIC_API_URL=https://api.kattenbak.nl
NEXT_PUBLIC_SITE_URL=https://kattenbak.nl
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=live-site-key
```

---

### Admin (`.env.local` / `.env.production`)

```env
# API Connection
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

**Production Example:**
```env
NEXT_PUBLIC_API_URL=https://api.kattenbak.nl/api/v1
```

---

### Backend (`.env` / `.env.production`)

```env
# Server
NODE_ENV=development
BACKEND_PORT=4000

# Database
DATABASE_URL=postgresql://localhost:5432/kattenbak_dev?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGINS=http://localhost:3102,http://localhost:3001

# Payment (Mollie)
MOLLIE_API_KEY=test_xxx

# Shipping (MyParcel)  
MYPARCEL_API_KEY=test_xxx
MYPARCEL_MODE=test

# hCaptcha
HCAPTCHA_SECRET_KEY=your-secret-key
```

**Production Example:**
```env
NODE_ENV=production
BACKEND_PORT=4000
DATABASE_URL=postgresql://prod-user:pass@prod-db:5432/kattenbak_prod
REDIS_HOST=redis-prod
CORS_ORIGINS=https://kattenbak.nl,https://admin.kattenbak.nl
MOLLIE_API_KEY=live_xxxxxxxxxxxxx
MYPARCEL_API_KEY=live_xxxxxxxxxxxxx
MYPARCEL_MODE=production
HCAPTCHA_SECRET_KEY=live-secret-key
```

---

## 🔒 CURRENT DEVELOPMENT CONFIG

### Verified Working Configuration

```
Frontend:  localhost:3102 → Backend: localhost:4000 ✅
Admin:     localhost:3001 → Backend: localhost:4000 ✅
Backend:   localhost:4000 → Mock Data ✅
```

### Config Files Using Environment Variables

```typescript
// ✅ Frontend (/lib/config.ts)
BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ✅ Admin (/lib/api/client.ts)  
API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

// ✅ Backend (/config/env.config.ts)
BACKEND_PORT: process.env.BACKEND_PORT || 4000
```

---

## ✅ ISOLATION VERIFICATION

### No Hardcoded Production URLs
```typescript
// ❌ BAD (hardcoded):
const API_URL = 'https://api.kattenbak.nl'

// ✅ GOOD (environment-based):
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
```

### Proper Fallbacks
```typescript
// Development: uses fallback (localhost:4000)
// Production: uses environment variable (https://api.kattenbak.nl)
```

### Security
- ✅ No secrets in code
- ✅ All sensitive data via environment
- ✅ `.env` files in `.gitignore`
- ✅ Production config separate

---

## 🚀 BENEFITS

### Development
- ✅ Easy local setup
- ✅ No production interference
- ✅ Mock data for testing
- ✅ Fast iteration

### Production
- ✅ Environment-based config
- ✅ No code changes needed
- ✅ Secure secret management
- ✅ Isolated from development

### Maintainability
- ✅ DRY: Single source per environment
- ✅ Type-safe configs
- ✅ Easy to update
- ✅ Clear separation

---

## 📝 USAGE

### Local Development
```bash
# No setup needed - uses fallbacks
cd frontend && npm run dev
cd admin-next && npm run dev
cd backend && npm run dev
```

### Production Build
```bash
# Set environment variables
export NEXT_PUBLIC_API_URL=https://api.kattenbak.nl

# Build
npm run build

# Start
npm run start
```

### Docker/Container
```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      - NEXT_PUBLIC_API_URL=https://api.kattenbak.nl
  backend:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - MOLLIE_API_KEY=${MOLLIE_API_KEY}
```

---

## ✅ CHECKLIST

### Environment Configuration
- [x] Frontend uses `process.env`
- [x] Admin uses `process.env`
- [x] Backend uses `process.env`
- [x] Fallbacks for development
- [x] No hardcoded production URLs

### API Communication
- [x] Frontend → Backend tested
- [x] Admin → Backend tested
- [x] All endpoints working
- [x] Mock data functional

### Production Isolation
- [x] Separate `.env` files
- [x] Environment variable usage
- [x] No secrets in code
- [x] Safe for deployment

---

*Generated: 2025-12-12*

