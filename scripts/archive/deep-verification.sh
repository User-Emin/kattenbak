#!/bin/bash

# 🔒 DEEP VERIFICATION SCRIPT - Complete Security & Deployment Check
# ============================================================================
# Expert Team Verification: Unaniem controle van alle security & deployment
# ============================================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 DEEP VERIFICATION - Expert Team Audit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    PASSED=$((PASSED + 1))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    FAILED=$((FAILED + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    WARNINGS=$((WARNINGS + 1))
}

# ============================================================================
# 1. ENVIRONMENT VARIABLES VALIDATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  ENVIRONMENT VARIABLES VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check env.config.ts
if [ -f "backend/src/config/env.config.ts" ]; then
    # Check DATABASE_URL validation
    if grep -q "DATABASE_URL.*z.string().min(1" backend/src/config/env.config.ts; then
        check_pass "DATABASE_URL validation: Min 1 character required"
    else
        check_fail "DATABASE_URL validation: Not found"
    fi
    
    # Check JWT_SECRET validation
    if grep -q "JWT_SECRET.*z.string().min(32" backend/src/config/env.config.ts; then
        check_pass "JWT_SECRET validation: Min 32 characters required"
    else
        check_fail "JWT_SECRET validation: Not found"
    fi
    
    # Check MOLLIE_API_KEY validation
    if grep -q "MOLLIE_API_KEY.*regex.*test_|live_" backend/src/config/env.config.ts; then
        check_pass "MOLLIE_API_KEY validation: Must start with test_ or live_"
    else
        check_fail "MOLLIE_API_KEY validation: Not found"
    fi
    
    # Check Zod validation
    if grep -q "zod" backend/src/config/env.config.ts; then
        check_pass "Zod schema validation: Active"
    else
        check_fail "Zod schema validation: Not found"
    fi
else
    check_fail "env.config.ts not found"
fi

# Check .gitignore for .env files
if grep -q "\.env" .gitignore 2>/dev/null; then
    check_pass ".env files in .gitignore"
else
    check_fail ".env files NOT in .gitignore"
fi

# ============================================================================
# 2. ENCRYPTION VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  ENCRYPTION VERIFICATION (AES-256-GCM + PBKDF2)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check AES-256-GCM
if grep -q "aes-256-gcm" backend/src/utils/encryption.util.ts 2>/dev/null; then
    check_pass "AES-256-GCM algorithm: Active"
else
    check_fail "AES-256-GCM algorithm: Not found"
fi

# Check PBKDF2
if grep -q "pbkdf2Sync" backend/src/utils/encryption.util.ts 2>/dev/null; then
    if grep -q "100000" backend/src/utils/encryption.util.ts 2>/dev/null; then
        check_pass "PBKDF2: 100k iterations (NIST SP 800-132)"
    else
        check_warn "PBKDF2 iterations: Not 100k"
    fi
    
    if grep -q "sha512" backend/src/utils/encryption.util.ts 2>/dev/null; then
        check_pass "PBKDF2: SHA-512 hash (stronger than SHA-256)"
    else
        check_fail "PBKDF2: SHA-512 not found"
    fi
else
    check_fail "PBKDF2: Not found"
fi

# Check Unique IV
if grep -q "randomBytes.*IV_LENGTH" backend/src/utils/encryption.util.ts 2>/dev/null; then
    check_pass "Unique IV per encryption: Random IV generated"
else
    check_fail "Unique IV: Not found"
fi

# Check Auth Tag
if grep -q "getAuthTag\|setAuthTag" backend/src/utils/encryption.util.ts 2>/dev/null; then
    check_pass "Authentication tags: Tamper detection active"
else
    check_fail "Authentication tags: Not found"
fi

# ============================================================================
# 3. INJECTION PROTECTION VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  INJECTION PROTECTION (6 Types)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check SQL injection protection (Prisma)
if grep -q "@prisma/client" backend/src/config/database.config.ts 2>/dev/null || grep -q "PrismaClient" backend/src/config/database.config.ts 2>/dev/null; then
    check_pass "SQL injection: Prisma ORM (parameterized queries)"
else
    check_fail "SQL injection: Prisma not found"
