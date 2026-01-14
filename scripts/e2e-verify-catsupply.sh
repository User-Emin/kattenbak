#!/bin/bash

# ✅ E2E VERIFICATION - CATSUPPLY.NL
# Verifies all endpoints and functionality

set -e

echo "✅ E2E VERIFICATION - CATSUPPLY.NL"
echo "=================================="
echo ""

BASE_URL="https://catsupply.nl"
LOCAL_BACKEND="http://localhost:3101"
LOCAL_FRONTEND="http://localhost:3000"
LOCAL_ADMIN="http://localhost:3002"

SCORE=0
MAX_SCORE=0
ISSUES=()

# Helper function
test_endpoint() {
  local name=$1
  local url=$2
  local expected=$3
  
  MAX_SCORE=$((MAX_SCORE + 1))
  
  echo -n "Testing $name... "
  response=$(curl -sf -w "\n%{http_code}" "$url" 2>&1 || echo "ERROR\n000")
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)
  
  if [ "$http_code" = "$expected" ] || [ "$http_code" = "200" ]; then
    echo "✅ ($http_code)"
    SCORE=$((SCORE + 1))
  else
    echo "❌ ($http_code)"
    ISSUES+=("$name: HTTP $http_code")
  fi
}

# 1. Backend Health
echo "1. BACKEND HEALTH"
echo "----------------"
test_endpoint "Backend Health (Local)" "$LOCAL_BACKEND/api/v1/health" "200"
test_endpoint "Backend Health (Production)" "$BASE_URL/api/v1/health" "200"
echo ""

# 2. Products API
echo "2. PRODUCTS API"
echo "---------------"
test_endpoint "Products List (Local)" "$LOCAL_BACKEND/api/v1/products" "200"
test_endpoint "Products List (Production)" "$BASE_URL/api/v1/products" "200"
echo ""

# 3. Frontend
echo "3. FRONTEND"
echo "-----------"
test_endpoint "Frontend Home (Local)" "$LOCAL_FRONTEND" "200"
test_endpoint "Frontend Home (Production)" "$BASE_URL" "200"
test_endpoint "Product Detail (Production)" "$BASE_URL/product/automatische-kattenbak-premium" "200"
echo ""

# 4. Admin
echo "4. ADMIN"
echo "--------"
test_endpoint "Admin Panel (Local)" "$LOCAL_ADMIN" "200"
test_endpoint "Admin Panel (Production)" "$BASE_URL/admin" "200"
echo ""

# 5. RAG System
echo "5. RAG SYSTEM"
echo "-------------"
test_endpoint "RAG Health (Local)" "$LOCAL_BACKEND/api/v1/rag/health" "200"
test_endpoint "RAG Health (Production)" "$BASE_URL/api/v1/rag/health" "200"
echo ""

# 6. Static Assets
echo "6. STATIC ASSETS"
echo "----------------"
test_endpoint "Next.js Static (Production)" "$BASE_URL/_next/static/css/app.css" "200"
echo ""

echo "=================================="
echo "SCORE: $SCORE / $MAX_SCORE"
echo "=================================="

PERCENTAGE=$((SCORE * 100 / MAX_SCORE))
echo "PERCENTAGE: ${PERCENTAGE}%"

if [ $PERCENTAGE -ge 90 ]; then
  echo "✅ EXCELLENT: All endpoints working"
elif [ $PERCENTAGE -ge 70 ]; then
  echo "⚠️  GOOD: Most endpoints working"
else
  echo "❌ NEEDS FIX: Multiple endpoints failing"
fi

echo ""
if [ ${#ISSUES[@]} -gt 0 ]; then
  echo "ISSUES FOUND:"
  for issue in "${ISSUES[@]}"; do
    echo "  - $issue"
  done
else
  echo "✅ NO ISSUES FOUND"
fi

echo ""
echo "=================================="
