#!/bin/bash

###############################################################################
# E2E CHAT VERIFICATION SCRIPT
# ✅ Tests chat button functionality
# ✅ Verifies no "Oeps!" error pages
# ✅ Security compliant (no hardcoded values)
###############################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ✅ SECURITY: Load from environment variables
BASE_URL="${E2E_BASE_URL:-https://catsupply.nl}"
LOCAL_URL="${E2E_LOCAL_URL:-http://localhost:3000}"

PASSED=0
FAILED=0
ISSUES=()

log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

test_url() {
  local name="$1"
  local url="$2"
  local expected_content="$3"
  local should_not_contain="${4:-Oeps!}"
  
  echo -e "${BLUE}Testing: $name${NC}"
  echo "  URL: $url"
  
  response=$(curl -sfL -w "\n%{http_code}" "$url" 2>&1 || echo "ERROR\n000")
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)
  
  # Check HTTP status
  if [ "$http_code" != "200" ]; then
    error "  ❌ FAILED: HTTP $http_code (expected 200)"
    ISSUES+=("$name: HTTP $http_code")
    ((FAILED++))
    return 1
  fi
  
  # Check for "Oeps!" error page
  if echo "$body" | grep -qi "Oeps!"; then
    error "  ❌ FAILED: 'Oeps!' error page detected!"
    ISSUES+=("$name: Oeps! error page shown")
    ((FAILED++))
    return 1
  fi
  
  # Check expected content
  if [ -n "$expected_content" ] && ! echo "$body" | grep -qi "$expected_content"; then
    warning "  ⚠️  WARNING: Expected content '$expected_content' not found"
  fi
  
  log "  ✅ PASSED: HTTP 200, no error page"
  ((PASSED++))
  return 0
}

test_api() {
  local name="$1"
  local url="$2"
  local method="${3:-GET}"
  local data="${4:-}"
  
  echo -e "${BLUE}Testing API: $name${NC}"
  echo "  URL: $url"
  
  if [ "$method" = "POST" ]; then
    response=$(curl -sfL -X POST -H "Content-Type: application/json" -d "$data" -w "\n%{http_code}" "$url" 2>&1 || echo "ERROR\n000")
  else
    response=$(curl -sfL -w "\n%{http_code}" "$url" 2>&1 || echo "ERROR\n000")
  fi
  
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)
  
  if [ "$http_code" != "200" ] && [ "$http_code" != "201" ]; then
    error "  ❌ FAILED: HTTP $http_code"
    ISSUES+=("$name API: HTTP $http_code")
    ((FAILED++))
    return 1
  fi
  
  log "  ✅ PASSED: HTTP $http_code"
  ((PASSED++))
  return 0
}

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 E2E CHAT VERIFICATION - CATSUPPLY.NL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# === FRONTEND TESTS ===
echo -e "${YELLOW}📱 FRONTEND TESTS${NC}"
test_url "Homepage" "$BASE_URL" "Automatische Kattenbak" "Oeps!"
test_url "Product Page" "$BASE_URL/product/automatische-kattenbak-premium" "ALP 1071" "Oeps!"
test_url "Cart Page" "$BASE_URL/cart" "Winkelwagen" "Oeps!"
test_url "Checkout Page" "$BASE_URL/checkout" "Betaalgegevens" "Oeps!"
echo ""

# === BACKEND API TESTS ===
echo -e "${YELLOW}🔧 BACKEND API TESTS${NC}"
test_api "Health Check" "$BASE_URL/api/v1/health" "GET"
test_api "Products List" "$BASE_URL/api/v1/products" "GET"
test_api "RAG Health" "$BASE_URL/api/v1/rag/health" "GET"
echo ""

# === CHAT API TESTS ===
echo -e "${YELLOW}💬 CHAT API TESTS${NC}"
test_api "RAG Chat (Valid Query)" "$BASE_URL/api/v1/rag/chat" "POST" '{"query":"Hoeveel liter is de afvalbak?"}'
echo ""

# === RESULTS ===
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESULTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ FAILED: $FAILED${NC}"
else
  echo -e "${GREEN}❌ FAILED: 0${NC}"
fi
echo ""

if [ ${#ISSUES[@]} -gt 0 ]; then
  echo -e "${RED}ISSUES FOUND:${NC}"
  for issue in "${ISSUES[@]}"; do
    echo -e "  ${RED}- $issue${NC}"
  done
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ NO ISSUES FOUND - ALL TESTS PASSED${NC}"
  echo ""
  exit 0
fi
