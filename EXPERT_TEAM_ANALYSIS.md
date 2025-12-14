# 🎯 EXPERT TEAM SPAR SESSIE - KATTENBAK DEPLOYMENT STRATEGIE

**Datum:** 14 December 2025  
**Doel:** Maximaal solide, compatibel, modern systeem met test automation

---

## 👥 EXPERT TEAM

### 🏗️ **BUILD ARCHITECT** - Jan
**Focus:** Compilation, bundling, transpilation

### 🔧 **INFRASTRUCTURE LEAD** - Sarah  
**Focus:** Monorepo, dependencies, Node.js versions

### 🧪 **QA ENGINEER** - Michael
**Focus:** Testing, automation, CI/CD

### 🚀 **DEVOPS SPECIALIST** - Lisa
**Focus:** Deployment, PM2, Nginx, scaling

### 🔒 **SECURITY EXPERT** - David
**Focus:** Hardening, vulnerabilities, best practices

### 🎨 **FRONTEND ARCHITECT** - Emma
**Focus:** Next.js, React, compatibility

---

## 🔍 PROBLEEM ANALYSE

### **Jan (Build):**
> "Het kernprobleem is TypeScript path aliases (`@/`). Dit werkt niet out-of-the-box met:
> - esbuild (geen native support)
> - tsc (compileert maar lost niet op)
> - Verschillende runtimes (Node.js vs bundlers)
> 
> **Root cause:** We proberen een DX feature (developer experience) in productie te forceren."

### **Sarah (Infrastructure):**
> "Workspace dependencies zijn een ramp:
> - `lightningcss-darwin-arm64` blijft terugkomen
> - Platform-specific binaries in lockfiles
> - Node.js 20 vs 22 engine mismatches
> - Geen echte monorepo setup (Turborepo/Nx)
> 
> **Root cause:** Onvolledige dependency isolation tussen apps."

### **Michael (QA):**
> "We hebben GEEN test automation:
> - Geen unit tests
> - Geen integration tests
> - Geen deployment verification
> - Geen health checks in CI/CD
> 
> **Root cause:** Deployment is een black box zonder feedback loop."

### **Lisa (DevOps):**
> "Deployment is fragiel:
> - Manual SSH commands
> - No rollback strategy
> - PM2 restarts in loops
> - No monitoring/alerting
> 
> **Root cause:** Geen mature deployment pipeline."

### **David (Security):**
> "Security is ad-hoc:
> - Plaintext passwords in scripts
> - No secrets management
> - Manual SSL setup
> - No security scanning
> 
> **Root cause:** Security als afterthought."

### **Emma (Frontend):**
> "Frontend dependencies zijn stabiel maar:
> - Next.js 16 (experimental features?)
> - API URL hardcoded in builds
> - No environment-specific configs
> - Admin misschien niet gebouwd
> 
> **Root cause:** Inconsistente build strategies."

---

## 💡 EXPERT CONSENSUS - TOP 3 OPLOSSINGEN

### **🥇 OPTIE 1: MODERNE MONOREPO (TURBOREPO + SWC)**
**Aanbevolen door:** Jan, Sarah, Lisa

#### **Setup:**
```bash
kattenbak/
├── apps/
│   ├── backend/       # Express + Prisma
│   ├── frontend/      # Next.js
│   └── admin/         # Next.js
├── packages/
│   ├── database/      # Prisma schema + client
│   ├── types/         # Shared TypeScript types
│   ├── ui/            # Shared components
│   └── config/        # Shared configs
├── turbo.json         # Build pipeline
└── package.json       # Root workspace
```

#### **Tech Stack:**
- **Build:** SWC (50x sneller dan tsc, native path support)
- **Monorepo:** Turborepo (caching, parallel builds)
- **Node.js:** Upgrade naar 22 LTS (native TypeScript support coming)
- **Package Manager:** pnpm (efficiënter dan npm)

#### **Voordelen:**
✅ Native TypeScript path support via `swc`  
✅ Incremental builds (alleen gewijzigde apps)  
✅ Shared code zonder duplication  
✅ Moderne stack (industry standard 2024/2025)  
✅ Betere caching → snellere deploys  

