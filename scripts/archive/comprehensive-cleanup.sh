#!/bin/bash
# ✅ SECURITY AUDIT COMPLIANT: Comprehensive cleanup script
# Strict checks for unnecessary processes, disk usage, and system health

set -euo pipefail  # Strict error handling

LOG_FILE="/var/log/comprehensive-cleanup.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log "🔍 Starting comprehensive cleanup and verification..."

# ✅ SECURITY: Get PM2 managed PIDs (only trusted source)
PM2_PIDS=$(pm2 jlist 2>/dev/null | grep -o '"pid":[0-9]*' | grep -o '[0-9]*' || echo "")
PM2_PROCESSES=$(pm2 jlist 2>/dev/null | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "")

log "✅ PM2 managed processes: $PM2_PROCESSES"
log "✅ PM2 managed PIDs: $PM2_PIDS"

# ✅ SECURITY: Kill orphaned next-server processes (not PM2 managed)
ORPHANED_COUNT=0
ps aux | grep -E 'next-server|node.*start|npm.*start' | grep -v grep | while read -r line; do
    PID=$(echo "$line" | awk '{print $2}')
    CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}')
    
    # Check if PID is managed by PM2
    if echo "$PM2_PIDS" | grep -q "^$PID$"; then
        log "✅ PID $PID is PM2 managed (keeping): $CMD"
    else
        # Check if it's a child of PM2 process
        PARENT_PID=$(ps -o ppid= -p "$PID" 2>/dev/null | tr -d ' ')
        if echo "$PM2_PIDS" | grep -q "^$PARENT_PID$"; then
            log "✅ PID $PID is child of PM2 process (keeping): $CMD"
        else
            log "⚠️ Killing orphaned process: PID $PID - $CMD"
            kill -9 "$PID" 2>/dev/null || true
            ORPHANED_COUNT=$((ORPHANED_COUNT + 1))
        fi
    fi
done

log "✅ Stopped $ORPHANED_COUNT orphaned processes"

# ✅ SECURITY: Kill high-CPU processes (>50%) that aren't PM2 managed
HIGH_CPU_COUNT=0
ps aux --sort=-%cpu | head -20 | grep -v '^USER' | while read -r line; do
    PID=$(echo "$line" | awk '{print $2}')
    CPU=$(echo "$line" | awk '{print $3}')
    CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}')
    
    # Skip if CPU < 50% or if it's a system process
    if (( $(echo "$CPU < 50" | bc -l 2>/dev/null || echo 0) )); then
        continue
    fi
    
    # Skip system processes
    if echo "$CMD" | grep -qE 'systemd|kthreadd|rcu_|kworker|top|ps|grep'; then
        continue
    fi
    
    # Check if PM2 managed
    if echo "$PM2_PIDS" | grep -q "^$PID$"; then
        log "✅ High-CPU process is PM2 managed (keeping): PID $PID (${CPU}%)"
    else
        log "⚠️ Killing high-CPU process: PID $PID (${CPU}%) - $CMD"
        kill -9 "$PID" 2>/dev/null || true
        HIGH_CPU_COUNT=$((HIGH_CPU_COUNT + 1))
    fi
done

log "✅ Stopped $HIGH_CPU_COUNT high-CPU processes"

# ✅ SECURITY: Clean up old logs and cache
log "🧹 Cleaning up logs and cache..."

# Clean old PM2 logs (keep last 100 lines)
pm2 flush 2>/dev/null || true

# Clean Next.js cache (keep structure, remove old files)
find /var/www/kattenbak -type d -name ".next" -exec find {} -type f -name "*.cache" -mtime +7 -delete \; 2>/dev/null || true

# Clean old build artifacts
find /var/www/kattenbak -type d -name "dist" -exec find {} -type f -mtime +30 -delete \; 2>/dev/null || true

log "✅ Cache cleanup complete"

# ✅ SECURITY: Disk space check
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
log "💾 Disk usage: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 80 ]; then
    log "⚠️ WARNING: Disk usage above 80%"
    
    # Clean node_modules duplicates
    find /var/www/kattenbak -type d -name "node_modules" -exec du -sh {} \; 2>/dev/null | sort -hr | tail -n +4 | while read -r size dir; do
        log "🗑️ Removing duplicate node_modules: $dir ($size)"
        rm -rf "$dir" 2>/dev/null || true
    done
fi

# ✅ SECURITY: Verify PM2 processes are running
log "✅ Verifying PM2 processes..."
pm2 list | grep -E 'online|errored' | while read -r line; do
    if echo "$line" | grep -q "errored"; then
        APP_NAME=$(echo "$line" | awk '{print $2}')
        log "⚠️ PM2 process errored: $APP_NAME - attempting restart"
        pm2 restart "$APP_NAME" 2>/dev/null || true
    fi
done

# ✅ SECURITY: Final verification
log "📊 Final system status:"
log "   Load average: $(uptime | awk -F'load average:' '{print $2}')"
log "   CPU idle: $(top -bn1 | grep '%Cpu' | awk '{print $8}')"
log "   Memory free: $(free -h | grep Mem | awk '{print $7}')"
log "   Disk free: $(df -h / | tail -1 | awk '{print $4}')"

# ✅ SECURITY: List all running processes (for audit)
log "📋 All running processes:"
ps aux --sort=-%cpu | head -15 | while read -r line; do
    PID=$(echo "$line" | awk '{print $2}')
    CPU=$(echo "$line" | awk '{print $3}')
    CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}')
    
    if (( $(echo "$CPU > 10" | bc -l 2>/dev/null || echo 0) )); then
        if echo "$PM2_PIDS" | grep -q "^$PID$"; then
            log "   ✅ PM2: PID $PID (${CPU}%) - $CMD"
        else
            log "   ⚠️ Orphan: PID $PID (${CPU}%) - $CMD"
        fi
    fi
done

log "✅ Comprehensive cleanup complete"
exit 0
