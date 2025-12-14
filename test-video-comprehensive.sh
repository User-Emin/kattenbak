#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPREHENSIVE VIDEO URL TESTING - DRY & MAXIMAAL DYNAMISCH
# Tests: Database, API, Frontend (2 plekken), Admin
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎥 VIDEO URL FEATURE - COMPREHENSIVE TESTING${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}Concept: 1 video (Product.videoUrl), 2 weergaveplekken${NC}"
echo "  1️⃣  Homepage Hero → Featured product video"
echo "  2️⃣  Product Detail → Same video onder 'Over dit product'"
echo ""

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

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "1️⃣  DATABASE SCHEMA"
echo "───────────────────────────────────────────────────────"

if grep -q 'videoUrl.*String?' backend/prisma/schema.prisma; then
  test_pass "Prisma schema: videoUrl field exists"
else
  test_fail "Prisma schema: videoUrl field MISSING"
fi

if grep -q '@map("video_url")' backend/prisma/schema.prisma; then
  test_pass "Prisma schema: correct database mapping"
else
  test_fail "Prisma schema: database mapping incorrect"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "2️⃣  FRONTEND TYPES & COMPONENTS"
echo "───────────────────────────────────────────────────────"

if grep -q 'videoUrl.*string.*null' frontend/types/product.ts; then
  test_pass "Frontend Product type includes videoUrl"
else
  test_fail "Frontend Product type MISSING videoUrl"
fi

if [ -f "frontend/components/ui/product-video.tsx" ]; then
  test_pass "ProductVideo component exists"
  
  if grep -q 'getYouTubeId' frontend/components/ui/product-video.tsx; then
    test_pass "ProductVideo: YouTube ID extraction"
  else
    test_fail "ProductVideo: MISSING YouTube support"
  fi
  
  if grep -q 'Play' frontend/components/ui/product-video.tsx; then
    test_pass "ProductVideo: Play button implemented"
  else
    test_fail "ProductVideo: MISSING Play button"
  fi
else
  test_fail "ProductVideo component MISSING"
fi

if [ -f "frontend/lib/video-utils.ts" ]; then
  test_pass "Video utility functions exist"
else
  test_fail "Video utilities MISSING"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "3️⃣  HOMEPAGE INTEGRATION (Weergaveplek 1/2)"
echo "───────────────────────────────────────────────────────"

if grep -q 'ProductVideo' frontend/app/page.tsx; then
  test_pass "Homepage imports ProductVideo"
else
  test_fail "Homepage MISSING ProductVideo import"
fi

if grep -q 'product\.videoUrl' frontend/app/page.tsx; then
  test_pass "Homepage uses product.videoUrl"
else
  test_fail "Homepage NOT using product.videoUrl"
fi

if grep -q 'PRODUCTS_FEATURED' frontend/app/page.tsx; then
  test_pass "Homepage fetches featured product"
else
  test_fail "Homepage NOT fetching featured product"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "4️⃣  PRODUCT DETAIL INTEGRATION (Weergaveplek 2/2)"
echo "───────────────────────────────────────────────────────"

if grep -q 'ProductVideo' frontend/components/products/product-detail.tsx; then
  test_pass "Product detail imports ProductVideo"
else
  test_fail "Product detail MISSING ProductVideo import"
fi

if grep -q 'product\.videoUrl.*ProductVideo' frontend/components/products/product-detail.tsx; then
  test_pass "Product detail uses product.videoUrl"
else
  test_fail "Product detail NOT using product.videoUrl"
fi

if grep -q 'Over dit product' frontend/components/products/product-detail.tsx; then
  test_pass "Product detail has 'Over dit product' section"
  
  # Check if video is near "Over dit product"
  if grep -A10 'Over dit product' frontend/components/products/product-detail.tsx | grep -q 'ProductVideo'; then
    test_pass "Video is under 'Over dit product' section ✨"
  else
    test_fail "Video NOT under 'Over dit product' section"
  fi
else
  test_fail "Product detail MISSING 'Over dit product' section"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "5️⃣  ADMIN PANEL"
echo "───────────────────────────────────────────────────────"

if grep -q 'videoUrl' admin-next/types/product.ts; then
  test_pass "Admin Product type includes videoUrl"
else
  test_fail "Admin Product type MISSING videoUrl"
fi

if grep -q 'videoUrl' admin-next/lib/validation/product.schema.ts; then
  test_pass "Admin validation schema includes videoUrl"
else
  test_fail "Admin validation MISSING videoUrl"
fi

if grep -q 'Demo Video URL' admin-next/components/product-form.tsx; then
  test_pass "Admin form has 'Demo Video URL' field"
else
  test_fail "Admin form MISSING video URL field"
fi

if grep -q 'CheckCircle.*XCircle' admin-next/components/product-form.tsx; then
  test_pass "Admin form has validation icons"
else
  test_fail "Admin form MISSING validation UI"
fi

if grep -q 'isValidVideoUrl' admin-next/components/product-form.tsx; then
  test_pass "Admin form validates video URLs"
else
  test_fail "Admin form NOT validating URLs"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "6️⃣  DRY PRINCIPLES"
echo "───────────────────────────────────────────────────────"

# Count ProductVideo usages
VIDEO_COMPONENT_USES=$(grep -r "ProductVideo" frontend/{app,components} 2>/dev/null | wc -l | tr -d ' ')

if [ "$VIDEO_COMPONENT_USES" -ge "2" ]; then
  test_pass "ProductVideo component reused (DRY) - ${VIDEO_COMPONENT_USES} uses"
else
  test_fail "ProductVideo NOT reused enough - only ${VIDEO_COMPONENT_USES} uses"
fi

# Check for duplicate video logic
if grep -r "youtube.*embed" frontend/{app,components} 2>/dev/null | grep -v "product-video.tsx" | grep -v ".next" > /dev/null; then
  test_fail "DUPLICATE video logic found (NOT DRY)"
else
  test_pass "No duplicate video logic (DRY ✨)"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "Test Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}🎉 ABSOLUTE SUCCESS! Video URL feature compleet!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "✅ Database schema met videoUrl"
  echo "✅ ProductVideo component (DRY, herbruikbaar)"
  echo "✅ Homepage hero toont featured product video"
  echo "✅ Product detail toont video onder 'Over dit product'"
  echo "✅ Admin panel met video URL field + validatie"
  echo "✅ Geen redundantie, maximaal maintainable"
  echo ""
  echo -e "${YELLOW}📋 Next steps - Manual testing:${NC}"
  echo "  1. Start backend: cd backend && npm run dev"
  echo "  2. Start frontend: cd frontend && npm run dev"
  echo "  3. Open http://localhost:3000"
  echo "  4. Edit product in admin, add YouTube URL"
  echo "  5. See video on homepage + product detail"
  echo ""
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ Some tests failed. Review output above.${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi


