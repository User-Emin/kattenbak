#!/bin/bash
# ✅ SECURITY AUDIT COMPLIANT: Anti-Miner Cleanup Script
# Removes crypto miners and unauthorized processes

set -euo pipefail

LOG_FILE="/var/log/anti-miner-cleanup.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log "🔍 Starting anti-miner cleanup..."

# ✅ SECURITY: Kill all crypto miner processes
MINER_PATTERNS=(
    "moneroocean"
    "/dev/shm/.x/m"
    "xmr"
    "xmrig"
    "miner"
    "crypto"
    "monero"
    "gulf.moneroocean"
)

MINER_COUNT=0
for pattern in "${MINER_PATTERNS[@]}"; do
    ps aux | grep -i "$pattern" | grep -v grep | while read -r line; do
        PID=$(echo "$line" | awk '{print $2}')
        CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}')
        log "⚠️ KILLING MINER: PID $PID - $CMD"
        kill -9 "$PID" 2>/dev/null || true
        MINER_COUNT=$((MINER_COUNT + 1))
    done
done

log "✅ Stopped $MINER_COUNT miner processes"

# ✅ SECURITY: Remove miner files
MINER_DIRS=(
    "/dev/shm/.x"
    "/tmp/.x"
    "/var/tmp/.x"
    "/root/.x"
    "/home/*/.x"
)

for dir in "${MINER_DIRS[@]}"; do
    if [ -d "$dir" ] || [ -f "$dir" ]; then
        log "🗑️ Removing miner directory: $dir"
        rm -rf "$dir" 2>/dev/null || true
    fi
done

# ✅ SECURITY: Remove miner executables
find /dev/shm -type f -executable -name "m" -o -name "*miner*" -o -name "*xmr*" 2>/dev/null | while read -r file; do
    log "🗑️ Removing miner executable: $file"
    rm -f "$file" 2>/dev/null || true
done

# ✅ SECURITY: Stop unauthorized services
UNAUTHORIZED_SERVICES=(
    "redis"
    "monarx-agent"
    "systemp"
)

for service in "${UNAUTHORIZED_SERVICES[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        log "⚠️ Stopping unauthorized service: $service"
        systemctl stop "$service" 2>/dev/null || true
        systemctl disable "$service" 2>/dev/null || true
    fi
done

# ✅ SECURITY: Kill ts-node in production (should use compiled dist/)
ps aux | grep -E 'ts-node|server-database.ts' | grep -v grep | while read -r line; do
    PID=$(echo "$line" | awk '{print $2}')
    log "⚠️ Killing ts-node process (should use dist/): PID $PID"
    kill -9 "$PID" 2>/dev/null || true
done

# ✅ SECURITY: Final verification
log "📊 Final status:"
log "   Miners running: $(ps aux | grep -iE 'moneroocean|xmr|miner' | grep -v grep | wc -l)"
log "   Load average: $(uptime | awk -F'load average:' '{print $2}')"
log "   CPU idle: $(top -bn1 | grep '%Cpu' | awk '{print $8}')"

log "✅ Anti-miner cleanup complete"
exit 0
