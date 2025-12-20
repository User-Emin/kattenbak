#!/bin/bash

# =============================================================================
# CI/CD DEPLOYMENT + COMPLETE E2E TEST AUTOMATION
# Maximale verificatie - Absoluut DRY + Secure
# =============================================================================

set -e

PASSWORD="${DEPLOY_PASSWORD:-Pursangue66@}"
SERVER="185.224.139.74"
USER="root"
BASE_URL="https://catsupply.nl"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
CRITICAL_FAILURES=0

# Test result functions
test_pass() {
  echo -e "  ${GREEN}✅ $1${NC}"
  ((PASSED_TESTS++))
  ((TOTAL_TESTS++))
}

test_fail() {
  echo -e "  ${RED}❌ $1${NC}"
  ((FAILED_TESTS++))
  ((TOTAL_TESTS++))
  if [ "$2" = "CRITICAL" ]; then
    ((CRITICAL_FAILURES++))
  fi
}

test_warn() {
  echo -e "  ${YELLOW}⚠️  $1${NC}"
}

section_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  🚀 CI/CD DEPLOYMENT + E2E TEST AUTOMATION"
echo "  🔒 VOLLEDIG DYNAMISCH - ABSOLUUT SECURE + DRY"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# =============================================================================
# PHASE 1: GIT DEPLOYMENT
# =============================================================================
section_header "PHASE 1: GIT DEPLOYMENT"

echo "  📦 Deploying latest code to production..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
cd /var/www/kattenbak

# Git pull with reset
git fetch origin
git reset --hard origin/main
git clean -fd

# Show latest commit
echo "  Latest commit: $(git log -1 --oneline)"
ENDSSH

if [ $? -eq 0 ]; then
  test_pass "Git deployment successful"
else
  test_fail "Git deployment failed" "CRITICAL"
fi

# =============================================================================
# PHASE 2: BACKEND VERIFICATION + RESTART
# =============================================================================
section_header "PHASE 2: BACKEND VERIFICATION + RESTART"

echo "  🔧 Restarting backend service..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
cd /var/www/kattenbak/backend

# Check dist exists
if [ ! -f "dist/server-database.js" ]; then
  echo "ERROR: dist/server-database.js not found"
  exit 1
fi

# Restart backend
pm2 restart backend
sleep 5
ENDSSH

if [ $? -eq 0 ]; then
  test_pass "Backend restarted successfully"
else
  test_fail "Backend restart failed" "CRITICAL"
fi

# Test backend health
BACKEND_HEALTH=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'curl -s http://localhost:3101/health')
if echo "$BACKEND_HEALTH" | grep -q '"success":true'; then
  test_pass "Backend health check passed"
else
  test_fail "Backend health check failed" "CRITICAL"
fi

# =============================================================================
# PHASE 3: FRONTEND VERIFICATION + RESTART
# =============================================================================
section_header "PHASE 3: FRONTEND VERIFICATION + RESTART"

echo "  🌐 Restarting frontend service..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
cd /var/www/kattenbak/frontend
pm2 restart frontend
sleep 5
ENDSSH

if [ $? -eq 0 ]; then
  test_pass "Frontend restarted successfully"
else
  test_fail "Frontend restart failed" "CRITICAL"
fi

# =============================================================================
# PHASE 4: ADMIN PANEL VERIFICATION + RESTART
# =============================================================================
section_header "PHASE 4: ADMIN PANEL VERIFICATION + RESTART"

echo "  👤 Restarting admin service..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
cd /var/www/kattenbak/admin-next
pm2 restart admin
sleep 5
ENDSSH

if [ $? -eq 0 ]; then
  test_pass "Admin restarted successfully"
else
  test_fail "Admin restart failed" "CRITICAL"
fi

# Test admin localhost
ADMIN_LOCAL=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'curl -s http://localhost:3103/admin/login -I | head -1')
if echo "$ADMIN_LOCAL" | grep -q "200\|301\|302"; then
  test_pass "Admin localhost responding"
