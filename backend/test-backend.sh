#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# KATTENBAK BACKEND - TEST SCRIPT
# DRY Health Check & Endpoint Testing
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment
source .env 2>/dev/null || true
PORT=${PORT:-3101}
BASE_URL="http://localhost:$PORT"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🧪 TESTING BACKEND API${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test function
test_endpoint() {
  local ENDPOINT=$1
  local DESCRIPTION=$2
  
  echo -n "Testing $DESCRIPTION... "
  
  if curl -s -f "$BASE_URL$ENDPOINT" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    return 0
  else
    echo -e "${RED}❌ FAIL${NC}"
    return 1
  fi
}

# Wait for server
echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
for i in {1..10}; do
  if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is ready!${NC}"
    echo ""
    break
  fi
  sleep 1
done

# Run tests
PASSED=0
FAILED=0

# Health check
if test_endpoint "/health" "Health Check"; then
  ((PASSED++))
else
  ((FAILED++))
fi

# API v1 health
if test_endpoint "/api/v1/health" "API v1 Health"; then
  ((PASSED++))
else
  ((FAILED++))
fi

# Featured products
if test_endpoint "/api/v1/products/featured" "Featured Products"; then
  ((PASSED++))
else
  ((FAILED++))
fi

# All products
if test_endpoint "/api/v1/products" "All Products"; then
  ((PASSED++))
else
  ((FAILED++))
fi

# Product detail
if test_endpoint "/api/v1/products/1" "Product Detail"; then
  ((PASSED++))
else
  ((FAILED++))
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 TEST RESULTS${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed${NC}"
  exit 1
fi

