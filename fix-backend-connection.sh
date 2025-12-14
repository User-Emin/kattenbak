#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BACKEND CONNECTION FIX - FUNDAMENTEEL
# Fix ERR_CONNECTION_REFUSED, start backend, test alle URLs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔧 BACKEND CONNECTION FIX${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Check PostgreSQL
echo -e "${YELLOW}1. PostgreSQL Check${NC}"
echo "─────────────────────────────────────────────────────"

if pg_isready > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} PostgreSQL is running"
else
  echo -e "${RED}✗${NC} PostgreSQL NOT running"
  echo ""
  echo -e "${CYAN}Starting PostgreSQL...${NC}"
  
  # Try to start PostgreSQL
  if command -v brew > /dev/null 2>&1; then
    brew services start postgresql@14 > /dev/null 2>&1
    sleep 3
    
    if pg_isready > /dev/null 2>&1; then
      echo -e "${GREEN}✓${NC} PostgreSQL started"
    else
      echo -e "${RED}✗${NC} Failed to start PostgreSQL"
      echo -e "${YELLOW}Manual start: brew services start postgresql@14${NC}"
    fi
  else
    echo -e "${YELLOW}Install PostgreSQL: brew install postgresql@14${NC}"
    echo -e "${YELLOW}Or start manually if already installed${NC}"
  fi
fi

# 2. Kill old backend processes
echo ""
echo -e "${YELLOW}2. Cleanup Old Processes${NC}"
echo "─────────────────────────────────────────────────────"

# Kill processes on port 3101
if lsof -ti:3101 > /dev/null 2>&1; then
  echo -e "${YELLOW}Killing processes on port 3101...${NC}"
  lsof -ti:3101 | xargs kill -9 2>/dev/null
  sleep 1
  echo -e "${GREEN}✓${NC} Port 3101 cleared"
else
  echo -e "${GREEN}✓${NC} Port 3101 already free"
fi

# Kill old npm/node processes from backend
old_procs=$(ps aux | grep -E "node.*backend|npm.*dev.*backend" | grep -v grep | wc -l | tr -d ' ')
if [ "$old_procs" -gt 0 ]; then
  echo -e "${YELLOW}Killing $old_procs old backend processes...${NC}"
  pkill -f "node.*backend" 2>/dev/null
  pkill -f "tsx.*backend" 2>/dev/null
  sleep 2
  echo -e "${GREEN}✓${NC} Old processes killed"
else
  echo -e "${GREEN}✓${NC} No old processes to kill"
fi

# 3. Start Backend
echo ""
echo -e "${YELLOW}3. Starting Backend${NC}"
echo "─────────────────────────────────────────────────────"

cd /Users/emin/kattenbak/backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install > /dev/null 2>&1
fi

# Start backend
echo -e "${CYAN}Starting backend on port 3101...${NC}"
npm run dev > /tmp/backend-connection-fix.log 2>&1 &
BACKEND_PID=$!

# Wait and check
for i in {1..10}; do
  sleep 1
  if curl -s http://localhost:3101/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend started successfully!"
    break
  fi
  echo -n "."
done
echo ""

# 4. Test Backend Health
echo ""
echo -e "${YELLOW}4. Backend Health Check${NC}"
echo "─────────────────────────────────────────────────────"

if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Backend responding: http://localhost:3101"
  
  health=$(curl -s http://localhost:3101/health 2>&1)
  if echo "$health" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} Health check passed"
  fi
else
  echo -e "${RED}✗${NC} Backend NOT responding"
  echo ""
  echo -e "${YELLOW}Checking logs:${NC}"
  tail -30 /tmp/backend-connection-fix.log
  echo ""
  echo -e "${RED}Backend failed to start. Common issues:${NC}"
  echo "  1. PostgreSQL not running"
  echo "  2. Database connection error"
  echo "  3. Port 3101 still in use"
  echo "  4. Node modules missing"
  exit 1
fi

# 5. Test All Critical Endpoints
echo ""
echo -e "${YELLOW}5. Testing Critical API Endpoints${NC}"
echo "─────────────────────────────────────────────────────"