#### **Nadelen:**
❌ Grote refactor nodig  
❌ Learning curve voor team  
❌ 1-2 dagen setup tijd  

**Complexity:** ⭐⭐⭐⭐ (High)  
**Time to Deploy:** 2-3 dagen  
**Long-term ROI:** ⭐⭐⭐⭐⭐ (Excellent)

---

### **🥈 OPTIE 2: PRAGMATISCHE FIX (RELATIEVE IMPORTS + TSC)**
**Aanbevolen door:** Michael, David

#### **Approach:**
1. **Convert alle `@/` imports naar relatieve paths**
   ```typescript
   // Voor:
   import { logger } from '@/config/logger.config';
   
   // Na:
   import { logger } from '../../config/logger.config';
   ```

2. **Gebruik standard tsc build**
   ```json
   {
     "scripts": {
       "build": "tsc && tsc-alias",
       "build:fast": "tsc --skipLibCheck"
     }
   }
   ```

3. **Isoleer dependencies per app**
   - Verwijder root workspace
   - Elke app eigen package.json
   - Shared code via `npm link` of git submodules

#### **Voordelen:**
✅ Simpel, geen nieuwe tools  
✅ TypeScript native  
✅ Werkt overal (Node, bundlers, editors)  
✅ Klein refactor  
✅ Kan binnen 4 uur live  

#### **Nadelen:**
❌ Langere import paths  
❌ Geen code sharing tussen apps  
❌ Manual dependency sync  

**Complexity:** ⭐⭐ (Low)  
**Time to Deploy:** 4-6 uur  
**Long-term ROI:** ⭐⭐⭐ (Good)

---

### **🥉 OPTIE 3: HYBRID (SWC BACKEND + HUIDIGE FRONTEND)**
**Aanbevolen door:** Emma, Jan

#### **Approach:**
1. **Backend:** Rebuild met SWC
   ```bash
   npm install -D @swc/cli @swc/core
   ```
   
   `.swcrc`:
   ```json
   {
     "jsc": {
       "parser": {
         "syntax": "typescript",
         "decorators": true
       },
       "target": "es2020",
       "baseUrl": "./src",
       "paths": {
         "@/*": ["./*"]
       }
     },
     "module": {
       "type": "commonjs"
     }
   }
   ```

2. **Frontend/Admin:** Keep as-is (Next.js handles own build)

3. **Shared types:** Export via npm package

#### **Voordelen:**
✅ SWC = native path support  
✅ 10x snellere builds dan tsc  
✅ Frontend unchanged (no risk)  
✅ Moderate refactor  
✅ Kan binnen 1 dag live  

#### **Nadelen:**
❌ Mixed build systems  
❌ SWC configuratie complexer  
❌ Nog geen echte monorepo  

**Complexity:** ⭐⭐⭐ (Medium)  
**Time to Deploy:** 1 dag  
**Long-term ROI:** ⭐⭐⭐⭐ (Very Good)

---

## 🧪 TEST AUTOMATION STRATEGIE

### **Michael's Recommendation:**

#### **Fase 1: Deployment Verification (IMMEDIATE)**
```yaml
# .github/workflows/deploy-verify.yml
name: Deployment Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Build Backend
        run: |
          cd backend
          npm ci
          npm run build
          npm test
      
      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build
      
      - name: Security Scan
        uses: snyk/actions/node@master
      
      - name: Deploy to Server
        if: github.ref == 'refs/heads/main'
        run: ./deploy-production.sh
      
      - name: Health Check
        run: |
          sleep 30
          curl -f https://api.catsupply.nl/health
          curl -f https://catsupply.nl
```

#### **Fase 2: Integration Tests (WEEK 1)**
```typescript
// tests/integration/api.test.ts
import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
  });
  
  test('products endpoint returns data', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.products).toBeDefined();
  });
  
  test('order creation flow', async ({ request }) => {
    // Create order
    const order = await request.post('/api/orders', {
      data: { /* test data */ }
    });
    expect(order.status()).toBe(201);
    
    // Verify in database
    const orderData = await order.json();
    expect(orderData.id).toBeDefined();
  });
});
```

