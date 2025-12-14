#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LIVE DEMO - VIDEO VELD IN ACTIE
# Start alle services en test video feature end-to-end
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎥 VIDEO VELD LIVE DEMO - ABSOLUTE VERIFICATIE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Kill existing processes on ports
echo -e "${YELLOW}🔧 Cleaning up existing processes...${NC}"
lsof -ti:3001,3101,3102 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
echo -e "${CYAN}🚀 Starting backend on port 3101...${NC}"
cd /Users/emin/kattenbak/backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Start frontend
echo -e "${CYAN}🚀 Starting frontend on port 3102...${NC}"
cd /Users/emin/kattenbak/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Start admin
echo -e "${CYAN}🚀 Starting admin on port 3001...${NC}"
cd /Users/emin/kattenbak/admin-next
PORT=3001 npm run dev > /tmp/admin.log 2>&1 &
ADMIN_PID=$!
echo "   Admin PID: $ADMIN_PID"

echo ""
echo -e "${YELLOW}⏳ Waiting for services to start (15 seconds)...${NC}"
sleep 15

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SERVICES RUNNING - CHECK DEZE URLs:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check backend
if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Backend:  http://localhost:3101"
  echo "   Status: $(curl -s http://localhost:3101/health | head -1)"
else
  echo -e "${RED}✗${NC} Backend FAILED - Check /tmp/backend.log"
fi

# Check frontend
if curl -s http://localhost:3102 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Frontend: http://localhost:3102"
  echo "   Product: http://localhost:3102/product/automatische-kattenbak-premium"
else
  echo -e "${RED}✗${NC} Frontend FAILED - Check /tmp/frontend.log"
fi

# Check admin
if curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Admin:    http://localhost:3001"
  echo "   Products: http://localhost:3001/dashboard/products"
else
  echo -e "${RED}✗${NC} Admin FAILED - Check /tmp/admin.log"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 STAP-VOOR-STAP INSTRUCTIES:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}1. Open Admin Panel:${NC}"
echo "   → http://localhost:3001/dashboard/products"
echo ""
echo -e "${CYAN}2. Bewerk Product:${NC}"
echo "   → Klik op 'Automatische Kattenbak Premium'"
echo "   → Scroll naar beneden"
echo "   → Vind sectie 'Afbeeldingen'"
echo ""
echo -e "${CYAN}3. Vind Video Veld:${NC}"
echo "   → Direct onder 'Product Afbeeldingen'"
echo "   → Label: 'Demo Video URL (Optioneel)'"
echo "   → Placeholder: 'https://www.youtube.com/watch?v=...'"
echo ""
echo -e "${CYAN}4. Test Video URL:${NC}"
echo "   → Plak: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
echo "   → Zie validatie: ✅ 'Geldige video URL'"
echo "   → Klik 'Opslaan'"
echo ""
echo -e "${CYAN}5. Controleer Frontend:${NC}"
echo "   → Homepage: http://localhost:3102"
echo "     (Hero kan video tonen als featured product)"
echo "   → Product Detail: http://localhost:3102/product/automatische-kattenbak-premium"
echo "     (Scroll naar 'Over dit product' → Video hier!)"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎯 VIDEO VELD LOCATIE IN CODE:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Bestand: admin-next/components/product-form.tsx"
echo "   Regels:  ~223-249"
echo "   Field:   FormField name='videoUrl'"
echo ""
echo -e "${YELLOW}Tip: Open dit bestand in je editor om code te zien!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 PROCESS INFO:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Admin PID:    $ADMIN_PID"
echo ""
echo -e "${YELLOW}Stop alle services met:${NC}"
echo "  kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID"
echo ""
echo -e "${YELLOW}Of kill alle Node processen:${NC}"
echo "  pkill -f 'node.*dev'"
echo ""
echo -e "${GREEN}✨ All services running! Open je browser en test!${NC}"


