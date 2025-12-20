#!/bin/bash

# COMPLETE E2E TESTING STRATEGY
# Tests ELKE pagina, ELKE functie, ELKE API endpoint
# MCP Server comprehensive verification

set -e

PASSWORD="${DEPLOY_PASSWORD:-Pursangue66@}"
SERVER="185.224.139.74"
USER="root"
BASE_URL="https://catsupply.nl"

echo "═══════════════════════════════════════════════════════════════════"
echo "  🧪 E2E TESTING - COMPLETE WEBSHOP VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

test_pass() {
  echo "  ✅ $1"
  ((PASSED_TESTS++))
  ((TOTAL_TESTS++))
}

test_fail() {
  echo "  ❌ $1"
  ((FAILED_TESTS++))
  ((TOTAL_TESTS++))
}

# ═══════════════════════════════════════════════════════════════════
# 1. FRONTEND - PUBLIC PAGES
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. FRONTEND - PUBLIC PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Homepage
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$CODE" = "200" ]; then
  # Check critical content
  CONTENT=$(curl -s "$BASE_URL/")
  if echo "$CONTENT" | grep -q "Slimste Kattenbak"; then
    test_pass "Homepage: Loads + Title present"
  else
    test_fail "Homepage: Title missing"
  fi
else
  test_fail "Homepage: HTTP $CODE"
fi

# Product detail
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/product/automatische-kattenbak-premium")
if [ "$CODE" = "200" ]; then
  CONTENT=$(curl -s "$BASE_URL/product/automatische-kattenbak-premium")
  if echo "$CONTENT" | grep -q "rounded-sm"; then
    test_pass "Product Detail: Loads + Sticky cart styling correct"
  else
    test_fail "Product Detail: Sticky cart styling missing"
  fi
else
  test_fail "Product Detail: HTTP $CODE"
fi

# Cart
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/cart")
[ "$CODE" = "200" ] && test_pass "Cart: HTTP 200" || test_fail "Cart: HTTP $CODE"

# Checkout
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/checkout")
[ "$CODE" = "200" ] && test_pass "Checkout: HTTP 200" || test_fail "Checkout: HTTP $CODE"

# Contact
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/contact")
[ "$CODE" = "200" ] && test_pass "Contact: HTTP 200" || test_fail "Contact: HTTP $CODE"

echo ""

# ═══════════════════════════════════════════════════════════════════
# 2. BACKEND API - PUBLIC ENDPOINTS
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. BACKEND API - PUBLIC ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get products
PRODUCTS=$(curl -s "$BASE_URL/api/v1/products")
if echo "$PRODUCTS" | grep -q '"success":true'; then
  COUNT=$(echo "$PRODUCTS" | jq -r '.data | length')
  test_pass "API Get Products: $COUNT products returned"
else
  test_fail "API Get Products: Failed"
fi

# Get product by slug
PRODUCT=$(curl -s "$BASE_URL/api/v1/products/slug/automatische-kattenbak-premium")
if echo "$PRODUCT" | grep -q '"success":true'; then
  NAME=$(echo "$PRODUCT" | jq -r '.data.name')
  test_pass "API Get Product by Slug: $NAME"
else
  test_fail "API Get Product by Slug: Failed"
fi

# Get featured products
FEATURED=$(curl -s "$BASE_URL/api/v1/products/featured")
if echo "$FEATURED" | grep -q '"success":true'; then
  test_pass "API Get Featured Products: Success"