#### **Fase 3: E2E Tests (WEEK 2)**
```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('complete checkout flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="product-card"]');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  
  // Fill shipping
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="firstName"]', 'Test');
  // ... more fields
  
  // Select payment
  await page.click('[data-testid="payment-ideal"]');
  
  // Verify redirect to Mollie (mock in test)
  await expect(page).toHaveURL(/mollie|checkout/);
});
```

#### **Fase 4: Performance & Load Tests (WEEK 3)**
```javascript
// tests/load/api-load.js (k6)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% onder 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function () {
  const res = http.get('https://api.catsupply.nl/api/products');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

---

## 📦 PACKAGE COMPATIBILITY MATRIX

### **Sarah's Analysis:**

| Package | Current | Latest Stable | Recommended | Notes |
|---------|---------|---------------|-------------|-------|
| **Node.js** | 20.19.6 | 22.12.0 LTS | **22.12.0** | Native .env, improved perf |
| **TypeScript** | 5.x | 5.7.2 | **5.7.2** | Stable, good |
| **Next.js** | 16.0.8 | 15.1.2 (stable) | **15.1.2** | v16 = canary! |
| **Prisma** | 6.19.0 | 6.19.0 | **6.19.0** | Latest, good |
| **Express** | 4.x | 5.0.1 | **4.21.2** | v5 breaking changes |
| **PM2** | 6.0.14 | 6.0.14 | **6.0.14** | Latest, good |
| **esbuild** | Latest | 0.24.2 | **Skip** | Path issues |
| **SWC** | - | 1.10.3 | **1.10.3** | ⭐ Recommend |
| **Turborepo** | - | 2.3.3 | **2.3.3** | If monorepo |
| **pnpm** | - | 10.0.0 | **9.15.0** | v10 = beta |

**BREAKING:** Next.js 16 is canary/experimental! Downgrade to 15!

---

## 🎯 TEAM CONSENSUS: AANBEVOLEN STRATEGIE

### **⚡ IMMEDIATE (Today - 4 hours):**

**OPTIE 2.5: Quick Win met tsc-alias FIX**

```bash
# Op server
cd /var/www/kattenbak/backend

# Install correct version tsc-alias
npm install -D tsc-alias@1.8.10

# Fix tsconfig
cat > tsconfig.json << 'TS'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    },
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": false,
    "sourceMap": false
  }
}
TS

# Build met correcte flow
npx tsc --skipLibCheck
npx tsc-alias -p tsconfig.json

# Test
node dist/server.js &
sleep 5
curl http://localhost:3101/health

