# 🏗️ ADMIN REBUILD - MODULAIR & STRATEGISCH PLAN

## 🎯 ARCHITECTUUR BESLISSING

**NIEUWE ADMIN STRUCTUUR:**
```
admin-next/
  ├── prisma/
  │   └── schema.prisma          # Symlink naar backend/prisma/schema.prisma
  ├── lib/
  │   ├── prisma.ts             # Prisma Client singleton (server-side only)
  │   ├── auth.ts               # JWT verification + bcrypt
  │   ├── rate-limit.ts         # Rate limiting per IP
  │   └── api-client.ts         # Frontend API calls
  ├── app/
  │   ├── api/                  # Next.js API Routes (server-side)
  │   │   ├── auth/
  │   │   │   └── login/route.ts    # POST /api/auth/login
  │   │   ├── products/
  │   │   │   ├── route.ts          # GET/POST /api/products
  │   │   │   └── [id]/route.ts     # GET/PUT/DELETE /api/products/:id
  │   │   ├── orders/
  │   │   │   ├── route.ts          # GET /api/orders
  │   │   │   └── [id]/route.ts     # GET/PUT /api/orders/:id
  │   │   ├── returns/
  │   │   │   ├── route.ts          # GET /api/returns
  │   │   │   └── [id]/route.ts     # PUT /api/returns/:id
  │   │   └── variants/
  │   │       ├── route.ts          # GET/POST /api/variants
  │   │       └── [id]/route.ts     # PUT/DELETE /api/variants/:id
  │   └── dashboard/            # UI (HERGEBRUIK 100%)
  └── middleware.ts             # Global auth + rate limiting
```

## 🔒 SECURITY LAYERS

### 1. Authentication (Server-Side)
- ✅ JWT verification in middleware
- ✅ bcrypt password hashing
- ✅ HttpOnly cookies (optional)
- ✅ Token expiry checks

### 2. Authorization
- ✅ Role-based access (ADMIN only)
- ✅ Per-route permission checks
- ✅ User context validation

### 3. Rate Limiting
- ✅ Per IP: 100 requests/15min
- ✅ Login: 5 attempts/15min
- ✅ Memory-based (or Redis)

### 4. Input Validation
- ✅ Zod schemas per endpoint
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React escaping)

### 5. CSRF Protection
- ✅ SameSite cookies
- ✅ Origin header checks
- ✅ CSRF tokens (optional)

## 📋 IMPLEMENTATIE STAPPEN

### STEP 1: Prisma Setup (15 min)
- [x] Copy schema.prisma naar admin-next
- [x] Install @prisma/client
- [x] Create lib/prisma.ts singleton
- [x] Generate Prisma Client
- [x] Test database connection

### STEP 2: Auth Infrastructure (20 min)
- [ ] lib/auth.ts - JWT verify + bcrypt
- [ ] lib/rate-limit.ts - Rate limiter
- [ ] middleware.ts - Global auth check
- [ ] Types voor User, JWTPayload

### STEP 3: API Routes - Auth (10 min)
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me
- [ ] Rate limiting applied

### STEP 4: API Routes - Products (20 min)
- [ ] GET /api/products (list)
- [ ] POST /api/products (create)
- [ ] GET /api/products/:id
- [ ] PUT /api/products/:id
- [ ] DELETE /api/products/:id
- [ ] Zod validation schemas

### STEP 5: API Routes - Orders (15 min)
- [ ] GET /api/orders (list)
- [ ] GET /api/orders/:id
- [ ] PUT /api/orders/:id (status update)

### STEP 6: API Routes - Returns (15 min)
- [ ] GET /api/returns (list)
- [ ] GET /api/returns/:id
- [ ] PUT /api/returns/:id (status update)

### STEP 7: API Routes - Variants (15 min)
- [ ] GET /api/variants?productId=X
- [ ] POST /api/variants
- [ ] PUT /api/variants/:id
- [ ] DELETE /api/variants/:id

### STEP 8: Frontend Update (10 min)
- [ ] Update lib/api-client.ts
- [ ] Change baseURL naar /api
- [ ] Test alle pages

### STEP 9: E2E Testing (30 min)
- [ ] MCP: Login flow
- [ ] MCP: Products CRUD
- [ ] MCP: Orders management
- [ ] MCP: Returns management
- [ ] MCP: Variants management

### STEP 10: Security Audit (15 min)
- [ ] Check JWT secrets
- [ ] Verify rate limiting
- [ ] Test SQL injection
- [ ] Test XSS
- [ ] Check CORS

### STEP 11: Deployment (20 min)
- [ ] Build admin-next
- [ ] Deploy to production
- [ ] Update Nginx config
- [ ] Restart PM2

### STEP 12: Production Verification (15 min)
- [ ] MCP test all features live
- [ ] Performance check
- [ ] Security scan
- [ ] Final sign-off

## ⏱️ TOTALE TIJD: ~3 uur

## ✅ SUCCESS CRITERIA

1. ✅ Login werkt met JWT
2. ✅ Products CRUD fully functional
3. ✅ Orders management working
4. ✅ Returns management working ⭐ NEW
5. ✅ Variants management working ⭐ NEW
6. ✅ Rate limiting active
7. ✅ NO security vulnerabilities
8. ✅ E2E tested met MCP
9. ✅ Production deployed & verified
10. ✅ ZERO redundancy (DRY)

## 🚀 LET'S BUILD!
