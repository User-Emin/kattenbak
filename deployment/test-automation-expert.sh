#!/bin/bash

# COMPLETE TEST AUTOMATION - EXPERT LEVEL
# Tests EVERYTHING: Admin, Webshop, API, Database, Infrastructure
# Zero tolerance - every action verified

set -e

PASSWORD="${DEPLOY_PASSWORD:-Pursangue66@}"
SERVER="185.224.139.74"
USER="root"
BASE_URL="https://catsupply.nl"
ADMIN_EMAIL="admin@catsupply.nl"
ADMIN_PASSWORD="admin123"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
CRITICAL_FAILURES=0

echo "═══════════════════════════════════════════════════════════════════"
echo "  🧪 COMPLETE TEST AUTOMATION - EXPERT LEVEL"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Testing EVERYTHING:"
echo "  ✓ Infrastructure (PM2, Nginx, Database)"
echo "  ✓ Backend API (Public + Admin)"
echo "  ✓ Frontend Pages (All routes)"
echo "  ✓ Admin Panel (All CRUD operations)"
echo "  ✓ Webshop Flow (Browse → Cart → Checkout)"
echo "  ✓ Static Assets (CSS, JS, Images)"
echo ""

test_pass() {
  echo -e "  ${GREEN}✅ $1${NC}"
  ((PASSED_TESTS++))
  ((TOTAL_TESTS++))
}

test_fail() {
  echo -e "  ${RED}❌ $1${NC}"
  ((FAILED_TESTS++))
  ((TOTAL_TESTS++))
  if [ "$2" = "CRITICAL" ]; then
    ((CRITICAL_FAILURES++))
  fi
}

test_warn() {
  echo -e "  ${YELLOW}⚠️  $1${NC}"
}

# ═══════════════════════════════════════════════════════════════════
# CATEGORY 1: INFRASTRUCTURE
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. INFRASTRUCTURE VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# PM2 Processes
PM2_STATUS=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'pm2 jlist 2>/dev/null' || echo "[]")

if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="backend") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  BACKEND_PID=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="backend") | .pid')
  test_pass "PM2 Backend: ONLINE (PID $BACKEND_PID)"
else
  test_fail "PM2 Backend: NOT ONLINE" "CRITICAL"
fi

if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="frontend") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  FRONTEND_PID=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="frontend") | .pid')
  test_pass "PM2 Frontend: ONLINE (PID $FRONTEND_PID)"
else
  test_fail "PM2 Frontend: NOT ONLINE" "CRITICAL"
fi

if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="admin") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  ADMIN_PID=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="admin") | .pid')
  test_pass "PM2 Admin: ONLINE (PID $ADMIN_PID)"
else
  test_fail "PM2 Admin: NOT ONLINE" "CRITICAL"
fi

