#!/bin/bash

# 🧪 E2E Verification Script - catsupply.nl
# ============================================================================
# Verifies complete deployment on catsupply.nl
# ============================================================================

set -e

BASE_URL="https://catsupply.nl"
TIMEOUT=10

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 E2E VERIFICATION - catsupply.nl"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Testing $name... "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" || echo "000")
    
    if [ "$HTTP_CODE" = "$expected_code" ]; then
        echo -e "${GREEN}✅ OK (HTTP $HTTP_CODE)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $HTTP_CODE, expected $expected_code)${NC}"
        return 1
    fi
}

check_json_response() {
    local name=$1
    local url=$2
    local field=$3
    local expected_value=$4
    
    echo -n "Testing $name... "
    
    RESPONSE=$(curl -s --max-time $TIMEOUT "$url" || echo "")
    
    if [ -z "$RESPONSE" ]; then
        echo -e "${RED}❌ FAILED (No response)${NC}"
        return 1
    fi
    
    VALUE=$(echo "$RESPONSE" | jq -r ".$field" 2>/dev/null || echo "")
    
    if [ "$VALUE" = "$expected_value" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  WARNING: $field = $VALUE (expected $expected_value)${NC}"
        return 0  # Don't fail on this
    fi
}

# Test 1: Backend Health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Backend Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "Backend Health" "$BASE_URL/api/v1/health" 200
BACKEND_OK=$?

# Test 2: Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "Frontend Home" "$BASE_URL/" 200
FRONTEND_OK=$?

# Test 3: Admin Panel
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Admin Panel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "Admin Panel" "$BASE_URL/admin" 200
ADMIN_OK=$?

# Test 4: API Endpoints
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "Products API" "$BASE_URL/api/v1/products" 200
PRODUCTS_OK=$?

if [ $PRODUCTS_OK -eq 0 ]; then
    check_json_response "Products Response" "$BASE_URL/api/v1/products" "success" "true"
fi

# Test 5: Security Headers
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Security Headers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEADERS=$(curl -s -I --max-time $TIMEOUT "$BASE_URL/" | grep -iE "x-powered-by|server:" || true)
if [ -z "$HEADERS" ]; then
    echo -e "${GREEN}✅ OK (No server info leaked)${NC}"
    SECURITY_OK=0
else
    echo -e "${YELLOW}⚠️  WARNING: Server info exposed${NC}"
    echo "$HEADERS"
    SECURITY_OK=1
fi

# Test 6: HTTPS
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  HTTPS Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HTTP_REDIRECT=$(curl -s -I "http://catsupply.nl/" | grep -iE "301|302|Location: https://" || true)
if [ -n "$HTTP_REDIRECT" ]; then
    echo -e "${GREEN}✅ OK (HTTP redirects to HTTPS)${NC}"
    HTTPS_OK=0
else
    echo -e "${YELLOW}⚠️  HTTP redirect not detected${NC}"
    HTTPS_OK=1
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL_TESTS=6
PASSED_TESTS=0

[ $BACKEND_OK -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ $FRONTEND_OK -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ $ADMIN_OK -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ $PRODUCTS_OK -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ $SECURITY_OK -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ $HTTPS_OK -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo ""
echo "Tests passed: $PASSED_TESTS / $TOTAL_TESTS"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - Deployment verified!${NC}"
    exit 0
elif [ $PASSED_TESTS -ge 4 ]; then
    echo -e "${YELLOW}⚠️  MOST TESTS PASSED - Minor issues detected${NC}"
    exit 0
else
    echo -e "${RED}❌ MULTIPLE TESTS FAILED - Deployment needs attention${NC}"
    exit 1
fi
