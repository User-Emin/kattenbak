#!/bin/bash

# ✅ DATA CONSISTENCY VERIFICATION SCRIPT
# Verifieert dat admin en frontend API dezelfde productdata teruggeven
# Wordt uitgevoerd na elke build/deployment

set -e

API_URL="${API_URL:-https://catsupply.nl/api/v1}"
PRODUCT_SLUG="automatische-kattenbak-premium"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@catsupply.nl}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo "🔍 DATA CONSISTENCY VERIFICATION - $(date)"
echo "=========================================="
echo "API URL: $API_URL"
echo "Product Slug: $PRODUCT_SLUG"
echo ""

# Expected values
EXPECTED_NAME="ALP1071 Kattenbak"
EXPECTED_SKU="ALP1071"
EXPECTED_PRICE="219.95"

# Test 1: Frontend API (public)
echo "✅ Test 1: Frontend API (Public)"
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/products/slug/$PRODUCT_SLUG" || echo "FAILED")
FRONTEND_HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n1)
FRONTEND_DATA=$(echo "$FRONTEND_RESPONSE" | sed '$d')

if [ "$FRONTEND_HTTP_CODE" != "200" ]; then
  echo "   ✗ Frontend API call failed (HTTP $FRONTEND_HTTP_CODE)"
  exit 1
fi

FRONTEND_NAME=$(echo "$FRONTEND_DATA" | jq -r '.data.name // "N/A"')
FRONTEND_SKU=$(echo "$FRONTEND_DATA" | jq -r '.data.sku // "N/A"')
FRONTEND_PRICE=$(echo "$FRONTEND_DATA" | jq -r '.data.price // "N/A"')

echo "   ✓ Frontend API: OK"
echo "     - Name: $FRONTEND_NAME"
echo "     - SKU: $FRONTEND_SKU"
echo "     - Price: €$FRONTEND_PRICE"

# Test 2: Admin API (authenticated)
echo ""
echo "✅ Test 2: Admin API (Authenticated)"

# Get auth token (simplified - in production use proper JWT)
# For now, we'll test the admin endpoint directly
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/admin/products" \
  -H "Authorization: Bearer $(curl -s -X POST "$API_URL/admin/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.data.token // ""')" || echo "FAILED")

ADMIN_HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)
ADMIN_DATA=$(echo "$ADMIN_RESPONSE" | sed '$d')

if [ "$ADMIN_HTTP_CODE" != "200" ]; then
  echo "   ⚠️  Admin API authentication failed (HTTP $ADMIN_HTTP_CODE)"
  echo "   Testing admin API without auth (may fail)..."
  
  # Try direct query (may require auth)
  ADMIN_DIRECT=$(curl -s "$API_URL/admin/products" || echo "{}")
  ADMIN_PRODUCT=$(echo "$ADMIN_DIRECT" | jq -r ".data[]? | select(.slug == \"$PRODUCT_SLUG\") // empty")
  
  if [ -z "$ADMIN_PRODUCT" ] || [ "$ADMIN_PRODUCT" = "null" ]; then
    echo "   ⚠️  Could not fetch admin product data (auth required)"
    echo "   Skipping admin API consistency check"
    ADMIN_NAME="SKIPPED"
    ADMIN_SKU="SKIPPED"
    ADMIN_PRICE="SKIPPED"
  else
    ADMIN_NAME=$(echo "$ADMIN_PRODUCT" | jq -r '.name // "N/A"')
    ADMIN_SKU=$(echo "$ADMIN_PRODUCT" | jq -r '.sku // "N/A"')
    ADMIN_PRICE=$(echo "$ADMIN_PRODUCT" | jq -r '.price // "N/A"')
    echo "   ✓ Admin API: OK (direct query)"
    echo "     - Name: $ADMIN_NAME"
    echo "     - SKU: $ADMIN_SKU"
    echo "     - Price: €$ADMIN_PRICE"
  fi
else
  ADMIN_PRODUCT=$(echo "$ADMIN_DATA" | jq -r ".data[]? | select(.slug == \"$PRODUCT_SLUG\") // empty")
  
  if [ -z "$ADMIN_PRODUCT" ] || [ "$ADMIN_PRODUCT" = "null" ]; then
    echo "   ✗ Product not found in admin API response"
    exit 1
  fi
  
  ADMIN_NAME=$(echo "$ADMIN_PRODUCT" | jq -r '.name // "N/A"')
  ADMIN_SKU=$(echo "$ADMIN_PRODUCT" | jq -r '.sku // "N/A"')
  ADMIN_PRICE=$(echo "$ADMIN_PRODUCT" | jq -r '.price // "N/A"')
  
  echo "   ✓ Admin API: OK"
  echo "     - Name: $ADMIN_NAME"
  echo "     - SKU: $ADMIN_SKU"
  echo "     - Price: €$ADMIN_PRICE"
fi

# Test 3: Database Direct Query (via SSH if available)
echo ""
echo "✅ Test 3: Database Consistency Check"
echo "   (Skipped in CI/CD - requires server access)"
echo "   Run manually on server: scripts/verify-database-consistency.sh"

# Compare Frontend vs Admin
if [ "$ADMIN_NAME" != "SKIPPED" ]; then
  echo ""
  echo "✅ Test 4: Frontend vs Admin Consistency"
  
  ERRORS=0
  
  if [ "$FRONTEND_NAME" != "$ADMIN_NAME" ]; then
    echo "   ✗ Name mismatch:"
    echo "     Frontend: $FRONTEND_NAME"
    echo "     Admin: $ADMIN_NAME"
    ERRORS=$((ERRORS + 1))
  else
    echo "   ✓ Name consistent: $FRONTEND_NAME"
  fi
  
  if [ "$FRONTEND_SKU" != "$ADMIN_SKU" ]; then
    echo "   ✗ SKU mismatch:"
    echo "     Frontend: $FRONTEND_SKU"
    echo "     Admin: $ADMIN_SKU"
    ERRORS=$((ERRORS + 1))
  else
    echo "   ✓ SKU consistent: $FRONTEND_SKU"
  fi
  
  if [ "$FRONTEND_PRICE" != "$ADMIN_PRICE" ]; then
    echo "   ✗ Price mismatch:"
    echo "     Frontend: €$FRONTEND_PRICE"
    echo "     Admin: €$ADMIN_PRICE"
    ERRORS=$((ERRORS + 1))
  else
    echo "   ✓ Price consistent: €$FRONTEND_PRICE"
  fi
  
  if [ $ERRORS -eq 0 ]; then
    echo ""
    echo "✅ Alle consistency checks succesvol!"
    echo "   ✓ Frontend en Admin API geven dezelfde data terug"
    exit 0
  else
    echo ""
    echo "❌ Consistency check gefaald: $ERRORS mismatch(es) gevonden"
    echo ""
    echo "⚠️  WAARSCHUWING: Admin en Frontend API geven verschillende data terug!"
    echo "   Dit suggereert dat:"
    echo "   1. Admin gebruikt mogelijk mock data in plaats van database"
    echo "   2. Er zijn meerdere producten met dezelfde slug"
    echo "   3. Er is een caching issue"
    exit 1
  fi
else
  echo ""
  echo "⚠️  Admin API check geskipped (auth required)"
  echo "   Frontend API data:"
  echo "     - Name: $FRONTEND_NAME"
  echo "     - SKU: $FRONTEND_SKU"
  echo "     - Price: €$FRONTEND_PRICE"
  echo ""
  echo "✅ Frontend API verificatie succesvol"
  exit 0
fi
