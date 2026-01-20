#!/bin/bash
#
# HEALTH CHECK & AUTO-RECOVERY SCRIPT
# Monitors all services and auto-restarts on failure
#

# Configuration
BACKEND_URL="http://localhost:3101/api/v1/health"
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3102"
LOG_FILE="/var/www/kattenbak/logs/health-check.log"
MAX_RETRIES=3
RETRY_DELAY=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if service is running via PM2
check_pm2_status() {
    local service=$1
    pm2 describe "$service" | grep -q "status.*online"
    return $?
}

# Check HTTP endpoint
check_http() {
    local url=$1
    local timeout=${2:-5}
    curl -sf --max-time "$timeout" "$url" > /dev/null 2>&1
    return $?
}

# Restart service via PM2
restart_service() {
    local service=$1
    log "⚠️  Restarting $service..."
    pm2 restart "$service"
    sleep 3
}

# Full rebuild and restart (nuclear option)
full_rebuild() {
    local service=$1
    log "🔧 Full rebuild required for $service..."
    
    cd /var/www/kattenbak
    
    case $service in
        "frontend")
            cd frontend
            rm -rf .next
            npm run build
            cd ..
            pm2 restart frontend
            ;;
        "backend")
            cd backend
            npm run build || true
            cd ..
            pm2 restart backend
            ;;
        "admin")
            cd admin
            npm run build || true
            cd ..
            pm2 restart admin
            ;;
    esac
}

# Check and recover a service
check_and_recover() {
    local service=$1
    local url=$2
    local retries=0
    
    log "🔍 Checking $service..."
    
    # Check PM2 status first
    if ! check_pm2_status "$service"; then
        log "❌ $service not running in PM2!"
        restart_service "$service"
        return
    fi
    
    # Check HTTP endpoint
    if ! check_http "$url"; then
        log "⚠️  $service HTTP check failed!"
        
        while [ $retries -lt $MAX_RETRIES ]; do
            retries=$((retries + 1))
            log "Retry $retries/$MAX_RETRIES..."
            
            restart_service "$service"
            sleep "$RETRY_DELAY"
            
            if check_http "$url"; then
                log "✅ $service recovered!"
                return 0
            fi
        done
        
        log "❌ $service failed after $MAX_RETRIES retries. Attempting full rebuild..."
        full_rebuild "$service"
        
        sleep 10
        if check_http "$url"; then
            log "✅ $service recovered after rebuild!"
        else
            log "🚨 CRITICAL: $service still down after rebuild!"
        fi
    else
        log "✅ $service healthy"
    fi
}

# Main health check routine
main() {
    log "════════════════════════════════════════════════"
    log "🏥 Starting health check cycle"
    log "════════════════════════════════════════════════"
    
    # Check all services
    check_and_recover "backend" "$BACKEND_URL"
    check_and_recover "frontend" "$FRONTEND_URL"
    check_and_recover "admin" "$ADMIN_URL"
    
    # Check Nginx
    if ! systemctl is-active --quiet nginx; then
        log "⚠️  Nginx not running! Restarting..."
        systemctl restart nginx
    else
        log "✅ Nginx healthy"
    fi
    
    # Check disk space
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        log "⚠️  Disk usage critical: ${DISK_USAGE}%"
    else
        log "✅ Disk usage OK: ${DISK_USAGE}%"
    fi
    
    # Check memory
    MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$MEM_USAGE" -gt 90 ]; then
        log "⚠️  Memory usage high: ${MEM_USAGE}%"
    else
        log "✅ Memory usage OK: ${MEM_USAGE}%"
    fi
    
    log "════════════════════════════════════════════════"
    log "✅ Health check cycle complete"
    log "════════════════════════════════════════════════"
}

# Run main function
main

