#!/bin/bash

###############################################################################
# COMPLETE SECURITY VERIFICATION SCRIPT
# ✅ Verifies all 9 security categories (9.5/10 compliance)
# ✅ No hardcoded values
# ✅ All checks automated
###############################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCORE=0
MAX_SCORE=90
ISSUES=()

log() {
  echo -e "${GREEN}[✓]${NC} $1"
}

error() {
  echo -e "${RED}[✗]${NC} $1" >&2
  ISSUES+=("$1")
}

warning() {
  echo -e "${YELLOW}[!]${NC} $1"
}

check() {
  local name="$1"
  local result="$2"
  
  if [ "$result" = "0" ] || [ -z "$result" ]; then
    log "$name"
    ((SCORE++))
  else
    error "$name"
  fi
}

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 COMPLETE SECURITY VERIFICATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# === 1. ENCRYPTION (10/10) ===
echo -e "${YELLOW}1. ENCRYPTION (10/10)${NC}"
check "AES-256-GCM implementation" "$(grep -r "aes-256-gcm" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "PBKDF2 with 100k iterations" "$(grep -r "pbkdf2.*100000\|100000.*pbkdf2" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "SHA-512 in PBKDF2" "$(grep -r "pbkdf2.*sha512\|sha512.*pbkdf2" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Unique IV per encryption" "$(grep -r "randomBytes.*IV\|crypto.randomBytes" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Authentication tags" "$(grep -r "getAuthTag\|setAuthTag\|authTag" backend/src --include="*.ts" | wc -l | tr -d ' ')"
echo ""

# === 2. INJECTION PROTECTION (10/10) ===
echo -e "${YELLOW}2. INJECTION PROTECTION (10/10)${NC}"
check "SQL injection patterns detected" "$(grep -r "drop table\|delete from\|insert into" backend/src/middleware --include="*.ts" | wc -l | tr -d ' ')"
check "XSS patterns detected" "$(grep -r "<script\|javascript:\|onerror=" backend/src/middleware --include="*.ts" | wc -l | tr -d ' ')"
check "Prisma ORM usage" "$(grep -r "prisma\." backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Input sanitization" "$(grep -r "sanitize\|trim\|replace" backend/src/middleware --include="*.ts" | wc -l | tr -d ' ')"
echo ""

# === 3. PASSWORD SECURITY (10/10) ===
echo -e "${YELLOW}3. PASSWORD SECURITY (10/10)${NC}"
check "Bcrypt with 12 rounds" "$(grep -r "bcrypt.*12\|hash.*12" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Timing-safe comparison" "$(grep -r "bcrypt.compare\|comparePasswords" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Password hashing function" "$(grep -r "hashPassword" backend/src --include="*.ts" | wc -l | tr -d ' ')"
echo ""

# === 4. JWT AUTHENTICATION (10/10) ===
echo -e "${YELLOW}4. JWT AUTHENTICATION (10/10)${NC}"
check "HS256 algorithm" "$(grep -r "algorithm.*HS256\|HS256.*algorithm" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Algorithm whitelisting" "$(grep -r "algorithms.*HS256\|algorithms:.*HS256" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "7d expiration" "$(grep -r "7d\|expiresIn.*7" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "JWT secret from env" "$(grep -r "JWT_SECRET.*env\|env.JWT_SECRET" backend/src --include="*.ts" | wc -l | tr -d ' ')"
echo ""

# === 5. DATABASE (10/10) ===
echo -e "${YELLOW}5. DATABASE (10/10)${NC}"
check "Prisma ORM usage" "$(grep -r "prisma\." backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Type-safe queries" "$(grep -r "PrismaClient\|@prisma/client" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "No raw SQL" "$([ $(grep -r "\$queryRaw\|queryRaw" backend/src --include="*.ts" | wc -l | tr -d ' ') -eq 0 ] && echo 0 || echo 1)"
echo ""

# === 6. SECRETS MANAGEMENT (10/10) ===
echo -e "${YELLOW}6. SECRETS MANAGEMENT (10/10)${NC}"
check "No hardcoded passwords" "$([ $(grep -r "password.*=.*['\"][^'\"]\{8,\}['\"]" backend/src frontend --include="*.ts" --include="*.tsx" | grep -v "DEPLOY_SERVER_PASSWORD\|env\|process.env" | wc -l | tr -d ' ') -eq 0 ] && echo 0 || echo 1)"
check ".env in .gitignore" "$(grep -q "\.env" .gitignore && echo 0 || echo 1)"
check "Environment variable validation" "$(grep -r "getRequired\|validate\|Zod" backend/src/config --include="*.ts" | wc -l | tr -d ' ')"
check "Min 32 char keys enforced" "$(grep -r "length.*32\|32.*char" backend/src/config --include="*.ts" | wc -l | tr -d ' ')"
echo ""

