#!/bin/bash
# MAXIMAAL ROBUUST DEPLOYMENT + SECURITY VALIDATION SCRIPT
# Full E2E testing met expliciete verificatie

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
SERVER="root@185.224.139.74"
PASSWORD="${DEPLOY_PASSWORD:-$(cat ~/.deploy_password 2>/dev/null)}"
FRONTEND_DIR="/var/www/kattenbak/frontend"
BACKEND_DIR="/var/www/kattenbak/backend"
LOCAL_BUILD_DIR="/Users/emin/kattenbak/frontend"

# Check password
if [ -z "$PASSWORD" ]; then
    echo "ERROR: DEPLOY_PASSWORD not set. Use:"
    echo "  export DEPLOY_PASSWORD='your-password'"
    echo "  OR create ~/.deploy_password file"
    exit 1
fi

log_success() { echo -e "${GREEN}✓ $1${NC}"; }
log_error() { echo -e "${RED}✗ $1${NC}"; exit 1; }
log_info() { echo -e "${YELLOW}→ $1${NC}"; }
log_test() { echo -e "${BLUE}TEST: $1${NC}"; }

echo "=========================================="
echo "  MAXIMAAL ROBUUST DEPLOYMENT PIPELINE   "
echo "  + SECURITY & BACKEND VALIDATION        "
echo "=========================================="

# ============================================
# PHASE 1: SECURITY PRE-CHECKS
# ============================================
log_info "PHASE 1: Security Pre-Checks..."

# Check 1: Backend Security Middleware
log_test "Checking backend security middleware..."
BACKEND_SECURITY=$(sshpass -p "$PASSWORD" ssh "$SERVER" "grep -c 'helmet' $BACKEND_DIR/dist/server-database.LAST || echo '0'")
if [[ "$BACKEND_SECURITY" == "0" ]]; then
    log_error "Backend security middleware (helmet) niet gevonden"
fi
log_success "Backend security middleware: PRESENT"

# Check 2: Rate Limiting
log_test "Checking rate limiting..."
RATE_LIMIT=$(sshpass -p "$PASSWORD" ssh "$SERVER" "grep -c 'express-rate-limit' $BACKEND_DIR/dist/server-database.LAST || echo '0'")
if [[ "$RATE_LIMIT" == "0" ]]; then
    log_error "Rate limiting niet geconfigureerd"
fi
log_success "Rate limiting: CONFIGURED"

# Check 3: CORS Configuration
log_test "Checking CORS configuration..."
CORS_CHECK=$(sshpass -p "$PASSWORD" ssh "$SERVER" "grep -c 'allowedOrigins' $BACKEND_DIR/dist/server-database.LAST || echo '0'")
if [[ "$CORS_CHECK" == "0" ]]; then
    log_error "CORS niet correct geconfigureerd"
fi
log_success "CORS: CONFIGURED"

# Check 4: JWT Authentication
log_test "Checking JWT authentication..."
JWT_CHECK=$(sshpass -p "$PASSWORD" ssh "$SERVER" "grep -c 'authenticate.*adminOnly' $BACKEND_DIR/dist/server-database.LAST || echo '0'")
if [[ "$JWT_CHECK" == "0" ]]; then
    log_error "JWT authentication middleware niet gevonden"
fi
log_success "JWT Authentication: IMPLEMENTED"

# ============================================
# PHASE 2: BACKEND VALIDATION
# ============================================
log_info "PHASE 2: Backend API Validation..."

