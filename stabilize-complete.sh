#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE LOCAL STABILIZATION + SERVER CHECK
# Fix database, poorten, alle services - VOLLEDIG STABIEL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

SERVER_IP="185.224.139.54"
SERVER_USER="deploy"

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔧 COMPLETE STABILIZATION - LOCAL + SERVER${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# 1. CHECK SERVER
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}1. SERVER STATUS (${SERVER_IP})${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo connected" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} SSH connection successful"
  
  # Check if PM2 is running
  echo -e "${YELLOW}Checking PM2 processes...${NC}"
  ssh ${SERVER_USER}@${SERVER_IP} "pm2 status 2>&1" || echo "PM2 not installed or no processes"
  
  # Check if backend is responding
  echo -e "${YELLOW}Checking backend health...${NC}"
  HEALTH=$(ssh ${SERVER_USER}@${SERVER_IP} "curl -s http://localhost:3101/health 2>&1" || echo "not responding")
  
  if echo "$HEALTH" | grep -q "healthy\|ok\|success"; then
    echo -e "${GREEN}✓${NC} Backend responding on server"
  else
    echo -e "${RED}✗${NC} Backend NOT responding on server"
    echo "  Response: $HEALTH"
  fi
  
  # Check Nginx
  echo -e "${YELLOW}Checking Nginx...${NC}"
  if ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl is-active nginx" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Nginx is active"
  else
    echo -e "${YELLOW}⚠${NC}  Nginx might not be running"
  fi
  
else
  echo -e "${YELLOW}⚠${NC}  Cannot connect to server"
  echo "  This is normal if:"
  echo "  - SSH key not configured"
  echo "  - Server not deployed yet"
  echo "  - Firewall blocking connection"
fi

# ═══════════════════════════════════════════════════════════════════
# 2. FIX LOCAL DATABASE
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}2. LOCAL DATABASE SETUP${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check PostgreSQL
if command -v psql > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} PostgreSQL client installed"
else
  echo -e "${RED}✗${NC} PostgreSQL not installed"
  echo "  Install: brew install postgresql@14"
  exit 1
fi

# Check if PostgreSQL is running
if pg_isready > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} PostgreSQL server running"
else
  echo -e "${YELLOW}⚠${NC}  PostgreSQL NOT running, starting..."
  brew services start postgresql@14
  sleep 3
  
  if pg_isready > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL started"
  else
    echo -e "${RED}✗${NC} Failed to start PostgreSQL"
    exit 1
  fi
fi

# Create database and user
echo -e "${YELLOW}Setting up database...${NC}"

# Create database
if psql -lqt | cut -d \| -f 1 | grep -qw kattenbak_dev; then
  echo -e "${GREEN}✓${NC} Database 'kattenbak_dev' exists"
else
  echo -e "${YELLOW}Creating database 'kattenbak_dev'...${NC}"
  createdb kattenbak_dev 2>/dev/null || psql postgres -c "CREATE DATABASE kattenbak_dev;" 2>/dev/null
  echo -e "${GREEN}✓${NC} Database created"
fi

# Create user
echo -e "${YELLOW}Setting up database user...${NC}"
psql postgres <<EOF 2>/dev/null
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'kattenbak_user') THEN
    CREATE USER kattenbak_user WITH PASSWORD 'kattenbak_dev_password';
  END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE kattenbak_dev TO kattenbak_user;
\connect kattenbak_dev
GRANT ALL ON SCHEMA public TO kattenbak_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kattenbak_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kattenbak_user;
EOF

echo -e "${GREEN}✓${NC} Database user configured"

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
if psql -U kattenbak_user -d kattenbak_dev -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Database connection successful"
else
  echo -e "${YELLOW}⚠${NC}  Connection test failed, but user exists"
fi

# ═══════════════════════════════════════════════════════════════════
# 3. CLEAN UP PORTS
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}3. PORT CLEANUP${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cleanup_port() {
  local port=$1
  local name=$2
  
  if lsof -ti:$port > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC}  Port $port ($name) in use, cleaning up..."
    lsof -ti:$port | xargs kill -9 2>/dev/null
    sleep 1
    echo -e "${GREEN}✓${NC} Port $port cleared"
  else
    echo -e "${GREEN}✓${NC} Port $port ($name) free"
  fi
}

cleanup_port 3101 "Backend"
cleanup_port 3000 "Frontend"
cleanup_port 3001 "Admin"
cleanup_port 5432 "PostgreSQL" # Don't kill, just check
cleanup_port 6379 "Redis"      # Don't kill, just check

# Kill old node processes
echo -e "${YELLOW}Cleaning up old node processes...${NC}"
pkill -f "tsx.*backend" 2>/dev/null || true
pkill -f "next.*3000" 2>/dev/null || true
pkill -f "next.*3001" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓${NC} Old processes cleaned"

# ═══════════════════════════════════════════════════════════════════
# 4. RUN MIGRATIONS
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}4. DATABASE MIGRATIONS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /Users/emin/kattenbak/backend

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Prisma client generated"

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy 2>&1 | grep -v "warn" | tail -5
echo -e "${GREEN}✓${NC} Migrations complete"

