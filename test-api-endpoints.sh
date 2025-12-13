#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPREHENSIVE API ENDPOINT TESTING
# Test ELKE API URL om errors te voorkomen
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_BASE="http://localhost:3101"
PASSED=0
FAILED=0
ERRORS=()

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 COMPREHENSIVE API TESTING - ALLE ENDPOINTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint() {
  local method="$1"
  local endpoint="$2"
  local expected_status="${3:-200}"
  local description="$4"
  
  echo -n "Testing: $method $endpoint ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint" 2>&1)
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE$endpoint" 2>&1)
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} ($http_code)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗${NC} Expected $expected_status, got $http_code"
    ERRORS+=("$method $endpoint: Expected $expected_status, got $http_code")
    ((FAILED++))
    return 1
  fi
}

test_json_response() {
  local endpoint="$1"
  local description="$2"
  
  echo -n "Testing JSON: $endpoint ... "
  
  response=$(curl -s "$API_BASE$endpoint" 2>&1)
  
  if echo "$response" | jq empty 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Valid JSON"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} Invalid JSON"
    ERRORS+=("$endpoint: Invalid JSON response")
    ((FAILED++))
  fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}1️⃣  HEALTH & STATUS ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────────"

test_endpoint "GET" "/health" 200 "Health check"
test_json_response "/health" "Health JSON"

echo ""
echo -e "${YELLOW}2️⃣  PRODUCTS ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────────"

test_endpoint "GET" "/api/v1/products" 200 "Get all products"
test_json_response "/api/v1/products" "Products JSON"

test_endpoint "GET" "/api/v1/products/featured" 200 "Get featured products"
test_json_response "/api/v1/products/featured" "Featured products JSON"

test_endpoint "GET" "/api/v1/products/slug/automatische-kattenbak-premium" 200 "Get product by slug"
test_json_response "/api/v1/products/slug/automatische-kattenbak-premium" "Product detail JSON"

echo ""
echo -e "${YELLOW}3️⃣  CATEGORIES ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────────"

test_endpoint "GET" "/api/v1/categories" 200 "Get all categories"
test_json_response "/api/v1/categories" "Categories JSON"

echo ""
echo -e "${YELLOW}4️⃣  SETTINGS ENDPOINT${NC}"
echo "─────────────────────────────────────────────────────"

test_endpoint "GET" "/api/v1/settings" 200 "Get settings"
test_json_response "/api/v1/settings" "Settings JSON"

echo ""
echo -e "${YELLOW}5️⃣  ERROR HANDLING${NC}"
echo "─────────────────────────────────────────────────────"

test_endpoint "GET" "/api/v1/products/999999" 404 "Non-existent product ID"
test_endpoint "GET" "/api/v1/products/slug/non-existent-slug" 404 "Non-existent product slug"
test_endpoint "GET" "/api/v1/nonexistent" 404 "Non-existent endpoint"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 TEST RESULTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ ERRORS DETECTED:${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  for error in "${ERRORS[@]}"; do
    echo -e "${RED}✗${NC} $error"
  done
  echo ""
  exit 1
else
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ ALL API ENDPOINTS WORKING!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  exit 0
fi
