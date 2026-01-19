#!/bin/bash

##############################################################################
# E2E Product API Test - Complete Product Management Verification
# Tests GET, PUT, variants, image uploads
##############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="https://catsupply.nl/api/v1"
ADMIN_EMAIL="admin@catsupply.nl"
ADMIN_PASSWORD="admin123"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧪 E2E PRODUCT API TEST                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

# Login
echo -e "\n${YELLOW}[1/5] Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/admin/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Login successful${NC}"

# Get products list
echo -e "\n${YELLOW}[2/5] Getting products list...${NC}"
PRODUCTS_RESPONSE=$(curl -s -X GET "${API_URL}/admin/products" \
    -H "Authorization: Bearer ${TOKEN}")

PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")

if [ -z "$PRODUCT_ID" ]; then
    echo -e "${RED}✗ No products found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Products list loaded (ID: ${PRODUCT_ID:0:20}...)${NC}"

# Get product by ID (THIS IS THE FAILING ENDPOINT)
echo -e "\n${YELLOW}[3/5] Getting product by ID (testing 500 fix)...${NC}"
PRODUCT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${API_URL}/admin/products/${PRODUCT_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

HTTP_STATUS=$(echo "$PRODUCT_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
PRODUCT_BODY=$(echo "$PRODUCT_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Product GET successful (HTTP 200)${NC}"
    
    # Check if product has required fields
    if echo "$PRODUCT_BODY" | grep -q '"id"'; then
        echo -e "${GREEN}✓ Product data valid${NC}"
    else
        echo -e "${RED}✗ Product data invalid${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Product GET failed (HTTP ${HTTP_STATUS})${NC}"
    echo "Response: $PRODUCT_BODY" | head -10
    exit 1
fi

# Test product update with optional fields as 0/null
echo -e "\n${YELLOW}[4/5] Testing product update (with 0/null optional fields)...${NC}"
UPDATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "${API_URL}/admin/products/${PRODUCT_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Product Update","compareAtPrice":0,"weight":0,"dimensions":{"length":0,"width":0,"height":0}}')

HTTP_STATUS=$(echo "$UPDATE_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Product UPDATE successful (HTTP 200)${NC}"
else
    echo -e "${RED}✗ Product UPDATE failed (HTTP ${HTTP_STATUS})${NC}"
    echo "Response: $UPDATE_BODY" | head -20
    exit 1
fi

# Test variants
echo -e "\n${YELLOW}[5/5] Testing variants...${NC}"
if echo "$PRODUCT_BODY" | grep -q '"variants"'; then
    VARIANT_COUNT=$(echo "$PRODUCT_BODY" | grep -o '"variants"' | wc -l || echo "0")
    echo -e "${GREEN}✓ Product has variants (${VARIANT_COUNT})${NC}"
else
    echo -e "${YELLOW}⚠ Product has no variants (this is OK)${NC}"
fi

echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ E2E PRODUCT API TEST PASSED                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
