#!/bin/bash

# 🚀 KATTENBAK TEST AUTOMATION - ROBUUST & UITVOERBAAR
# Gebruik: bash test-automation.sh
# Test alle services, APIs, en endpoints

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Test result function
test_result() {
    local name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "0" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $name"
        [ -n "$details" ] && echo "   $details"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $name"
        [ -n "$details" ] && echo "   $details"
        ((FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 KATTENBAK TEST AUTOMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. PORT AVAILABILITY TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}📡 PORT AVAILABILITY TESTS${NC}"
echo ""

# Frontend Port
if lsof -i:3102 2>/dev/null | grep -q LISTEN; then
    test_result "Frontend Port :3102" 0 "Process running"
else
    test_result "Frontend Port :3102" 1 "No process listening"
fi

# Backend Port
if lsof -i:4000 2>/dev/null | grep -q LISTEN; then
    test_result "Backend Port :4000" 0 "Process running"
else
    test_result "Backend Port :4000" 1 "No process listening"
fi

# Admin Port
if lsof -i:3001 2>/dev/null | grep -q LISTEN; then
    test_result "Admin Port :3001" 0 "Process running"
else
    test_result "Admin Port :3001" 1 "No process listening"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. HTTP RESPONSE TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}🌐 HTTP RESPONSE TESTS${NC}"
echo ""

# Frontend Homepage
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3102 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    test_result "Frontend Homepage" 0 "HTTP $HTTP_CODE"
else
    test_result "Frontend Homepage" 1 "HTTP $HTTP_CODE (expected 200)"
fi

# Frontend Retourneren
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3102/retourneren 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    test_result "Frontend /retourneren" 0 "HTTP $HTTP_CODE"
else
    test_result "Frontend /retourneren" 1 "HTTP $HTTP_CODE (expected 200)"
fi

# Admin (may redirect)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "303" ]; then
    test_result "Admin Panel" 0 "HTTP $HTTP_CODE (OK or redirect)"
else
    test_result "Admin Panel" 1 "HTTP $HTTP_CODE"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. API ENDPOINT TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}🔌 API ENDPOINT TESTS${NC}"
echo ""

# Backend Health
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "403" ]; then
    test_result "Backend /health" 0 "HTTP $HTTP_CODE"
else
    test_result "Backend /health" 1 "HTTP $HTTP_CODE"
fi

# Products API
RESPONSE=$(curl -s http://localhost:4000/api/v1/products 2>/dev/null)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/products 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] && echo "$RESPONSE" | grep -q "success"; then
    COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')
    test_result "Backend /api/v1/products" 0 "HTTP $HTTP_CODE ($COUNT products)"
else
    test_result "Backend /api/v1/products" 1 "HTTP $HTTP_CODE or invalid JSON"
fi

# Settings API
RESPONSE=$(curl -s http://localhost:4000/api/v1/admin/settings 2>/dev/null)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/admin/settings 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] && echo "$RESPONSE" | grep -q "success"; then
    test_result "Backend /api/v1/admin/settings" 0 "HTTP $HTTP_CODE"
else
    test_result "Backend /api/v1/admin/settings" 1 "HTTP $HTTP_CODE or invalid JSON"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. RESPONSE TIME TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}⏱️  RESPONSE TIME TESTS${NC}"
echo ""

# Frontend response time
TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3102 2>/dev/null || echo "999")
if (( $(echo "$TIME < 2.0" | bc -l) )); then
    test_result "Frontend Response Time" 0 "${TIME}s (< 2s)"
else
    test_result "Frontend Response Time" 1 "${TIME}s (> 2s)"
fi

# Backend response time
TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:4000/api/v1/products 2>/dev/null || echo "999")
if (( $(echo "$TIME < 1.0" | bc -l) )); then
    test_result "Backend API Response Time" 0 "${TIME}s (< 1s)"
else
    test_result "Backend API Response Time" 1 "${TIME}s (> 1s)"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. CONTENT VALIDATION TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}📄 CONTENT VALIDATION TESTS${NC}"
echo ""

# Homepage contains expected text
RESPONSE=$(curl -s http://localhost:3102 2>/dev/null)
if echo "$RESPONSE" | grep -q "Kattenbak"; then
    test_result "Homepage Contains Brand Name" 0 "'Kattenbak' found"
else
    test_result "Homepage Contains Brand Name" 1 "'Kattenbak' not found"
fi

# API returns valid JSON
RESPONSE=$(curl -s http://localhost:4000/api/v1/products 2>/dev/null)
if echo "$RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
    test_result "API Returns Valid JSON" 0 "JSON parseable"
else
    test_result "API Returns Valid JSON" 1 "Invalid JSON"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$(echo "scale=1; ($PASSED * 100) / $TOTAL" | bc)
echo -e "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi



