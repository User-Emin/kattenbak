#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE URL/ENDPOINT VERIFICATION - LOCAL + PRODUCTION
# Check alle connections, poortnummers, endpoints - ABSOLUUT SECURE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔍 COMPLETE URL/ENDPOINT VERIFICATION${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# 1. LOCAL ENVIRONMENT CHECK
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}1. LOCAL ENVIRONMENT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend .env
echo -e "${YELLOW}Backend Environment:${NC}"
if [ -f "/Users/emin/kattenbak/backend/.env" ]; then
  PORT=$(grep "^PORT=" /Users/emin/kattenbak/backend/.env | cut -d'=' -f2)
  DB_URL=$(grep "^DATABASE_URL=" /Users/emin/kattenbak/backend/.env | cut -d'=' -f2 | sed 's/:.*/.../')
  MOLLIE=$(grep "^MOLLIE_API_KEY=" /Users/emin/kattenbak/backend/.env | cut -d'=' -f2 | head -c 20)
  
  echo "  PORT: ${PORT}"
  echo "  DATABASE: ${DB_URL}"
  echo "  MOLLIE: ${MOLLIE}..."
  
  if [ "$PORT" = "3101" ]; then
    echo -e "  ${GREEN}✓${NC} Backend port correct (3101)"
  else
    echo -e "  ${RED}✗${NC} Backend port wrong (expected 3101, got $PORT)"
  fi
else
  echo -e "  ${RED}✗${NC} backend/.env not found"
fi

# Frontend .env.local
echo ""
echo -e "${YELLOW}Frontend Environment:${NC}"
if [ -f "/Users/emin/kattenbak/frontend/.env.local" ]; then
  API_URL=$(grep "^NEXT_PUBLIC_API_URL=" /Users/emin/kattenbak/frontend/.env.local | cut -d'=' -f2)
  echo "  NEXT_PUBLIC_API_URL: ${API_URL}"
  
  if [ "$API_URL" = "http://localhost:3101/api/v1" ]; then
    echo -e "  ${GREEN}✓${NC} Frontend API URL correct"
  else
    echo -e "  ${YELLOW}⚠${NC}  Frontend API URL might be wrong"
    echo -e "     Expected: http://localhost:3101/api/v1"
    echo -e "     Got:      $API_URL"
  fi
else
  echo -e "  ${YELLOW}⚠${NC}  frontend/.env.local not found (will use default)"
  echo -e "     Default: http://localhost:3101/api/v1"
fi

# Admin .env.local
echo ""
echo -e "${YELLOW}Admin Environment:${NC}"
if [ -f "/Users/emin/kattenbak/admin-next/.env.local" ]; then
  API_URL=$(grep "^NEXT_PUBLIC_API_URL=" /Users/emin/kattenbak/admin-next/.env.local | cut -d'=' -f2)
  echo "  NEXT_PUBLIC_API_URL: ${API_URL}"
  
  if [ "$API_URL" = "http://localhost:3101/api/v1" ]; then
    echo -e "  ${GREEN}✓${NC} Admin API URL correct"
  else
    echo -e "  ${YELLOW}⚠${NC}  Admin API URL might be wrong"
  fi
else
  echo -e "  ${YELLOW}⚠${NC}  admin-next/.env.local not found"
fi

# ═══════════════════════════════════════════════════════════════════
# 2. PORT CHECK
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}2. PORT STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_port() {
  local port=$1
  local service=$2
  
  if lsof -ti:$port > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Port $port: $service RUNNING"
    return 0
  else
    echo -e "${RED}✗${NC} Port $port: $service NOT RUNNING"
    return 1
  fi
}

check_port 3101 "Backend"
BACKEND_RUNNING=$?

check_port 3000 "Frontend"
check_port 3001 "Admin"

# ═══════════════════════════════════════════════════════════════════
# 3. BACKEND ENDPOINT TEST
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}3. BACKEND ENDPOINTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $BACKEND_RUNNING -eq 0 ]; then
  # Test critical endpoints
  endpoints=(
    "/health"
    "/api/v1/products"
    "/api/v1/products/featured"
    "/api/v1/products/slug/automatische-kattenbak-premium"
    "/api/v1/orders"
    "/api/v1/contact"
  )
  
  for endpoint in "${endpoints[@]}"; do
    response=$(curl -s -w "\n%{http_code}" http://localhost:3101${endpoint} 2>&1)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
      echo -e "${GREEN}✓${NC} GET $endpoint: 200 OK"
    elif [ "$http_code" = "404" ]; then
      echo -e "${YELLOW}⚠${NC}  GET $endpoint: 404 NOT FOUND"
    else
      echo -e "${RED}✗${NC} GET $endpoint: $http_code"
    fi
  done
else
  echo -e "${RED}✗${NC} Backend not running, skipping endpoint tests"
  echo ""
  echo -e "${YELLOW}Start backend:${NC}"
  echo "  cd backend && npm run dev"
fi

# ═══════════════════════════════════════════════════════════════════
# 4. FRONTEND CONFIG CHECK
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}4. FRONTEND CONFIG (config.ts)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "/Users/emin/kattenbak/frontend/lib/config.ts" ]; then
  # Extract BASE_URL from config.ts
  BASE_URL=$(grep "BASE_URL:" /Users/emin/kattenbak/frontend/lib/config.ts | grep -o "http[^'\"]*" | head -1)
  echo "BASE_URL (line 9): $BASE_URL"
  
  if echo "$BASE_URL" | grep -q "localhost:3101"; then
    echo -e "${GREEN}✓${NC} config.ts BASE_URL correct for local development"
  else
    echo -e "${YELLOW}⚠${NC}  config.ts BASE_URL might not be localhost:3101"
  fi
  
  # Check endpoint definitions
  if grep -q "PRODUCTS_FEATURED: '/products/featured'" /Users/emin/kattenbak/frontend/lib/config.ts; then
    echo -e "${GREEN}✓${NC} PRODUCTS_FEATURED endpoint defined"
  fi
  
  if grep -q "PRODUCT_BY_SLUG.*slug.*products/slug" /Users/emin/kattenbak/frontend/lib/config.ts; then
    echo -e "${GREEN}✓${NC} PRODUCT_BY_SLUG endpoint defined"
  fi
