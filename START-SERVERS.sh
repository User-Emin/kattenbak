#!/bin/bash
# 🚀 START ALL SERVERS - DRY Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STARTING KATTENBAK SERVERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill existing processes
echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
pkill -f "npm run dev" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# Start Backend (Port 4000)
echo -e "${GREEN}📡 Starting Backend on port 4000...${NC}"
cd /Users/emin/kattenbak/backend
PORT=4000 npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > /tmp/backend.pid
echo "   Backend PID: $BACKEND_PID"

# Wait for backend
sleep 3

# Start Frontend (Port 3001)
echo -e "${GREEN}🎨 Starting Frontend on port 3001...${NC}"
cd /Users/emin/kattenbak/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/frontend.pid
echo "   Frontend PID: $FRONTEND_PID"

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 5

# Health checks
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend health
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend:  http://localhost:4000${NC}"
  echo "   $(curl -s http://localhost:4000/health | python3 -m json.tool 2>/dev/null | grep message)"
else
  echo "❌ Backend: NOT RESPONDING"
fi

# Frontend health
if curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Frontend: http://localhost:3001${NC}"
else
  echo "❌ Frontend: NOT RESPONDING"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 USEFUL COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Stop all:    pkill -f 'npm run dev'"
echo "Backend log: tail -f /tmp/backend.log"
echo "Frontend log: tail -f /tmp/frontend.log"
echo ""
echo "Backend PID:  $BACKEND_PID (saved to /tmp/backend.pid)"
echo "Frontend PID: $FRONTEND_PID (saved to /tmp/frontend.pid)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ ALL SERVERS STARTED!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