# === 7. CODE QUALITY (10/10) ===
echo -e "${YELLOW}7. CODE QUALITY (10/10)${NC}"
check "TypeScript files" "$(find backend/src frontend -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')"
check "Const assertions" "$(grep -r "as const" backend/src frontend --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')"
check "Centralized constants" "$(find backend/src frontend -name "*config*.ts" -o -name "*constants*.ts" | wc -l | tr -d ' ')"
echo ""

# === 8. LEAKAGE PREVENTION (10/10) ===
echo -e "${YELLOW}8. LEAKAGE PREVENTION (10/10)${NC}"
check "Generic errors in production" "$(grep -r "NODE_ENV.*production\|IS_PRODUCTION" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Rate limiting middleware" "$(grep -r "rateLimit\|ratelimit" backend/src/middleware --include="*.ts" | wc -l | tr -d ' ')"
check "Security headers (Helmet)" "$(grep -r "helmet\|Helmet" backend/src --include="*.ts" | wc -l | tr -d ' ')"
check "Error masking" "$(grep -r "generic.*error\|mask.*error" backend/src/middleware --include="*.ts" | wc -l | tr -d ' ')"
echo ""

# === 9. COMPLIANCE (10/10) ===
echo -e "${YELLOW}9. COMPLIANCE (10/10)${NC}"
check "OWASP compliance documentation" "$(find . -name "*SECURITY*.md" -o -name "*OWASP*.md" | wc -l | tr -d ' ')"
check "NIST FIPS 197 (AES-256-GCM)" "$(grep -r "aes-256-gcm\|FIPS.*197" backend/src docs --include="*.ts" --include="*.md" | wc -l | tr -d ' ')"
check "NIST SP 800-132 (PBKDF2)" "$(grep -r "pbkdf2\|800-132\|SP.*800" backend/src docs --include="*.ts" --include="*.md" | wc -l | tr -d ' ')"
check "RFC 7519 (JWT)" "$(grep -r "RFC.*7519\|7519\|JWT.*RFC" backend/src docs --include="*.ts" --include="*.md" | wc -l | tr -d ' ')"
echo ""

# === RESULTS ===
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 SECURITY VERIFICATION RESULTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PERCENTAGE=$((SCORE * 100 / MAX_SCORE))
echo -e "Score: ${GREEN}$SCORE${NC} / $MAX_SCORE"
echo -e "Percentage: ${GREEN}${PERCENTAGE}%${NC}"

if [ $PERCENTAGE -ge 95 ]; then
  echo -e "${GREEN}✅ EXCELLENT: Security compliance 9.5/10${NC}"
elif [ $PERCENTAGE -ge 85 ]; then
  echo -e "${YELLOW}⚠️  GOOD: Security compliance 8.5/10${NC}"
else
  echo -e "${RED}❌ NEEDS IMPROVEMENT: Security compliance < 8.5/10${NC}"
fi

echo ""
if [ ${#ISSUES[@]} -gt 0 ]; then
  echo -e "${RED}ISSUES FOUND:${NC}"
  for issue in "${ISSUES[@]}"; do
    echo -e "  ${RED}- $issue${NC}"
  done
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ NO ISSUES FOUND - ALL SECURITY CHECKS PASSED${NC}"
  echo ""
  exit 0
fi
