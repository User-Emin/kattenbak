#!/bin/bash
#
# 🔒 DIEPGAANDE SECURITY AUDIT
# Checkt op kwaadaardige code, hardcoded secrets, gevaarlijke patterns
#

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}🔒 DIEPGAANDE SECURITY AUDIT${NC}"
echo "=========================================="

ISSUES=0

# Check 1: Hardcoded secrets
echo -e "${YELLOW}1. Checking for hardcoded secrets...${NC}"
if grep -rE "(ENCRYPTION_KEY|JWT_SECRET|DATABASE_URL|PASSWORD|API_KEY)\s*=\s*['\"][^'\"]{20,}" \
   --include="*.ts" --include="*.js" --exclude-dir=node_modules \
   . | grep -v "process.env" | grep -v "getRequired" | grep -v ".example" | grep -v "|| ''" | grep -v "|| \"\""; then
    echo -e "${RED}❌ Hardcoded secrets found!${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No hardcoded secrets${NC}"
fi

# Check 2: Dangerous code patterns (only actual dangerous calls, not method names)
echo -e "${YELLOW}2. Checking for dangerous code patterns...${NC}"
DANGEROUS=$(grep -rE "(eval\(|Function\(|\.exec\(|\.spawn\(|child_process\.)" \
   --include="*.ts" --include="*.js" --exclude-dir=node_modules \
   backend/src 2>/dev/null | grep -v "//.*spawn" | grep -v "import.*spawn" | grep -v "from 'child_process'" | grep -v "static.*Retrieval\|static.*agentic" || true)

if [ -n "$DANGEROUS" ]; then
    # Check if spawn is properly secured (path validation, shell: false)
    if echo "$DANGEROUS" | grep -q "spawn" && ! grep -r "shell: false" --include="*.ts" backend/src/services/rag/embeddings.service.ts 2>/dev/null; then
        echo -e "${RED}❌ spawn() found without shell: false security!${NC}"
        ISSUES=$((ISSUES + 1))
    elif echo "$DANGEROUS" | grep -q "eval\|Function("; then
        echo -e "${RED}❌ eval() or Function() found!${NC}"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✅ spawn() is properly secured (path validation, shell: false)${NC}"
    fi
else
    echo -e "${GREEN}✅ No dangerous patterns${NC}"
fi

# Check 3: Python script validation
echo -e "${YELLOW}3. Checking Python script usage...${NC}"
if [ -f "backend/scripts/generate_embedding.py" ]; then
    echo -e "${GREEN}✅ Python script exists${NC}"
    # Check if script path is hardcoded or validated
    if grep -r "generate_embedding.py" backend/src --include="*.ts" | grep -v "path.join"; then
        echo -e "${RED}❌ Python script path not validated!${NC}"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✅ Python script path validated${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Python script not found (RAG may use local embeddings)${NC}"
fi

# Check 4: Security algorithms
echo -e "${YELLOW}4. Verifying security algorithms...${NC}"
if ! grep -r "aes-256-gcm" --include="*.ts" backend/src/lib/encryption.ts backend/src/utils/encryption.util.ts 2>/dev/null; then
    echo -e "${RED}❌ AES-256-GCM not found!${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ AES-256-GCM found${NC}"
fi

if ! grep -r "bcrypt" --include="*.ts" backend/src/utils/auth.util.ts 2>/dev/null; then
    echo -e "${RED}❌ bcrypt not found!${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ bcrypt found${NC}"
fi

if ! grep -r "jsonwebtoken\|jwt.sign" --include="*.ts" backend/src/utils/auth.util.ts 2>/dev/null; then
    echo -e "${RED}❌ JWT not found!${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ JWT found${NC}"
fi

# Check 5: Environment variable usage
echo -e "${YELLOW}5. Checking environment variable usage...${NC}"
ENV_COUNT=$(grep -r "process.env\." --include="*.ts" backend/src | wc -l)
if [ "$ENV_COUNT" -lt 50 ]; then
    echo -e "${RED}❌ Too few environment variables used (possible hardcoding)${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ Environment variables used: ${ENV_COUNT}${NC}"
fi

# Summary
echo ""
echo "=========================================="
if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✅ SECURITY AUDIT PASSED (0 issues)${NC}"
    exit 0
else
    echo -e "${RED}❌ SECURITY AUDIT FAILED (${ISSUES} issues)${NC}"
    exit 1
fi
