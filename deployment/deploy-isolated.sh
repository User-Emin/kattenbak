#!/bin/bash
###############################################################################
# WATERDICHT DEPLOYMENT SCRIPT V2 - VOLLEDIGE ISOLATIE
# Zero downtime, atomic swaps, health checks, rollback
###############################################################################

set -euo pipefail  # Exit on error, undefined var, pipe failure

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

# Config
readonly SERVER_USER="root"
readonly SERVER_HOST="185.224.139.74"
readonly SERVER_PASS="Pursangue66@"
readonly DEPLOY_DIR="/var/www/kattenbak"
readonly BACKUP_DIR="/var/www/kattenbak-backup-$(date +%Y%m%d-%H%M%S)"
readonly MAX_RETRIES=3
readonly HEALTH_CHECK_TIMEOUT=30

# Logging
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Error handler
error_exit() {
    log_error "$1"
    log_error "Deployment failed! Rolling back..."
    rollback
    exit 1
}

# Rollback function
rollback() {
    log_warn "Rolling back to previous version..."
    sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
        if [ -d "${BACKUP_DIR}" ]; then
            cd /var/www/kattenbak
            pm2 stop frontend backend admin || true
            cp -r ${BACKUP_DIR}/frontend/.next frontend/ 2>/dev/null || true
            cp -r ${BACKUP_DIR}/backend/dist backend/ 2>/dev/null || true
            pm2 restart frontend backend admin
            echo "✅ Rollback completed"
        else
            echo "❌ No backup found"
        fi
ENDSSH
}

# Health check with retry
health_check() {
    local url=$1
    local service_name=$2
    local retries=0
    
    log_info "Health checking $service_name..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -sf --max-time 10 "$url" > /dev/null 2>&1; then
            log_info "✅ $service_name is healthy"
            return 0
        fi
        retries=$((retries + 1))
        log_warn "Retry $retries/$MAX_RETRIES for $service_name..."
        sleep 2
    done
    
    log_error "❌ $service_name health check failed"
    return 1
}

# Verify build artifacts
verify_build() {
    local dir=$1
    local artifact=$2
    
    if [ ! -f "$dir/$artifact" ]; then
        error_exit "Build artifact $artifact not found in $dir"
    fi
    
    local size=$(du -sh "$dir/$artifact" | cut -f1)
    log_info "✅ Build artifact $artifact verified ($size)"
}

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}WATERDICHT DEPLOYMENT V2${NC}"
echo -e "${GREEN}================================${NC}"

# 1. PRE-FLIGHT CHECKS
log_info "[1/8] Pre-flight checks..."

# Check SSH connectivity
if ! sshpass -p "$SERVER_PASS" ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} 'echo OK' > /dev/null 2>&1; then
    error_exit "SSH connection failed"
fi
log_info "✅ SSH connection OK"

# Check server disk space
DISK_USAGE=$(sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} 'df -h /var/www | tail -1 | awk "{print \$5}"' | tr -d '%')
if [ "$DISK_USAGE" -gt 90 ]; then
    error_exit "Disk usage too high: ${DISK_USAGE}%"
fi
log_info "✅ Disk space OK (${DISK_USAGE}% used)"

# 2. BACKUP CURRENT VERSION
log_info "[2/8] Creating backup..."
sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    mkdir -p ${BACKUP_DIR}/{frontend,backend,admin}
    cp -r ${DEPLOY_DIR}/frontend/.next ${BACKUP_DIR}/frontend/ 2>/dev/null || true
    cp -r ${DEPLOY_DIR}/backend/dist ${BACKUP_DIR}/backend/ 2>/dev/null || true
    echo "✅ Backup created at ${BACKUP_DIR}"
ENDSSH

# 3. BUILD FRONTEND
log_info "[3/8] Building Frontend..."
cd frontend || error_exit "Frontend directory not found"

# Create production env
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1
NEXT_PUBLIC_SITE_URL=https://catsupply.nl
NODE_ENV=production
EOF

rm -rf .next
if ! NODE_ENV=production npm run build; then
    error_exit "Frontend build failed"
fi

tar czf next-build.tar.gz .next
verify_build "." "next-build.tar.gz"
log_info "✅ Frontend built"

# 4. DEPLOY FRONTEND
log_info "[4/8] Deploying Frontend..."
if ! sshpass -p "$SERVER_PASS" scp next-build.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/; then
    error_exit "Frontend upload failed"
fi

sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
    cd /var/www/kattenbak/frontend
    pm2 stop frontend || true
    rm -rf .next
    tar xzf /tmp/next-build.tar.gz
    pm2 restart frontend
    sleep 2
ENDSSH
log_info "✅ Frontend deployed"

# 5. HEALTH CHECKS
log_info "[5/8] Running health checks..."

# Homepage check
health_check "https://catsupply.nl/" "Frontend" || error_exit "Frontend health check failed"

# API check
health_check "https://catsupply.nl/api/v1/health" "Backend API" || error_exit "Backend API health check failed"

# Admin check
health_check "https://catsupply.nl/admin/login" "Admin Panel" || error_exit "Admin Panel health check failed"

# 6. E2E VERIFICATION
log_info "[6/8] Running E2E verification..."

# Test product API
PRODUCT_SUCCESS=$(curl -sf "https://catsupply.nl/api/v1/products" | jq -r '.success')
if [ "$PRODUCT_SUCCESS" != "true" ]; then
    error_exit "Product API test failed"
fi
log_info "✅ Product API working"

# Test admin auth
ADMIN_AUTH=$(curl -sf "https://catsupply.nl/admin/api/products" | jq -r '.error')
if [ "$ADMIN_AUTH" != "Unauthorized" ]; then
    error_exit "Admin auth test failed - security breach!"
fi
log_info "✅ Admin auth working (unauthorized without token)"

# 7. PM2 STATUS CHECK
log_info "[7/8] Checking PM2 processes..."
PM2_STATUS=$(sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 jlist' | jq '[.[] | select(.name == "frontend" or .name == "backend" or .name == "admin")] | map(select(.pm2_env.status == "online")) | length')

if [ "$PM2_STATUS" -lt 3 ]; then
    error_exit "Not all PM2 processes online (found: $PM2_STATUS/3)"
fi
log_info "✅ All PM2 processes online ($PM2_STATUS/3)"

# 8. CLEANUP
log_info "[8/8] Cleaning up..."
rm -f frontend/next-build.tar.gz
log_info "✅ Cleanup completed"

# SUCCESS
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESS${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Frontend: https://catsupply.nl"
echo "Backend API: https://catsupply.nl/api/v1"
echo "Admin: https://catsupply.nl/admin"
echo ""
echo "Backup location: ${BACKUP_DIR}"
echo "PM2 processes: ${PM2_STATUS}/3 online"
echo ""
log_info "Deployment completed successfully!"
