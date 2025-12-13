# 🧪 **TESTING GUIDE - ENTERPRISE RETURN SYSTEM**

## 📊 **TEST STRATEGY**

**Test Pyramid (DRY Approach)**:
```
        E2E (5%)          ← Few, expensive, slow
       /        \
   Integration (15%)      ← API + DB tests
  /                \
Unit Tests (80%)           ← Fast, many, cheap
```

---

## ✅ **QUICK TEST EXAMPLES**

### **1️⃣ UNIT TESTS (Backend)**

#### **Validation Tests** (`return.validation.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { validateRequest, createReturnRequestSchema } from '@/validation/return.validation';

describe('Return Validation', () => {
  it('should validate correct return request', () => {
    const validRequest = {
      orderId: 'cjld2cjxh0000qzrmn831i7rn',
      orderNumber: 'ORD-2024-001',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      shippingAddress: {
        street: 'Teststraat',
        houseNumber: '1',
        postalCode: '1234AB',
        city: 'Amsterdam',
        country: 'NL',
      },
      reason: 'DEFECTIVE',
      items: [{
        productId: 'cjld2cjxh0000qzrmn831i7rn',
        productName: 'Test Product',
        quantity: 1,
      }],
    };

    const result = validateRequest(createReturnRequestSchema, validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidRequest = {
      // ... same as above
      customerEmail: 'not-an-email',
    };

    const result = validateRequest(createReturnRequestSchema, invalidRequest);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('customerEmail: Ongeldig email adres');
  });

  it('should reject invalid postal code', () => {
    const invalidRequest = {
      // ... same as above
      shippingAddress: {
        street: 'Test',
        houseNumber: '1',
        postalCode: '123',  // ❌ Invalid
        city: 'Amsterdam',
        country: 'NL',
      },
    };

    const result = validateRequest(createReturnRequestSchema, invalidRequest);
    expect(result.success).toBe(false);
  });
});
```

#### **Webhook Security Tests** (`webhooks.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('Webhook Security', () => {
  it('should verify valid HMAC signature', () => {
    const secret = 'test_secret';
    const payload = JSON.stringify({ shipment_id: 123 });
    
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Test verification function
    expect(verifySignature(payload, hmac, secret)).toBe(true);
  });

  it('should reject invalid signature', () => {
    const payload = '{"shipment_id":123}';
    const fakeSignature = 'fake_signature';
    
    expect(verifySignature(payload, fakeSignature, 'secret')).toBe(false);
  });

  it('should whitelist MyParcel IPs', () => {
    expect(isMyParcelIP('185.3.208.1')).toBe(true);
    expect(isMyParcelIP('1.2.3.4')).toBe(false);
    expect(isMyParcelIP('127.0.0.1')).toBe(true); // localhost
  });
});
```

---

### **2️⃣ INTEGRATION TESTS (API)**

#### **Return API Tests** (`returns.routes.test.ts`)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '@/server';

describe('POST /api/v1/returns', () => {
  it('should create return request', async () => {
    const response = await request(app)
      .post('/api/v1/returns')
      .send({
        orderId: 'test_order_1',
        orderNumber: 'ORD-2024-001',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        shippingAddress: {
          street: 'Teststraat',
          houseNumber: '1',
          postalCode: '1234AB',
          city: 'Amsterdam',
          country: 'NL',
        },
        reason: 'DEFECTIVE',
        items: [{
          productId: 'prod_1',
          productName: 'Test Product',
          quantity: 1,
        }],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('returnId');
    expect(response.body.data).toHaveProperty('trackingCode');
  });

  it('should reject invalid request', async () => {
    const response = await request(app)
      .post('/api/v1/returns')
      .send({
        orderId: 'test',
        // Missing required fields
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('should check return eligibility', async () => {
    const response = await request(app)
      .post('/api/v1/returns/validate/test_order_1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('eligible');
  });
});
```

---

### **3️⃣ E2E TESTS (Playwright)**

#### **Customer Return Flow** (`return-flow.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Customer Return Flow', () => {
  test('complete return request', async ({ page }) => {
    // 1. Navigate to order page
    await page.goto('http://localhost:3100/orders/test_order_1');
    
    // 2. Click return button
    await page.click('text=Retour aanvragen');
    
    // 3. Wait for form to load
    await expect(page.locator('h1')).toContainText('Retour aanvragen');
    
    // 4. Select reason
    await page.selectOption('#return-reason', 'DEFECTIVE');
    
    // 5. Fill reason details
    await page.fill('#reasonDetails', 'Product werkt niet goed');
    
    // 6. Select product
    await page.check('input[type="checkbox"]');
    
    // 7. Submit form
    await page.click('button:has-text("Retour aanvragen")');
    
    // 8. Wait for success
    await expect(page.locator('text=Retour aangevraagd!')).toBeVisible();
    await expect(page.locator('text=Tracking code')).toBeVisible();
    
    // 9. Verify tracking code is shown
    const trackingCode = await page.locator('[class*="font-mono"]').textContent();
    expect(trackingCode).toMatch(/^3S[A-Z0-9]+$/);
  });

  test('should prevent ineligible return', async ({ page }) => {
    // Test with expired return window
    await page.goto('http://localhost:3100/orders/old_order');
    await page.click('text=Retour aanvragen');
    
    await expect(page.locator('text=Retour niet mogelijk')).toBeVisible();
    await expect(page.locator('text=Return window expired')).toBeVisible();
  });
});
```

#### **Admin Return Management** (`admin-returns.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Returns Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3103/login');
    await page.fill('#email', 'admin@localhost');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Inloggen")');
    await page.waitForURL('**/dashboard');
  });

  test('view returns list', async ({ page }) => {
    await page.goto('http://localhost:3103/dashboard/returns');
    
    await expect(page.locator('h1')).toContainText('Retouren');
    await expect(page.locator('table')).toBeVisible();
  });

  test('filter returns by status', async ({ page }) => {
    await page.goto('http://localhost:3103/dashboard/returns');
    
    // Select filter
    await page.selectOption('select', 'REQUESTED');
    
    // Verify filtered results
    const statusBadges = await page.locator('[class*="badge"]').allTextContents();
    statusBadges.forEach(badge => {
      expect(badge).toBe('Aangevraagd');
    });
  });

  test('search returns', async ({ page }) => {
    await page.goto('http://localhost:3103/dashboard/returns');
    
    await page.fill('input[placeholder*="Zoek"]', '3SABCD');
    
    // Verify search results
    await expect(page.locator('text=3SABCD123456789')).toBeVisible();
  });
});
```

---

## 🚀 **RUNNING TESTS**

### **Setup (One-time)**

```bash
# Install test dependencies
cd /Users/emin/kattenbak/backend
npm install -D vitest @vitest/ui supertest @types/supertest

