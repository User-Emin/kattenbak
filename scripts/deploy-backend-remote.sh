#!/bin/bash

# ✅ REMOTE BACKEND DEPLOYMENT SCRIPT
# Run this script ON THE SERVER to deploy backend
# Usage: bash /var/www/kattenbak/scripts/deploy-backend-remote.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/kattenbak"
BACKEND_DIR="${PROJECT_DIR}/backend"
NICE_LEVEL=10

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info "Starting backend deployment..."

cd "$PROJECT_DIR" || exit 1

# Git pull
log_info "Pulling latest code..."
if git pull origin main; then
    log_success "Git pull successful"
else
    log_error "Git pull failed"
    exit 1
fi

# Build
cd "$BACKEND_DIR" || exit 1
log_info "Building backend (CPU-friendly)..."
if nice -n $NICE_LEVEL npm run build 2>&1 | tail -30; then
    log_success "Build successful"
else
    log_error "Build failed"
    exit 1
fi

# Restart
log_info "Restarting backend service..."
if pm2 restart backend --update-env; then
    log_success "Backend restarted"
    sleep 5
else
    log_error "PM2 restart failed"
    exit 1
fi

# Health check
log_info "Checking health..."
for i in {1..5}; do
    if curl -sf https://catsupply.nl/api/v1/health > /dev/null 2>&1; then
        log_success "Health check passed"
        break
    fi
    if [ $i -eq 5 ]; then
        log_error "Health check failed after 5 attempts"
        exit 1
    fi
    sleep 3
done

log_success "✅ Backend deployment completed successfully!"