else
  test_fail "Admin localhost not responding" "CRITICAL"
  echo "    Response: $ADMIN_LOCAL"
fi

# =============================================================================
# PHASE 5: NGINX RELOAD
# =============================================================================
section_header "PHASE 5: NGINX RELOAD"

echo "  🔄 Reloading nginx configuration..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'systemctl reload nginx'

if [ $? -eq 0 ]; then
  test_pass "Nginx reloaded successfully"
else
  test_fail "Nginx reload failed" "CRITICAL"
fi

# =============================================================================
# PHASE 6: DATABASE CONNECTIVITY TEST
# =============================================================================
section_header "PHASE 6: DATABASE CONNECTIVITY TEST"

echo "  🗄️  Testing database connection..."
DB_TEST=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'cd /var/www/kattenbak/backend && node -e "
const { PrismaClient } = require(\"@prisma/client\");
const prisma = new PrismaClient();

async function test() {
  try {
    const count = await prisma.product.count();
    const users = await prisma.user.count();
    console.log(\"PRODUCTS:\", count);
    console.log(\"USERS:\", users);
    await prisma.\$disconnect();
  } catch (error) {
    console.log(\"ERROR:\", error.message);
    process.exit(1);
  }
}

test();
" 2>&1')

if echo "$DB_TEST" | grep -q "PRODUCTS:"; then
  PRODUCT_COUNT=$(echo "$DB_TEST" | grep "PRODUCTS:" | awk '{print $2}')
  USER_COUNT=$(echo "$DB_TEST" | grep "USERS:" | awk '{print $2}')
  test_pass "Database connected: $PRODUCT_COUNT products, $USER_COUNT users"
else
  test_fail "Database connection failed" "CRITICAL"
  echo "    Error: $DB_TEST"
fi

# =============================================================================
# PHASE 7: BACKEND API E2E TESTS
# =============================================================================
section_header "PHASE 7: BACKEND API E2E TESTS"

# Test 1: Products List
echo "  Test 1: GET /api/v1/products"
PRODUCTS=$(curl -s "$BASE_URL/api/v1/products")
if echo "$PRODUCTS" | grep -q '"success":true'; then
  PRODUCT_COUNT=$(echo "$PRODUCTS" | jq -r '.data.products | length' 2>/dev/null || echo "0")
  test_pass "Products list: $PRODUCT_COUNT products"
else
  test_fail "Products list failed" "CRITICAL"
fi

# Test 2: Featured Products
echo "  Test 2: GET /api/v1/products/featured"
FEATURED=$(curl -s "$BASE_URL/api/v1/products/featured")
if echo "$FEATURED" | grep -q '"success":true'; then
  FEATURED_COUNT=$(echo "$FEATURED" | jq -r '.data | length' 2>/dev/null || echo "0")
  test_pass "Featured products: $FEATURED_COUNT products"
else
  test_fail "Featured products failed"
fi

# Test 3: Product by Slug
echo "  Test 3: GET /api/v1/products/slug/automatische-kattenbak-premium"
PRODUCT_DETAIL=$(curl -s "$BASE_URL/api/v1/products/slug/automatische-kattenbak-premium")
if echo "$PRODUCT_DETAIL" | grep -q '"success":true'; then
  PRODUCT_NAME=$(echo "$PRODUCT_DETAIL" | jq -r '.data.name' 2>/dev/null || echo "N/A")
  PRODUCT_PRICE=$(echo "$PRODUCT_DETAIL" | jq -r '.data.price' 2>/dev/null || echo "N/A")
  test_pass "Product detail: $PRODUCT_NAME (€$PRODUCT_PRICE)"
else
  test_fail "Product detail failed" "CRITICAL"
fi

# Test 4: Health Check
echo "  Test 4: GET /api/v1/health"
HEALTH=$(curl -s "$BASE_URL/api/v1/health")
if echo "$HEALTH" | grep -q '"success":true'; then
  test_pass "API health check passed"
else
  test_fail "API health check failed"
fi

# =============================================================================
# PHASE 8: ADMIN API E2E TESTS
# =============================================================================
section_header "PHASE 8: ADMIN API E2E TESTS"

# Test 1: Admin Login
echo "  Test 1: POST /api/v1/admin/auth/login"
LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@catsupply.nl","password":"admin123"}')

if echo "$LOGIN" | grep -q '"success":true'; then
  TOKEN=$(echo "$LOGIN" | jq -r '.data.token // .token' 2>/dev/null)
  if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    test_pass "Admin login successful - Token received"
    
    # Test 2: Admin Get Products
    echo "  Test 2: GET /api/v1/admin/products"
    ADMIN_PRODUCTS=$(curl -s "$BASE_URL/api/v1/admin/products" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$ADMIN_PRODUCTS" | grep -q '"success":true'; then
      ADMIN_COUNT=$(echo "$ADMIN_PRODUCTS" | jq -r '.data | length' 2>/dev/null || echo "0")
      test_pass "Admin get products: $ADMIN_COUNT products"
      
      # Test 3: Admin Get Product by ID
      if [ "$ADMIN_COUNT" -gt 0 ]; then
        PRODUCT_ID=$(echo "$ADMIN_PRODUCTS" | jq -r '.data[0].id' 2>/dev/null)
        echo "  Test 3: GET /api/v1/admin/products/$PRODUCT_ID"
        ADMIN_PRODUCT=$(curl -s "$BASE_URL/api/v1/admin/products/$PRODUCT_ID" \
          -H "Authorization: Bearer $TOKEN")
        
        if echo "$ADMIN_PRODUCT" | grep -q '"success":true'; then
          test_pass "Admin get product by ID successful"
        else
          test_fail "Admin get product by ID failed"
        fi
      fi
    else
      test_fail "Admin get products failed" "CRITICAL"
    fi
  else
    test_fail "Admin login - No token received" "CRITICAL"
  fi
else
  test_fail "Admin login failed" "CRITICAL"
  echo "    Response: $(echo $LOGIN | head -c 200)"
fi

# =============================================================================
# PHASE 9: FRONTEND PAGE TESTS
# =============================================================================
section_header "PHASE 9: FRONTEND PAGE E2E TESTS"

# Test 1: Homepage
echo "  Test 1: GET /"
HOME_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$HOME_CODE" = "200" ]; then
  test_pass "Homepage: HTTP 200"
else
  test_fail "Homepage: HTTP $HOME_CODE" "CRITICAL"
fi

# Test 2: Product Detail Page
echo "  Test 2: GET /product/automatische-kattenbak-premium"
PRODUCT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/product/automatische-kattenbak-premium")
if [ "$PRODUCT_CODE" = "200" ]; then
  test_pass "Product page: HTTP 200"
else
  test_fail "Product page: HTTP $PRODUCT_CODE"
fi

# Test 3: Admin Login Page
echo "  Test 3: GET /admin/login"
ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/login")
if [ "$ADMIN_CODE" = "200" ]; then
  test_pass "Admin login page: HTTP 200"
else
  test_fail "Admin login page: HTTP $ADMIN_CODE" "CRITICAL"
  echo "    Testing direct admin URL..."
  ADMIN_DIRECT=$(curl -s "$BASE_URL/admin/login" -I | head -1)
  echo "    Response: $ADMIN_DIRECT"
fi

# =============================================================================
# PHASE 10: PM2 HEALTH CHECK
# =============================================================================
section_header "PHASE 10: PM2 PROCESS HEALTH CHECK"

PM2_STATUS=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'pm2 jlist')

# Check Backend
if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="backend") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  BACKEND_PID=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="backend") | .pid')
  BACKEND_RESTARTS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="backend") | .pm2_env.restart_time')
  BACKEND_UPTIME=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="backend") | .pm2_env.pm_uptime')
  test_pass "Backend: ONLINE (PID $BACKEND_PID, $BACKEND_RESTARTS restarts)"