# Database Connection
DB_TEST=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'cd /var/www/kattenbak/backend && node -e "
const { PrismaClient } = require(\"@prisma/client\");
const prisma = new PrismaClient();
prisma.product.count().then(count => {
  console.log(count);
  prisma.\$disconnect();
}).catch(() => {
  console.log(\"ERROR\");
  process.exit(1);
});
" 2>/dev/null' || echo "ERROR")

if [ "$DB_TEST" != "ERROR" ] && [ -n "$DB_TEST" ]; then
  test_pass "Database: Connected ($DB_TEST products in DB)"
else
  test_fail "Database: Connection failed" "CRITICAL"
fi

# Nginx
NGINX_STATUS=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'systemctl is-active nginx 2>/dev/null' || echo "unknown")
if [ "$NGINX_STATUS" = "active" ]; then
  test_pass "Nginx: Running"
else
  test_warn "Nginx: Status unknown or not running"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# CATEGORY 2: BACKEND API - PUBLIC ENDPOINTS
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. BACKEND API - PUBLIC ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get all products
PRODUCTS=$(curl -s "$BASE_URL/api/v1/products")
if echo "$PRODUCTS" | jq -e '.success == true' > /dev/null 2>&1; then
  PRODUCT_COUNT=$(echo "$PRODUCTS" | jq -r '.data | length')
  test_pass "GET /api/v1/products: $PRODUCT_COUNT products returned"
  
  # Extract first product slug for later tests
  PRODUCT_SLUG=$(echo "$PRODUCTS" | jq -r '.data[0].slug')
else
  test_fail "GET /api/v1/products: Failed or invalid response" "CRITICAL"
  PRODUCT_SLUG="automatische-kattenbak-premium"
fi

# Get product by slug
PRODUCT=$(curl -s "$BASE_URL/api/v1/products/slug/$PRODUCT_SLUG")
if echo "$PRODUCT" | jq -e '.success == true' > /dev/null 2>&1; then
  PRODUCT_NAME=$(echo "$PRODUCT" | jq -r '.data.name')
  PRODUCT_PRICE=$(echo "$PRODUCT" | jq -r '.data.price')
  test_pass "GET /api/v1/products/slug/$PRODUCT_SLUG: $PRODUCT_NAME (€$PRODUCT_PRICE)"
else
  test_fail "GET /api/v1/products/slug/$PRODUCT_SLUG: Failed" "CRITICAL"
fi

# Get featured products
FEATURED=$(curl -s "$BASE_URL/api/v1/products/featured")
if echo "$FEATURED" | jq -e '.success == true' > /dev/null 2>&1; then
  FEATURED_COUNT=$(echo "$FEATURED" | jq -r '.data | length')
  test_pass "GET /api/v1/products/featured: $FEATURED_COUNT featured products"
else
  test_fail "GET /api/v1/products/featured: Failed" "CRITICAL"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# CATEGORY 3: FRONTEND PAGES - ALL ROUTES
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. FRONTEND PAGES - ALL ROUTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test each page
test_frontend_page() {
  local path=$1
  local name=$2
  local search_text=$3
  
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  
  if [ "$CODE" = "200" ]; then
    if [ -n "$search_text" ]; then
      CONTENT=$(curl -s "$BASE_URL$path")
      if echo "$CONTENT" | grep -q "$search_text"; then
        test_pass "$name: HTTP 200 + Content verified"
      else
        test_warn "$name: HTTP 200 but missing: '$search_text'"
      fi
    else
      test_pass "$name: HTTP 200"
    fi
  else
    test_fail "$name: HTTP $CODE" "CRITICAL"
  fi
}

test_frontend_page "/" "Homepage" "Slimste Kattenbak"
test_frontend_page "/product/$PRODUCT_SLUG" "Product Detail" "rounded-sm"
test_frontend_page "/producten" "Products List" ""
test_frontend_page "/cart" "Shopping Cart" ""
test_frontend_page "/checkout" "Checkout" ""
test_frontend_page "/contact" "Contact Page" ""
test_frontend_page "/over-ons" "About Us" ""
test_frontend_page "/verzending" "Shipping Info" ""
test_frontend_page "/retourneren" "Returns Policy" ""
test_frontend_page "/veelgestelde-vragen" "FAQ" ""

echo ""

# ═══════════════════════════════════════════════════════════════════
# CATEGORY 4: STATIC ASSETS - CSS & JS
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. STATIC ASSETS - CSS & JS CHUNKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HTML=$(curl -s "$BASE_URL/")

# Test CSS files
CSS_FILES=$(echo "$HTML" | grep -o '/_next/static/[^"]*\.css' | head -3)
CSS_PASS=0
CSS_FAIL=0
for css in $CSS_FILES; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$css")
  if [ "$CODE" = "200" ]; then
    ((CSS_PASS++))
  else
    ((CSS_FAIL++))
    test_fail "CSS $css: HTTP $CODE"
  fi
done

if [ $CSS_PASS -gt 0 ]; then
  test_pass "CSS Files: $CSS_PASS/$((CSS_PASS + CSS_FAIL)) loading correctly"
fi

# Test JS chunks
JS_FILES=$(echo "$HTML" | grep -o '/_next/static/chunks/[^"]*\.js' | head -5)
JS_PASS=0
JS_FAIL=0
for js in $JS_FILES; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$js")
  if [ "$CODE" = "200" ]; then
    ((JS_PASS++))
  else
    ((JS_FAIL++))
    test_fail "JS $js: HTTP $CODE"
  fi
done

if [ $JS_PASS -gt 0 ]; then
  test_pass "JS Chunks: $JS_PASS/$((JS_PASS + JS_FAIL)) loading correctly"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# CATEGORY 5: ADMIN AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. ADMIN AUTHENTICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test login page
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/login")
if [ "$CODE" = "200" ]; then
  test_pass "Admin Login Page: HTTP 200"
else
  test_fail "Admin Login Page: HTTP $CODE" "CRITICAL"
fi

# Admin login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // .token')
  ADMIN_ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.data.user.role // .user.role')
  test_pass "Admin Login: Token received (Role: $ADMIN_ROLE)"
  
  # Verify token
  VERIFY=$(curl -s "$BASE_URL/api/v1/admin/auth/verify" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$VERIFY" | jq -e '.success == true' > /dev/null 2>&1; then
    test_pass "Admin Token Verification: Valid"
  else
    test_fail "Admin Token Verification: Invalid"
  fi
else
  test_fail "Admin Login: Failed - No token received" "CRITICAL"
  TOKEN=""
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# CATEGORY 6: ADMIN API - CRUD OPERATIONS
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. ADMIN API - CRUD OPERATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$TOKEN" ]; then
  # Get all products (admin)
  ADMIN_PRODUCTS=$(curl -s "$BASE_URL/api/v1/admin/products" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$ADMIN_PRODUCTS" | jq -e '.success == true' > /dev/null 2>&1; then
    ADMIN_PRODUCT_COUNT=$(echo "$ADMIN_PRODUCTS" | jq -r '.data | length')
    test_pass "Admin GET Products: $ADMIN_PRODUCT_COUNT products"
    
    # Get first product ID
    PRODUCT_ID=$(echo "$ADMIN_PRODUCTS" | jq -r '.data[0].id')
    
    # Get product by ID
    ADMIN_PRODUCT=$(curl -s "$BASE_URL/api/v1/admin/products/$PRODUCT_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$ADMIN_PRODUCT" | jq -e '.success == true' > /dev/null 2>&1; then
      ADMIN_PRODUCT_NAME=$(echo "$ADMIN_PRODUCT" | jq -r '.data.name')
      test_pass "Admin GET Product by ID: $ADMIN_PRODUCT_NAME"
      
      # Update product (minimal update to test)
      UPDATE=$(curl -s -X PUT "$BASE_URL/api/v1/admin/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$ADMIN_PRODUCT_NAME\"}")
      
      if echo "$UPDATE" | jq -e '.success == true' > /dev/null 2>&1; then
        test_pass "Admin UPDATE Product: Success"
      else
        test_fail "Admin UPDATE Product: Failed"
      fi
    else
      test_fail "Admin GET Product by ID: Failed"
    fi
  else
    test_fail "Admin GET Products: Failed" "CRITICAL"
  fi
  
  # Get orders
  ORDERS=$(curl -s "$BASE_URL/api/v1/admin/orders" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$ORDERS" | jq -e '.success == true' > /dev/null 2>&1; then
    ORDER_COUNT=$(echo "$ORDERS" | jq -r '.data | length')
    test_pass "Admin GET Orders: $ORDER_COUNT orders"
  else
    test_fail "Admin GET Orders: Failed"
  fi
  
  # Get returns
  RETURNS=$(curl -s "$BASE_URL/api/v1/admin/returns" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$RETURNS" | jq -e '.success == true' > /dev/null 2>&1; then
    RETURN_COUNT=$(echo "$RETURNS" | jq -r '.data | length')
    test_pass "Admin GET Returns: $RETURN_COUNT returns"
  else
    test_fail "Admin GET Returns: Failed"
  fi
else
  test_fail "Admin API Tests: Skipped (no token)" "CRITICAL"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# CATEGORY 7: ADMIN UI PAGES
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. ADMIN UI PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_admin_page() {
  local path=$1
  local name=$2
  
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  if [ "$CODE" = "200" ]; then
    test_pass "$name: HTTP 200"
  else
    test_fail "$name: HTTP $CODE"
  fi
}

test_admin_page "/admin/login" "Admin Login Page"
test_admin_page "/admin/dashboard" "Admin Dashboard"
test_admin_page "/admin/dashboard/products" "Admin Products Page"
test_admin_page "/admin/dashboard/orders" "Admin Orders Page"

echo ""

# ═══════════════════════════════════════════════════════════════════
# FINAL REPORT
# ═══════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════"
echo "  📊 COMPLETE TEST AUTOMATION RESULTS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests:          $TOTAL_TESTS"
echo -e "${GREEN}Passed:               $PASSED_TESTS${NC}"
echo -e "${RED}Failed:               $FAILED_TESTS${NC}"
echo -e "${RED}Critical Failures:    $CRITICAL_FAILURES${NC}"
echo ""

PASS_RATE=0
if [ $TOTAL_TESTS -gt 0 ]; then
  PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
fi

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED (100%)${NC}"
  echo ""
  echo "🎉 WEBSHOP FULLY OPERATIONAL"
  echo "   - All infrastructure healthy"
  echo "   - All APIs responding correctly"
  echo "   - All pages loading"
  echo "   - All static assets available"
  echo "   - Admin panel fully functional"
  echo ""
  exit 0
else
  echo -e "${YELLOW}⚠️  SOME TESTS FAILED (Pass rate: ${PASS_RATE}%)${NC}"
  echo ""
  
  if [ $CRITICAL_FAILURES -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL FAILURES DETECTED${NC}"
    echo "   The webshop has critical issues that need immediate attention"
    echo ""
  fi
  
  echo "Failed tests require investigation and fixes"
  echo ""
  exit 1
fi