# Test /products/featured
echo -n "GET /api/v1/products/featured ... "
response=$(curl -s -w "\n%{http_code}" http://localhost:3101/api/v1/products/featured 2>&1)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $http_code${NC}"
fi

# Test /products
echo -n "GET /api/v1/products ... "
response=$(curl -s -w "\n%{http_code}" http://localhost:3101/api/v1/products 2>&1)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $http_code${NC}"
fi

# Test /orders
echo -n "GET /api/v1/orders ... "
response=$(curl -s -w "\n%{http_code}" http://localhost:3101/api/v1/orders 2>&1)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $http_code${NC}"
fi

# Test /contact
echo -n "GET /api/v1/contact ... "
response=$(curl -s -w "\n%{http_code}" http://localhost:3101/api/v1/contact 2>&1)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $http_code${NC}"
fi

# 6. Check Frontend Config
echo ""
echo -e "${YELLOW}6. Frontend Configuration${NC}"
echo "─────────────────────────────────────────────────────"

# Check frontend .env.local
if [ -f "/Users/emin/kattenbak/frontend/.env.local" ]; then
  api_url=$(grep "NEXT_PUBLIC_API_URL" /Users/emin/kattenbak/frontend/.env.local 2>/dev/null | cut -d'=' -f2)
  if [ -n "$api_url" ]; then
    echo "NEXT_PUBLIC_API_URL: $api_url"
    if [ "$api_url" = "http://localhost:3101/api/v1" ]; then
      echo -e "${GREEN}✓${NC} Frontend API URL correct"
    else
      echo -e "${YELLOW}⚠${NC}  Frontend API URL might be incorrect"
      echo -e "${CYAN}  Expected: http://localhost:3101/api/v1${NC}"
    fi
  else
    echo -e "${YELLOW}⚠${NC}  NEXT_PUBLIC_API_URL not set in .env.local"
    echo -e "${CYAN}  Will use default: http://localhost:3101/api/v1${NC}"
  fi
else
  echo -e "${YELLOW}⚠${NC}  Frontend .env.local not found"
  echo -e "${CYAN}  Create: frontend/.env.local${NC}"
  echo -e "${CYAN}  Add: NEXT_PUBLIC_API_URL=http://localhost:3101/api/v1${NC}"
fi

# Check admin .env.local
if [ -f "/Users/emin/kattenbak/admin-next/.env.local" ]; then
  api_url=$(grep "NEXT_PUBLIC_API_URL" /Users/emin/kattenbak/admin-next/.env.local 2>/dev/null | cut -d'=' -f2)
  if [ -n "$api_url" ]; then
    echo "Admin NEXT_PUBLIC_API_URL: $api_url"
    if [ "$api_url" = "http://localhost:3101/api/v1" ]; then
      echo -e "${GREEN}✓${NC} Admin API URL correct"
    else
      echo -e "${YELLOW}⚠${NC}  Admin API URL might be incorrect"
    fi
  fi
fi

# 7. Frontend Service Check
echo ""
echo -e "${YELLOW}7. Frontend Service Check${NC}"
echo "─────────────────────────────────────────────────────"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Frontend running: http://localhost:3000"
else
  echo -e "${YELLOW}⚠${NC}  Frontend NOT running"
  echo -e "${CYAN}  Start: cd frontend && npm run dev${NC}"
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Admin running: http://localhost:3001"
else
  echo -e "${YELLOW}⚠${NC}  Admin NOT running"
  echo -e "${CYAN}  Start: cd admin-next && npm run dev${NC}"
fi

# 8. Final Report
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ BACKEND CONNECTION FIX COMPLETE${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}Services:${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3101${NC}"
echo -e "  Frontend: ${CYAN}http://localhost:3000${NC} (start if needed)"
echo -e "  Admin:    ${CYAN}http://localhost:3001${NC} (start if needed)"
echo ""

echo -e "${CYAN}Test in Browser:${NC}"
echo "  1. Open: http://localhost:3000"
echo "  2. Open DevTools (F12) → Console + Network"
echo "  3. Expected:"
echo "     ✓ GET /api/v1/products/featured: 200 OK"
echo "     ✓ NO 'net::ERR_CONNECTION_REFUSED'"
echo "     ✓ NO empty error objects {}"
echo ""

echo -e "${CYAN}If you see errors:${NC}"
echo "  1. Hard refresh: Cmd+Shift+R"
echo "  2. Check console for detailed errors"
echo "  3. Check Network tab for failed requests"
echo "  4. Backend logs: tail -f /tmp/backend-connection-fix.log"
echo ""

echo -e "${GREEN}Backend is running! Test now! 🚀${NC}"


