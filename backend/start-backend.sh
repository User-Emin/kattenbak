#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# KATTENBAK BACKEND - CONTINUÏTEIT START SCRIPT
# DRY, Secure, Maintainable
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 KATTENBAK BACKEND - START SCRIPT${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 1. Check if .env exists
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ Error: .env file not found${NC}"
  echo -e "${YELLOW}💡 Copy .env.example to .env and configure it${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"

# 2. Load environment variables
source .env

# 3. Validate required variables
REQUIRED_VARS=("PORT" "DATABASE_URL" "JWT_SECRET" "MOLLIE_API_KEY")
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo -e "${RED}❌ Error: Required variable $VAR is not set${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✅ Required environment variables validated${NC}"

# 4. Check if port is already in use
PORT=${PORT:-3101}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo -e "${YELLOW}⚠️  Port $PORT is already in use${NC}"
  echo -e "${YELLOW}🔄 Killing existing process...${NC}"
  lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
  sleep 2
fi

echo -e "${GREEN}✅ Port $PORT is available${NC}"

# 5. Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  npm install
fi

# 6. Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npm run prisma:generate 2>/dev/null || echo -e "${YELLOW}⚠️  Prisma generate skipped (optional)${NC}"

# 7. Check database connection (optional)
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if npm run prisma:migrate 2>/dev/null; then
  echo -e "${GREEN}✅ Database connected${NC}"
else
  echo -e "${YELLOW}⚠️  Database not available - using mock data${NC}"
fi

# 8. Start backend server
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Starting backend server on port $PORT...${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

npm run dev



