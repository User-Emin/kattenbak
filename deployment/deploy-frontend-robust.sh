#!/bin/bash
# ROBUST FRONTEND DEPLOYMENT SCRIPT MET EXPLICIETE TESTING
# Deployt frontend naar catsupply.nl met volledige validatie

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Config
SERVER="root@185.224.139.74"
PASSWORD="${DEPLOY_PASSWORD:-$(cat ~/.deploy_password 2>/dev/null)}"
FRONTEND_DIR="/var/www/kattenbak/frontend"
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

echo "=========================================="
echo "  FRONTEND DEPLOYMENT - ROBUST PIPELINE  "
echo "=========================================="

# STAP 1: PRE-DEPLOYMENT CHECKS
log_info "STAP 1: Pre-deployment checks..."

# Check local build directory
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    log_error "Local build directory niet gevonden: $LOCAL_BUILD_DIR"
fi

# Check if .next exists (recent build)
if [ ! -d "$LOCAL_BUILD_DIR/.next" ]; then
    log_error ".next build directory niet gevonden - run eerst 'npm run build'"
fi

# Check logo file
if [ ! -f "$LOCAL_BUILD_DIR/public/logo-catsupply.png" ]; then
    log_error "Logo file niet gevonden in public/"
fi

log_success "Pre-deployment checks geslaagd"

# STAP 2: BUILD FRONTEND LOKAAL
log_info "STAP 2: Building frontend lokaal..."
cd "$LOCAL_BUILD_DIR"
npm run build > /tmp/frontend-build.log 2>&1 || log_error "Frontend build failed - check /tmp/frontend-build.log"
log_success "Frontend build succesvol"

# STAP 3: CREATE DEPLOYMENT PACKAGE
log_info "STAP 3: Creating deployment package..."
TIMESTAMP=$(date +%s)
TARBALL="/tmp/frontend-deploy-${TIMESTAMP}.tar.gz"

# Only include files that exist
TAR_FILES=".next public components"
[ -f "package.json" ] && TAR_FILES="$TAR_FILES package.json"
[ -f "package-lock.json" ] && TAR_FILES="$TAR_FILES package-lock.json"
[ -f "next.config.ts" ] && TAR_FILES="$TAR_FILES next.config.ts"
[ -f "next.config.js" ] && TAR_FILES="$TAR_FILES next.config.js"
[ -f "tsconfig.json" ] && TAR_FILES="$TAR_FILES tsconfig.json"

tar -czf "$TARBALL" $TAR_FILES || log_error "Tarball creation failed"
TARBALL_SIZE=$(du -h "$TARBALL" | cut -f1)
log_success "Deployment package created: $TARBALL_SIZE"

# STAP 4: UPLOAD TO SERVER
log_info "STAP 4: Uploading to server..."
sshpass -p "$PASSWORD" scp "$TARBALL" "$SERVER:/tmp/frontend-deploy.tar.gz" || log_error "Upload failed"
log_success "Upload succesvol"

# STAP 5: BACKUP CURRENT VERSION
log_info "STAP 5: Creating backup of current version..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
if [ -d /var/www/kattenbak/frontend/.next ]; then
    BACKUP_DIR="/var/www/kattenbak/frontend-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r /var/www/kattenbak/frontend/.next "$BACKUP_DIR"
    echo "Backup created: $BACKUP_DIR"
fi
EOF
log_success "Backup created"

# STAP 6: DEPLOY TO SERVER
log_info "STAP 6: Deploying to server..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
set -e
cd /var/www/kattenbak/frontend
rm -rf .next
tar -xzf /tmp/frontend-deploy.tar.gz
chown -R root:root .next public
EOF
log_success "Deployment succesvol"

# STAP 7: RESTART PM2
log_info "STAP 7: Restarting PM2 process..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
pm2 restart frontend
sleep 3
EOF
log_success "PM2 restart succesvol"

# STAP 8: HEALTH CHECKS
log_info "STAP 8: Running health checks..."

# Check 1: PM2 Status
log_info "  → Checking PM2 status..."
PM2_STATUS=$(sshpass -p "$PASSWORD" ssh "$SERVER" "pm2 list | grep frontend | grep online" || echo "FAILED")
if [[ "$PM2_STATUS" == "FAILED" ]]; then
    log_error "Frontend PM2 process not online"
fi
log_success "  PM2 status: online"

# Check 2: Port 3102 listening
log_info "  → Checking port 3102..."
PORT_CHECK=$(sshpass -p "$PASSWORD" ssh "$SERVER" "netstat -tuln | grep :3102 || echo 'NOT_LISTENING'")
if [[ "$PORT_CHECK" == "NOT_LISTENING" ]]; then
    log_error "Port 3102 not listening"
fi
log_success "  Port 3102: listening"

# Check 3: HTTP Response
log_info "  → Checking HTTP response..."
sleep 5  # Give app time to fully start
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://185.224.139.74:3102 || echo "000")
if [[ "$HTTP_STATUS" != "200" ]]; then
    log_error "HTTP check failed - Status: $HTTP_STATUS"
fi
log_success "  HTTP status: $HTTP_STATUS"

# Check 4: Logo Presence in HTML
log_info "  → Checking logo in HTML..."
LOGO_CHECK=$(curl -s http://185.224.139.74:3102 | grep -c 'logo-catsupply.png' || echo "0")
if [[ "$LOGO_CHECK" == "0" ]]; then
    log_error "Logo not found in HTML"
fi
log_success "  Logo found in HTML"

# Check 5: Backend API
log_info "  → Checking backend API..."
API_STATUS=$(curl -s https://catsupply.nl/api/v1/products | jq -r '.success' || echo "false")
if [[ "$API_STATUS" != "true" ]]; then
    log_error "Backend API check failed"
fi
PRODUCT_COUNT=$(curl -s https://catsupply.nl/api/v1/products | jq -r '.data | length' || echo "0")
log_success "  Backend API: $PRODUCT_COUNT producten beschikbaar"

# Check 6: Public URL via Nginx
log_info "  → Checking public URL via Nginx..."
PUBLIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl || echo "000")
if [[ "$PUBLIC_STATUS" != "200" ]]; then
    log_error "Public URL check failed - Status: $PUBLIC_STATUS"
fi
log_success "  Public URL: $PUBLIC_STATUS"

# Check 7: Logo accessible via public URL
log_info "  → Checking logo accessibility..."
LOGO_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl/logo-catsupply.png || echo "000")
if [[ "$LOGO_HTTP" != "200" ]]; then
    log_error "Logo not accessible - Status: $LOGO_HTTP"
fi
log_success "  Logo accessible: $LOGO_HTTP"

# STAP 9: CLEANUP
log_info "STAP 9: Cleanup..."
rm -f "$TARBALL"
sshpass -p "$PASSWORD" ssh "$SERVER" "rm -f /tmp/frontend-deploy.tar.gz"
log_success "Cleanup done"

echo ""
echo "=========================================="
log_success "DEPLOYMENT SUCCESVOL VOLTOOID"
echo "=========================================="
echo ""
echo "Deployment Details:"
echo "  - Frontend: ONLINE"
echo "  - Backend API: $PRODUCT_COUNT producten"
echo "  - Logo: GEÏNTEGREERD"
echo "  - Public URL: https://catsupply.nl"
echo ""
echo "Alle health checks: PASSED ✓"
echo ""