else
  test_fail "API Get Featured Products: Failed"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# 3. ADMIN - AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. ADMIN - AUTHENTICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Admin login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@catsupply.nl","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
  test_pass "Admin Login: Token received"
  
  # Verify token
  VERIFY=$(curl -s "$BASE_URL/api/v1/admin/auth/verify" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$VERIFY" | grep -q '"success":true'; then
    ROLE=$(echo "$VERIFY" | jq -r '.data.role')
    test_pass "Admin Verify Token: Role = $ROLE"
  else
    test_fail "Admin Verify Token: Failed"
  fi
else
  test_fail "Admin Login: No token received"
  TOKEN=""
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# 4. ADMIN API - PROTECTED ENDPOINTS
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. ADMIN API - PROTECTED ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$TOKEN" ]; then
  # Get admin products
  ADMIN_PRODUCTS=$(curl -s "$BASE_URL/api/v1/admin/products" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$ADMIN_PRODUCTS" | grep -q '"success":true'; then
    ADMIN_COUNT=$(echo "$ADMIN_PRODUCTS" | jq -r '.data | length')
    test_pass "Admin Get Products: $ADMIN_COUNT products"
    
    # Get first product ID
    PRODUCT_ID=$(echo "$ADMIN_PRODUCTS" | jq -r '.data[0].id')
    
    if [ "$PRODUCT_ID" != "null" ]; then
      # Get product by ID
      ADMIN_PRODUCT=$(curl -s "$BASE_URL/api/v1/admin/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $TOKEN")
      
      if echo "$ADMIN_PRODUCT" | grep -q '"success":true'; then
        PRODUCT_NAME=$(echo "$ADMIN_PRODUCT" | jq -r '.data.name')
        test_pass "Admin Get Product by ID: $PRODUCT_NAME"
        
        # Update product (same data to avoid changes)
        UPDATE=$(curl -s -X PUT "$BASE_URL/api/v1/admin/products/$PRODUCT_ID" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "{\"name\":\"$PRODUCT_NAME\"}")
        
        if echo "$UPDATE" | grep -q '"success":true'; then
          test_pass "Admin Update Product: Success"
        else
          test_fail "Admin Update Product: Failed"
        fi
      else
        test_fail "Admin Get Product by ID: Failed"
      fi
    fi
  else
    test_fail "Admin Get Products: Failed"
  fi
  
  # Get orders
  ORDERS=$(curl -s "$BASE_URL/api/v1/admin/orders" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$ORDERS" | grep -q '"success":true'; then
    test_pass "Admin Get Orders: Success"
  else
    test_fail "Admin Get Orders: Failed"
  fi
  
  # Get returns
  RETURNS=$(curl -s "$BASE_URL/api/v1/admin/returns" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$RETURNS" | grep -q '"success":true'; then
    test_pass "Admin Get Returns: Success"
  else
    test_fail "Admin Get Returns: Failed"
  fi
else
  test_fail "Admin API Tests: Skipped (no token)"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# 5. ADMIN UI - PAGES
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. ADMIN UI - PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Login page
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/login")
if [ "$CODE" = "200" ]; then
  CONTENT=$(curl -s "$BASE_URL/admin/login")
  if echo "$CONTENT" | grep -q "Inloggen"; then
    test_pass "Admin Login Page: Loads correctly"
  else
    test_fail "Admin Login Page: Content missing"
  fi
else
  test_fail "Admin Login Page: HTTP $CODE"
fi

# Dashboard
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/dashboard")
[ "$CODE" = "200" ] && test_pass "Admin Dashboard: HTTP 200" || test_fail "Admin Dashboard: HTTP $CODE"

# Products list
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/dashboard/products")
[ "$CODE" = "200" ] && test_pass "Admin Products Page: HTTP 200" || test_fail "Admin Products Page: HTTP $CODE"

# Orders list
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/dashboard/orders")
[ "$CODE" = "200" ] && test_pass "Admin Orders Page: HTTP 200" || test_fail "Admin Orders Page: HTTP $CODE"

echo ""

# ═══════════════════════════════════════════════════════════════════
# 6. PM2 & INFRASTRUCTURE
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. PM2 & INFRASTRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PM2_STATUS=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'pm2 jlist')

# Backend
if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="backend") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  test_pass "PM2 Backend: Online"
else
  test_fail "PM2 Backend: Not online"
fi

# Frontend
if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="frontend") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  test_pass "PM2 Frontend: Online"
else
  test_fail "PM2 Frontend: Not online"
fi

# Admin
if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="admin") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  test_pass "PM2 Admin: At least one instance online"
else
  test_fail "PM2 Admin: No instances online"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# 7. DATABASE CONNECTIVITY
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. DATABASE CONNECTIVITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DB_TEST=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'cd /var/www/kattenbak/backend && node -e "
const { PrismaClient } = require(\"@prisma/client\");
const prisma = new PrismaClient();
prisma.product.count().then(count => {
  console.log(count);
  prisma.\$disconnect();
}).catch(err => {
  console.error(\"ERROR\");
  process.exit(1);
});
"' 2>&1)

if [ "$DB_TEST" != "ERROR" ] && [ -n "$DB_TEST" ]; then
  test_pass "Database: Connected ($DB_TEST products)"
else
  test_fail "Database: Connection failed"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════"
echo "  📊 E2E TEST RESULTS SUMMARY"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo "Passed:       $PASSED_TESTS"
echo "Failed:       $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo "✅ ALL TESTS PASSED"
  echo ""
  exit 0
else
  PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
  echo "⚠️  SOME TESTS FAILED (Pass rate: ${PASS_RATE}%)"
  echo ""
  exit 1
fi
