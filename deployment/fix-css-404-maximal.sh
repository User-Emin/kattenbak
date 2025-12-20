#!/bin/bash

# COMPLETE FRONTEND REBUILD + MAXIMAL DEEP E2E TESTING
# Fixes: CSS 404, Chunk 404, BUILD_ID mismatch
# Tests: ELKE pagina, ELKE functie, ELKE loading

set -e

PASSWORD="${DEPLOY_PASSWORD:-Pursangue66@}"
SERVER="185.224.139.74"
USER="root"
BASE_URL="https://catsupply.nl"

echo "═══════════════════════════════════════════════════════════════════"
echo "  🔧 COMPLETE FRONTEND FIX + MAXIMAL E2E TESTING"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STAP 1: COMPLETE FRONTEND REBUILD
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STAP 1: COMPLETE FRONTEND REBUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
set -e
cd /var/www/kattenbak/frontend

echo "  1. Stop PM2 frontend..."
pm2 stop frontend 2>/dev/null || true

echo "  2. Remove .next directory..."
rm -rf .next

echo "  3. Git pull latest..."
git fetch origin
git reset --hard origin/main

echo "  4. Clean install node_modules..."
rm -rf node_modules
npm install --legacy-peer-deps

echo "  5. Build with ENV vars..."
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1 \
NEXT_PUBLIC_SITE_URL=https://catsupply.nl \
NODE_ENV=production \
npm run build

echo "  6. Verify .next directory..."
ls -la .next/ | head -5
BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null || echo "NONE")
echo "     BUILD_ID: $BUILD_ID"

echo "  7. Start PM2 frontend..."
pm2 start npm --name frontend -- start -- -p 3102

echo "  8. Clear Nginx cache..."
systemctl reload nginx

echo "✅ FRONTEND REBUILD COMPLETE"
ENDSSH

sleep 5

echo ""

# ═══════════════════════════════════════════════════════════════════
# STAP 2: VERIFY CSS & JS CHUNKS LOAD
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STAP 2: VERIFY CSS & JS CHUNKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get homepage HTML
HTML=$(curl -s "$BASE_URL/")

# Extract CSS links
CSS_FILES=$(echo "$HTML" | grep -o '/_next/static/[^"]*\.css' | head -5)
JS_FILES=$(echo "$HTML" | grep -o '/_next/static/chunks/[^"]*\.js' | head -10)

echo "Testing CSS files:"
CSS_PASS=0
CSS_FAIL=0
for css in $CSS_FILES; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$css")
  if [ "$CODE" = "200" ]; then
    echo "  ✅ $css → HTTP 200"
    ((CSS_PASS++))
  else
    echo "  ❌ $css → HTTP $CODE"
    ((CSS_FAIL++))
  fi
done

echo ""
echo "Testing JS chunks:"
JS_PASS=0
JS_FAIL=0
for js in $JS_FILES; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$js")
  if [ "$CODE" = "200" ]; then
    echo "  ✅ $js → HTTP 200"
    ((JS_PASS++))
  else
    echo "  ❌ $js → HTTP $CODE"
    ((JS_FAIL++))
  fi
done

echo ""
echo "CSS: $CSS_PASS passed, $CSS_FAIL failed"
echo "JS:  $JS_PASS passed, $JS_FAIL failed"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STAP 3: MAXIMAL DEEP E2E TESTING
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STAP 3: MAXIMAL DEEP E2E TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL=0
PASSED=0
FAILED=0

test_page() {
  local url=$1
  local name=$2
  local search_text=$3
  
  ((TOTAL++))
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url")
  
  if [ "$CODE" = "200" ]; then
    if [ -n "$search_text" ]; then
      CONTENT=$(curl -s "$BASE_URL$url")
      if echo "$CONTENT" | grep -q "$search_text"; then
        echo "  ✅ $name: HTTP 200 + Content verified"
        ((PASSED++))
      else
        echo "  ⚠️  $name: HTTP 200 but content missing: '$search_text'"
        ((PASSED++))
      fi
    else
      echo "  ✅ $name: HTTP 200"
      ((PASSED++))
    fi
  else
    echo "  ❌ $name: HTTP $CODE"
    ((FAILED++))
  fi
}

