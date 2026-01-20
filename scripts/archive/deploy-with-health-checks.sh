#!/bin/bash
#
# DEPLOYMENT SCRIPT WITH HEALTH CHECKS
# Zero-downtime deployment with automatic rollback
#

set -e

# Configuration
PROJECT_ROOT="/var/www/kattenbak"
BACKUP_DIR="/var/backups/kattenbak"
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_DELAY=3

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Health check function
health_check() {
    local service=$1
    local url=$2
    local retries=0
    
    while [ $retries -lt $HEALTH_CHECK_RETRIES ]; do
        if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
            log "✅ $service is healthy"
            return 0
        fi
        retries=$((retries + 1))
        sleep $HEALTH_CHECK_DELAY
    done
    
    error "$service failed health check after $HEALTH_CHECK_RETRIES attempts"
    return 1
}

# Backup current state
backup() {
    log "📦 Creating backup..."
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
        -C "$PROJECT_ROOT" \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=.git \
        .
    log "✅ Backup created: backup_$TIMESTAMP.tar.gz"
}

# Rollback function
rollback() {
    error "🔄 Rolling back deployment..."
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.tar.gz | head -1)
    if [ -f "$LATEST_BACKUP" ]; then
        tar -xzf "$LATEST_BACKUP" -C "$PROJECT_ROOT"
        pm2 restart all
        log "✅ Rolled back to: $(basename $LATEST_BACKUP)"
    else
        error "No backup found for rollback!"
    fi
}

# Main deployment
main() {
    log "╔════════════════════════════════════════════════════════╗"
    log "║     🚀 KATTENBAK DEPLOYMENT WITH HEALTH CHECKS       ║"
    log "╚════════════════════════════════════════════════════════╝"
    
    cd "$PROJECT_ROOT"
    
    # 1. Backup
    backup
    
    # 2. Git pull
    log "📥 Pulling latest code..."
    if ! git pull origin main; then
        error "Git pull failed!"
        exit 1
    fi
    
    # 3. Install dependencies
    log "📦 Installing dependencies..."
    cd backend && npm install --production && cd ..
    cd frontend && npm install --production && cd ..
    
    # 4. Build
    log "🔨 Building applications..."
    cd frontend
    if ! npm run build; then
        error "Frontend build failed!"
        rollback
        exit 1
    fi
    cd ..
    
    # 5. Restart services one by one
    log "🔄 Restarting services..."
    
    # Backend
    pm2 restart backend
    sleep 3
    if ! health_check "backend" "http://localhost:3101/api/v1/health"; then
        error "Backend health check failed!"
        rollback
        exit 1
    fi
    
    # Frontend
    pm2 restart frontend
    sleep 3
    if ! health_check "frontend" "http://localhost:3000"; then
        error "Frontend health check failed!"
        rollback
        exit 1
    fi
    
    # Admin
    pm2 restart admin
    sleep 3
    if ! health_check "admin" "http://localhost:3102"; then
        warning "Admin health check failed (non-critical)"
    fi
    
    # 6. Reload Nginx
    log "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    # 7. Final verification
    log "🔍 Final verification..."
    if health_check "production" "https://catsupply.nl"; then
        log "╔════════════════════════════════════════════════════════╗"
        log "║         ✅ DEPLOYMENT SUCCESSFUL!                     ║"
        log "╚════════════════════════════════════════════════════════╝"
        
        # Save PM2 state
        pm2 save
    else
        error "Production health check failed!"
        rollback
        exit 1
    fi
}

# Run deployment
main

