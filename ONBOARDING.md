# 🚀 KATTENBAK WEBSHOP - COMPLETE ONBOARDING

## 📁 PROJECT STRUCTUUR

```
/Users/emin/kattenbak/
├── backend/          # Node.js + Express + Prisma + PostgreSQL
├── frontend/         # Next.js 16 App Router + React 19
├── admin-next/       # Next.js 16 Admin Panel
└── scripts/          # Deployment scripts
```

**Stack:**
- Backend: Node 22, Express 4, Prisma 6, PostgreSQL 16, Redis 7
- Frontend: Next.js 16, React 19, Tailwind CSS 4, TanStack Query
- Admin: Next.js 16, React Admin pattern
- Payments: Mollie (LIVE), iDEAL, PayPal
- Shipping: MyParcel (PostNL)
- AI: Claude Sonnet 4, RAG system, vector embeddings

---

## 🖥️ SERVER CONFIGURATIE

**Server:** VPS @ `185.224.139.74`  
**SSH:** `ssh root@185.224.139.74` (wachtwoord: zie `.cursor/commands/` of vraag admin)  
**Domain:** `catsupply.nl` (Nginx reverse proxy)  
**Location:** `/var/www/kattenbak/`

### Process Manager (PM2):
```bash
pm2 list
# backend  - Port 3101
# frontend - Port 3000  
# admin    - Port 3001
```

### Nginx Config:
```nginx
# /etc/nginx/conf.d/kattenbak.conf
server {
  server_name catsupply.nl;
  
  # Frontend (/)
  location / {
    proxy_pass http://localhost:3000;
  }
  
  # Admin (/admin)
  location /admin {
    proxy_pass http://localhost:3001;
  }
  
  # API (/api)
  location /api {
    proxy_pass http://localhost:3101;
  }
  
  # Static assets
  location /_next/static/ { ... }
  location /admin/_next/static/ { ... }
}
```

---

## 🚀 DEPLOYMENT PROCES

### Automated Deployment Script:
**File:** `/var/www/kattenbak/scripts/deploy.sh`

```bash
# LOKAAL: Push naar Git
cd /Users/emin/kattenbak
git add -A
git commit -m "feat: your message"
git push origin main

# SERVER: Deploy (via SSH)
sshpass -p '$SERVER_PASSWORD' ssh root@185.224.139.74 \
  "cd /var/www/kattenbak && bash scripts/deploy.sh"
```

### Deploy Script Flow:
```bash
#!/bin/bash
set -e

# 1. Git pull
git pull origin main

# 2. Backend: Install + Build + Restart + Health Check
cd backend
npm install --include=optional
npm run build
pm2 restart backend
# Health check: curl localhost:3101/api/v1/health

# 3. Frontend: Install + Build + Restart + Health Check
cd ../frontend
npm install
npm run build
pm2 restart frontend
# Health check: curl https://catsupply.nl (HTTP 200)

# 4. Admin: Install + Build + Restart + Health Check
cd ../admin-next
npm install
npm run build
pm2 restart admin
# Health check: curl https://catsupply.nl/admin (HTTP 200)

# 5. Success: pm2 status
```

**Health Checks:**
- 10 retries, 3s delay
- Logs bij failure: `pm2 logs [service] --lines 50`

---

## 🔐 ENVIRONMENT VARIABLES

### Backend (.env.production):
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kattenbak"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Mollie (LIVE)
MOLLIE_API_KEY="live_xxxxxxxxxxxxxxxxxxxx"  # Zie .cursor/commands/molliekey.md

# MyParcel (LIVE) ⚠️ NOG INSTELLEN
MYPARCEL_API_KEY="jouw_myparcel_live_key"

# SMTP (voor return labels) ⚠️ NOG INSTELLEN
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"

# URLs
FRONTEND_URL="https://catsupply.nl"
BACKEND_URL="https://catsupply.nl/api/v1"

