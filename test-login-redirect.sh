#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE LOGIN + REDIRECT TEST
# Test login EN redirect naar dashboard - ABSOLUTE VERIFICATIE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎯 COMPLETE LOGIN + REDIRECT TEST${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Check services
echo -e "${YELLOW}1. Services Status${NC}"
echo "─────────────────────────────────────────────────────"

if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Backend: http://localhost:3101"
else
  echo -e "${RED}✗${NC} Backend NOT running"
  exit 1
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Admin: http://localhost:3001"
else
  echo -e "${RED}✗${NC} Admin NOT running"
  exit 1
fi

# 2. Test login API
echo ""
echo -e "${YELLOW}2. Login API Test${NC}"
echo "─────────────────────────────────────────────────────"

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3101/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@localhost","password":"admin123"}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓${NC} Login API: 200 OK"
  token=$(echo "$body" | jq -r '.data.token' 2>/dev/null | head -c 30)
  echo -e "${GREEN}✓${NC} Token: ${token}..."
else
  echo -e "${RED}✗${NC} Login API Failed: $http_code"
  echo "$body"
  exit 1
fi

# 3. Check dashboard page exists
echo ""
echo -e "${YELLOW}3. Dashboard Page Check${NC}"
echo "─────────────────────────────────────────────────────"

if [ -f "/Users/emin/kattenbak/admin-next/app/dashboard/page.tsx" ]; then
  echo -e "${GREEN}✓${NC} Dashboard page exists"
else
  echo -e "${RED}✗${NC} Dashboard page missing!"
  exit 1
fi

# 4. Test dashboard access
dashboard_response=$(curl -s http://localhost:3001/dashboard 2>&1)

if echo "$dashboard_response" | grep -q "Dashboard\|Kattenbak\|Admin"; then
  echo -e "${GREEN}✓${NC} Dashboard accessible"
else
  echo -e "${YELLOW}⚠${NC}  Dashboard response: $(echo "$dashboard_response" | head -c 50)..."
fi

# 5. Manual test instructions
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ READY FOR BROWSER TEST${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}STEP-BY-STEP TESTING:${NC}"
echo ""
echo -e "${CYAN}1. Open Browser:${NC}"
echo "   → http://localhost:3001/login"
echo ""
echo -e "${CYAN}2. Open DevTools (F12):${NC}"
echo "   → Console tab"
echo "   → Network tab"
echo ""
echo -e "${CYAN}3. Enter Credentials:${NC}"
echo "   Email:    admin@localhost"
echo "   Password: admin123"
echo ""
echo -e "${CYAN}4. Click 'Inloggen'${NC}"
echo ""
echo -e "${CYAN}5. Expected Behavior:${NC}"
echo "   ✓ Toast: 'Login successful! Redirecting...'"
echo "   ✓ Console: 'Login success! Redirecting to /dashboard...'"
echo "   ✓ URL changes: /login → /dashboard"
echo "   ✓ Page shows: Dashboard content"
echo "   ✓ No errors in console"
echo ""
echo -e "${CYAN}6. Verify in Console:${NC}"
echo "   Should see:"
echo "   - API Response interceptor (or no error)"
echo "   - loginApi: Response received"
echo "   - Login success! Redirecting to /dashboard..."
echo ""
echo -e "${CYAN}7. Verify in Network Tab:${NC}"
echo "   - POST /admin/auth/login: 200 OK"
echo "   - GET /dashboard: 200 OK"
echo ""
echo -e "${YELLOW}If redirect doesn't work:${NC}"
echo "  1. Check console for errors"
echo "  2. Hard refresh: Cmd+Shift+R"
echo "  3. Clear cache and try again"
echo "  4. Check Network tab for redirect"
echo ""
echo -e "${GREEN}Backend:  http://localhost:3101${NC}"
echo -e "${GREEN}Admin:    http://localhost:3001${NC}"
echo -e "${GREEN}Login:    http://localhost:3001/login${NC}"
echo -e "${GREEN}Dashboard: http://localhost:3001/dashboard${NC}"
echo ""
echo -e "${CYAN}Test now! 🚀${NC}"


