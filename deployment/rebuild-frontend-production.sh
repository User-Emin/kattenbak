#!/bin/bash
# PRODUCTION FRONTEND REBUILD - WITH EXPLICIT ENV VARS
# Rebuilds frontend on server with correct production environment variables
# Fixes browser cache issues by ensuring all env vars are inline during build

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
echo "  PRODUCTION FRONTEND REBUILD            "
echo "=========================================="

# STAP 1: BACKUP CURRENT BUILD
log_info "STAP 1: Creating backup..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
if [ -d /var/www/kattenbak/frontend/.next ]; then
    BACKUP_DIR="/var/www/kattenbak/frontend-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r /var/www/kattenbak/frontend/.next "$BACKUP_DIR"
    echo "Backup created: $BACKUP_DIR"
fi
EOF
log_success "Backup created"

# STAP 2: CLEAN OLD BUILD
log_info "STAP 2: Cleaning old build..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
cd /var/www/kattenbak/frontend
rm -rf .next
echo "Old build removed"
EOF
log_success "Old build cleaned"

# STAP 3: REBUILD WITH EXPLICIT ENV VARS
log_info "STAP 3: Rebuilding with production env vars..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
cd /var/www/kattenbak/frontend

# CRITICAL: Inline env vars ensure they're baked into build
# Next.js replaces process.env.NEXT_PUBLIC_* at BUILD TIME
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1 \
NEXT_PUBLIC_SITE_URL=https://catsupply.nl \
NODE_ENV=production \
npm run build

# Verify build succeeded
if [ ! -d ".next" ]; then
    echo "ERROR: Build failed - .next directory not created"
    exit 1
fi

echo "Build completed successfully"
EOF
log_success "Build completed"

# STAP 4: VERIFY NO LOCALHOST IN BUILD
log_info "STAP 4: Verifying no localhost references..."
LOCALHOST_CHECK=$(sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
cd /var/www/kattenbak/frontend
grep -r "localhost:3101" .next/server/chunks/ 2>/dev/null | wc -l
EOF
)

if [ "$LOCALHOST_CHECK" != "0" ]; then
    log_error "Build contains localhost references! Count: $LOCALHOST_CHECK"
fi
log_success "No localhost references found"

# STAP 5: RESTART FRONTEND
log_info "STAP 5: Restarting frontend..."
sshpass -p "$PASSWORD" ssh "$SERVER" bash << 'EOF'
pm2 restart frontend
sleep 3
EOF
log_success "Frontend restarted"

# STAP 6: HEALTH CHECKS
log_info "STAP 6: Running health checks..."

# Check PM2 Status
log_info "  → Checking PM2 status..."
PM2_STATUS=$(sshpass -p "$PASSWORD" ssh "$SERVER" "pm2 list | grep frontend | grep online" || echo "FAILED")
if [[ "$PM2_STATUS" == "FAILED" ]]; then
    log_error "Frontend PM2 process not online"
fi
log_success "  PM2 status: online"

# Check HTTP Response
log_info "  → Checking HTTP response..."
sleep 5  # Give app time to fully start
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://catsupply.nl || echo "000")
if [[ "$HTTP_STATUS" != "200" ]]; then
    log_error "HTTP check failed - Status: $HTTP_STATUS"
fi
log_success "  HTTP status: $HTTP_STATUS"

# Check Backend API
log_info "  → Checking backend API..."
API_STATUS=$(curl -s https://catsupply.nl/api/v1/products | jq -r '.success' 2>/dev/null || echo "false")
if [[ "$API_STATUS" != "true" ]]; then
    log_error "Backend API check failed"
fi
log_success "  Backend API: working"

# Check Build ID Changed
log_info "  → Verifying new build..."
BUILD_ID=$(sshpass -p "$PASSWORD" ssh "$SERVER" "cat /var/www/kattenbak/frontend/.next/BUILD_ID")
log_success "  New Build ID: $BUILD_ID"

echo ""
echo "=========================================="
log_success "REBUILD SUCCESVOL VOLTOOID"
echo "=========================================="
echo ""
echo "Rebuild Details:"
echo "  - Build ID: $BUILD_ID"
echo "  - Localhost references: 0 ✓"
echo "  - Environment: PRODUCTION"
echo "  - API URL: https://catsupply.nl/api/v1"
echo ""
echo "⚠️  BELANGRIJK: Gebruikers moeten HARD REFRESH doen:"
echo "    - Mac: Cmd + Shift + R"
echo "    - Windows/Linux: Ctrl + F5"
echo ""
echo "Dit wist de browser cache en laadt de nieuwe build!"
echo ""
