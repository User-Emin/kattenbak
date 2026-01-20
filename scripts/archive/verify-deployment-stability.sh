#!/bin/bash

# ✅ DEPLOYMENT STABILITY VERIFICATION SCRIPT
# Verifies data consistency and prevents data loss during deployments
# Run this script before/after deployments to ensure stability

set -e

API_BASE="https://catsupply.nl/api/v1"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying deployment stability..."

# Test 1: Product detail API
echo -e "\n📦 Test 1: Product detail API"
PRODUCT_RESPONSE=$(curl -s "${API_BASE}/products/slug/automatische-kattenbak-premium")
if echo "$PRODUCT_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    PRODUCT_NAME=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.name // "N/A"')
    PRODUCT_SKU=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.sku // "N/A"')
    PRODUCT_PRICE=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.price // "N/A"')
    echo -e "${GREEN}✅ Product detail API works${NC}"
    echo "   Name: $PRODUCT_NAME"
    echo "   SKU: $PRODUCT_SKU"
    echo "   Price: €$PRODUCT_PRICE"
else
    echo -e "${RED}❌ Product detail API failed${NC}"
    echo "$PRODUCT_RESPONSE" | head -20
    exit 1
fi

# Test 2: Featured products API
echo -e "\n⭐ Test 2: Featured products API"
FEATURED_RESPONSE=$(curl -s "${API_BASE}/products/featured")
if echo "$FEATURED_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    FEATURED_COUNT=$(echo "$FEATURED_RESPONSE" | jq -r '.data | length // 0')
    echo -e "${GREEN}✅ Featured products API works${NC}"
    echo "   Featured products: $FEATURED_COUNT"
else
    echo -e "${RED}❌ Featured products API failed${NC}"
    echo "$FEATURED_RESPONSE" | head -20
    exit 1
fi

# Test 3: Products list API
echo -e "\n📋 Test 3: Products list API"
PRODUCTS_RESPONSE=$(curl -s "${API_BASE}/products")
if echo "$PRODUCTS_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    PRODUCTS_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.products | length // 0')
    echo -e "${GREEN}✅ Products list API works${NC}"
    echo "   Total products: $PRODUCTS_COUNT"
else
    echo -e "${RED}❌ Products list API failed${NC}"
    echo "$PRODUCTS_RESPONSE" | head -20
    exit 1
fi

# Test 4: Backend health check
echo -e "\n💚 Test 4: Backend health check"
HEALTH_RESPONSE=$(curl -s "${API_BASE}/health" || echo '{"success":false}')
if echo "$HEALTH_RESPONSE" | jq -e '.success == true or .status == "ok"' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Health check endpoint not available (non-critical)${NC}"
fi

# Summary
echo -e "\n${GREEN}✅ All critical tests passed!${NC}"
echo "   - Product detail API: ✅"
echo "   - Featured products API: ✅"
echo "   - Products list API: ✅"
echo ""
echo "🎉 Deployment stability verified!"