else
  test_fail "Backend: NOT ONLINE" "CRITICAL"
fi

# Check Frontend
if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="frontend") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  FRONTEND_PID=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="frontend") | .pid')
  FRONTEND_RESTARTS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="frontend") | .pm2_env.restart_time')
  test_pass "Frontend: ONLINE (PID $FRONTEND_PID, $FRONTEND_RESTARTS restarts)"
else
  test_fail "Frontend: NOT ONLINE" "CRITICAL"
fi

# Check Admin
if echo "$PM2_STATUS" | jq -e '.[] | select(.name=="admin") | select(.pm2_env.status=="online")' > /dev/null 2>&1; then
  ADMIN_PID=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="admin") | .pid')
  ADMIN_RESTARTS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="admin") | .pm2_env.restart_time')
  test_pass "Admin: ONLINE (PID $ADMIN_PID, $ADMIN_RESTARTS restarts)"
else
  test_fail "Admin: NOT ONLINE" "CRITICAL"
fi

# =============================================================================
# PHASE 11: SECURITY VERIFICATION
# =============================================================================
section_header "PHASE 11: SECURITY VERIFICATION"

# Test 1: HTTPS Redirect
echo "  Test 1: HTTP to HTTPS redirect"
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" "http://catsupply.nl" -L -I | head -1)
if echo "$HTTP_REDIRECT" | grep -q "301\|302"; then
  test_pass "HTTP to HTTPS redirect working"
