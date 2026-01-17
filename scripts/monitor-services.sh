#!/bin/bash

# 🔄 Continuous E2E Monitoring Script
# Monitors all services and ensures they're operational
# Auto-restarts on failure with anti-solidarity (resilience)

set -e

SERVER_HOST="185.224.139.74"
SERVER_USER="root"
MAX_RETRIES=3
CHECK_INTERVAL=30

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 E2E Continuous Monitoring - catsupply.nl"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_service() {
    local service_name=$1
    local url=$2
    
    for i in $(seq 1 $MAX_RETRIES); do
        RESPONSE=$(curl -sfI "$url" 2>&1 | head -3)
        
        if echo "$RESPONSE" | grep -q "502\|Bad Gateway\|Connection refused"; then
            if [ $i -eq $MAX_RETRIES ]; then
                echo "❌ $service_name: FAILED after $MAX_RETRIES attempts"
                return 1
            fi
            echo "⚠️  $service_name: Attempt $i/$MAX_RETRIES - Retrying..."
            sleep 2
        else
            if echo "$RESPONSE" | grep -qE "200|301|302|HTTP"; then
                echo "✅ $service_name: OK"
                return 0
            fi
        fi
    done
    
    echo "❌ $service_name: UNKNOWN STATUS"
    return 1
}

restart_service() {
    local service_name=$1
    
    echo "🔄 Restarting $service_name..."
    sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
        "cd /var/www/kattenbak && pm2 restart $service_name && sleep 3 && pm2 list | grep $service_name"
    
    sleep 5
}

check_cpu() {
    echo "📊 CPU Check..."
    CPU_LOAD=$(sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
        "uptime | awk -F'load average:' '{ print \$2 }' | awk '{ print \$1 }' | sed 's/,//'")
    
    CPU_COUNT=$(sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "nproc")
    LOAD_THRESHOLD=$(echo "$CPU_COUNT * 0.8" | bc)
    
    if (( $(echo "$CPU_LOAD > $LOAD_THRESHOLD" | bc -l) )); then
        echo "⚠️  WARNING: High CPU load ($CPU_LOAD / $CPU_COUNT cores)"
        return 1
    else
        echo "✅ CPU load OK ($CPU_LOAD / $CPU_COUNT cores)"
        return 0
    fi
}

check_build_processes() {
    BUILD_PROCESSES=$(sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
        "ps aux | grep -E 'next.*build|tsc|npm.*build' | grep -v grep | wc -l")
    
    if [ "$BUILD_PROCESSES" -gt 0 ]; then
        echo "⚠️  WARNING: Build processes detected ($BUILD_PROCESSES)"
        echo "🛑 Stopping build processes..."
        sshpass -p 'Kizilay023@@' ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
            "pkill -9 -f 'next.*build' 2>/dev/null || true; pkill -9 -f 'tsc' 2>/dev/null || true"
        return 1
    else
        echo "✅ No build processes (CPU-friendly)"
        return 0
    fi
}

# Main monitoring loop
monitor_loop() {
    local iteration=0
    
    while true; do
        iteration=$((iteration + 1))
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔄 E2E Check #$iteration - $(date '+%Y-%m-%d %H:%M:%S')"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        ALL_OK=true
        
        # Check CPU
        if ! check_cpu; then
            ALL_OK=false
        fi
        echo ""
        
        # Check build processes
        if ! check_build_processes; then
            ALL_OK=false
        fi
        echo ""
        
        # Check Backend
        if ! check_service "Backend API" "https://catsupply.nl/api/v1/health"; then
            ALL_OK=false
            restart_service "backend"
        fi
        echo ""
        
        # Check Frontend
        if ! check_service "Frontend" "https://catsupply.nl/"; then
            ALL_OK=false
            restart_service "frontend"
        fi
        echo ""
        
        # Check Admin
        if ! check_service "Admin" "https://catsupply.nl/admin"; then
            ALL_OK=false
            restart_service "admin"
        fi
        echo ""
        
        if [ "$ALL_OK" = true ]; then
            echo "✅ ALL CHECKS PASSING - catsupply.nl OPERATIONAL"
        else
            echo "⚠️  SOME CHECKS FAILED - Auto-restarting services..."
        fi
        
        echo ""
        echo "⏳ Waiting $CHECK_INTERVAL seconds until next check..."
        sleep $CHECK_INTERVAL
    done
}

# Start monitoring
monitor_loop
