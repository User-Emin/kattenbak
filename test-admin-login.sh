#!/bin/bash
# 🧪 ADMIN LOGIN FLOW TEST - MAXIMAAL DIEP & EXPLICIET
# Dit test de VOLLEDIGE login flow inclusief redirect

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 ADMIN LOGIN FLOW TEST - DIEP & EXPLICIET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

test_result() {
  local name="$1"
  local result=$2
  local details="$3"
  
  if [ $result -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC} $name ${details:+- $details}"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC} $name ${details:+- $details}"
    ((FAILED++))
  fi
}

echo "1️⃣ SERVICE AVAILABILITY TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend
if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
  test_result "Backend :4000" 0 "Reachable"
else
  test_result "Backend :4000" 1 "NOT reachable"
  exit 1
fi

# Admin
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "303" ]; then
  test_result "Admin :3001" 0 "HTTP $HTTP_CODE"
else
  test_result "Admin :3001" 1 "HTTP $HTTP_CODE"
  exit 1
fi

echo ""
echo "2️⃣ BACKEND LOGIN API TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test login endpoint
RESPONSE=$(curl -s -X POST http://localhost:4000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001" \
  -d '{"email":"admin@localhost","password":"admin123"}' 2>/dev/null)

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001" \
  -d '{"email":"admin@localhost","password":"admin123"}' 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
  test_result "Login HTTP Status" 0 "200 OK"
else
  test_result "Login HTTP Status" 1 "HTTP $HTTP_CODE (expected 200)"
  exit 1
fi

# Check response structure
if echo "$RESPONSE" | grep -q "\"success\":true"; then
  test_result "Response has success:true" 0
else
  test_result "Response has success:true" 1 "Missing success field"
fi

if echo "$RESPONSE" | grep -q "\"token\""; then
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  test_result "Response has token" 0 "Length: ${#TOKEN}"
else
  test_result "Response has token" 1 "Missing token"
  exit 1
fi

if echo "$RESPONSE" | grep -q "\"user\""; then
  test_result "Response has user object" 0
else
  test_result "Response has user object" 1 "Missing user"
  exit 1
fi

if echo "$RESPONSE" | grep -q "\"email\":\"admin@localhost\""; then
  test_result "User email correct" 0 "admin@localhost"
else
  test_result "User email correct" 1
fi

if echo "$RESPONSE" | grep -q "\"role\":\"ADMIN\""; then
  test_result "User role correct" 0 "ADMIN"
else
  test_result "User role correct" 1
fi

echo ""
echo "3️⃣ CORS HEADERS TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CORS_RESPONSE=$(curl -s -v -X POST http://localhost:4000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001" \
  -d '{"email":"admin@localhost","password":"admin123"}' 2>&1)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
  ORIGIN=$(echo "$CORS_RESPONSE" | grep "Access-Control-Allow-Origin" | head -1)
  test_result "CORS Allow-Origin header" 0 "$ORIGIN"
else
  test_result "CORS Allow-Origin header" 1 "Header missing"
fi

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Credentials"; then
  test_result "CORS Allow-Credentials header" 0
else
  test_result "CORS Allow-Credentials header" 1 "Header missing"
fi

echo ""
echo "4️⃣ JWT TOKEN VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Token structure (should have 3 parts separated by dots)
TOKEN_PARTS=$(echo "$TOKEN" | tr '.' '\n' | wc -l | tr -d ' ')
if [ "$TOKEN_PARTS" = "3" ]; then
  test_result "JWT token structure" 0 "3 parts (header.payload.signature)"
else
  test_result "JWT token structure" 1 "Expected 3 parts, got $TOKEN_PARTS"
fi

# Token length (should be reasonable)
if [ ${#TOKEN} -gt 100 ]; then
  test_result "JWT token length" 0 "${#TOKEN} characters"
else
  test_result "JWT token length" 1 "Too short: ${#TOKEN} characters"
fi

echo ""
echo "5️⃣ PROTECTED ROUTE TEST (with token)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test protected endpoint with token
PROTECTED_RESPONSE=$(curl -s -X GET http://localhost:4000/api/v1/admin/settings \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:4000/api/v1/admin/settings \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
  test_result "Protected endpoint with token" 0 "HTTP 200"
else
  test_result "Protected endpoint with token" 1 "HTTP $HTTP_CODE (expected 200)"
fi

# Test protected endpoint WITHOUT token
HTTP_CODE_NO_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:4000/api/v1/admin/settings 2>/dev/null)

if [ "$HTTP_CODE_NO_TOKEN" = "401" ] || [ "$HTTP_CODE_NO_TOKEN" = "403" ]; then
  test_result "Protected endpoint without token" 0 "HTTP $HTTP_CODE_NO_TOKEN (correctly rejected)"
else
  test_result "Protected endpoint without token" 1 "HTTP $HTTP_CODE_NO_TOKEN (expected 401/403)"
fi

echo ""
echo "6️⃣ ADMIN PAGE TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test login page loads
LOGIN_PAGE=$(curl -s http://localhost:3001/login 2>/dev/null)
if echo "$LOGIN_PAGE" | grep -q "login\|Login\|Inloggen"; then
  test_result "Login page content" 0 "Contains login form"
else
  test_result "Login page content" 1 "Missing login form"
fi

# Test dashboard redirects to login (without cookie)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/dashboard 2>/dev/null)
if [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "303" ] || [ "$HTTP_CODE" = "302" ]; then
  test_result "Dashboard redirect (no auth)" 0 "HTTP $HTTP_CODE (redirects)"
else
  test_result "Dashboard redirect (no auth)" 1 "HTTP $HTTP_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Success Rate: $PERCENTAGE% ($PASSED/$TOTAL)"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}🎉 ALL TESTS PASSED - LOGIN FLOW WERKEND!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "✅ Backend API operational"
  echo "✅ CORS configured correctly"
  echo "✅ JWT tokens working"
  echo "✅ Protected routes secured"
  echo "✅ Admin pages loading"
  echo ""
  echo "🎯 NEXT: Test in browser met console open!"
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi



