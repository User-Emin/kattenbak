#!/bin/bash

# 🚨 CRITICAL SERVER CLEANUP - Malicious Files & CPU Optimization
# ============================================================================
# Expert Team Emergency Response
# ============================================================================

set -e

SERVER="185.224.139.74"
USER="root"
PASSWORD="Kizilay023@@"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚨 CRITICAL SERVER CLEANUP - EXPERT TEAM RESPONSE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Execute cleanup on server
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'ENDSSH'
    set -e
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1️⃣  CRITICAL: Stop Malicious Processes"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Find and kill systemp process (crypto miner)
    echo "🔍 Searching for malicious process: systemp"
    SYSTEMP_PIDS=$(ps aux | grep "systemp.*\.config\.json" | grep -v grep | awk '{print $2}' || echo "")
    
    if [ -n "$SYSTEMP_PIDS" ]; then
        echo "❌ CRITICAL: Malicious process found!"
        echo "PIDs: $SYSTEMP_PIDS"
        echo ""
        echo "🛑 Killing malicious processes..."
        echo "$SYSTEMP_PIDS" | xargs kill -9 2>/dev/null || true
        sleep 2
        echo "✅ Malicious processes killed"
    else
        echo "✅ No systemp process found"
    fi
    
    # Find and kill build processes on server (should be on GitHub Actions)
    echo ""
    echo "🔍 Searching for build processes (tsc, npm run build)..."
    BUILD_PIDS=$(ps aux | grep -E "tsc|npm.*build|node.*build" | grep -v grep | awk '{print $2}' || echo "")
    
    if [ -n "$BUILD_PIDS" ]; then
        echo "⚠️  WARNING: Build processes running on server (should be on GitHub Actions)"
        echo "PIDs: $BUILD_PIDS"
        echo ""
        echo "🛑 Stopping build processes..."
        echo "$BUILD_PIDS" | xargs kill -9 2>/dev/null || true
        sleep 2
        echo "✅ Build processes stopped"
    else
        echo "✅ No build processes found"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "2️⃣  CRITICAL: Find and Remove Malicious Files"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Find .config.json files (common crypto miner config)
    echo "🔍 Searching for malicious files..."
    
    # Check common locations for miners
    MALICIOUS_LOCATIONS=(
        "/tmp/.config.json"
        "/tmp/systemp"
        "/var/tmp/.config.json"
        "/root/.config.json"
        "/root/systemp"
        "/home/*/.config.json"
        "/home/*/systemp"
        "/var/www/*/.config.json"
        "/usr/local/bin/systemp"
    )
    
    FOUND_MALICIOUS=0
    
    for location in "${MALICIOUS_LOCATIONS[@]}"; do
        for file in $(find $location 2>/dev/null || true); do
            if [ -f "$file" ]; then
                echo "❌ MALICIOUS FILE FOUND: $file"
                echo "   Removing..."
                rm -f "$file"
                FOUND_MALICIOUS=$((FOUND_MALICIOUS + 1))
            fi
        done
    done
    
    # Check for suspicious cron jobs
    echo ""
    echo "🔍 Checking cron jobs for malicious entries..."
    MALICIOUS_CRONS=$(crontab -l 2>/dev/null | grep -E "systemp|\.config\.json|curl.*\||wget.*\|" || true)
    
    if [ -n "$MALICIOUS_CRONS" ]; then
        echo "❌ MALICIOUS CRON JOBS FOUND:"
        echo "$MALICIOUS_CRONS"
        echo ""
        echo "🛑 Removing malicious cron jobs..."
        crontab -l 2>/dev/null | grep -vE "systemp|\.config\.json|curl.*\||wget.*\|" | crontab - 2>/dev/null || crontab -r 2>/dev/null
        echo "✅ Malicious cron jobs removed"
    else
        echo "✅ No malicious cron jobs found"
    fi
    
    if [ $FOUND_MALICIOUS -eq 0 ]; then
        echo "✅ No malicious files found in common locations"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "3️⃣  CPU OPTIMIZATION: Stop Unnecessary Builds"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Stop any running builds
    echo "🛑 Ensuring no builds are running on server..."
    
    # Check for node processes doing builds
    NODE_BUILD_PROCESSES=$(ps aux | grep node | grep -E "build|tsc|compile" | grep -v grep || true)
    if [ -n "$NODE_BUILD_PROCESSES" ]; then
        echo "⚠️  WARNING: Build processes detected"
        echo "$NODE_BUILD_PROCESSES"
        echo ""
        echo "🛑 Stopping build processes..."
        ps aux | grep node | grep -E "build|tsc|compile" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
        echo "✅ Build processes stopped"
    else
        echo "✅ No build processes running"
    fi
    
    # Remove node_modules/.bin/tsc if not needed (builds should be on GitHub)
    if [ -d "/var/www/kattenbak/node_modules/.bin/tsc" ]; then
        echo "⚠️  INFO: tsc found in node_modules (normal for TypeScript projects)"
        echo "   This is OK, but builds should happen on GitHub Actions"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "4️⃣  CPU MONITORING: Current Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    echo "📊 Current CPU Usage:"
    uptime
    echo ""
    echo "📊 Top 5 CPU Processes:"
    ps aux --sort=-%cpu | head -6 | tail -5
    echo ""
    
    # Check PM2 status
    echo "📊 PM2 Status:"
    pm2 list 2>/dev/null || echo "PM2 not running"
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ CLEANUP COMPLETE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
ENDSSH
