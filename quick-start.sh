#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# QUICK START - All Services in één commando
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 STARTING ALL SERVICES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Kill existing
echo "🧹 Cleaning up..."
lsof -ti:3001,3101,3102 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Start services
echo "🚀 Starting backend..."
cd /Users/emin/kattenbak/backend && npm run dev > /dev/null 2>&1 &

echo "🚀 Starting frontend..."
cd /Users/emin/kattenbak/frontend && npm run dev > /dev/null 2>&1 &

echo "🚀 Starting admin..."
cd /Users/emin/kattenbak/admin-next && npm run dev > /dev/null 2>&1 &

echo ""
echo "⏳ Services starting... (10 seconds)"
sleep 10

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SERVICES READY!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📍 ADMIN PANEL (Video veld toevoegen):${NC}"
echo "   http://localhost:3001/dashboard/products"
echo ""
echo -e "${CYAN}📍 FRONTEND (Video bekijken):${NC}"
echo "   http://localhost:3102/product/automatische-kattenbak-premium"
echo ""
echo -e "${CYAN}📍 BACKEND API:${NC}"
echo "   http://localhost:3101/api/v1/products/featured"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎥 VIDEO VELD LOCATIE:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Open: http://localhost:3001/dashboard/products"
echo "2. Klik product → Scroll naar 'Afbeeldingen'"
echo "3. Vind: 'Demo Video URL (Optioneel)' ← HIER!"
echo "4. Plak: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
echo "5. Zie: ✅ Validatie"
echo "6. Klik: 'Opslaan'"
echo "7. Check: http://localhost:3102/product/automatische-kattenbak-premium"
echo "8. Scroll: 'Over dit product' → Video daar!"
echo ""
echo -e "${GREEN}✨ All services running! Open je browser!${NC}"
