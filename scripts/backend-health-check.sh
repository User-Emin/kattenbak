#!/bin/bash

# ✅ BACKEND HEALTH CHECK & VALIDATION SCRIPT
# Security: Validates backend stability, API health, and error handling
# CPU-Friendly: Lightweight checks, minimal resource usage
# Modular: Can be run standalone or integrated into CI/CD

set -e

API_BASE="https://catsupply.nl/api/v1"
ADMIN_API_BASE="https://catsupply.nl/api/v1/admin"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# ✅ SECURITY: Generic error message (no sensitive data leakage)
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

echo "🔍 Backend Health Check & Security Validation"
echo "=============================================="

# Test 1: Health Check Endpoint
echo -e "\n1️⃣  Health Check"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.success == true' > /dev/null 2>&1; then
        log_success "Health check endpoint responds correctly"
    else
        log_error "Health check response format invalid"
    fi
else
    log_error "Health check returned HTTP $HTTP_CODE"
fi

# Test 2: Public Product API
echo -e "\n2️⃣  Public Product API"
PRODUCT_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/products/slug/automatische-kattenbak-premium" 2>&1)
HTTP_CODE=$(echo "$PRODUCT_RESPONSE" | tail -1)
BODY=$(echo "$PRODUCT_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.success == true and .data.name' > /dev/null 2>&1; then
        PRODUCT_NAME=$(echo "$BODY" | jq -r '.data.name // "N/A"')
        log_success "Product API works (Product: $PRODUCT_NAME)"
    else
        log_error "Product API response format invalid"
    fi
elif [ "$HTTP_CODE" = "404" ]; then
    log_warning "Product not found (non-critical)"
else
    log_error "Product API returned HTTP $HTTP_CODE"
fi

# Test 3: Featured Products API
echo -e "\n3️⃣  Featured Products API"
FEATURED_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/products/featured" 2>&1)
HTTP_CODE=$(echo "$FEATURED_RESPONSE" | tail -1)
BODY=$(echo "$FEATURED_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.success == true' > /dev/null 2>&1; then
        COUNT=$(echo "$BODY" | jq -r '.data | length // 0')
        log_success "Featured products API works ($COUNT products)"
    else
        log_error "Featured products API response format invalid"
    fi
else
    log_error "Featured products API returned HTTP $HTTP_CODE"
fi

# Test 4: Admin API (with authentication - expect 401 without token)
echo -e "\n4️⃣  Admin API Security"
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" "${ADMIN_API_BASE}/products" 2>&1)
HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    log_success "Admin API correctly requires authentication (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "502" ] || [ "$HTTP_CODE" = "500" ]; then
    log_error "Admin API returned HTTP $HTTP_CODE (backend error)"
else
    log_warning "Admin API returned unexpected HTTP $HTTP_CODE"
fi

# Test 5: Error Handling (404 endpoint)
echo -e "\n5️⃣  Error Handling"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/nonexistent-endpoint" 2>&1)
HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "404" ]; then
    log_success "Error handling works correctly (404 for non-existent endpoint)"
else
    log_warning "Unexpected error handling (HTTP $HTTP_CODE instead of 404)"
fi

# Test 6: Response Time Check (CPU-friendly)
echo -e "\n6️⃣  Performance Check"
START_TIME=$(date +%s%N)
curl -s "${API_BASE}/health" > /dev/null 2>&1
END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 )) # Convert to milliseconds

if [ "$DURATION" -lt 1000 ]; then
    log_success "Response time acceptable (${DURATION}ms)"
else
    log_warning "Response time slow (${DURATION}ms)"
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
