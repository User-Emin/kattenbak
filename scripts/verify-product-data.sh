#!/bin/bash

# ✅ PRODUCT DATA VERIFICATION SCRIPT
# Verifieert dat productdata correct is en niet is gereset
# Wordt uitgevoerd na elke build/deployment

set -e

API_URL="${API_URL:-https://catsupply.nl/api/v1}"
PRODUCT_SLUG="automatische-kattenbak-premium"

echo "🔍 PRODUCT DATA VERIFICATION - $(date)"
echo "=================================="
echo "API URL: $API_URL"
echo "Product Slug: $PRODUCT_SLUG"
echo ""

# Expected values
EXPECTED_NAME="ALP1071 Kattenbak"
EXPECTED_SKU="ALP1071"
EXPECTED_PRICE="219.95"
EXPECTED_VARIANTS_COUNT=2
EXPECTED_VARIANT_NAMES=("Premium Beige" "Premium Grijs")

# Test API
echo "✅ Test 1: API Health Check"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health" || echo "FAILED")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✓ API is healthy"
else
  echo "   ✗ API health check failed (HTTP $HTTP_CODE)"
  exit 1
fi

# Test Product Data
echo ""
echo "✅ Test 2: Product Data Verification"
PRODUCT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/products/slug/$PRODUCT_SLUG" || echo "FAILED")
PRODUCT_HTTP_CODE=$(echo "$PRODUCT_RESPONSE" | tail -n1)
PRODUCT_DATA=$(echo "$PRODUCT_RESPONSE" | sed '$d')

if [ "$PRODUCT_HTTP_CODE" != "200" ]; then
  echo "   ✗ Product API call failed (HTTP $PRODUCT_HTTP_CODE)"
  echo "   Response: $PRODUCT_DATA"
  exit 1
fi

# Extract values
ACTUAL_NAME=$(echo "$PRODUCT_DATA" | jq -r '.data.name // "N/A"')
ACTUAL_SKU=$(echo "$PRODUCT_DATA" | jq -r '.data.sku // "N/A"')
ACTUAL_PRICE=$(echo "$PRODUCT_DATA" | jq -r '.data.price // "N/A"')
ACTUAL_VARIANTS_COUNT=$(echo "$PRODUCT_DATA" | jq -r '.data.variants | length // 0')
ACTUAL_VARIANT_NAMES=$(echo "$PRODUCT_DATA" | jq -r '.data.variants[].name // empty' | sort)

echo "   Expected:"
echo "     - Name: $EXPECTED_NAME"
echo "     - SKU: $EXPECTED_SKU"
echo "     - Price: €$EXPECTED_PRICE"
echo "     - Variants: $EXPECTED_VARIANTS_COUNT"
echo "   Actual:"
echo "     - Name: $ACTUAL_NAME"
echo "     - SKU: $ACTUAL_SKU"
echo "     - Price: €$ACTUAL_PRICE"
echo "     - Variants: $ACTUAL_VARIANTS_COUNT"

# Verify values
ERRORS=0

if [ "$ACTUAL_NAME" != "$EXPECTED_NAME" ]; then
  echo "   ✗ Name mismatch: expected '$EXPECTED_NAME', got '$ACTUAL_NAME'"
  ERRORS=$((ERRORS + 1))
fi

if [ "$ACTUAL_SKU" != "$EXPECTED_SKU" ]; then
  echo "   ✗ SKU mismatch: expected '$EXPECTED_SKU', got '$ACTUAL_SKU'"
  ERRORS=$((ERRORS + 1))
fi

if [ "$ACTUAL_PRICE" != "$EXPECTED_PRICE" ]; then
  echo "   ✗ Price mismatch: expected €$EXPECTED_PRICE, got €$ACTUAL_PRICE"
  ERRORS=$((ERRORS + 1))
fi

if [ "$ACTUAL_VARIANTS_COUNT" != "$EXPECTED_VARIANTS_COUNT" ]; then
  echo "   ✗ Variants count mismatch: expected $EXPECTED_VARIANTS_COUNT, got $ACTUAL_VARIANTS_COUNT"
  ERRORS=$((ERRORS + 1))
fi

# Verify variant names
for expected_variant in "${EXPECTED_VARIANT_NAMES[@]}"; do
  if ! echo "$ACTUAL_VARIANT_NAMES" | grep -q "$expected_variant"; then
    echo "   ✗ Missing variant: $expected_variant"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ Alle productdata verificaties succesvol!"
  echo "   ✓ Naam: $ACTUAL_NAME"
  echo "   ✓ SKU: $ACTUAL_SKU"
  echo "   ✓ Prijs: €$ACTUAL_PRICE"
  echo "   ✓ Varianten: $ACTUAL_VARIANTS_COUNT"
  exit 0
else
  echo ""
  echo "❌ Productdata verificatie gefaald: $ERRORS fout(en) gevonden"
  echo ""
  echo "⚠️  WAARSCHUWING: Productdata is mogelijk gereset!"
  echo "   Voer scripts/restore-product-data.sh uit om te herstellen."
  exit 1
fi
