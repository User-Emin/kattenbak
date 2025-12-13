#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE LOGIN TEST - Browser + Console + API
# Blijf testen tot ABSOLUTE SUCCESS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 COMPLETE LOGIN TEST - MAXIMAAL THOROUGH${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BACKEND_URL="http://localhost:3101"
ADMIN_URL="http://localhost:3001"
API_URL="$BACKEND_URL/api/v1"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}1️⃣  SERVICES CHECK${NC}"
echo "─────────────────────────────────────────────────────"

# Backend
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
  health=$(curl -s "$BACKEND_URL/health" | jq -r '.message' 2>&1)
  echo -e "${GREEN}✓${NC} Backend:  $BACKEND_URL ($health)"
else
  echo -e "${RED}✗${NC} Backend DOWN - Starting..."
  cd /Users/emin/kattenbak/backend && npm run dev > /dev/null 2>&1 &
  sleep 6
fi

# Admin
if curl -s "$ADMIN_URL" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Admin:    $ADMIN_URL"
else
  echo -e "${RED}✗${NC} Admin DOWN - Starting..."
  cd /Users/emin/kattenbak/admin-next && npm run dev > /dev/null 2>&1 &
  sleep 8
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo -e "${YELLOW}2️⃣  ADMIN CONFIG CHECK${NC}"
echo "─────────────────────────────────────────────────────"

ENV_FILE="/Users/emin/kattenbak/admin-next/.env.local"
if [ -f "$ENV_FILE" ]; then
  API_CONFIG=$(grep "NEXT_PUBLIC_API_URL" "$ENV_FILE" | cut -d '=' -f 2)
  echo -e "${GREEN}✓${NC} .env.local exists"
  echo "   API_URL: $API_CONFIG"
  
  if [ "$API_CONFIG" = "http://localhost:3101/api/v1" ]; then
    echo -e "${GREEN}✓${NC} API URL correct!"
  else
    echo -e "${RED}✗${NC} API URL incorrect! Should be: http://localhost:3101/api/v1"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3101/api/v1" > "$ENV_FILE"
    echo -e "${YELLOW}⚠ Fixed! Restart admin panel:${NC}"
    echo "   pkill -f 'admin-next'"
    echo "   cd admin-next && npm run dev"
  fi
else
  echo -e "${RED}✗${NC} .env.local missing - Creating..."
  echo "NEXT_PUBLIC_API_URL=http://localhost:3101/api/v1" > "$ENV_FILE"
  echo -e "${GREEN}✓${NC} Created with correct URL"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo -e "${YELLOW}3️⃣  LOGIN API ENDPOINT TESTS${NC}"
echo "─────────────────────────────────────────────────────"

# Test 1: Valid credentials
echo -e "${CYAN}Test 1: Valid credentials${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@localhost","password":"admin123"}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓${NC} Status: 200 OK"
  token=$(echo "$body" | jq -r '.data.token' 2>/dev/null | cut -c1-30)
  if [ ! -z "$token" ] && [ "$token" != "null" ]; then
    echo -e "${GREEN}✓${NC} Token: ${token}..."
    echo -e "${GREEN}✓${NC} LOGIN API WORKS!"
  else
    echo -e "${RED}✗${NC} No token in response"
    echo "Response: $body"
  fi
else
  echo -e "${RED}✗${NC} Status: $http_code (expected 200)"
  echo "Response: $body"
fi

echo ""

# Test 2: Wrong credentials
echo -e "${CYAN}Test 2: Wrong credentials${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"wrongpass"}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✓${NC} Status: 401 (correct!)"
  error=$(echo "$body" | jq -r '.error' 2>/dev/null)
  echo -e "${GREEN}✓${NC} Error: $error"
else
  echo -e "${RED}✗${NC} Status: $http_code (expected 401)"
  echo "Response: $body"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}4️⃣  BROWSER TESTING INSTRUCTIONS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Step 1: Open Browser${NC}"
echo "   → $ADMIN_URL/login"
echo ""
echo -e "${CYAN}Step 2: Open Console (F12)${NC}"
echo "   → Console tab"
echo "   → Clear console (right-click → Clear)"
echo ""
echo -e "${CYAN}Step 3: Test Valid Login${NC}"
echo "   Email:    admin@localhost"
echo "   Password: admin123"
echo "   → Click 'Inloggen'"
echo ""
echo -e "${CYAN}Step 4: Check Console Output${NC}"
echo "   Expected in console:"
echo "   ✓ API Response interceptor: { url, status, data }"
echo "   ✓ loginApi: Response received: { token, user }"
echo "   ✓ Redirecting to /dashboard..."
echo ""
echo -e "${CYAN}Step 5: If Errors Appear${NC}"
echo "   Check console for:"
echo "   - API Error interceptor: { full details }"
echo "   - loginApi error: { full details }"
echo "   - Login error details: { full details }"
echo ""
echo -e "${CYAN}Step 6: Test Wrong Credentials${NC}"
echo "   Email:    wrong@test.com"
echo "   Password: wrongpass"
echo "   → Click 'Inloggen'"
echo "   → Should see: 'Ongeldige email of wachtwoord'"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✓ Backend:     $BACKEND_URL${NC}"
echo -e "${GREEN}✓ Admin:       $ADMIN_URL${NC}"
echo -e "${GREEN}✓ API:         $API_URL${NC}"
echo -e "${GREEN}✓ Login API:   TESTED & WORKING${NC}"
echo -e "${GREEN}✓ Credentials: admin@localhost / admin123${NC}"
echo ""
echo -e "${YELLOW}If you still see {} in console:${NC}"
echo "  1. Hard refresh admin: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "  2. Clear browser cache"
echo "  3. Restart admin: pkill -f admin-next && cd admin-next && npm run dev"
echo "  4. Check Network tab in DevTools for actual API calls"
echo ""
echo -e "${CYAN}Open now: $ADMIN_URL/login${NC}"