cd /Users/emin/kattenbak/frontend
npm install -D @playwright/test
```

### **Run Unit Tests**

```bash
# Backend
cd /Users/emin/kattenbak/backend
npm run test

# Watch mode (development)
npm run test:watch

# Coverage
npm run test:coverage
```

### **Run Integration Tests**

```bash
# With test database
DATABASE_URL="postgresql://test:test@localhost:5432/kattenbak_test" npm run test:integration
```

### **Run E2E Tests**

```bash
# Frontend
cd /Users/emin/kattenbak/frontend
npx playwright test

# With UI
npx playwright test --ui

# Specific test
npx playwright test return-flow.spec.ts
```

---

## 📊 **TEST COVERAGE GOALS**

| Layer | Target | Priority |
|-------|--------|----------|
| Unit Tests | 80% | HIGH |
| Integration Tests | 60% | MEDIUM |
| E2E Tests | Critical paths only | HIGH |

**Focus areas:**
1. ✅ Validation logic (HIGH)
2. ✅ Webhook security (HIGH)
3. ✅ Return flow (HIGH)
4. ⏳ Edge cases (MEDIUM)
5. ⏳ Error handling (MEDIUM)

---

## ✅ **MANUAL TESTING CHECKLIST**

### **Backend API**

```bash
# 1. Health check
curl http://localhost:3101/health

# 2. Return validation
curl -X POST http://localhost:3101/api/v1/returns/validate/test_order_1

# 3. Create return (should validate)
curl -X POST http://localhost:3101/api/v1/returns \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test","customerEmail":"invalid"}'  # ❌ Should fail

# 4. Webhook (with signature)
curl -X POST http://localhost:3101/api/v1/webhooks/myparcel \
  -H "X-MyParcel-Signature: test_signature" \
  -d '{"shipment_id":123,"status":2}'
```

### **Frontend UI**

1. ✅ Navigate to `/orders/[id]/return`
2. ✅ Form validation (empty fields)
3. ✅ Reason selector (all options)
4. ✅ Item selector (multi-select)
5. ✅ Character limits (1000, 500)
6. ✅ Success state (tracking code shown)
7. ✅ Error handling (network failure)

### **Admin UI**

1. ✅ Login to `/dashboard`
2. ✅ Navigate to `/dashboard/returns`
3. ✅ Table rendering
4. ✅ Search functionality
5. ✅ Status filter
6. ✅ Detail page (click on return)

---

## 🎯 **TESTING BEST PRACTICES**

1. **DRY Tests**
   - Reusable test fixtures
   - Shared setup/teardown
   - Helper functions

2. **Descriptive Names**
   ```typescript
   // ✅ Good
   it('should reject invalid email format')
   
   // ❌ Bad
   it('test 1')
   ```

3. **One Assertion Per Test** (when possible)
   - Easier to debug
   - Clear failure messages

4. **Test Edge Cases**
   - Empty strings
   - Max lengths
   - Invalid formats
   - Null/undefined

5. **Mock External Services**
   - MyParcel API
   - Email service
   - File uploads

---

## ✅ **CONCLUSION**

**Test Infrastructure is Ready!**

✅ Examples provided for:
- Unit tests (validation, security)
- Integration tests (API routes)
- E2E tests (user flows)

⏳ To implement:
1. Create test files
2. Add to CI/CD pipeline
3. Run on every commit
4. Monitor coverage

**Testing = Confidence = Quality!** 🎯

