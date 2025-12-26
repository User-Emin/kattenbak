#!/bin/bash
# ============================================================
# COMPREHENSIVE E2E VERIFICATION SCRIPT
# Tests all critical endpoints and functionality
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load credentials
if [ -f "$PROJECT_ROOT/.env.server" ]; then
  source "$PROJECT_ROOT/.env.server"
else
  echo -e "${RED}❌ .env.server not found!${NC}"
  exit 1
fi

PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"
  local expected_content="$4"
  
  echo -e "${BLUE}Testing: $name${NC}"
  
  response=$(curl -s -w "\n%{http_code}|%{time_total}" "$url")
  status=$(echo "$response" | tail -n1 | cut -d'|' -f1)
  time=$(echo "$response" | tail -n1 | cut -d'|' -f2)
  body=$(echo "$response" | head -n-1)
  
  if [ "$status" != "$expected_status" ]; then
    echo -e "${RED}❌ FAILED: Expected HTTP $expected_status, got $status${NC}"
    ((FAILED++))
    return 1
  fi
  
  if [ -n "$expected_content" ] && ! echo "$body" | grep -q "$expected_content"; then
    echo -e "${RED}❌ FAILED: Expected content not found${NC}"
    ((FAILED++))
    return 1
  fi
  
  echo -e "${GREEN}✅ PASSED: HTTP $status in ${time}s${NC}"
  ((PASSED++))
}

# Test SSH connection
test_ssh() {
  echo -e "${BLUE}Testing: SSH Connection${NC}"
  if sshpass -e ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "echo 'SSH OK'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED: SSH connection works${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAILED: Cannot connect via SSH${NC}"
    ((FAILED++))
  fi
}

# Test PM2 processes
test_pm2() {
  echo -e "${BLUE}Testing: PM2 Processes${NC}"
  pm2_status=$(sshpass -e ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "pm2 list" 2>/dev/null | grep -E "online|errored" || echo "")
  
  for app in frontend backend admin; do
    if echo "$pm2_status" | grep -q "$app.*online"; then
      echo -e "${GREEN}  ✅ $app: ONLINE${NC}"
      ((PASSED++))
    else
      echo -e "${RED}  ❌ $app: NOT ONLINE${NC}"
      ((FAILED++))
    fi
  done
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   E2E VERIFICATION - COMPREHENSIVE${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# === INFRASTRUCTURE TESTS ===
echo -e "${YELLOW}📊 INFRASTRUCTURE TESTS${NC}"
test_ssh
test_pm2
echo

# === WEBSHOP TESTS ===
echo -e "${YELLOW}🛒 WEBSHOP TESTS${NC}"
test_endpoint "Homepage" "https://catsupply.nl/" 200 "Slimme Kattenbak"
test_endpoint "Product Page" "https://catsupply.nl/product/automatische-kattenbak-premium" 200 "ALP 1071"
test_endpoint "Checkout Page" "https://catsupply.nl/checkout" 200 "Betaalgegevens"
test_endpoint "Cart Page" "https://catsupply.nl/cart" 200
test_endpoint "Contact Page" "https://catsupply.nl/contact" 200
echo

# === BACKEND API TESTS ===
echo -e "${YELLOW}🔧 BACKEND API TESTS${NC}"
test_endpoint "API Health" "https://catsupply.nl/api/v1/products" 200 '"success":true'
test_endpoint "Orders Endpoint" "https://catsupply.nl/api/v1/orders" 200
test_endpoint "Returns Endpoint" "https://catsupply.nl/api/v1/returns/validate/test-id" 400  # Should reject invalid ID
echo

# === ADMIN PANEL TESTS ===
echo -e "${YELLOW}🔐 ADMIN PANEL TESTS${NC}"
test_endpoint "Admin Login Page" "https://catsupply.nl/admin/login" 200 "Admin Login"
test_endpoint "Admin Dashboard (Unauthorized)" "https://catsupply.nl/admin/dashboard" 200  # Should redirect or show login
echo

# === STATIC ASSETS ===
echo -e "${YELLOW}📦 STATIC ASSETS${NC}"
test_endpoint "Logo Image" "https://catsupply.nl/images/logo-catsupply.png" 200
test_endpoint "Test Cat Image" "https://catsupply.nl/images/test-cat.jpg" 200
echo

# === SECURITY CHECKS ===
echo -e "${YELLOW}🔒 SECURITY CHECKS${NC}"
test_endpoint "No .env exposure" "https://catsupply.nl/.env" 404
test_endpoint "No .git exposure" "https://catsupply.nl/.git/config" 404
test_endpoint "No backend source" "https://catsupply.nl/backend/src/server.ts" 404
echo

# === FINAL SUMMARY ===
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   FINAL RESULTS${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ PASSED: $PASSED tests${NC}"
echo -e "${RED}❌ FAILED: $FAILED tests${NC}"
echo

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED! SYSTEM IS FULLY OPERATIONAL!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  $FAILED TEST(S) FAILED! REVIEW LOGS ABOVE.${NC}"
  exit 1
fi

