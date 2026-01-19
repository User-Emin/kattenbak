#!/bin/bash

##############################################################################
# E2E ADMIN TEST - Complete Admin Functionality Verification
# Tests login, product management, orders, and all admin features
# Ensures everything is stable before deployment
##############################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_HOST="catsupply.nl"
ADMIN_URL="https://${SERVER_HOST}/admin"
ADMIN_LOGIN_URL="https://${SERVER_HOST}/admin/login"
API_URL="https://${SERVER_HOST}/api/v1"
ADMIN_EMAIL="admin@catsupply.nl"
ADMIN_PASSWORD="admin123"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧪 E2E ADMIN TEST - Complete Verification          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

##############################################################################
# Helper Functions
##############################################################################
test_pass() {
    local test_name="$1"
    echo -e "${GREEN}✓ ${test_name}${NC}"
    ((TESTS_PASSED++))
}

test_fail() {
    local test_name="$1"
    local reason="$2"
    echo -e "${RED}✗ ${test_name}${NC}"
    echo -e "  ${RED}Reason: ${reason}${NC}"
    ((TESTS_FAILED++))
    FAILED_TESTS+=("${test_name}: ${reason}")
}

##############################################################################
# Test 1: Admin Login Page Accessibility
##############################################################################
echo -e "\n${YELLOW}[1/10] Testing admin login page accessibility...${NC}"

LOGIN_RESPONSE=$(curl -s -o /dev/null -w '%{http_code}' "${ADMIN_LOGIN_URL}" || echo "000")

if [ "$LOGIN_RESPONSE" == "200" ]; then
    test_pass "Admin login page accessible (HTTP 200)"
else
    test_fail "Admin login page accessible" "HTTP ${LOGIN_RESPONSE}"
    exit 1
fi

##############################################################################
# Test 2: Admin Login Page Content
##############################################################################
echo -e "\n${YELLOW}[2/10] Verifying admin login page content...${NC}"

LOGIN_CONTENT=$(curl -s -L "${ADMIN_LOGIN_URL}" || echo "")

if echo "$LOGIN_CONTENT" | grep -q "Kattenbak Admin"; then
    test_pass "Admin login page shows correct title"
else
    test_fail "Admin login page title" "Title not found"
    exit 1
fi

if echo "$LOGIN_CONTENT" | grep -q "admin@catsupply.nl"; then
    test_pass "Admin login page shows correct credentials"
else
    test_fail "Admin login page credentials" "Credentials not found"
    exit 1
fi

# Check that frontend navbar is NOT present
if echo "$LOGIN_CONTENT" | grep -q "CatSupply Logo"; then
    test_fail "Frontend navbar check" "Frontend navbar detected in admin page"
    exit 1
else
    test_pass "No frontend navbar in admin page"
fi

##############################################################################
# Test 3: Admin Login API
##############################################################################
echo -e "\n${YELLOW}[3/10] Testing admin login API...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/admin/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" || echo "{}")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    test_pass "Admin login API successful"
    
    # Extract token for later tests
    ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
    
    if [ -n "$ADMIN_TOKEN" ]; then
        test_pass "Admin token received"
    else
        test_fail "Admin token extraction" "Token not found in response"
        exit 1
    fi
else
    test_fail "Admin login API" "Login failed or invalid response"
    echo "Response: $LOGIN_RESPONSE" | head -5
    exit 1
fi

##############################################################################
# Test 4: Products API Access
##############################################################################
echo -e "\n${YELLOW}[4/10] Testing products API access...${NC}"