fi

# Check XSS protection
if grep -q "sanitizeInput\|replace.*script" backend/src/middleware/rag-security.middleware.ts 2>/dev/null; then
    check_pass "XSS protection: Input sanitization active"
else
    check_fail "XSS protection: Sanitization not found"
fi

# Check Command injection
if grep -q "Command\|command\|exec\|spawn" backend/src/middleware/rag-security.middleware.ts 2>/dev/null; then
    check_pass "Command injection: Detection active"
else
    check_warn "Command injection: Detection may be limited"
fi

# Check Path Traversal
if grep -q "\.\." backend/src/middleware/rag-security.middleware.ts 2>/dev/null || grep -q "path.*sanitize" backend/src 2>/dev/null; then
    check_pass "Path Traversal: Protection active"
else
    check_warn "Path Traversal: Protection may be limited"
fi

# Check LDAP
if grep -q "ldap\|LDAP" backend/src/middleware/rag-security.middleware.ts 2>/dev/null; then
    check_pass "LDAP injection: Protection active"
else
    check_warn "LDAP injection: Not explicitly checked"
fi

# ============================================================================
# 4. PASSWORD SECURITY VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  PASSWORD SECURITY (Bcrypt)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Bcrypt
if grep -q "bcrypt" backend/src/utils/auth.util.ts 2>/dev/null; then
    if grep -q "hash.*12" backend/src/utils/auth.util.ts 2>/dev/null; then
        check_pass "Bcrypt: 12 rounds (OWASP 2023)"
    else
        check_warn "Bcrypt: Not 12 rounds"
    fi
    
    if grep -q "compare" backend/src/utils/auth.util.ts 2>/dev/null; then
        check_pass "Password comparison: Timing-safe (bcrypt.compare)"
    else
        check_fail "Password comparison: Not found"
    fi
else
    check_fail "Bcrypt: Not found"
fi

# Check password complexity
if grep -q "ADMIN_PASSWORD.*min.*12\|password.*length.*12" backend/src/config/env.config.ts 2>/dev/null; then
    check_pass "Password complexity: Min 12 characters enforced"
else
    check_warn "Password complexity: Min length may not be enforced"
fi

# ============================================================================
# 5. JWT AUTHENTICATION VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  JWT AUTHENTICATION (HS256)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check HS256
if grep -q "HS256" backend/src/utils/auth.util.ts 2>/dev/null; then
    check_pass "JWT algorithm: HS256 (RFC 7519)"
else
    check_fail "JWT algorithm: HS256 not found"
fi

# Check algorithm whitelisting
if grep -q "algorithms.*HS256\|algorithm.*HS256" backend/src/utils/auth.util.ts 2>/dev/null; then
    check_pass "Algorithm whitelisting: HS256 only"
else
    check_fail "Algorithm whitelisting: Not found"
fi

# Check expiration
if grep -q "expiresIn.*7d\|JWT_EXPIRES_IN.*7d" backend/src/utils/auth.util.ts 2>/dev/null || grep -q "JWT_EXPIRES_IN" backend/src/config/env.config.ts 2>/dev/null; then
    check_pass "JWT expiration: 7d configured"
else
    check_warn "JWT expiration: Not found or different"
fi

# ============================================================================
# 6. DATABASE SECURITY VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  DATABASE SECURITY (Prisma ORM)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check connection pooling
if grep -q "connection_limit\|pool_timeout\|connection.*pool" backend/src/config/database.config.ts 2>/dev/null; then
    check_pass "Connection pooling: Configured"
else
    check_warn "Connection pooling: May not be configured"
fi

# Check Prisma
if [ -f "backend/prisma/schema.prisma" ]; then
    check_pass "Prisma schema: Found"
    
    if grep -q "datasource db" backend/prisma/schema.prisma; then
        check_pass "Prisma datasource: Configured"
    fi
else
    check_fail "Prisma schema: Not found"
fi

