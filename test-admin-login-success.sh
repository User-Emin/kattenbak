#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ADMIN LOGIN SUCCESS TEST - Tot het werkt!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 ADMIN LOGIN SUCCESS TEST${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Check Backend
echo -e "${YELLOW}1. Backend Check...${NC}"
if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Backend running on http://localhost:3101"
else
  echo -e "${RED}✗${NC} Backend NOT running - Starting..."
  cd /Users/emin/kattenbak/backend && npm run dev > /dev/null 2>&1 &
  sleep 6
fi

# 2. Check Admin
echo ""
echo -e "${YELLOW}2. Admin Panel Check...${NC}"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Admin running on http://localhost:3001"
else
  echo -e "${RED}✗${NC} Admin NOT running - Starting..."
  cd /Users/emin/kattenbak/admin-next && npm run dev > /dev/null 2>&1 &
  sleep 8
fi

# 3. Test Login API
echo ""
echo -e "${YELLOW}3. Testing Login API...${NC}"
response=$(curl -s -X POST http://localhost:3101/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@localhost","password":"admin123"}')

echo "Response: $response"

if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Login API WORKS!"
  token=$(echo "$response" | jq -r '.data.token')
  echo -e "${GREEN}✓${NC} Token received: ${token:0:20}..."
else
  echo -e "${RED}✗${NC} Login API FAILED"
  echo "Full response: $response"
  exit 1
fi

# 4. Web Test Instructions
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ADMIN LOGIN READY!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Test in browser:${NC}"
echo "  → http://localhost:3001/login"
echo ""
echo -e "${CYAN}Credentials:${NC}"
echo "  Email:    admin@localhost"
echo "  Password: admin123"
echo ""
echo -e "${GREEN}✓ Backend:    http://localhost:3101${NC}"
echo -e "${GREEN}✓ Admin:      http://localhost:3001${NC}"
echo -e "${GREEN}✓ Login API:  WORKING!${NC}"
echo ""
echo -e "${YELLOW}Open je browser en test nu!${NC}"