# Security
HCAPTCHA_SECRET_KEY="your_hcaptcha_secret"

# Claude AI
ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

### Frontend (.env.production):
```bash
NEXT_PUBLIC_API_URL="https://catsupply.nl/api/v1"
NEXT_PUBLIC_FRONTEND_URL="https://catsupply.nl"
```

### Admin (.env.production):
```bash
NEXT_PUBLIC_API_URL="https://catsupply.nl/api/v1"
NEXT_TELEMETRY_DISABLED=1
```

---

## 📦 BUILD STRATEGIEËN

### Backend:
```json
// package.json
{
  "scripts": {
    "build": "tsc && tsc-alias",
    "start": "node dist/server-database.js",
    "dev": "tsx watch src/server-database.ts"
  }
}
```

**Output:** TypeScript → `dist/` folder  
**Alias:** `@/` paths resolved via `tsc-alias`  
**Entry:** `dist/server-database.js` (PM2)

### Frontend:
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p 3000"
  }
}

// next.config.ts
{
  output: 'standalone',
  reactStrictMode: true
}
```

**Output:** `.next/` folder (optimized production build)  
**Mode:** Standalone server (geen external dependencies)  
**Port:** 3000 (hardcoded in start script)

### Admin:
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p 3001"
  }
}

// next.config.ts
{
  output: 'standalone',
  basePath: '/admin',
  reactStrictMode: true
}
```

**Output:** `.next/` folder  
**BasePath:** `/admin` (voor subpath routing)  
**Port:** 3001

---

## 🗄️ DATABASE

### Prisma Commands:
```bash
# Schema wijzigen
cd backend
npx prisma db push --accept-data-loss  # Development
npx prisma migrate dev --name migration_name  # Met migrations

# Prisma Client regenereren
npx prisma generate

# Database reset (⚠️ DATA LOSS)
npx prisma migrate reset

# Studio (GUI)
npx prisma studio  # http://localhost:5555
```

### Schema Location:
`backend/prisma/schema.prisma`

### Belangrijke Models:
```prisma
- User (admin, customer)
- Product (met isPreOrder, preOrderDiscount, videoUrl, uspImage1/2)
- Category
- Order (met addresses, items, payment, shipment)
- OrderItem
- Payment (Mollie integratie)
- Shipment (MyParcel)
- Return (MyParcel return system) ⚠️ Routes nog activeren
- Address
- AuditLog
```

---

## 🔧 GIT WORKFLOW

### Pre-commit Hooks:
`.husky/pre-commit` voert security checks uit:
```bash
# .husky/pre-commit
#!/bin/bash
backend/scripts/pre-commit-check.sh
```

**Checks:**
- Hardcoded secrets (API keys, passwords)
- console.log statements
- SQL injection patterns
- XSS vulnerabilities
- .env files in commit

**Bypass (⚠️ NIET DOEN):**
```bash
git commit --no-verify
```

### Branch Strategy:
```bash
main  # Production (direct deploy)
```

---

## 🎨 BELANGRIJKE FEATURES

### 1. BTW Berekening (KRITIEK):
```typescript
// Prijzen zijn INCLUSIEF BTW!
const priceInclBTW = 299.94;
const taxRate = 0.21;
const tax = priceInclBTW - (priceInclBTW / (1 + taxRate));
const priceExclBTW = priceInclBTW - tax;
const total = priceInclBTW + shippingCost; // GEEN BTW ERBIJ!
```

### 2. Mollie Payments:
```typescript
// backend/src/services/mollie.service.ts
MollieService.createPayment(orderId, amount, description, redirectUrl, method)
// Webhook: /api/v1/webhooks/mollie
// Status updates: PENDING → PAID → Stock decrement
```

### 3. MyParcel Returns (⚠️ NOG ACTIVEREN):
```typescript
// backend/src/services/myparcel.service.ts
MyParcelService.createReturnShipment(returnId)
// options: { return: true } ← Creates return label
// Email: sendReturnLabelEmail()
```

