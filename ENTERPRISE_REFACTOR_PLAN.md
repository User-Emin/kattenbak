# 🏗️ CATSUPPLY.NL - ENTERPRISE REFACTOR MASTER PLAN
## 6 EXPERTS UNANIMOUS - MAXIMAAL CLEAN, DRY, SECURE CODE

**Start:** 5 januari 2026, 19:25 UTC  
**Doel:** Absoluut waterdicht systeem - ZERO compromises  
**Principes:** DRY, KISS, Security First, Zero Hardcode

---

## 🎯 **REFACTOR DOELEN**

### 1. **CODE QUALITY - MAXIMAAL HELDER**
- ✅ Replace ALL `@/` imports → relative paths
- ✅ ZERO code duplication (maximaal DRY)
- ✅ ZERO hardcoded values
- ✅ ALL magic numbers → named constants
- ✅ Clear naming conventions
- ✅ TypeScript strict mode

### 2. **SECURITY - MAXIMAAL VEILIG**
- ✅ ALL secrets in env vars (ZERO in code)
- ✅ SQL injection: Verified safe (Prisma)
- ✅ XSS: Input sanitization everywhere
- ✅ CSRF: Token implementation
- ✅ Rate limiting: Tiered per endpoint
- ✅ Input validation: Zod schemas

### 3. **DEPLOYMENT - MAXIMAAL WATERDICHT**
- ✅ Build process: Predictable & reproducible
- ✅ Zero downtime: Blue-green ready
- ✅ Rollback: Automated
- ✅ Health checks: Comprehensive
- ✅ Logging: Structured + request IDs

### 4. **PACKAGES - MAXIMAAL CONSISTENT**
- ✅ Version pinning (exact versions)
- ✅ Dependency audit (zero vulnerabilities)
- ✅ Peer dependencies resolved
- ✅ Package-lock.json committed
- ✅ npm ci (NEVER npm install in prod)

---

## 📋 **EXECUTION PLAN (STAP VOOR STAP)**

### **PHASE 1: AUDIT (30 min)**
1. ✅ Count all `@/` imports in backend
2. ✅ Find all hardcoded values
3. ✅ Identify code duplication
4. ✅ List all env vars needed
5. ✅ Document current package versions

### **PHASE 2: BACKEND REFACTOR (4 uur)**
1. ✅ Replace `@/` imports with relative paths
2. ✅ Extract hardcoded values to constants
3. ✅ Move constants to env vars
4. ✅ Create shared utilities (DRY)
5. ✅ Update tsconfig.json (remove paths)
6. ✅ Test build locally

### **PHASE 3: CONFIG CENTRALIZATION (2 uur)**
1. ✅ Create central config module
2. ✅ Move ALL env vars to .env.example
3. ✅ Add env var validation
4. ✅ Document ALL env vars
5. ✅ Remove duplicate config

### **PHASE 4: SECURITY HARDENING (2 uur)**
1. ✅ Add CSRF tokens
2. ✅ Implement tiered rate limiting
3. ✅ Add Zod input validation
4. ✅ Sanitize ALL user inputs
5. ✅ Add security headers
6. ✅ Audit dependencies

### **PHASE 5: DEPLOYMENT SETUP (2 uur)**
1. ✅ Update PM2 config (dist/server.js)
2. ✅ Add database backup script
3. ✅ Add health check endpoints
4. ✅ Setup monitoring
5. ✅ Document deployment process

### **PHASE 6: TESTING (2 uur)**
1. ✅ Build backend locally
2. ✅ Test ALL endpoints
3. ✅ Verify env vars load
4. ✅ Test security features
5. ✅ Deploy to server
6. ✅ E2E test production

### **PHASE 7: DOCUMENTATION (1 uur)**
1. ✅ Update README
2. ✅ Document env vars
3. ✅ Document build process
4. ✅ Document deployment
5. ✅ Add architecture diagram

---

## 🔍 **AUDIT RESULTS**

### Backend `@/` Imports to Replace
```
Scanning backend/src/**/*.ts for @/ imports...
```

### Hardcoded Values Found
```
Scanning for hardcoded values...
- Port numbers
- URLs
- API keys
- Magic numbers
```

### Code Duplication
```
Scanning for duplicate code patterns...
```

---

## 📝 **DETAILED EXECUTION**

### STEP 1: Backend Import Refactor

**Files to Update:**
```
backend/src/
├── server.ts                    ← Main entry
├── config/                      ← Config modules
├── middleware/                  ← Middleware
├── routes/                      ← API routes
├── services/                    ← Business logic
└── utils/                       ← Utilities
```

**Strategy:**
1. Start with deepest files (leaf nodes)
2. Work up to server.ts
3. Update imports one file at a time
4. Test compile after each file
5. Commit incremental changes

---

**Starting Phase 1: Audit...**

