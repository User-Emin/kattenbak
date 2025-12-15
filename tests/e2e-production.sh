#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 AUTOMATED E2E PRODUCTION TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PASSED=0
FAILED=0
BASE_URL="https://catsupply.nl"

test_url() {
  local name="$1"
  local url="$2"
  local expected="$3"
  
  echo ""
  echo "Testing: $name"
  RESPONSE=$(curl -skL "$url" 2>&1)
  
  if echo "$RESPONSE" | grep -q "$expected"; then
    echo "  ✅ PASS"
    PASSED=$((PASSED + 1))
  else
    echo "  ❌ FAIL - Expected: $expected"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "━━━ BACKEND API ━━━"
test_url "Health" "$BASE_URL/api/v1/health" '"success":true'
test_url "Products" "$BASE_URL/api/v1/products" '"success":true'
test_url "Product Slug" "$BASE_URL/api/v1/products/slug/automatische-kattenbak-premium" 'automatische-kattenbak-premium'

echo ""
echo "━━━ ADMIN ━━━"
test_url "Admin Login" "$BASE_URL/admin" "Kattenbak Admin"
test_url "Admin Dashboard" "$BASE_URL/admin/dashboard" "Dashboard"

# Admin Login Test
echo ""
echo "Testing: Admin Backend Auth"
LOGIN=$(curl -sk "$BASE_URL/api/v1/admin/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@catsupply.nl","password":"CatSupply2024!Secure#Admin"}')

if echo "$LOGIN" | grep -q '"success":true'; then
  echo "  ✅ PASS"
  PASSED=$((PASSED + 1))
else
  echo "  ❌ FAIL"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━ FRONTEND ━━━"
test_url "Home" "$BASE_URL" "Slimme Kattenbak"
test_url "Product" "$BASE_URL/product/automatische-kattenbak-premium" "Automatische Kattenbak Premium"
test_url "Cart" "$BASE_URL/cart" "Winkelwagen"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTS: $PASSED passed, $FAILED failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED!"
  exit 0
else
  echo "❌ SOME TESTS FAILED"
  exit 1
fi
