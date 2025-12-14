#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VIDEO UPLOAD + CHAT ADMIN - COMPLETE IMPLEMENTATION TEST
# Maximaal DRY, dynamisch, maintainable
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📹 VIDEO UPLOAD + CHAT ADMIN - VERIFICATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Database Schema Check
echo -e "${YELLOW}1. Database Schema${NC}"
echo "─────────────────────────────────────────────────────"

if grep -q "model ContactMessage" /Users/emin/kattenbak/backend/prisma/schema.prisma; then
  echo -e "${GREEN}✓${NC} ContactMessage model in schema"
else
  echo -e "${RED}✗${NC} ContactMessage model missing"
fi

if grep -q "videoUrl.*String" /Users/emin/kattenbak/backend/prisma/schema.prisma; then
  echo -e "${GREEN}✓${NC} Product videoUrl field"
else
  echo -e "${RED}✗${NC} Product videoUrl field missing"
fi

# 2. Backend Routes Check
echo ""
echo -e "${YELLOW}2. Backend Routes${NC}"
echo "─────────────────────────────────────────────────────"

if grep -q "prisma.contactMessage" /Users/emin/kattenbak/backend/src/routes/contact.routes.ts; then
  echo -e "${GREEN}✓${NC} Contact routes use database (not in-memory)"
else
  echo -e "${RED}✗${NC} Contact routes still using in-memory storage"
fi

if [ -f "/Users/emin/kattenbak/backend/prisma/migrations/add_contact_messages/migration.sql" ]; then
  echo -e "${GREEN}✓${NC} Migration file created"
else
  echo -e "${YELLOW}⚠${NC}  Migration file not found"
fi

# 3. Admin Panel Check
echo ""
echo -e "${YELLOW}3. Admin Panel - Messages${NC}"
echo "─────────────────────────────────────────────────────"

if [ -f "/Users/emin/kattenbak/admin-next/app/dashboard/messages/page.tsx" ]; then
  echo -e "${GREEN}✓${NC} Messages page exists"
else
  echo -e "${RED}✗${NC} Messages page missing"
fi

if grep -q "apiClient.get.*contact" /Users/emin/kattenbak/admin-next/app/dashboard/messages/page.tsx; then
  echo -e "${GREEN}✓${NC} Messages page fetches from API"
else
  echo -e "${RED}✗${NC} Messages page not using API"
fi

# 4. Video Components Check
echo ""
echo -e "${YELLOW}4. Video Components (DRY)${NC}"
echo "─────────────────────────────────────────────────────"

if [ -f "/Users/emin/kattenbak/frontend/components/ui/product-video.tsx" ]; then
  echo -e "${GREEN}✓${NC} ProductVideo component exists"
else
  echo -e "${RED}✗${NC} ProductVideo component missing"
fi

# Check home page uses ProductVideo
if grep -q "ProductVideo" /Users/emin/kattenbak/frontend/app/page.tsx; then
  echo -e "${GREEN}✓${NC} Homepage uses ProductVideo"
else
  echo -e "${RED}✗${NC} Homepage not using ProductVideo"
fi

# Check product detail uses ProductVideo
if grep -q "ProductVideo" /Users/emin/kattenbak/frontend/components/products/product-detail.tsx; then
  echo -e "${GREEN}✓${NC} Product detail uses ProductVideo"
else
  echo -e "${RED}✗${NC} Product detail not using ProductVideo"
fi

# 5. Services Status
echo ""
echo -e "${YELLOW}5. Services Status${NC}"
echo "─────────────────────────────────────────────────────"

if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Backend: http://localhost:3101"
else
  echo -e "${RED}✗${NC} Backend NOT running"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Frontend: http://localhost:3000"
else
  echo -e "${RED}✗${NC} Frontend NOT running"
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Admin: http://localhost:3001"
else
  echo -e "${RED}✗${NC} Admin NOT running"
fi

# 6. API Test
echo ""
echo -e "${YELLOW}6. API Endpoints Test${NC}"
echo "─────────────────────────────────────────────────────"

# Test GET /contact (requires backend running)
if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  response=$(curl -s http://localhost:3101/api/v1/contact 2>&1)
  if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓${NC} GET /api/v1/contact works"
  else
    echo -e "${YELLOW}⚠${NC}  GET /api/v1/contact returns: $(echo $response | head -c 50)"
  fi
else
  echo -e "${YELLOW}⚠${NC}  Backend not running, skipping API tests"
fi

# 7. Test Instructions
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ READY FOR MANUAL TESTING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}TEST 1: Chat Berichten in Admin${NC}"
echo "─────────────────────────────────────────────────────"
echo "1. Open: http://localhost:3001/login"
echo "2. Login: admin@localhost / admin123"
echo "3. Navigeer naar 'Berichten' in sidebar"
echo "4. Verwacht:"
echo "   ✓ Overzicht van alle chat berichten"
echo "   ✓ Status badges (Nieuw, Gelezen, Beantwoord)"
echo "   ✓ Click op bericht toont details"
echo "   ✓ Kan status updaten"
echo ""

echo -e "${CYAN}TEST 2: Video op Homepage${NC}"
echo "─────────────────────────────────────────────────────"
echo "1. Open: http://localhost:3000"
echo "2. Verwacht:"
echo "   ✓ Als featured product videoUrl heeft → video in hero"
echo "   ✓ Play button zichtbaar"
echo "   ✓ Click speelt video af"
echo "   ✓ Responsive (mobiel + desktop)"
echo ""

echo -e "${CYAN}TEST 3: Video op Product Detail${NC}"
echo "─────────────────────────────────────────────────────"
echo "1. Open: http://localhost:3000/product/[slug]"
echo "2. Scroll naar 'Over dit product' sectie"
echo "3. Verwacht:"
echo "   ✓ Video direct onder titel (niet bij afbeeldingen!)"
echo "   ✓ Zelfde ProductVideo component als homepage"
echo "   ✓ DRY: 1 video source, 2 weergave plekken"
echo ""

echo -e "${CYAN}TEST 4: Chat Functionaliteit${NC}"
echo "─────────────────────────────────────────────────────"
echo "1. Open: http://localhost:3000"
echo "2. Click chat icon (bottom right)"
echo "3. Fill form + submit"
echo "4. Check admin panel berichten"
echo "5. Verwacht:"
echo "   ✓ Bericht verschijnt direct in admin"
echo "   ✓ Status = 'new'"
echo "   ✓ Email, message, orderNumber visible"
echo "   ✓ hCaptcha verified"
echo ""

echo -e "${YELLOW}Database Migration Needed:${NC}"
echo "1. Ensure PostgreSQL is running"
echo "2. Run: cd backend && npx prisma migrate deploy"
echo "3. Or restart backend (auto-migration if configured)"
echo ""

echo -e "${GREEN}Services:${NC}"
echo "Backend:  http://localhost:3101"
echo "Frontend: http://localhost:3000"
echo "Admin:    http://localhost:3001"
echo ""

echo -e "${CYAN}Test now! 🚀${NC}"