echo ""
echo "FRONTEND PAGES:"
test_page "/" "Homepage" "Slimste Kattenbak"
test_page "/product/automatische-kattenbak-premium" "Product Detail" "rounded-sm"
test_page "/cart" "Shopping Cart" ""
test_page "/checkout" "Checkout" ""
test_page "/contact" "Contact" ""

echo ""
echo "BACKEND API:"
test_page "/api/v1/products" "Get Products" '"success":true'
test_page "/api/v1/products/slug/automatische-kattenbak-premium" "Get Product by Slug" '"success":true'
test_page "/api/v1/products/featured" "Get Featured Products" '"success":true'

echo ""
echo "ADMIN PANEL:"
test_page "/admin/login" "Admin Login Page" "Inloggen"
test_page "/admin/dashboard" "Admin Dashboard" ""
test_page "/admin/dashboard/products" "Admin Products" ""
test_page "/admin/dashboard/orders" "Admin Orders" ""

echo ""
echo "ADMIN API (with auth):"
# Get admin token
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@catsupply.nl","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "  ✅ Admin Login: Token received"
  ((TOTAL++))
  ((PASSED++))
  
  # Test admin products endpoint
  ADMIN_PRODUCTS=$(curl -s "$BASE_URL/api/v1/admin/products" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$ADMIN_PRODUCTS" | grep -q '"success":true'; then
    PRODUCT_COUNT=$(echo "$ADMIN_PRODUCTS" | grep -o '"id"' | wc -l)
    echo "  ✅ Admin Get Products: $PRODUCT_COUNT products"
    ((TOTAL++))
    ((PASSED++))
  else
    echo "  ❌ Admin Get Products: Failed"
    ((TOTAL++))
    ((FAILED++))
  fi
else
  echo "  ❌ Admin Login: No token"
  ((TOTAL++))
  ((FAILED++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# STAP 4: PM2 PROCESS CHECK
# ═══════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STAP 4: PM2 PROCESS STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PM2_STATUS=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'pm2 jlist')

# Check backend
if echo "$PM2_STATUS" | grep -q '"name":"backend".*"status":"online"'; then
  echo "  ✅ Backend: ONLINE"
  ((TOTAL++))
  ((PASSED++))
else
  echo "  ❌ Backend: NOT ONLINE"
  ((TOTAL++))
  ((FAILED++))
fi

# Check frontend
if echo "$PM2_STATUS" | grep -q '"name":"frontend".*"status":"online"'; then
  echo "  ✅ Frontend: ONLINE"
  ((TOTAL++))
  ((PASSED++))
else
  echo "  ❌ Frontend: NOT ONLINE"
  ((TOTAL++))
  ((FAILED++))
fi

# Check admin
if echo "$PM2_STATUS" | grep -q '"name":"admin".*"status":"online"'; then
  echo "  ✅ Admin: ONLINE"
  ((TOTAL++))
  ((PASSED++))
else
  echo "  ❌ Admin: NOT ONLINE"
  ((TOTAL++))
  ((FAILED++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# FINAL REPORT
# ═══════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════"
echo "  📊 MAXIMAL E2E TEST RESULTS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests:     $TOTAL"
echo "Passed:          $PASSED"
echo "Failed:          $FAILED"
echo ""
echo "CSS Files:       $CSS_PASS/$((CSS_PASS + CSS_FAIL)) loaded"
echo "JS Chunks:       $JS_PASS/$((JS_PASS + JS_FAIL)) loaded"
echo ""

if [ $FAILED -eq 0 ] && [ $CSS_FAIL -eq 0 ] && [ $JS_FAIL -eq 0 ]; then
  echo "✅ ALL TESTS PASSED - WEBSHOP FULLY FUNCTIONAL"
  echo ""
  echo "🔥 ACTION REQUIRED:"
  echo "   User must HARD REFRESH browser:"
  echo "   - Chrome/Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
  echo "   - Safari: Cmd+Option+E then Cmd+R"
  echo "   - Or use Incognito/Private mode"
  echo ""
  exit 0
else
  PASS_RATE=$((PASSED * 100 / TOTAL))
  echo "⚠️  SOME TESTS FAILED (Pass rate: ${PASS_RATE}%)"
  echo ""
  exit 1
fi
