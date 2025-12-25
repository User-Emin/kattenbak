#!/bin/bash
#
# DEPLOYMENT VERIFICATION SCRIPT
# Tests all critical endpoints & services
# Usage: ./verify-deployment.sh [production|local]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MODE="${1:-production}"

if [ "$MODE" = "production" ]; then
    BASE_URL="https://catsupply.nl"
    API_URL="https://catsupply.nl/api/v1"
    ADMIN_URL="https://catsupply.nl/admin"
else
    BASE_URL="http://localhost:3102"
    API_URL="http://localhost:3101/api/v1"
    ADMIN_URL="http://localhost:3103/admin"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   KATTENBAK DEPLOYMENT VERIFICATION${NC}"
echo -e "${BLUE}   Mode: ${MODE}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    local method="${4:-GET}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -ne "${YELLOW}Testing:${NC} $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" --max-time 10)
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $response)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Frontend Tests
echo -e "\n${BLUE}[1/5] FRONTEND TESTS${NC}"
test_endpoint "Homepage" "$BASE_URL/"
test_endpoint "Products page" "$BASE_URL/products"
test_endpoint "Product detail" "$BASE_URL/products/automatische-kattenbak-premium"
test_endpoint "Cart page" "$BASE_URL/cart"
test_endpoint "Checkout page" "$BASE_URL/checkout"

# Backend API Tests
echo -e "\n${BLUE}[2/5] BACKEND API TESTS${NC}"
test_endpoint "API Health" "$API_URL/health"
test_endpoint "Products API" "$API_URL/products"
test_endpoint "Single Product API" "$API_URL/products/automatische-kattenbak-premium"
test_endpoint "Categories API" "$API_URL/categories"
test_endpoint "Settings API" "$API_URL/settings"

# Admin Tests
echo -e "\n${BLUE}[3/5] ADMIN PANEL TESTS${NC}"
test_endpoint "Admin Login" "$ADMIN_URL/login"
test_endpoint "Admin Dashboard" "$ADMIN_URL/dashboard" "200"

# Auth Tests
echo -e "\n${BLUE}[4/5] AUTHENTICATION TESTS${NC}"
test_endpoint "Admin Auth (no token)" "$API_URL/admin/products" "401"
test_endpoint "Admin Upload (no token)" "$API_URL/admin/upload/images" "401" "POST"

# SSL/Security Tests
echo -e "\n${BLUE}[5/5] SECURITY TESTS${NC}"
if [ "$MODE" = "production" ]; then
    echo -ne "${YELLOW}Testing:${NC} SSL Certificate ... "
    ssl_check=$(echo | openssl s_client -connect catsupply.nl:443 -servername catsupply.nl 2>/dev/null | grep -c "Verify return code: 0")
    if [ "$ssl_check" -eq 1 ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -ne "${YELLOW}Testing:${NC} HTTPS Redirect ... "
    http_redirect=$(curl -s -o /dev/null -w "%{http_code}" http://catsupply.nl/ -L --max-time 5)
    if [ "$http_redirect" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}Deployment is healthy and secure.${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED!${NC}"
    echo -e "${RED}Please investigate failures before deploying.${NC}"
    exit 1
fi