# Deploy
pm2 restart backend || pm2 start dist/server.js --name backend
```

**Waarom dit werkt:**
- `tsc-alias` version 1.8.10 = stabiel
- `skipLibCheck` = sneller, minder errors
- Post-process path replacement

---

### **📅 SHORT TERM (Week 1):**

1. **Downgrade Next.js 16 → 15** (frontend/admin)
2. **Upgrade Node.js 20 → 22** (server)
3. **Add deployment verification script**
4. **Setup GitHub Actions CI/CD**
5. **Add basic health checks**

---

### **🚀 MEDIUM TERM (Month 1):**

1. **Migrate naar SWC** (backend)
2. **Setup Turborepo** (optional maar recommended)
3. **Add integration tests** (Playwright)
4. **Setup monitoring** (Grafana/Prometheus)
5. **Add automated SSL renewal**

---

### **🏆 LONG TERM (Quarter 1):**

1. **Full monorepo migration** (Turborepo)
2. **Shared package architecture**
3. **E2E test suite** (full coverage)
4. **Load testing** (k6)
5. **Advanced monitoring & alerting**

---

## 🔒 SECURITY CHECKLIST

### **David's Must-Haves:**

#### **Immediate:**
- [ ] Move passwords to `.env` (not in scripts)
- [ ] Setup secrets manager (GitHub Secrets)
- [ ] SSL certificates (Let's Encrypt)
- [ ] Firewall rules (UFW)
- [ ] Rate limiting (Nginx)

#### **Week 1:**
- [ ] Security headers (Helmet.js)
- [ ] Input validation (Zod everywhere)
- [ ] SQL injection prevention (Prisma = safe)
- [ ] XSS protection (React = safe by default)
- [ ] CSRF tokens (for forms)

#### **Month 1:**
- [ ] Dependency scanning (Snyk/Dependabot)
- [ ] OWASP ZAP scanning
- [ ] Penetration testing
- [ ] Security audit
- [ ] Incident response plan

---

## 📊 DEPLOYMENT AUTOMATION

### **Lisa's Production-Grade Setup:**

```yaml
# deploy-automation.yml
name: Production Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install & Test Backend
        run: |
          cd backend
          npm ci
          npm run build
          npm test
      
      - name: Install & Test Frontend
        run: |
          cd frontend
          npm ci
          npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/kattenbak
            git pull origin main
            
            # Backend
            cd backend
            npm ci --production
            npm run build
            pm2 restart backend
            
            # Frontend
            cd ../frontend
            npm ci --production
            npm run build
            pm2 restart frontend
            
            # Health check
            sleep 30
            curl -f http://localhost:3101/health || exit 1
            curl -f http://localhost:3102 || exit 1
      
      - name: Rollback on Failure
        if: failure()
        run: |
          ssh root@$SERVER "pm2 restart all"
          # Notify team
  
  verify:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Smoke Tests
        run: |
          curl -f https://api.catsupply.nl/health
          curl -f https://catsupply.nl
          
      - name: Notify Success
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment successful! 🎉'
```

---

## 🎯 FINAL RECOMMENDATION

### **Team Unanimity: GO WITH HYBRID APPROACH**

**Phase 1 (TODAY - 4h):**
```bash
✅ Fix backend met tsc-alias 1.8.10
✅ Get backend running
✅ Deploy frontend/backend samen
✅ Basic health checks
```

**Phase 2 (WEEK 1):**
```bash
✅ Downgrade Next.js 16 → 15
✅ Upgrade Node.js 20 → 22
✅ Setup GitHub Actions
✅ Add deployment verification
✅ SSL certificates
```

**Phase 3 (MONTH 1):**
```bash
✅ Migrate backend naar SWC
✅ Add integration tests
✅ Setup monitoring
✅ Performance optimization
```

---

## ✅ ACTION ITEMS - PRIORITIZED

| Priority | Task | Owner | Time | Impact |
|----------|------|-------|------|--------|
| 🔴 **P0** | Fix backend build (tsc-alias) | Jan | 2h | BLOCKER |
| 🔴 **P0** | Deploy backend + frontend | Lisa | 1h | BLOCKER |
| 🟡 **P1** | Add health check automation | Michael | 2h | HIGH |
| 🟡 **P1** | Setup SSL certificates | David | 1h | HIGH |
| 🟡 **P1** | Downgrade Next.js 16→15 | Emma | 1h | HIGH |
| 🟢 **P2** | GitHub Actions CI/CD | Lisa | 4h | MEDIUM |
| 🟢 **P2** | Integration tests | Michael | 1d | MEDIUM |
| 🔵 **P3** | Migrate to SWC | Jan | 2d | LOW |
| 🔵 **P3** | Turborepo setup | Sarah | 3d | LOW |

---

## 💬 CLOSING REMARKS

**Jan:** "tsc-alias 1.8.10 should work. Let's get backend live first, then optimize."

**Sarah:** "Agreed. Monorepo is nice-to-have, not must-have. Focus on stability."

**Michael:** "Can't stress enough: WE NEED TESTS. Let's add them incrementally."

**Lisa:** "Deployment automation >>> manual SSH. GitHub Actions ASAP."

**David:** "Security isn't optional. SSL today, scanning tomorrow."

**Emma:** "Next.js 16 is trouble. Downgrade to 15 LTS for production."

---

**CONSENSUS: Fix today, optimize tomorrow. Ship it! 🚀**

