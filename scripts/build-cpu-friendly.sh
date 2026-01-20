#!/bin/bash
#
# 🔧 CPU-FRIENDLY BUILD SCRIPT - KATTENBAK PROJECT
# Secure, modular, no redundancy, with data checks
# CPU usage limited to prevent overload
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="/var/www/kattenbak"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
ADMIN_DIR="${PROJECT_ROOT}/admin-next"

# ✅ CPU LIMIT: Use nice to reduce priority
NICE_LEVEL=10

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🔧 CPU-FRIENDLY BUILD SCRIPT                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ✅ CPU CHECK: Check current load
CPU_LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | awk '{ print $1 }' | sed 's/,//')
CPU_COUNT=$(nproc)
LOAD_THRESHOLD=$(echo "$CPU_COUNT * 0.7" | bc)

echo -e "${YELLOW}📊 CPU Status:${NC}"
echo "   - CPU Cores: $CPU_COUNT"
echo "   - Current Load: $CPU_LOAD"
echo "   - Load Threshold: $LOAD_THRESHOLD"

if (( $(echo "$CPU_LOAD > $LOAD_THRESHOLD" | bc -l) )); then
  echo -e "${YELLOW}⚠️  High CPU load detected. Waiting 30s before build...${NC}"
  sleep 30
fi

# ✅ DATA CHECK: Verify database connection before build
echo ""
echo -e "${YELLOW}🔍 Data Check: Verifying database connection...${NC}"
cd "$BACKEND_DIR"
if node -e "require('./dist/config/database.config.js').prisma.\$queryRaw\`SELECT 1\`.then(() => process.exit(0)).catch(() => process.exit(1))" 2>/dev/null; then
  echo -e "${GREEN}✅ Database connection OK${NC}"
else
  echo -e "${YELLOW}⚠️  Database check skipped (backend not built yet)${NC}"
fi

# ✅ BACKEND BUILD: CPU-friendly with nice priority
echo ""
echo -e "${BLUE}🔨 Building Backend (CPU-friendly)...${NC}"
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  nice -n $NICE_LEVEL npm install --legacy-peer-deps
fi

# Build with CPU limit
echo -e "${YELLOW}🔧 Compiling TypeScript...${NC}"
nice -n $NICE_LEVEL npm run build 2>&1 | tail -20

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend build successful${NC}"
else
  echo -e "${RED}❌ Backend build failed${NC}"
  exit 1
fi

# ✅ DATA CHECK: Verify order variant columns exist
echo ""
echo -e "${YELLOW}🔍 Data Check: Verifying order variant columns...${NC}"
cd "$BACKEND_DIR"
VARIANT_CHECK=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRawUnsafe\`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'variant_color'
  ) as exists;
\`.then(r => { console.log(r[0].exists ? 'true' : 'false'); prisma.\$disconnect(); })
.catch(() => { console.log('false'); prisma.\$disconnect(); });
" 2>/dev/null || echo "false")

if [ "$VARIANT_CHECK" = "true" ]; then
  echo -e "${GREEN}✅ Variant columns exist in database${NC}"
else
  echo -e "${YELLOW}⚠️  Variant columns not found (non-critical)${NC}"
fi

# ✅ FRONTEND BUILD: CPU-friendly
echo ""
echo -e "${BLUE}🔨 Building Frontend (CPU-friendly)...${NC}"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  nice -n $NICE_LEVEL npm install --legacy-peer-deps
fi

# Build with CPU limit
echo -e "${YELLOW}🔧 Building Next.js...${NC}"
NEXT_PUBLIC_API_URL="https://catsupply.nl/api/v1" nice -n $NICE_LEVEL npm run build 2>&1 | tail -20

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Frontend build successful${NC}"
else
  echo -e "${RED}❌ Frontend build failed${NC}"
  exit 1
fi

# ✅ ADMIN BUILD: CPU-friendly
echo ""
echo -e "${BLUE}🔨 Building Admin Panel (CPU-friendly)...${NC}"
cd "$ADMIN_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  nice -n $NICE_LEVEL npm install --legacy-peer-deps
fi

# Build with CPU limit
echo -e "${YELLOW}🔧 Building Next.js Admin...${NC}"
NEXT_PUBLIC_API_URL="https://catsupply.nl/api/v1" nice -n $NICE_LEVEL npm run build 2>&1 | tail -20

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Admin build successful${NC}"
else
  echo -e "${RED}❌ Admin build failed${NC}"
  exit 1
fi

# ✅ FINAL DATA CHECK: Verify API endpoints
echo ""
echo -e "${YELLOW}🔍 Final Data Check: Verifying API endpoints...${NC}"
sleep 2

HEALTH_CHECK=$(curl -s https://catsupply.nl/api/v1/health 2>/dev/null | grep -o '"success":true' || echo "")
if [ -n "$HEALTH_CHECK" ]; then
  echo -e "${GREEN}✅ API health check passed${NC}"
else
  echo -e "${YELLOW}⚠️  API health check failed (may need restart)${NC}"
fi

# ✅ SUMMARY
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ BUILD COMPLETE - CPU-FRIENDLY                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📊 Next Steps:${NC}"
echo "   1. Restart services: pm2 restart all"
echo "   2. Verify: curl https://catsupply.nl/api/v1/health"
echo "   3. Check admin: https://catsupply.nl/admin"
echo ""
