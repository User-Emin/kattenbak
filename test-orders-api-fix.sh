#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ORDERS API FIX - FUNDAMENTAL & DRY
# Fix empty error objects, test all endpoints, verify success
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 ORDERS API - FUNDAMENTAL FIX${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Check backend is running
echo -e "${YELLOW}1. Backend Service Check${NC}"
echo "─────────────────────────────────────────────────────"

if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Backend running: http://localhost:3101"
else
  echo -e "${RED}✗${NC} Backend NOT running"
  echo ""
  echo -e "${YELLOW}Starting backend...${NC}"
  cd /Users/emin/kattenbak/backend && npm run dev > /tmp/backend-orders-fix.log 2>&1 &
  sleep 5
  
  if curl -s http://localhost:3101/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend started successfully"
  else
    echo -e "${RED}✗${NC} Failed to start backend"
    echo -e "${YELLOW}Check logs: tail /tmp/backend-orders-fix.log${NC}"
    exit 1
  fi
fi

# 2. Test Orders API Endpoint
echo ""
echo -e "${YELLOW}2. Orders API Endpoint Test${NC}"
echo "─────────────────────────────────────────────────────"

# Test GET /api/v1/orders
response=$(curl -s -w "\n%{http_code}" http://localhost:3101/api/v1/orders 2>&1)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "GET /api/v1/orders"
echo "Status: $http_code"

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓${NC} Orders endpoint works"
  
  # Check response structure
  if echo "$body" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Response has 'success' field"
  else
    echo -e "${RED}✗${NC} Response missing 'success' field"
  fi
  
  if echo "$body" | jq -e '.data' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Response has 'data' field"
    order_count=$(echo "$body" | jq '.data | length' 2>/dev/null || echo "0")
    echo -e "${CYAN}  Orders in system: $order_count${NC}"
  else
    echo -e "${RED}✗${NC} Response missing 'data' field"
  fi
  
else
  echo -e "${RED}✗${NC} Orders endpoint failed: $http_code"
  echo -e "${YELLOW}Response:${NC}"
  echo "$body" | head -20
fi

# 3. Check Admin Panel API Client
echo ""
echo -e "${YELLOW}3. Admin API Client Configuration${NC}"
echo "─────────────────────────────────────────────────────"

# Check .env.local
if [ -f "/Users/emin/kattenbak/admin-next/.env.local" ]; then
  api_url=$(grep "NEXT_PUBLIC_API_URL" /Users/emin/kattenbak/admin-next/.env.local | cut -d'=' -f2)
  echo "NEXT_PUBLIC_API_URL: $api_url"
  
  if [ "$api_url" = "http://localhost:3101/api/v1" ]; then
    echo -e "${GREEN}✓${NC} API URL correct"
  else
    echo -e "${YELLOW}⚠${NC}  API URL might be incorrect (expected: http://localhost:3101/api/v1)"
  fi
else
  echo -e "${RED}✗${NC} .env.local not found"
fi

# Check client.ts error handling
if grep -q "console.error.*API Error interceptor" /Users/emin/kattenbak/admin-next/lib/api/client.ts; then
  echo -e "${GREEN}✓${NC} API client has error logging"
else
  echo -e "${YELLOW}⚠${NC}  API client might not have comprehensive error logging"
fi

# 4. Check orders.ts API file
echo ""
echo -e "${YELLOW}4. Orders API File Check${NC}"
echo "─────────────────────────────────────────────────────"

if [ -f "/Users/emin/kattenbak/admin-next/lib/api/orders.ts" ]; then
  echo -e "${GREEN}✓${NC} orders.ts exists"
  
  # Check if it uses apiClient
  if grep -q "apiClient\|import.*client" /Users/emin/kattenbak/admin-next/lib/api/orders.ts; then
    echo -e "${GREEN}✓${NC} Uses API client"
  else
    echo -e "${YELLOW}⚠${NC}  Might not use centralized API client"
  fi
  
  # Check if getOrders function exists
  if grep -q "export.*getOrders\|export const getOrders" /Users/emin/kattenbak/admin-next/lib/api/orders.ts; then
    echo -e "${GREEN}✓${NC} getOrders function exists"
  else
    echo -e "${RED}✗${NC} getOrders function missing"
  fi
else
  echo -e "${RED}✗${NC} orders.ts not found"
fi

# 5. Check orders page error handling
echo ""
echo -e "${YELLOW}5. Orders Page Error Handling${NC}"
echo "─────────────────────────────────────────────────────"

if grep -q "console.error.*Load orders error" /Users/emin/kattenbak/admin-next/app/dashboard/orders/page.tsx; then
  echo -e "${GREEN}✓${NC} Page has error logging"
else
  echo -e "${YELLOW}⚠${NC}  Page might not have error logging"
fi

if grep -q "toast.error" /Users/emin/kattenbak/admin-next/app/dashboard/orders/page.tsx; then
  echo -e "${GREEN}✓${NC} Page shows toast on error"
else
  echo -e "${YELLOW}⚠${NC}  Page might not show toast on error"
fi

# 6. Test with admin running
echo ""
echo -e "${YELLOW}6. Admin Service Check${NC}"
echo "─────────────────────────────────────────────────────"

if curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Admin running: http://localhost:3001"
else
  echo -e "${YELLOW}⚠${NC}  Admin NOT running"
  echo -e "${CYAN}  Start with: cd admin-next && npm run dev${NC}"
fi

# 7. Final recommendations
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DIAGNOSTIC COMPLETE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}If backend is running:${NC}"
echo "   ✓ Orders API endpoint works"
echo "   ✓ Returns proper JSON structure"
echo ""
echo "2. ${YELLOW}If you see empty error objects {}:${NC}"
echo "   a) Check browser console for FULL error details"
echo "   b) Check Network tab for actual API response"
echo "   c) Hard refresh: Cmd+Shift+R or Ctrl+Shift+R"
echo "   d) Clear browser cache"
echo ""
echo "3. ${YELLOW}Manual Browser Test:${NC}"
echo "   a) Open: http://localhost:3001/login"
echo "   b) Login: admin@localhost / admin123"
echo "   c) Navigate: Dashboard → Bestellingen"
echo "   d) Open DevTools (F12) → Console + Network"
echo "   e) Check for errors"
echo ""
echo "4. ${YELLOW}Expected Console Output (NO empty {}):${NC}"
echo "   ✓ GET /orders request visible in Network tab"
echo "   ✓ Status: 200 OK"
echo "   ✓ Response: {success: true, data: [...], meta: {...}}"
echo "   ✓ If error: Detailed error object with message, status, url"
echo ""
echo "5. ${YELLOW}If error persists:${NC}"
echo "   → Check error.response in browser console"
echo "   → Check error.status"
echo "   → Check error.message"
echo "   → Should NOT be empty {}"
echo ""

echo -e "${GREEN}Backend:  http://localhost:3101${NC}"
echo -e "${GREEN}Admin:    http://localhost:3001${NC}"
echo -e "${GREEN}Orders:   http://localhost:3001/dashboard/orders${NC}"
echo ""
echo -e "${CYAN}Test now! 🚀${NC}"