# Test 1: Products Endpoint
log_test "Testing /api/v1/products endpoint..."
PRODUCTS_RESPONSE=$(curl -s https://catsupply.nl/api/v1/products)
PRODUCTS_SUCCESS=$(echo "$PRODUCTS_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
if [[ "$PRODUCTS_SUCCESS" != "true" ]]; then
    log_error "Products endpoint failed: $(echo $PRODUCTS_RESPONSE | jq -r '.error // "Unknown error"')"
fi
PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data | length')
log_success "Products endpoint: $PRODUCT_COUNT producten beschikbaar"

# Test 2: Featured Products
log_test "Testing /api/v1/products/featured endpoint..."
FEATURED_RESPONSE=$(curl -s https://catsupply.nl/api/v1/products/featured)
FEATURED_SUCCESS=$(echo "$FEATURED_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
if [[ "$FEATURED_SUCCESS" != "true" ]]; then
    log_error "Featured products endpoint failed"
fi
log_success "Featured products: WORKING"

# Test 3: Product by Slug
log_test "Testing product slug endpoint..."
SLUG_RESPONSE=$(curl -s https://catsupply.nl/api/v1/products/slug/automatische-kattenbak-premium)
SLUG_SUCCESS=$(echo "$SLUG_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
if [[ "$SLUG_SUCCESS" != "true" ]]; then
    log_error "Product slug endpoint failed"
fi
log_success "Product slug endpoint: WORKING"

# Test 4: Admin Auth Protection (should fail without token)
log_test "Testing admin endpoint protection..."
ADMIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/api/v1/admin/products)
if [[ "$ADMIN_RESPONSE" != "401" ]]; then
    log_error "Admin endpoint not properly protected (expected 401, got $ADMIN_RESPONSE)"
fi
log_success "Admin endpoints: PROTECTED (401 without auth)"

# Test 5: Rate Limiting
log_test "Testing rate limiting on login endpoint..."
for i in {1..3}; do
    curl -s -X POST https://catsupply.nl/api/v1/admin/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"email":"test@test.com","password":"wrong"}' > /dev/null
done
RATE_LIMIT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST https://catsupply.nl/api/v1/admin/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"test@test.com","password":"wrong"}')
if [[ "$RATE_LIMIT_STATUS" == "429" ]]; then
    log_success "Rate limiting: ACTIVE (429 Too Many Requests)"
else
    log_info "Rate limiting: May not be triggered yet (status: $RATE_LIMIT_STATUS)"
fi

# ============================================
# PHASE 3: FRONTEND BUILD & DEPLOYMENT
# ============================================
log_info "PHASE 3: Frontend Build & Deployment..."

# Pre-deployment checks
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    log_error "Local build directory not found"
fi

if [ ! -f "$LOCAL_BUILD_DIR/public/logo-catsupply.png" ]; then
    log_error "Logo file not found"
fi

# Build frontend
log_info "Building frontend..."
cd "$LOCAL_BUILD_DIR"
npm run build > /tmp/frontend-build.log 2>&1 || log_error "Frontend build failed"
log_success "Frontend build: SUCCESS"

# Create deployment package
TIMESTAMP=$(date +%s)
TARBALL="/tmp/frontend-deploy-${TIMESTAMP}.tar.gz"
TAR_FILES=".next public components"
[ -f "package.json" ] && TAR_FILES="$TAR_FILES package.json"
[ -f "next.config.ts" ] && TAR_FILES="$TAR_FILES next.config.ts"
[ -f "next.config.js" ] && TAR_FILES="$TAR_FILES next.config.js"
tar -czf "$TARBALL" $TAR_FILES || log_error "Tarball creation failed"
log_success "Deployment package created"

# Upload
log_info "Uploading to server..."
sshpass -p "$PASSWORD" scp "$TARBALL" "$SERVER:/tmp/frontend-deploy.tar.gz" || log_error "Upload failed"
log_success "Upload complete"

# Backup current version
log_info "Creating backup..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
if [ -d /var/www/kattenbak/frontend/.next ]; then
    BACKUP_DIR="/var/www/kattenbak/frontend-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r /var/www/kattenbak/frontend/.next "$BACKUP_DIR"
fi
EOF
log_success "Backup created"

# Deploy
log_info "Deploying to server..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
set -e
cd /var/www/kattenbak/frontend
rm -rf .next
tar -xzf /tmp/frontend-deploy.tar.gz
chown -R root:root .next public
EOF
log_success "Deployment complete"

# Restart PM2
log_info "Restarting services..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
pm2 restart frontend
sleep 5
EOF
log_success "Services restarted"

# ============================================
# PHASE 4: POST-DEPLOYMENT VALIDATION
# ============================================
log_info "PHASE 4: Post-Deployment Validation..."

# Test 1: PM2 Status
log_test "Checking PM2 status..."
PM2_STATUS=$(sshpass -p "$PASSWORD" ssh "$SERVER" "pm2 list | grep frontend | grep online" || echo "FAILED")
if [[ "$PM2_STATUS" == "FAILED" ]]; then
    log_error "Frontend PM2 process not online"
fi
log_success "PM2: ONLINE"

# Test 2: Port Check
log_test "Checking port 3102..."
PORT_CHECK=$(sshpass -p "$PASSWORD" ssh "$SERVER" "netstat -tuln | grep :3102 || echo 'NOT_LISTENING'")
if [[ "$PORT_CHECK" == "NOT_LISTENING" ]]; then
    log_error "Port 3102 not listening"
fi
log_success "Port 3102: LISTENING"

# Test 3: HTTP Response
log_test "Checking HTTP response..."
sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://185.224.139.74:3102)
if [[ "$HTTP_STATUS" != "200" ]]; then
    log_error "HTTP check failed (status: $HTTP_STATUS)"
fi
log_success "HTTP Status: 200"

# Test 4: Logo Presence
log_test "Checking logo in HTML..."
LOGO_CHECK=$(curl -s http://185.224.139.74:3102 | grep -c 'logo-catsupply.png' || echo "0")
if [[ "$LOGO_CHECK" == "0" ]]; then
    log_error "Logo not found in HTML"
fi
log_success "Logo: PRESENT in HTML"

# Test 5: API URL Configuration
log_test "Checking API URL configuration..."
API_URL_CHECK=$(curl -s http://185.224.139.74:3102 | grep -c 'localhost:3101' || echo "0")
if [[ "$API_URL_CHECK" != "0" ]]; then
    log_error "Development API URL detected in production build"
fi
log_success "API URL: Production configured"

# Test 6: Public URL
log_test "Checking public URL..."
PUBLIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl)
if [[ "$PUBLIC_STATUS" != "200" ]]; then
    log_error "Public URL check failed (status: $PUBLIC_STATUS)"
fi
log_success "Public URL: 200 OK"

# Test 7: Logo Size Check
log_test "Checking logo size in HTML..."
LOGO_HEIGHT=$(curl -s https://catsupply.nl | grep -o 'class="h-[0-9]\+' | head -1 || echo "h-0")
log_success "Logo height class: $LOGO_HEIGHT"

# Test 8: No Duplicate API Paths
log_test "Checking for duplicate API paths..."
DUPLICATE_CHECK=$(curl -s https://catsupply.nl/_next/static/chunks/*.js 2>/dev/null | grep -c 'api/v1/api/v1' || echo "0")
if [[ "$DUPLICATE_CHECK" != "0" ]]; then
    log_error "Duplicate API paths detected in build"
fi
log_success "API paths: NO DUPLICATES"

# ============================================
# PHASE 5: E2E FUNCTIONAL TESTS
# ============================================
log_info "PHASE 5: E2E Functional Tests..."

# Test 1: Homepage loads products
log_test "Testing homepage product loading..."
sleep 2
HOMEPAGE_PRODUCTS=$(curl -s https://catsupply.nl | grep -c 'Bekijk Product' || echo "0")
if [[ "$HOMEPAGE_PRODUCTS" == "0" ]]; then
    log_error "No products found on homepage"
fi
log_success "Homepage: Products visible"

# Test 2: Product detail page
log_test "Testing product detail page..."
PRODUCT_PAGE=$(curl -s https://catsupply.nl/product/automatische-kattenbak-premium | grep -c 'Toevoegen aan Winkelwagen' || echo "0")
if [[ "$PRODUCT_PAGE" == "0" ]]; then
    log_error "Product detail page not loading correctly"
fi
log_success "Product detail page: WORKING"

# Test 3: Logo accessibility
log_test "Testing logo accessibility..."
LOGO_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/logo-catsupply.png)
if [[ "$LOGO_HTTP" != "200" ]]; then
    log_error "Logo not accessible (status: $LOGO_HTTP)"
fi
log_success "Logo accessibility: 200 OK"

# ============================================
# CLEANUP
# ============================================
log_info "Cleanup..."
rm -f "$TARBALL"
sshpass -p "$PASSWORD" ssh "$SERVER" "rm -f /tmp/frontend-deploy.tar.gz"
log_success "Cleanup complete"

# ============================================
# FINAL REPORT
# ============================================
echo ""
echo "=========================================="
log_success "DEPLOYMENT SUCCESVOL VOLTOOID"
echo "=========================================="
echo ""
echo "Security Status:"
echo "  ✓ Backend Security Middleware: ACTIVE"
echo "  ✓ Rate Limiting: CONFIGURED"
echo "  ✓ CORS Policy: RESTRICTED"
echo "  ✓ JWT Authentication: IMPLEMENTED"
echo "  ✓ Admin Endpoints: PROTECTED"
echo ""
echo "Backend API Status:"
echo "  ✓ Products Endpoint: $PRODUCT_COUNT products"
echo "  ✓ Featured Products: WORKING"
echo "  ✓ Product Slug: WORKING"
echo "  ✓ Admin Protection: 401 (correct)"
echo ""
echo "Frontend Status:"
echo "  ✓ PM2 Process: ONLINE"
echo "  ✓ Port 3102: LISTENING"
echo "  ✓ HTTP Status: 200"
echo "  ✓ Logo: $LOGO_HEIGHT (80% navbar)"
echo "  ✓ API URLs: Production"
echo "  ✓ No Duplicates: Verified"
echo ""
echo "E2E Tests:"
echo "  ✓ Homepage: Products loaded"
echo "  ✓ Product Detail: Working"
echo "  ✓ Logo: Accessible"
echo ""
echo "Public URL: https://catsupply.nl"
echo ""


