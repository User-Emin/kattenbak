#!/bin/bash
# DEPLOYMENT VERIFICATION SCRIPT - ROBUST & SECURE
# Verifies frontend/admin/backend health after deployment

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load credentials
if [ -f "$PROJECT_ROOT/.env.server" ]; then
  source "$PROJECT_ROOT/.env.server"
  echo -e "${GREEN}✅ Credentials loaded${NC}"
else
  echo -e "${RED}❌ .env.server not found!${NC}"
  exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   DEPLOYMENT VERIFICATION - E2E${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# SSH helper
ssh_exec() {
  sshpass -e ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "$@"
}

# Test 1: PM2 Status
echo -e "${YELLOW}📊 Test 1: PM2 Process Health${NC}"
PM2_STATUS=$(ssh_exec "pm2 jlist")
FRONTEND_STATUS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="frontend") | .pm2_env.status')
BACKEND_STATUS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="backend") | .pm2_env.status')
ADMIN_STATUS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="admin") | .pm2_env.status')

if [ "$FRONTEND_STATUS" = "online" ]; then
  echo -e "${GREEN}  ✅ Frontend: online${NC}"
else
  echo -e "${RED}  ❌ Frontend: $FRONTEND_STATUS${NC}"
  exit 1
fi

if [ "$BACKEND_STATUS" = "online" ]; then
  echo -e "${GREEN}  ✅ Backend: online${NC}"
else
  echo -e "${RED}  ❌ Backend: $BACKEND_STATUS${NC}"
  exit 1
fi

if [ "$ADMIN_STATUS" = "online" ]; then
  echo -e "${GREEN}  ✅ Admin: online${NC}"
elif [ "$ADMIN_STATUS" = "errored" ]; then
  echo -e "${RED}  ❌ Admin: errored (needs rebuild)${NC}"
  ADMIN_NEEDS_FIX=true
else
  echo -e "${YELLOW}  ⚠️  Admin: $ADMIN_STATUS${NC}"
fi

echo ""

# Test 2: HTTP Health Checks
echo -e "${YELLOW}🌐 Test 2: HTTP Endpoints${NC}"

# Frontend
FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/)
if [ "$FRONTEND_HTTP" = "200" ]; then
  echo -e "${GREEN}  ✅ Frontend (https://catsupply.nl/): 200 OK${NC}"
else
  echo -e "${RED}  ❌ Frontend: HTTP $FRONTEND_HTTP${NC}"
  exit 1
fi

# Backend API
BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/api/v1/products)
if [ "$BACKEND_HTTP" = "200" ]; then
  echo -e "${GREEN}  ✅ Backend (https://catsupply.nl/api/v1/products): 200 OK${NC}"
else
  echo -e "${RED}  ❌ Backend API: HTTP $BACKEND_HTTP${NC}"
  exit 1
fi

# Admin Panel
ADMIN_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/admin/login)
if [ "$ADMIN_HTTP" = "200" ]; then
  echo -e "${GREEN}  ✅ Admin (https://catsupply.nl/admin/login): 200 OK${NC}"
elif [ "$ADMIN_HTTP" = "502" ]; then
  echo -e "${RED}  ❌ Admin Panel: 502 Bad Gateway (PM2 errored)${NC}"
  ADMIN_NEEDS_FIX=true
else
  echo -e "${YELLOW}  ⚠️  Admin Panel: HTTP $ADMIN_HTTP${NC}"
fi

echo ""

# Test 3: API Response Validation
echo -e "${YELLOW}🔍 Test 3: API Response Validation${NC}"

PRODUCTS_RESPONSE=$(curl -s https://catsupply.nl/api/v1/products)
PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data | length')

if [ "$PRODUCT_COUNT" -gt 0 ]; then
  echo -e "${GREEN}  ✅ Products API: $PRODUCT_COUNT products returned${NC}"
else
  echo -e "${RED}  ❌ Products API: No products or invalid response${NC}"
  exit 1
fi

echo ""

# Test 4: Security Checks
echo -e "${YELLOW}🔒 Test 4: Security Verification${NC}"

# Check for exposed credentials in public endpoints
FRONTEND_SOURCE=$(curl -s https://catsupply.nl/)
if echo "$FRONTEND_SOURCE" | grep -qi "Pursangue"; then
  echo -e "${RED}  ❌ SECURITY: Credentials exposed in frontend!${NC}"
  exit 1
else
  echo -e "${GREEN}  ✅ No credentials in frontend source${NC}"
fi

# Check .env is not publicly accessible
ENV_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/.env)
if [ "$ENV_HTTP" = "404" ] || [ "$ENV_HTTP" = "403" ]; then
  echo -e "${GREEN}  ✅ .env file not accessible (HTTP $ENV_HTTP)${NC}"
else
  echo -e "${RED}  ❌ SECURITY: .env accessible (HTTP $ENV_HTTP)!${NC}"
  exit 1
fi

echo ""

# Test 5: Build Artifacts
echo -e "${YELLOW}📦 Test 5: Build Artifacts${NC}"

FRONTEND_BUILD=$(ssh_exec "[ -d /var/www/kattenbak/frontend/.next ] && echo 'exists' || echo 'missing'")
BACKEND_BUILD=$(ssh_exec "[ -d /var/www/kattenbak/backend/dist ] && echo 'exists' || echo 'missing'")
ADMIN_BUILD=$(ssh_exec "[ -d /var/www/kattenbak/admin-next/.next ] && echo 'exists' || echo 'missing'")

if [ "$FRONTEND_BUILD" = "exists" ]; then
  echo -e "${GREEN}  ✅ Frontend build artifacts exist${NC}"
else
  echo -e "${RED}  ❌ Frontend build missing${NC}"
  exit 1
fi

if [ "$BACKEND_BUILD" = "exists" ]; then
  echo -e "${GREEN}  ✅ Backend build artifacts exist${NC}"
else
  echo -e "${RED}  ❌ Backend build missing${NC}"
  exit 1
fi

if [ "$ADMIN_BUILD" = "exists" ]; then
  echo -e "${GREEN}  ✅ Admin build artifacts exist${NC}"
elif [ "$ADMIN_NEEDS_FIX" = "true" ]; then
  echo -e "${YELLOW}  ⚠️  Admin build missing (needs rebuild)${NC}"
else
  echo -e "${RED}  ❌ Admin build missing${NC}"
fi

echo ""

# Test 6: Database Connectivity
echo -e "${YELLOW}💾 Test 6: Database Connectivity${NC}"

DB_CHECK=$(ssh_exec "cd /var/www/kattenbak/backend && npx prisma db execute --stdin <<< 'SELECT 1;' 2>&1")
if echo "$DB_CHECK" | grep -qi "error"; then
  echo -e "${RED}  ❌ Database connection failed${NC}"
  exit 1
else
  echo -e "${GREEN}  ✅ Database connected${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
if [ "$ADMIN_NEEDS_FIX" = "true" ]; then
  echo -e "${YELLOW}⚠️  VERIFICATION COMPLETE - ADMIN NEEDS FIX${NC}"
  echo -e "${YELLOW}   Action required: Rebuild admin panel${NC}"
  exit 2
else
  echo -e "${GREEN}✅  ALL TESTS PASSED - DEPLOYMENT VERIFIED!${NC}"
fi
echo -e "${BLUE}========================================${NC}"