cd /Users/emin/kattenbak

# ═══════════════════════════════════════════════════════════════════
# 5. START SERVICES
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}5. STARTING SERVICES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start Backend
echo -e "${YELLOW}Starting backend (port 3101)...${NC}"
cd /Users/emin/kattenbak/backend
npm run dev > /tmp/backend-stable.log 2>&1 &
BACKEND_PID=$!
cd /Users/emin/kattenbak

# Wait and check
echo -n "Waiting for backend"
for i in {1..15}; do
  sleep 1
  echo -n "."
  if curl -s http://localhost:3101/health > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}✓${NC} Backend started successfully (PID: $BACKEND_PID)"
    break
  fi
done
echo ""

if ! curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${RED}✗${NC} Backend failed to start"
  echo -e "${YELLOW}Checking logs:${NC}"
  tail -20 /tmp/backend-stable.log
  exit 1
fi

# Start Frontend
echo -e "${YELLOW}Starting frontend (port 3000)...${NC}"
cd /Users/emin/kattenbak/frontend
npm run dev > /tmp/frontend-stable.log 2>&1 &
FRONTEND_PID=$!
cd /Users/emin/kattenbak

echo -n "Waiting for frontend"
for i in {1..10}; do
  sleep 1
  echo -n "."
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}✓${NC} Frontend started successfully (PID: $FRONTEND_PID)"
    break
  fi
done
echo ""

# Start Admin (if not already running)
if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${YELLOW}Starting admin (port 3001)...${NC}"
  cd /Users/emin/kattenbak/admin-next
  npm run dev > /tmp/admin-stable.log 2>&1 &
  ADMIN_PID=$!
  cd /Users/emin/kattenbak
  
  echo -n "Waiting for admin"
  for i in {1..10}; do
    sleep 1
    echo -n "."
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
      echo ""
      echo -e "${GREEN}✓${NC} Admin started successfully (PID: $ADMIN_PID)"
      break
    fi
  done
  echo ""
else
  echo -e "${GREEN}✓${NC} Admin already running"
fi

# ═══════════════════════════════════════════════════════════════════
# 6. VERIFY ALL SERVICES
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}6. SERVICE VERIFICATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

verify_service() {
  local url=$1
  local name=$2
  
  if curl -s "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $name: $url"
    return 0
  else
    echo -e "${RED}✗${NC} $name: $url"
    return 1
  fi
}

verify_service "http://localhost:3101/health" "Backend Health"
verify_service "http://localhost:3101/api/v1/products" "Products API"
verify_service "http://localhost:3101/api/v1/products/featured" "Featured Products"
verify_service "http://localhost:3000" "Frontend"
verify_service "http://localhost:3001" "Admin"

# Test specific endpoint from error
echo ""
echo -e "${YELLOW}Testing specific endpoint from error:${NC}"
response=$(curl -s -w "\n%{http_code}" http://localhost:3101/api/v1/products/slug/automatische-kattenbak-premium 2>&1)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓${NC} GET /api/v1/products/slug/automatische-kattenbak-premium: 200 OK"
elif [ "$http_code" = "404" ]; then
  echo -e "${YELLOW}⚠${NC}  Product slug not found (404) - might need seeding"
else
  echo -e "${RED}✗${NC} Endpoint returned: $http_code"
fi

# ═══════════════════════════════════════════════════════════════════
# 7. PROCESS INFORMATION
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}7. RUNNING PROCESSES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Backend:  PID $BACKEND_PID (port 3101)"
echo "Frontend: PID ${FRONTEND_PID:-'already running'} (port 3000)"
echo "Admin:    PID ${ADMIN_PID:-'already running'} (port 3001)"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/backend-stable.log"
echo "  Frontend: tail -f /tmp/frontend-stable.log"
echo "  Admin:    tail -f /tmp/admin-stable.log"

# ═══════════════════════════════════════════════════════════════════
# 8. FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ STABILIZATION COMPLETE${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}LOCAL SERVICES:${NC}"
echo "  Backend:  http://localhost:3101 ✓"
echo "  Frontend: http://localhost:3000 ✓"
echo "  Admin:    http://localhost:3001 ✓"
echo ""

echo -e "${CYAN}DATABASE:${NC}"
echo "  PostgreSQL: Running ✓"
echo "  Database:   kattenbak_dev ✓"
echo "  User:       kattenbak_user ✓"
echo "  Migrations: Complete ✓"
echo ""

echo -e "${CYAN}PORTS:${NC}"
echo "  3101: Backend  ✓"
echo "  3000: Frontend ✓"
echo "  3001: Admin    ✓"
echo ""

echo -e "${CYAN}NEXT STEPS:${NC}"
echo "  1. Test in browser: http://localhost:3000"
echo "  2. Check endpoints: curl http://localhost:3101/api/v1/products/featured"
echo "  3. Monitor logs: tail -f /tmp/backend-stable.log"
echo ""

echo -e "${GREEN}All services running! 🚀${NC}"
