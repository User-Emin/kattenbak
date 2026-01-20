#!/bin/bash

# 🔄 Auto-Heal Script - Anti-Solidarity (Resilience)
# Automatically detects and fixes issues with services

set -e

SERVER_HOST="185.224.139.74"
SERVER_USER="root"
LOG_FILE="/var/log/kattenbak-auto-heal.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_and_restart_service() {
    local service_name=$1
    local port=$2
    local max_retries=3
    
    for i in $(seq 1 $max_retries); do
        RESPONSE=$(curl -sf "http://localhost:$port" 2>&1 || echo "FAILED")
        
        if echo "$RESPONSE" | grep -q "FAILED\|Connection refused\|502"; then
            if [ $i -eq $max_retries ]; then
                log "❌ $service_name on port $port: FAILED after $max_retries attempts - Restarting..."
                sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
                    "cd /var/www/kattenbak && pm2 restart $service_name && sleep 3"
                return 1
            fi
            sleep 2
        else
            log "✅ $service_name on port $port: OK"
            return 0
        fi
    done
}

kill_build_processes() {
    BUILD_COUNT=$(sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
        "ps aux | grep -E 'next.*build|tsc|npm.*build' | grep -v grep | wc -l")
    
    if [ "$BUILD_COUNT" -gt 0 ]; then
        log "⚠️  Build processes detected ($BUILD_COUNT) - Killing for CPU optimization..."
        sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
            "pkill -9 -f 'next.*build' 2>/dev/null || true; \
             pkill -9 -f 'tsc' 2>/dev/null || true; \
             pkill -9 -f 'npm.*build' 2>/dev/null || true"
        log "✅ Build processes killed"
    fi
}

check_cpu_load() {
    CPU_LOAD=$(sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
        "uptime | awk -F'load average:' '{ print \$2 }' | awk '{ print \$1 }' | sed 's/,//'")
    
    CPU_COUNT=$(sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "nproc")
    LOAD_THRESHOLD=$(echo "$CPU_COUNT * 1.0" | bc)
    
    if (( $(echo "$CPU_LOAD > $LOAD_THRESHOLD" | bc -l) )); then
        log "⚠️  High CPU load detected ($CPU_LOAD / $CPU_COUNT) - Checking processes..."
        sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
            "ps aux --sort=-%cpu | head -10" | tee -a "$LOG_FILE"
        return 1
    fi
    
    return 0
}

# Main auto-heal function
auto_heal() {
    log "🔄 Starting auto-heal check..."
    
    # Kill any build processes
    kill_build_processes
    
    # Check CPU load
    check_cpu_load
    
    # Check and restart services if needed
    check_and_restart_service "backend" 3101
    check_and_restart_service "frontend" 3102
    check_and_restart_service "admin" 3103
    
    log "✅ Auto-heal check complete"
}

# Run auto-heal
auto_heal