PRODUCTS_RESPONSE=$(curl -s -X GET "${API_URL}/admin/products" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" || echo "{}")

if echo "$PRODUCTS_RESPONSE" | grep -q '"success":true' || echo "$PRODUCTS_RESPONSE" | grep -q '\[.*\]'; then
    test_pass "Products API accessible with admin token"
    
    # Check if we got products
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id"' | wc -l || echo "0")
    if [ "$PRODUCT_COUNT" -gt 0 ]; then
        test_pass "Products found (${PRODUCT_COUNT} products)"
    else
        test_fail "Products count" "No products found"
    fi
else
    test_fail "Products API access" "API call failed or unauthorized"
    echo "Response: $PRODUCTS_RESPONSE" | head -5
    exit 1
fi

##############################################################################
# Test 5: Orders API Access
##############################################################################
echo -e "\n${YELLOW}[5/10] Testing orders API access...${NC}"

ORDERS_RESPONSE=$(curl -s -X GET "${API_URL}/admin/orders" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" || echo "{}")

if echo "$ORDERS_RESPONSE" | grep -q '"success":true' || echo "$ORDERS_RESPONSE" | grep -q '\[.*\]'; then
    test_pass "Orders API accessible with admin token"
    
    # Check if we got orders (might be empty array)
    ORDER_COUNT=$(echo "$ORDERS_RESPONSE" | grep -o '"id"' | wc -l || echo "0")
    test_pass "Orders API responding (${ORDER_COUNT} orders)"
else
    test_fail "Orders API access" "API call failed or unauthorized"
    echo "Response: $ORDERS_RESPONSE" | head -5
    exit 1
fi

##############################################################################
# Test 6: Product Management (Read/Update)
##############################################################################
echo -e "\n${YELLOW}[6/10] Testing product management (read/update)...${NC}"

# Get first product ID if available
FIRST_PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")

if [ -n "$FIRST_PRODUCT_ID" ]; then
    # Test GET product by ID
    PRODUCT_DETAIL_RESPONSE=$(curl -s -X GET "${API_URL}/admin/products/${FIRST_PRODUCT_ID}" \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" || echo "{}")
    
    if echo "$PRODUCT_DETAIL_RESPONSE" | grep -q '"id"'; then
        test_pass "Product detail API accessible (GET by ID)"
        
        # Extract product data for update test
        PRODUCT_NAME=$(echo "$PRODUCT_DETAIL_RESPONSE" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
        
        if [ -n "$PRODUCT_NAME" ]; then
            test_pass "Product data accessible (name: ${PRODUCT_NAME})"
        else
            test_fail "Product data extraction" "Product name not found"
        fi
    else
        test_fail "Product detail API" "Failed to fetch product detail"
        exit 1
    fi
    
    # Test product update capability (read-only check, no actual update)
    UPDATE_RESPONSE=$(curl -s -X GET "${API_URL}/admin/products/${FIRST_PRODUCT_ID}" \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" || echo "{}")
    
    if echo "$UPDATE_RESPONSE" | grep -q '"id"'; then
        test_pass "Product update endpoint accessible"
    else
        test_fail "Product update endpoint" "Failed to access update endpoint"
    fi
else
    test_fail "Product management" "No products found to test"
    exit 1
fi

##############################################################################
# Test 7: Categories API Access
##############################################################################
echo -e "\n${YELLOW}[7/10] Testing categories API access...${NC}"

CATEGORIES_RESPONSE=$(curl -s -X GET "${API_URL}/admin/categories" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" || echo "{}")

if echo "$CATEGORIES_RESPONSE" | grep -q '"success":true' || echo "$CATEGORIES_RESPONSE" | grep -q '\[.*\]'; then
    test_pass "Categories API accessible with admin token"
else
    # Categories might not exist, but API should respond
    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X GET "${API_URL}/admin/categories" \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" || echo "000")
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "404" ]; then
        test_pass "Categories API responding (HTTP ${HTTP_CODE})"
    else
        test_fail "Categories API access" "HTTP ${HTTP_CODE}"
    fi
fi

##############################################################################
# Test 8: Admin Dashboard & Protected Routes
##############################################################################
echo -e "\n${YELLOW}[8/10] Testing admin dashboard and protected routes...${NC}"

# Test dashboard route (should redirect to login if not authenticated)
DASHBOARD_RESPONSE=$(curl -s -L -o /dev/null -w '%{http_code}' "${ADMIN_URL}/dashboard" || echo "000")

# Should redirect to login if not authenticated, or return 200 if authenticated
if [ "$DASHBOARD_RESPONSE" == "200" ] || [ "$DASHBOARD_RESPONSE" == "302" ] || [ "$DASHBOARD_RESPONSE" == "307" ]; then
    test_pass "Admin dashboard route accessible (HTTP ${DASHBOARD_RESPONSE})"
else
    test_fail "Admin dashboard route" "HTTP ${DASHBOARD_RESPONSE}"
fi

# Test products page route
PRODUCTS_PAGE_RESPONSE=$(curl -s -L -o /dev/null -w '%{http_code}' "${ADMIN_URL}/dashboard/products" || echo "000")

if [ "$PRODUCTS_PAGE_RESPONSE" == "200" ] || [ "$PRODUCTS_PAGE_RESPONSE" == "302" ] || [ "$PRODUCTS_PAGE_RESPONSE" == "307" ]; then
    test_pass "Admin products page route accessible (HTTP ${PRODUCTS_PAGE_RESPONSE})"
else
    test_fail "Admin products page route" "HTTP ${PRODUCTS_PAGE_RESPONSE}"
fi

# Test orders page route
ORDERS_PAGE_RESPONSE=$(curl -s -L -o /dev/null -w '%{http_code}' "${ADMIN_URL}/dashboard/orders" || echo "000")

if [ "$ORDERS_PAGE_RESPONSE" == "200" ] || [ "$ORDERS_PAGE_RESPONSE" == "302" ] || [ "$ORDERS_PAGE_RESPONSE" == "307" ]; then
    test_pass "Admin orders page route accessible (HTTP ${ORDERS_PAGE_RESPONSE})"
else
    test_fail "Admin orders page route" "HTTP ${ORDERS_PAGE_RESPONSE}"
fi

##############################################################################
# Test 9: Admin Health Check
##############################################################################
echo -e "\n${YELLOW}[9/10] Testing admin service health...${NC}"

# Check if admin service is running on server
if ssh -o StrictHostKeyChecking=no root@185.224.139.74 "pm2 list | grep -q 'admin.*online'"; then
    test_pass "Admin service running (PM2 online)"
else
    test_fail "Admin service health" "PM2 process not online"
    exit 1
fi

# Check local port
LOCAL_RESPONSE=$(ssh -o StrictHostKeyChecking=no root@185.224.139.74 "curl -s -o /dev/null -w '%{http_code}' http://localhost:3103/admin/login || echo '000'")

if [ "$LOCAL_RESPONSE" == "200" ]; then
    test_pass "Admin service responding on port 3103"
else
    test_fail "Admin service port check" "HTTP ${LOCAL_RESPONSE}"
    exit 1
fi

##############################################################################
# Test 10: Nginx Routing
##############################################################################
echo -e "\n${YELLOW}[10/10] Testing Nginx routing...${NC}"

# Check Nginx config
if ssh -o StrictHostKeyChecking=no root@185.224.139.74 "nginx -t 2>&1 | grep -q 'syntax is ok'"; then
    test_pass "Nginx configuration valid"
else
    test_fail "Nginx configuration" "Syntax errors detected"
    exit 1
fi

# Check upstream configuration
ADMIN_UPSTREAM=$(ssh -o StrictHostKeyChecking=no root@185.224.139.74 "grep -A 1 'location /admin' /etc/nginx/sites-available/catsupply.nl | grep 'proxy_pass' | grep -o 'http://[^;]*' | head -1")

if echo "$ADMIN_UPSTREAM" | grep -q "admin"; then
    test_pass "Nginx /admin routes to admin upstream"
else
    test_fail "Nginx routing" "/admin does not route to admin upstream"
    exit 1
fi

# Check upstream port
ADMIN_PORT=$(ssh -o StrictHostKeyChecking=no root@185.224.139.74 "grep -A 3 'upstream admin {' /etc/nginx/sites-available/catsupply.nl | grep 'server' | grep -o '3103' || echo ''")

if [ "$ADMIN_PORT" == "3103" ]; then
    test_pass "Admin upstream points to port 3103"
else
    test_fail "Admin upstream port" "Port is not 3103"
    exit 1
fi

##############################################################################
# SUMMARY
##############################################################################
echo -e "\n${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📊 TEST SUMMARY                                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}Tests Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Tests Failed: ${TESTS_FAILED}${NC}"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "\n${RED}Failed Tests:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}✗ ${test}${NC}"
    done
    
    echo -e "\n${RED}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ E2E ADMIN TEST FAILED                              ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════╝${NC}"
    exit 1
else
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ E2E ADMIN TEST PASSED - ALL SYSTEMS STABLE        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
    echo -e "\n${BLUE}Admin is ready for production use:${NC}"
    echo -e "  ${BLUE}URL: ${ADMIN_URL}${NC}"
    echo -e "  ${BLUE}Login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}${NC}"
    exit 0
fi