### 4. RAG Chat System:
```typescript
// backend/src/services/rag/claude-direct.service.ts
ClaudeDirectService.query(message, conversationId)
// Vector store: multilingual-e5-base embeddings
// Documents: backend/data/knowledge-base.json
```

### 5. Pre-order Discount:
```typescript
// Product model
isPreOrder: boolean
preOrderDiscount: Decimal // Percentage (e.g. 20.00)
releaseDate: DateTime

// Calculation in order creation
if (product.isPreOrder && product.preOrderDiscount) {
  itemPrice *= (1 - discount / 100);
}
```

### 6. Dynamic USP Images:
```typescript
// Product model
uspImage1: String? // Homepage zigzag section
uspImage2: String? // Homepage zigzag section
videoUrl: String?  // Product detail video

// Admin: /dashboard/products/:id/page.tsx
// Upload via FileUpload component → /api/v1/upload/image
```

---

## 🚨 KRITIEKE ISSUES & OPLOSSINGEN

### Issue 1: Backend Crash (Sharp Module)
**Symptom:** `MODULE_NOT_FOUND: sharp`  
**Oorzaak:** Cross-platform binary incompatibility (macOS → Linux)  
**Oplossing:** Temporary fallback naar `upload.routes.simple.ts` (geen Sharp processing)

### Issue 2: Nginx MIME Type Errors
**Symptom:** CSS als `text/plain` served  
**Oplossing:** Explicit `location /_next/static/` blocks met `types` directive

### Issue 3: Double API Path (`/api/v1/api/v1/...`)
**Oorzaak:** Route mounting + client base URL beide met `/api/v1`  
**Oplossing:** Check route mounting in `server-database.ts`

### Issue 4: Admin 404 Errors
**Oorzaak:** `basePath: '/admin'` + incorrect internal links  
**Oplossing:** Gebruik relatieve paths of prefix met `/admin`

### Issue 5: Order Creation 500 Error
**Oorzaak:** Fields niet in Prisma schema (`customerFirstName`, `paymentStatus`, etc.)  
**Oplossing:** Only use fields defined in `schema.prisma`

### Issue 6: Return Routes Disabled
**Status:** ⚠️ TIJDELIJK DISABLED  
**Oorzaak:** `@/` imports in `returns.routes.ts` werken niet in production build  
**Oplossing:** Wacht op MyParcel + SMTP keys → dan activeren

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] Git committed & pushed
- [ ] .env files NOT in commit
- [ ] Security checks passed
- [ ] TypeScript compiles (`npm run build`)
- [ ] Tests passed (if any)

### Deployment:
- [ ] Run `deploy.sh`
- [ ] Backend health check OK
- [ ] Frontend health check OK
- [ ] Admin health check OK
- [ ] PM2 status all online

### Post-Deployment:
- [ ] Test checkout flow (iDEAL, PayPal)
- [ ] Test admin login
- [ ] Test product creation/editing
- [ ] Check PM2 logs (`pm2 logs --lines 100`)
- [ ] Monitor error logs

---

## 🔑 ADMIN CREDENTIALS

**URL:** `https://catsupply.nl/admin/login`  
**Test Account:** Zie admin credentials in `.cursor/commands/`

**⚠️ BELANGRIJK:** Wijzig credentials na eerste login!

---

## 📞 DEBUGGING

### View Logs:
```bash
# All services
pm2 logs

# Specific service
pm2 logs backend
pm2 logs frontend
pm2 logs admin

# Last N lines
pm2 logs backend --lines 100
```

### Restart Services:
```bash
pm2 restart backend
pm2 restart frontend
pm2 restart admin
pm2 restart all
```

### Check Status:
```bash
pm2 status
pm2 monit  # Real-time monitor
```