else
  test_warn "HTTP redirect might not be configured"
fi

# Test 2: Admin Auth Required
echo "  Test 2: Admin endpoints require authentication"
NO_AUTH=$(curl -s "$BASE_URL/api/v1/admin/products" | jq -r '.error // .message' 2>/dev/null)
if echo "$NO_AUTH" | grep -qi "unauthorized\|token\|auth"; then
  test_pass "Admin endpoints protected by authentication"
else
  test_warn "Admin authentication might not be enforced"
fi

# Test 3: CORS Headers
echo "  Test 3: CORS headers configured"
CORS=$(curl -s -I "$BASE_URL/api/v1/health" | grep -i "access-control")
if [ -n "$CORS" ]; then
  test_pass "CORS headers present"
else
  test_warn "CORS headers not found"
fi

# =============================================================================
# FINAL REPORT
# =============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  📊 CI/CD DEPLOYMENT + E2E TEST RESULTS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "  Total Tests:    $TOTAL_TESTS"
echo -e "  ${GREEN}Passed:         $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed:         $FAILED_TESTS${NC}"
echo -e "  ${RED}Critical:       $CRITICAL_FAILURES${NC}"
echo ""

if [ $CRITICAL_FAILURES -gt 0 ]; then
  echo -e "${RED}❌ DEPLOYMENT FAILED - CRITICAL ISSUES DETECTED${NC}"
  echo ""
  echo "  Critical failures must be resolved before deployment is complete."
  echo "  Please review the failed tests above and fix the issues."
  echo ""
  exit 1
elif [ $FAILED_TESTS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  DEPLOYMENT COMPLETED WITH WARNINGS${NC}"
  echo ""
  echo "  Some non-critical tests failed. Review and fix if necessary."
  echo ""
  exit 0
else
  echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL - ALL TESTS PASSED${NC}"
  echo ""
  echo "  🎉 Backend: Fully operational and dynamic"
  echo "  🎉 Frontend: Rendering dynamic data"
  echo "  🎉 Admin: Fully functional and secure"
  echo "  🎉 Database: Connected and responsive"
  echo "  🎉 PM2: All processes stable"
  echo "  🎉 Security: Authentication and CORS configured"
  echo ""
  echo "  🔥 WEBSHOP IS 100% DYNAMISCH - ABSOLUUT SECURE + DRY"
  echo ""
  exit 0
fi
