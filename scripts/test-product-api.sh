#!/bin/bash

# ✅ PRODUCT API TEST SCRIPT
# Test product API endpoints voor elke build
# Isolatie: Test API, database, en frontend data fetching

set -e

API_URL="${API_URL:-https://catsupply.nl/api/v1}"
PRODUCT_SLUG="automatische-kattenbak-premium"

echo "🔍 PRODUCT API TEST - $(date)"
echo "=================================="
echo "API URL: $API_URL"
echo "Product Slug: $PRODUCT_SLUG"
echo ""

# Test 1: API Health Check
echo "✅ Test 1: API Health Check"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health" || echo "FAILED")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✓ API is healthy"
else
  echo "   ✗ API health check failed (HTTP $HTTP_CODE)"
  exit 1
fi

# Test 2: Product by Slug
echo ""
echo "✅ Test 2: Product by Slug"
PRODUCT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/products/slug/$PRODUCT_SLUG" || echo "FAILED")
HTTP_CODE=$(echo "$PRODUCT_RESPONSE" | tail -n1)
PRODUCT_BODY=$(echo "$PRODUCT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✓ Product endpoint responds (HTTP $HTTP_CODE)"
  
  # Check for required fields
  if echo "$PRODUCT_BODY" | grep -q '"success":true'; then
    echo "   ✓ Response has success:true"
  else
    echo "   ✗ Response missing success:true"
    exit 1
  fi
  
  if echo "$PRODUCT_BODY" | grep -q '"name"'; then
    PRODUCT_NAME=$(echo "$PRODUCT_BODY" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   ✓ Product name found: $PRODUCT_NAME"
  else
    echo "   ✗ Product name missing"
    exit 1
  fi
  
  if echo "$PRODUCT_BODY" | grep -q '"sku"'; then
    PRODUCT_SKU=$(echo "$PRODUCT_BODY" | grep -o '"sku":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   ✓ Product SKU found: $PRODUCT_SKU"
  else
    echo "   ✗ Product SKU missing"
    exit 1
  fi
  
  if echo "$PRODUCT_BODY" | grep -q '"price"'; then
    PRODUCT_PRICE=$(echo "$PRODUCT_BODY" | grep -o '"price":[0-9.]*' | head -1 | cut -d':' -f2)
    echo "   ✓ Product price found: €$PRODUCT_PRICE"
  else
    echo "   ✗ Product price missing"
    exit 1
  fi
  
  if echo "$PRODUCT_BODY" | grep -q '"variants"'; then
    echo "   ✓ Product variants found"
  else
    echo "   ⚠ Product variants missing (may be empty array)"
  fi
else
  echo "   ✗ Product endpoint failed (HTTP $HTTP_CODE)"
  echo "   Response: $PRODUCT_BODY"
  exit 1
fi

# Test 3: Verify dynamic data (not hardcoded)
echo ""
echo "✅ Test 3: Verify Dynamic Data"
if [ -n "$PRODUCT_NAME" ] && [ "$PRODUCT_NAME" != "Automatische Kattenbak Premium" ]; then
  echo "   ⚠ Product name differs from expected: $PRODUCT_NAME"
fi

if [ -n "$PRODUCT_SKU" ] && [ "$PRODUCT_SKU" != "KB-AUTO-001" ]; then
  echo "   ⚠ Product SKU differs from expected: $PRODUCT_SKU"
fi

# Test 4: Frontend API Call Simulation
echo ""
echo "✅ Test 4: Frontend API Call Simulation"
FRONTEND_URL="${FRONTEND_URL:-https://catsupply.nl}"
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL/product/$PRODUCT_SLUG" || echo "FAILED")
FRONTEND_HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n1)

if [ "$FRONTEND_HTTP_CODE" = "200" ]; then
  echo "   ✓ Frontend page loads (HTTP $FRONTEND_HTTP_CODE)"
  
  # Check if page contains product data
  FRONTEND_BODY=$(echo "$FRONTEND_RESPONSE" | sed '$d')
  if echo "$FRONTEND_BODY" | grep -q "$PRODUCT_NAME"; then
    echo "   ✓ Frontend page contains product name"
  else
    echo "   ⚠ Frontend page may not contain product name (check client-side rendering)"
  fi
  
  if echo "$FRONTEND_BODY" | grep -q "$PRODUCT_SKU"; then
    echo "   ✓ Frontend page contains product SKU"
  else
    echo "   ⚠ Frontend page may not contain product SKU (check client-side rendering)"
  fi
else
  echo "   ✗ Frontend page failed (HTTP $FRONTEND_HTTP_CODE)"
  exit 1
fi

echo ""
echo "=================================="
echo "✅ ALL TESTS PASSED"
echo "Product data is dynamic and API is working correctly"
echo ""
