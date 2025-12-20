#!/bin/bash

# DEPLOYMENT VERIFICATION SCRIPT
# Tests backend API and frontend after every deployment

set -e

echo "================================"
echo "🔍 DEPLOYMENT VERIFICATION"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

# Test 1: Backend Health
echo -e "\n📡 Testing Backend Health..."
if curl -sf https://catsupply.nl/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend health check OK${NC}"
else
    echo -e "${RED}✗ Backend health check FAILED${NC}"
    ((ERRORS++))
fi

# Test 2: Featured Products
echo -e "\n🛍️  Testing Featured Products API..."
FEATURED=$(curl -sf https://catsupply.nl/api/v1/products/featured 2>&1)
if echo "$FEATURED" | jq -e '.success == true' > /dev/null 2>&1; then
    PRODUCT_COUNT=$(echo "$FEATURED" | jq '.data | length')
    echo -e "${GREEN}✓ Featured products OK (${PRODUCT_COUNT} products)${NC}"
else
    echo -e "${RED}✗ Featured products API FAILED${NC}"
    echo "$FEATURED"
    ((ERRORS++))
fi

# Test 3: Product by Slug
echo -e "\n📦 Testing Product Slug API..."
SLUG_TEST=$(curl -sf https://catsupply.nl/api/v1/products/slug/automatische-kattenbak-premium 2>&1)
if echo "$SLUG_TEST" | jq -e '.success == true' > /dev/null 2>&1; then
    PRODUCT_NAME=$(echo "$SLUG_TEST" | jq -r '.data.name')
    echo -e "${GREEN}✓ Product slug OK: ${PRODUCT_NAME}${NC}"
else
    echo -e "${RED}✗ Product slug API FAILED${NC}"
    echo "$SLUG_TEST"
    ((ERRORS++))
fi

# Test 4: Frontend Homepage
echo -e "\n🌐 Testing Frontend..."
if curl -sf https://catsupply.nl/ | grep -q "Catsupply Logo" 2>&1; then
    echo -e "${GREEN}✓ Frontend homepage OK${NC}"
else
    echo -e "${RED}✗ Frontend homepage FAILED${NC}"
    ((ERRORS++))
fi

# Test 5: Floating Navbar Check
echo -e "\n🖼️  Testing Floating Navbar..."
NAVBAR_CHECK=$(curl -sf https://catsupply.nl/ | grep -o 'rounded-3xl' | head -1)
if [ -n "$NAVBAR_CHECK" ]; then
    echo -e "${GREEN}✓ Floating navbar with rounded corners present${NC}"
else
    echo -e "${RED}✗ Floating navbar not found${NC}"
    ((ERRORS++))
fi

# Test 6: PM2 Status
echo -e "\n⚙️  Testing PM2 Services..."
PM2_STATUS=$(sshpass -p 'Pursangue66@' ssh root@185.224.139.74 "pm2 jlist" 2>&1)
BACKEND_STATUS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="backend") | .pm2_env.status')
FRONTEND_STATUS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="frontend") | .pm2_env.status')

if [ "$BACKEND_STATUS" = "online" ]; then
    echo -e "${GREEN}✓ Backend PM2 online${NC}"
else
    echo -e "${RED}✗ Backend PM2 not online: $BACKEND_STATUS${NC}"
    ((ERRORS++))
fi

if [ "$FRONTEND_STATUS" = "online" ]; then
    echo -e "${GREEN}✓ Frontend PM2 online${NC}"
else
    echo -e "${RED}✗ Frontend PM2 not online: $FRONTEND_STATUS${NC}"
    ((ERRORS++))
fi

# Final Report
echo -e "\n================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo "================================"
    exit 0
else
    echo -e "${RED}❌ $ERRORS CHECK(S) FAILED${NC}"
    echo "================================"
    exit 1
fi


