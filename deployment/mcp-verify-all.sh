#!/bin/bash

# MCP SERVER COMPREHENSIVE VERIFICATION SCRIPT
# Absolute bevestiging van ELKE pagina, ELKE actie, ELKE loading
# DRY + Secure + Complete diagnostic

set -e

PASSWORD="${DEPLOY_PASSWORD:-Pursangue66@}"
SERVER="185.224.139.74"
USER="root"
BASE_URL="https://catsupply.nl"

echo "═══════════════════════════════════════════════════════════════════"
echo "  🔍 MCP SERVER COMPREHENSIVE CHECK"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

log_error() {
  echo -e "${RED}❌ ERROR: $1${NC}"
  ((ERRORS++))
}

log_warning() {
  echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
  ((WARNINGS++))
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# 1. PM2 PROCESS CHECK
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. PM2 PROCESS STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sshpass -p "$PASSWORD" ssh "$USER@$SERVER" << 'PM2_CHECK'
pm2 jlist | jq -r '.[] | "\(.name):\(.pm2_env.status):\(.pm2_env.restart_time):\(.pid)"' | while IFS=: read name status restarts pid; do
  if [ "$status" = "online" ]; then
    echo "✅ $name: ONLINE (PID: $pid, Restarts: $restarts)"
  else
    echo "❌ $name: $status (PID: $pid, Restarts: $restarts)"
  fi
done
PM2_CHECK

echo ""

# 2. HTTP ENDPOINT CHECK
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. HTTP ENDPOINT VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENDPOINTS=(
  "/:Homepage"
  "/product/automatische-kattenbak-premium:Product Detail"
  "/cart:Cart"
  "/checkout:Checkout"
  "/contact:Contact"
  "/admin/login:Admin Login"
  "/api/v1/products:API Products"
)

for endpoint in "${ENDPOINTS[@]}"; do
  IFS=: read -r path name <<< "$endpoint"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  
  if [ "$HTTP_CODE" = "200" ]; then
    log_success "$name ($path): HTTP $HTTP_CODE"
  else
    log_error "$name ($path): HTTP $HTTP_CODE"
  fi
done

echo ""

# 3. CLIENT-SIDE ERROR CHECK
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. CLIENT-SIDE ERROR DETECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HTML=$(curl -s "$BASE_URL/")

if echo "$HTML" | grep -q "Application error"; then
  log_error "Found 'Application error' in HTML"
  echo "$HTML" | grep -A 5 "Application error" | head -10
else
  log_success "No 'Application error' in HTML"
fi

if echo "$HTML" | grep -q "_error"; then
  log_warning "Found '_error' references in HTML"
else
  log_success "No '_error' references"
fi

echo ""

# 4. PM2 LOGS CHECK
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. PM2 ERROR LOGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sshpass -p "$PASSWORD" ssh "$USER@$SERVER" << 'LOGS_CHECK'
echo "Frontend errors:"
pm2 logs frontend --lines 30 --nostream --err 2>&1 | grep -i "error\|exception\|failed" | tail -5 || echo "No errors found"
echo ""
echo "Admin errors:"
pm2 logs admin --lines 30 --nostream --err 2>&1 | grep -i "error\|exception\|failed" | tail -5 || echo "No errors found"
echo ""
echo "Backend errors:"
pm2 logs backend --lines 30 --nostream --err 2>&1 | grep -i "error\|exception\|failed" | tail -5 || echo "No errors found"
LOGS_CHECK

echo ""

# 5. BUILD VERIFICATION
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. BUILD & DEPLOYMENT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sshpass -p "$PASSWORD" ssh "$USER@$SERVER" << 'BUILD_CHECK'
cd /var/www/kattenbak

echo "Git status:"
git log -1 --oneline

echo ""
echo "Frontend build:"
if [ -f frontend/.next/BUILD_ID ]; then
  echo "  BUILD_ID: $(cat frontend/.next/BUILD_ID)"
  echo "  .next folder: $(du -sh frontend/.next 2>/dev/null | cut -f1)"
else
  echo "  ❌ No .next/BUILD_ID found"
fi

echo ""
echo "Admin build:"
if [ -f admin-next/.next/BUILD_ID ]; then
  echo "  BUILD_ID: $(cat admin-next/.next/BUILD_ID)"
  echo "  .next folder: $(du -sh admin-next/.next 2>/dev/null | cut -f1)"
else
  echo "  ❌ No .next/BUILD_ID found"
fi
BUILD_CHECK

echo ""

# 6. CONTENT VERIFICATION
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. CONTENT VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Homepage
if curl -s "$BASE_URL/" | grep -q "Over dit product"; then
  log_success "Homepage: 'Over dit product' found"
else
  log_warning "Homepage: 'Over dit product' NOT found"
fi

# Product page
if curl -s "$BASE_URL/product/automatische-kattenbak-premium" | grep -q "rounded-sm"; then
  log_success "Product: Sticky cart 'rounded-sm' found"
else
  log_warning "Product: Sticky cart 'rounded-sm' NOT found"
fi

# Admin
if curl -s "$BASE_URL/admin/login" | grep -q "Inloggen"; then
  log_success "Admin: Login page accessible"
else
  log_error "Admin: Login page NOT accessible"
fi

echo ""

# 7. SUMMARY
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS WARNING(S) FOUND${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS ERROR(S) and $WARNINGS WARNING(S) FOUND${NC}"
  exit 1
fi