### Database Queries:
```bash
cd /var/www/kattenbak/backend
npx prisma studio  # GUI on port 5555
# Or direct SQL:
psql -U kattenbak_user -d kattenbak
```

### Nginx:
```bash
# Test config
nginx -t

# Reload
systemctl reload nginx

# Logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## 🎯 TODO: NOG TE CONFIGUREREN

### 1. MyParcel API Key
```bash
# Verkrijg key: https://backoffice.myparcel.nl/settings/api
# Server: /var/www/kattenbak/backend/.env
MYPARCEL_API_KEY="jouw_key_hier"
```

### 2. SMTP Configuratie
```bash
# Gmail App Password: https://myaccount.google.com/apppasswords
# Server: /var/www/kattenbak/backend/.env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="jouw-email@gmail.com"
SMTP_PASS="jouw-app-wachtwoord"
```

### 3. Return Routes Activeren
Na keys instellen:
```bash
# In server-database.ts:
const returnsRoutes = require('./routes/returns.routes').default;
app.use('/api/v1/returns', returnsRoutes);
```

---

## 📊 LIVE STATUS (NU)

✅ **Backend:** Healthy (Port 3101)  
✅ **Frontend:** Healthy (Port 3000)  
✅ **Admin:** Healthy (Port 3001)  
✅ **Database:** PostgreSQL connected  
✅ **Redis:** Connected  
✅ **Nginx:** Proxying correct  
✅ **Mollie:** LIVE key configured  
⏸️ **MyParcel:** Keys needed  
⏸️ **SMTP:** Keys needed  

**Live URL:** https://catsupply.nl  
**Admin URL:** https://catsupply.nl/admin  

---

## 🚀 QUICK COMMANDS

```bash
# DEPLOY
sshpass -p '$SERVER_PASSWORD' ssh root@185.224.139.74 \
  "cd /var/www/kattenbak && bash scripts/deploy.sh"

# CHECK STATUS
sshpass -p '$SERVER_PASSWORD' ssh root@185.224.139.74 "pm2 status"

# VIEW LOGS
sshpass -p '$SERVER_PASSWORD' ssh root@185.224.139.74 "pm2 logs --lines 50"

# RESTART ALL
sshpass -p '$SERVER_PASSWORD' ssh root@185.224.139.74 "pm2 restart all"

# DATABASE PUSH (after schema change)
sshpass -p '$SERVER_PASSWORD' ssh root@185.224.139.74 \
  "cd /var/www/kattenbak/backend && npx prisma db push"
```

---

## 📚 KEY FILES

**Backend:**
- `backend/src/server-database.ts` - Main server (no @ imports!)
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/services/mollie.service.ts` - Payment logic
- `backend/src/services/myparcel.service.ts` - Shipping/returns
- `backend/src/services/email.service.ts` - Email (return labels)

**Frontend:**
- `frontend/app/page.tsx` - Homepage
- `frontend/app/checkout/page.tsx` - Checkout flow
- `frontend/app/retourneren/page.tsx` - Return request
- `frontend/components/products/product-detail.tsx` - Product page
- `frontend/types/product.ts` - Product interface

**Admin:**
- `admin-next/app/dashboard/products/[id]/page.tsx` - Edit product
- `admin-next/app/dashboard/orders/page.tsx` - Orders list
- `admin-next/app/dashboard/returns/page.tsx` - Returns management

**Deployment:**
- `scripts/deploy.sh` - Automated deployment
- `.husky/pre-commit` - Git hooks

---

## 🎓 ONBOARDING COMPLETE

**Repository:** https://github.com/User-Emin/kattenbak  
**Server:** `root@185.224.139.74` (wachtwoord: zie `.cursor/commands/`)  
**Domain:** https://catsupply.nl  

**Next Steps:**
1. Configure MyParcel API key
2. Configure SMTP credentials
3. Activate return routes
4. E2E test return flow
5. Monitor PM2 logs

**Support:** Check `pm2 logs` voor errors!

