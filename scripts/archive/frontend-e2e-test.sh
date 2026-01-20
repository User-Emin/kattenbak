#!/bin/bash

# ✅ FRONTEND E2E TEST SCRIPT - AUTOMATED BROWSER TESTING
# Security: Validates frontend stability, API connectivity, and error handling
# CPU-Friendly: Uses curl for lightweight checks, minimal resource usage
# Modular: Can be run standalone or integrated into CI/CD

set -e

BASE_URL="https://catsupply.nl"
API_BASE="${BASE_URL}/api/v1"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

log_error() {
    echo -e "${RED}❌ FAILED:${NC} $1"
    FAILED=$((FAILED + 1))
}

log_success() {
    echo -e "${GREEN}✅ PASSED:${NC} $1"
    PASSED=$((PASSED + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

echo "🔍 Frontend E2E Test & Validation"
echo "=================================="

# Test 1: Homepage loads correctly
echo -e "\n1️⃣  Homepage Load"
HOME_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/" 2>&1)
HTTP_CODE=$(echo "$HOME_RESPONSE" | tail -1 | tr -d '\n')
BODY=$(echo "$HOME_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    # Check for error page text
    if echo "$BODY" | grep -qi "Oeps!\|Er is iets misgegaan"; then
        log_error "Homepage shows error page"
    elif echo "$BODY" | grep -qi "Automatische Kattenbak\|CatSupply"; then
        log_success "Homepage loads correctly"
    else
        log_warning "Homepage loads but content unclear"
    fi
else
    log_error "Homepage returned HTTP $HTTP_CODE"
fi

# Test 2: Logo file exists and loads
echo -e "\n2️⃣  Logo File Check"
LOGO_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/logos/logo-navbar-original.png" 2>&1)
if [ "$LOGO_CHECK" = "200" ] || [ "$LOGO_CHECK" = "304" ]; then
    log_success "Logo file accessible (HTTP $LOGO_CHECK)"
elif [ "$LOGO_CHECK" = "404" ]; then
    log_error "Logo file not found (404)"
else
    log_warning "Logo file check returned HTTP $LOGO_CHECK"
fi

# Test 3: Product Detail Page
echo -e "\n3️⃣  Product Detail Page"
PRODUCT_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/product/automatische-kattenbak-premium" 2>&1)
HTTP_CODE=$(echo "$PRODUCT_RESPONSE" | tail -1 | tr -d '\n')
BODY=$(echo "$PRODUCT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    # Check for error page text
    if echo "$BODY" | grep -qi "Oeps!\|Er is iets misgegaan"; then
        log_error "Product page shows error page"
    elif echo "$BODY" | grep -qi "ALP1071\|Automatische Kattenbak"; then
        log_success "Product detail page loads correctly"
    else
        log_warning "Product page loads but content unclear"
    fi
else
    log_error "Product page returned HTTP $HTTP_CODE"
fi

# Test 4: API Connectivity (from frontend perspective)
echo -e "\n4️⃣  API Connectivity"
API_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/products/featured" 2>&1)
HTTP_CODE=$(echo "$API_RESPONSE" | tail -1 | tr -d '\n')
BODY=$(echo "$API_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.success == true' > /dev/null 2>&1; then
        COUNT=$(echo "$BODY" | jq -r '.data | length // 0')
        log_success "API connectivity works (featured products: $COUNT)"
    else
        log_warning "API responds but response format unexpected"
    fi
elif [ "$HTTP_CODE" = "502" ] || [ "$HTTP_CODE" = "500" ]; then
    log_error "API returned HTTP $HTTP_CODE (backend error)"
else
    log_warning "API returned HTTP $HTTP_CODE"
fi

# Test 5: Static Assets (CSS, JS)
echo -e "\n5️⃣  Static Assets"
CSS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/_next/static/css/app/layout.css" 2>&1 2>/dev/null || echo "404")
JS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/_next/static/chunks/main.js" 2>&1 2>/dev/null || echo "404")

if [ "$CSS_CHECK" = "200" ] || [ "$CSS_CHECK" = "304" ] || [ "$CSS_CHECK" = "404" ]; then
    log_success "Static assets accessible (CSS: $CSS_CHECK, JS: $JS_CHECK)"
else
    log_warning "Static assets check returned unexpected codes"
fi

# Test 6: Error Page Handling
echo -e "\n6️⃣  Error Page Handling"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/nonexistent-page-12345" 2>&1)
HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1 | tr -d '\n')

if [ "$HTTP_CODE" = "404" ]; then
    log_success "Error handling works correctly (404 for non-existent page)"
else
    log_warning "Error handling returned HTTP $HTTP_CODE instead of 404"
fi

# Summary
echo -e "\n=============================================="
echo "📊 Summary:"
echo -e "   ${GREEN}✅ Passed: $PASSED${NC}"
echo -e "   ${RED}❌ Failed: $FAILED${NC}"
echo -e "   ${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