else
  echo -e "${RED}✗${NC} config.ts not found"
fi

# ═══════════════════════════════════════════════════════════════════
# 5. PRODUCTION CONFIG CHECK
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}5. PRODUCTION CONFIGURATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if .env.production files exist
if [ -f "/Users/emin/kattenbak/backend/.env.production" ]; then
  echo -e "${GREEN}✓${NC} backend/.env.production exists"
  PROD_PORT=$(grep "^PORT=" /Users/emin/kattenbak/backend/.env.production 2>/dev/null | cut -d'=' -f2)
  echo "  Production PORT: ${PROD_PORT:-'not set'}"
else
  echo -e "${YELLOW}⚠${NC}  backend/.env.production not found (will be created)"
fi

if [ -f "/Users/emin/kattenbak/frontend/.env.production" ]; then
  echo -e "${GREEN}✓${NC} frontend/.env.production exists"
  PROD_API=$(grep "^NEXT_PUBLIC_API_URL=" /Users/emin/kattenbak/frontend/.env.production 2>/dev/null | cut -d'=' -f2)
  echo "  Production API URL: ${PROD_API:-'not set'}"
else
  echo -e "${YELLOW}⚠${NC}  frontend/.env.production not found (will be created)"
fi

# Check for catsupply.nl domain
echo ""
echo -e "${YELLOW}Production Domain: catsupply.nl${NC}"
echo "  API:      https://api.catsupply.nl"
echo "  Frontend: https://catsupply.nl"
echo "  Admin:    https://admin.catsupply.nl"

# ═══════════════════════════════════════════════════════════════════
# 6. SSL/HTTPS CHECK
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}6. SSL CONFIGURATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if certbot/ssl config exists
if command -v certbot > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Certbot installed"
else
  echo -e "${YELLOW}⚠${NC}  Certbot not installed (needed for SSL)"
fi

# Check nginx config
if [ -f "/etc/nginx/nginx.conf" ] || [ -f "/usr/local/etc/nginx/nginx.conf" ]; then
  echo -e "${GREEN}✓${NC} Nginx configuration found"
else
  echo -e "${YELLOW}⚠${NC}  Nginx not configured"
fi

# ═══════════════════════════════════════════════════════════════════
# 7. CONNECTION TEST SUMMARY
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 CONNECTION SUMMARY${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}LOCAL DEVELOPMENT:${NC}"
echo "  Backend:  http://localhost:3101"
echo "  Frontend: http://localhost:3000"
echo "  Admin:    http://localhost:3001"
echo ""

echo -e "${YELLOW}PRODUCTION (catsupply.nl):${NC}"
echo "  API:      https://api.catsupply.nl"
echo "  Frontend: https://catsupply.nl"
echo "  Admin:    https://admin.catsupply.nl"
echo ""

echo -e "${CYAN}NEXT STEPS:${NC}"
echo ""
echo "1. ${YELLOW}If Backend Not Running:${NC}"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. ${YELLOW}Test Local URLs:${NC}"
echo "   curl http://localhost:3101/health"
echo "   curl http://localhost:3101/api/v1/products/featured"
echo "   curl http://localhost:3101/api/v1/products/slug/automatische-kattenbak-premium"
echo ""
echo "3. ${YELLOW}Deploy to Production:${NC}"
echo "   ./deploy-production.sh"
echo "   (Will be created with SSL, secure env, etc.)"
echo ""
echo "4. ${YELLOW}Fix Database Issue:${NC}"
echo "   psql postgres"
echo "   CREATE DATABASE kattenbak_dev;"
echo "   CREATE USER kattenbak_user WITH PASSWORD 'kattenbak_dev_password';"
echo "   GRANT ALL PRIVILEGES ON DATABASE kattenbak_dev TO kattenbak_user;"
echo ""

echo -e "${GREEN}Verification complete! 🚀${NC}"
