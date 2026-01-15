#!/bin/bash

# 🚀 START LOKAAL - SECURITY COMPLIANT
# Start alle services lokaal met correcte poorten

set -e

echo "🚀 Starting Kattenbak Local Development..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Starting PostgreSQL and Redis via Docker Compose...${NC}"
    echo "   Please start Docker Desktop first, then run this script again."
    exit 1
fi

# Start Docker services
echo -e "${GREEN}📦 Starting Docker services (PostgreSQL, Redis)...${NC}"
cd "$(dirname "$0")"
docker-compose up -d postgres redis

# Wait for services to be ready
echo -e "${GREEN}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check PostgreSQL
if docker exec kattenbak-postgres pg_isready -U kattenbak_user > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not ready yet. Waiting...${NC}"
    sleep 5
fi

# Check Redis
if docker exec kattenbak-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Redis is not ready yet. Waiting...${NC}"
    sleep 3
fi

# Run Prisma migrations
echo -e "${GREEN}🔄 Running database migrations...${NC}"
cd backend
npm run prisma:generate
npm run prisma:migrate || echo -e "${YELLOW}⚠️  Migration may have already been applied${NC}"
cd ..

# Start all services
echo -e "${GREEN}🚀 Starting all services...${NC}"
echo ""
echo "📍 Services will be available at:"
echo "   Frontend:  http://localhost:3001"
echo "   Backend:   http://localhost:3101"
echo "   Admin:     http://localhost:3102"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start all services concurrently
npm run dev