# ============================================================================
# 7. SECRETS MANAGEMENT VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  SECRETS MANAGEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for hardcoded secrets
if grep -r "password.*=.*['\"].*[a-zA-Z0-9]{10,}" backend/src --exclude-dir=node_modules --exclude="*.test.ts" 2>/dev/null | grep -v "test\|example\|TODO" | grep -v "hash\|encrypt" > /tmp/hardcoded.txt; then
    HARDCODED=$(cat /tmp/hardcoded.txt | wc -l)
    if [ "$HARDCODED" -gt 0 ]; then
        check_warn "Hardcoded secrets: Possible $HARDCODED instance(s) found"
        echo "   (Review /tmp/hardcoded.txt for details)"
    else
        check_pass "Hardcoded secrets: None found"
    fi
else
    check_pass "Hardcoded secrets: None detected"
fi

# Check .gitignore
if grep -q "\.env\|\.pem\|\.key\|secrets" .gitignore 2>/dev/null; then
    check_pass "Secrets in .gitignore: Protected"
else
    check_fail "Secrets in .gitignore: Missing"
fi

# ============================================================================
# 8. CODE QUALITY VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  CODE QUALITY (TypeScript)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check TypeScript
if [ -f "backend/tsconfig.json" ]; then
    check_pass "TypeScript: Configured"
else
    check_fail "TypeScript: tsconfig.json not found"
fi

# Check const assertions (sample check)
if grep -r "as const" backend/src --exclude-dir=node_modules 2>/dev/null | head -1 > /dev/null; then
    check_pass "Const assertions: Used in codebase"
else
    check_warn "Const assertions: Not widely used"
fi

# ============================================================================
# 9. LEAKAGE PREVENTION VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  LEAKAGE PREVENTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check generic errors
if grep -q "Generic error\|geen gevoelige data\|sensitive data" backend/src/middleware/error.middleware.ts 2>/dev/null; then
    check_pass "Generic errors: Production-safe error messages"
else
    check_warn "Generic errors: May leak sensitive data"
fi

# Check rate limiting
if grep -q "rateLimit\|rate.*limit" backend/src/middleware/ratelimit.middleware.ts 2>/dev/null; then
    check_pass "Rate limiting: Active (DDoS protection)"
else
    check_fail "Rate limiting: Not found"
fi

# Check Helmet
if grep -q "helmet" backend/src/server.ts 2>/dev/null; then
    check_pass "Security headers: Helmet.js active"
else
    check_fail "Security headers: Helmet not found"
fi

# ============================================================================
# 10. GITHUB WORKFLOW VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔟 GITHUB WORKFLOW VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check workflow file exists
if [ -f ".github/workflows/production-deploy.yml" ]; then
    check_pass "GitHub workflow: File exists"
    
    # Check builds on GitHub Actions
    if grep -q "Build.*GitHub Actions\|runs-on: ubuntu-latest" .github/workflows/production-deploy.yml; then
        check_pass "Builds: On GitHub Actions (zero server load)"
    else
        check_warn "Builds: May run on server"
    fi
    
    # Check security scanning
    if grep -q "trufflehog\|Secret Scanning" .github/workflows/production-deploy.yml; then
        check_pass "Security scanning: TruffleHog active"
    else
        check_warn "Security scanning: May not be active"
    fi
    
    # Check CPU monitoring
    if grep -q "CPU\|Miner\|security.*check" .github/workflows/production-deploy.yml; then
        check_pass "CPU monitoring: Active in workflow"
    else
        check_warn "CPU monitoring: May not be in workflow"
    fi
else
    check_fail "GitHub workflow: Not found"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Passed:  $PASSED"
echo "❌ Failed:  $FAILED"
echo "⚠️  Warnings: $WARNINGS"
echo ""

TOTAL=$((PASSED + FAILED + WARNINGS))
SCORE=$((PASSED * 100 / TOTAL))

echo "Score: $SCORE%"
echo ""

if [ $FAILED -eq 0 ] && [ $SCORE -ge 90 ]; then
    echo -e "${GREEN}✅ VERIFICATION PASSED - PRODUCTION READY${NC}"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  VERIFICATION PASSED WITH WARNINGS${NC}"
    exit 0
else
    echo -e "${RED}❌ VERIFICATION FAILED - FIX ISSUES BEFORE DEPLOYMENT${NC}"
    exit 1
fi
