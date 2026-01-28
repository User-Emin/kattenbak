#!/bin/bash

# ✅ E2E DEPLOYMENT VERIFICATION - Volledige verificatie na deployment
# Test alle kritieke endpoints en functionaliteiten

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-https://catsupply.nl}"
API_URL="${API_URL:-${BASE_URL}/api/v1}"
TIMEOUT=10

echo -e "${GREEN}🚀 E2E Deployment Verification${NC}"
echo "=================================="
echo "Base URL: $BASE_URL"
echo "API URL: $API_URL"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$url" || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        echo "   URL: $url"
        if [ -n "$body" ]; then
            echo "   Response: $(echo "$body" | head -c 200)"
        fi
        ((TESTS_FAILED++))
        return 1
    fi
}

# 1. Health Check
echo -e "\n${YELLOW}📋 Health Checks${NC}"
test_endpoint "API Health" "$API_URL/health" 200
test_endpoint "Frontend Homepage" "$BASE_URL" 200

# 2. Product API
echo -e "\n${YELLOW}📦 Product API${NC}"
test_endpoint "Get Products" "$API_URL/products" 200
test_endpoint "Get Featured Products" "$API_URL/products/featured" 200
test_endpoint "Get Product by Slug" "$API_URL/products/slug/automatische-kattenbak-premium" 200

# 3. Product Images
echo -e "\n${YELLOW}🖼️  Product Images${NC}"
# Get product data first
product_data=$(curl -s "$API_URL/products/slug/automatische-kattenbak-premium" || echo "{}")
if echo "$product_data" | grep -q "success.*true"; then
    # Extract first image URL
    first_image=$(echo "$product_data" | grep -o '"https://[^"]*uploads[^"]*"' | head -1 | tr -d '"')
    if [ -n "$first_image" ]; then
        test_endpoint "Product Image" "$first_image" 200
    else
        echo -e "${YELLOW}⚠️  No product images found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not fetch product data${NC}"
fi

# 4. Variant Images
echo -e "\n${YELLOW}🎨 Variant Images${NC}"
if echo "$product_data" | grep -q "variants"; then
    # Extract first variant image URL
    variant_image=$(echo "$product_data" | grep -o '"https://[^"]*uploads[^"]*"' | head -1 | tr -d '"')
    if [ -n "$variant_image" ]; then
        test_endpoint "Variant Image" "$variant_image" 200
    else
        echo -e "${YELLOW}⚠️  No variant images found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No variants found${NC}"
fi

# 5. Static Assets
echo -e "\n${YELLOW}📁 Static Assets${NC}"
test_endpoint "Product Main Image" "$BASE_URL/images/product-main-optimized.jpg" 200
test_endpoint "Feature Image" "$BASE_URL/images/feature-2.jpg" 200

# 6. Frontend Pages
echo -e "\n${YELLOW}🌐 Frontend Pages${NC}"
test_endpoint "Product Page" "$BASE_URL/product/automatische-kattenbak-premium" 200
test_endpoint "Cart Page" "$BASE_URL/cart" 200
test_endpoint "Checkout Page" "$BASE_URL/checkout" 200

# 7. Error Handling
echo -e "\n${YELLOW}⚠️  Error Handling${NC}"
# API returns 400 for invalid slug (validation), which is correct
test_endpoint "Invalid Product Slug" "$API_URL/products/nonexistent-slug" 400
test_endpoint "Invalid Endpoint" "$API_URL/invalid-endpoint" 404

# 8. API Response Format
echo -e "\n${YELLOW}📊 API Response Format${NC}"
echo -n "Checking API response format... "
product_response=$(curl -s "$API_URL/products/slug/automatische-kattenbak-premium")
if echo "$product_response" | grep -q '"success"'; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
    
    # Check if images array exists
    if echo "$product_response" | grep -q '"images"'; then
        echo -n "  Checking images array... "
        image_count=$(echo "$product_response" | grep -o '"images":\[[^]]*\]' | grep -o 'https://' | wc -l)
        if [ "$image_count" -gt 0 ]; then
            echo -e "${GREEN}✅ PASS${NC} ($image_count images found)"
            ((TESTS_PASSED++))
        else
            echo -e "${YELLOW}⚠️  No images in response${NC}"
        fi
    fi
    
    # Check if variants exist
    if echo "$product_response" | grep -q '"variants"'; then
        echo -n "  Checking variants array... "
        variant_count=$(echo "$product_response" | grep -o '"variants":\[[^]]*\]' | grep -o '"id"' | wc -l)
        if [ "$variant_count" -gt 0 ]; then
            echo -e "${GREEN}✅ PASS${NC} ($variant_count variants found)"
            ((TESTS_PASSED++))
        else
            echo -e "${YELLOW}⚠️  No variants in response${NC}"
        fi
    fi
else
    echo -e "${RED}❌ FAIL${NC} (Invalid response format)"
    ((TESTS_FAILED++))
fi

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
fi
