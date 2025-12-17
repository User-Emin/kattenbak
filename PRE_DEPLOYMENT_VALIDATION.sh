#!/bin/bash
# PRE-DEPLOYMENT VALIDATION SCRIPT
# DEFENSIEF: Voorkomt 502 errors en broken deploys

set -e  # Exit on any error

echo "🔍 PRE-DEPLOYMENT VALIDATION STARTED"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VALIDATION_FAILED=0

# 1. CHECK: Lokale build slaagt
echo -e "\n${YELLOW}[1/6]${NC} Testing local build..."
cd frontend
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ Frontend build SUCCESS${NC}"
else
    echo -e "${RED}❌ Frontend build FAILED${NC}"
    echo "Last 20 lines of build log:"
    tail -20 /tmp/build.log
    VALIDATION_FAILED=1
fi
cd ..

# 2. CHECK: TypeScript errors
echo -e "\n${YELLOW}[2/6]${NC} Checking TypeScript..."
cd frontend
if npx tsc --noEmit > /tmp/tsc.log 2>&1; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    tail -20 /tmp/tsc.log
    VALIDATION_FAILED=1
fi
cd ..

# 3. CHECK: Port configuration
echo -e "\n${YELLOW}[3/6]${NC} Checking port configuration..."
FRONTEND_PORT=$(grep "next start -p" frontend/package.json | grep -oP '\d+' || echo "3000")
echo "Frontend configured port: $FRONTEND_PORT"
if [ "$FRONTEND_PORT" != "3102" ] && [ "$FRONTEND_PORT" != "3100" ]; then
    echo -e "${YELLOW}⚠️  Warning: Unusual port $FRONTEND_PORT${NC}"
fi

# 4. CHECK: Required files exist
echo -e "\n${YELLOW}[4/6]${NC} Checking required files..."
REQUIRED_FILES=(
    "frontend/app/layout.tsx"
    "frontend/components/ui/chat-popup-rag.tsx"
    "frontend/types/product.ts"
    "frontend/types/return.ts"
    "backend/src/server.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} Missing: $file"
        VALIDATION_FAILED=1
    fi
done

# 5. CHECK: No merge conflicts
echo -e "\n${YELLOW}[5/6]${NC} Checking for merge conflicts..."
if git diff --check > /tmp/gitcheck.log 2>&1; then
    echo -e "${GREEN}✅ No merge conflicts${NC}"
else
    echo -e "${RED}❌ Merge conflicts detected${NC}"
    cat /tmp/gitcheck.log
    VALIDATION_FAILED=1
fi

# 6. CHECK: Git status clean
echo -e "\n${YELLOW}[6/6]${NC} Checking git status..."
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ Git status clean${NC}"
else
    echo -e "${YELLOW}⚠️  Uncommitted changes:${NC}"
    git status --short
fi

echo -e "\n===================================="
if [ $VALIDATION_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL VALIDATIONS PASSED${NC}"
    echo -e "${GREEN}🚀 SAFE TO DEPLOY${NC}"
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo -e "${RED}🚫 DO NOT DEPLOY${NC}"
    exit 1
fi

