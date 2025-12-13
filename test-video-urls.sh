#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DRY VIDEO URL TESTING SCRIPT
# Tests: Schema Migration, API, Frontend, Admin Integration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "🎥 DEMO VIDEO URL TESTING - DRY & Maintainable"
echo "═══════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

test_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

test_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

echo "1️⃣  DATABASE SCHEMA TESTING"
echo "─────────────────────────────"

# Check Prisma schema
if grep -q "videoUrl.*String?" backend/prisma/schema.prisma; then
  test_pass "Prisma schema has videoUrl field"
else
  test_fail "Prisma schema missing videoUrl field"
fi

echo ""
echo "2️⃣  FRONTEND TYPE TESTING"
echo "─────────────────────────────"

# Frontend types
if grep -q "videoUrl.*string" frontend/types/product.ts; then
  test_pass "Frontend Product type includes videoUrl"
else
  test_fail "Frontend Product type missing videoUrl"
fi

# Product video component exists
if [ -f "frontend/components/ui/product-video.tsx" ]; then
  test_pass "ProductVideo component exists"
else
  test_fail "ProductVideo component missing"
fi

# Video utils
if [ -f "frontend/lib/video-utils.ts" ]; then
  test_pass "Video utility functions exist"
else
  test_fail "Video utilities missing"
fi

echo ""
echo "3️⃣  ADMIN INTERFACE TESTING"
echo "─────────────────────────────"

# Admin types
if grep -q "videoUrl" admin-next/types/product.ts; then
  test_pass "Admin Product type includes videoUrl"
else
  test_fail "Admin Product type missing videoUrl"
fi

# Admin validation schema
if grep -q "videoUrl" admin-next/lib/validation/product.schema.ts; then
  test_pass "Admin validation includes videoUrl"
else
  test_fail "Admin validation missing videoUrl"
fi

# Admin product form
if grep -q "videoUrl" admin-next/components/product-form.tsx; then
  test_pass "Admin form includes video URL field"
else
  test_fail "Admin form missing video URL field"
fi

echo ""
echo "4️⃣  COMPONENT INTEGRATION TESTING"
echo "─────────────────────────────────────"

# Product detail page
if grep -q "ProductVideo" frontend/components/products/product-detail.tsx; then
  test_pass "Product detail page uses ProductVideo"
else
  test_fail "Product detail missing video integration"
fi

# Homepage
if grep -q "ProductVideo" frontend/app/page.tsx; then
  test_pass "Homepage supports dynamic video"
else
  test_fail "Homepage missing video support"
fi

# Homepage settings type
if grep -q "videoUrl.*string" frontend/app/page.tsx; then
  test_pass "Homepage settings include videoUrl"
else
  test_fail "Homepage settings missing videoUrl"
fi

echo ""
echo "5️⃣  API TESTING (Manual URLs to verify)"
echo "─────────────────────────────────────────"

echo -e "${YELLOW}Manual Tests:${NC}"
echo ""
echo "Backend Health:"
echo "  curl http://localhost:3101/health"
echo ""
echo "Featured Product (check videoUrl field):"
echo "  curl http://localhost:3101/api/v1/products/featured | jq '.data[0].videoUrl'"
echo ""
echo "Settings (check hero.videoUrl field):"
echo "  curl http://localhost:3101/api/v1/settings | jq '.data.hero.videoUrl'"
echo ""
echo "Admin Product Update (PATCH with videoUrl):"
echo "  curl -X PATCH http://localhost:3101/api/v1/admin/products/{id} \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"videoUrl\": \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}'"
echo ""

echo "═══════════════════════════════════════════════════"
echo -e "Test Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED! Video URL feature ready.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Review output above.${NC}"
  exit 1
fi
