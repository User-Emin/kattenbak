#!/bin/bash

# 🔒 Server Security Monitor - CPU & Miner Detection
# ============================================================================
# Monitors CPU usage and detects Monero miners
# Run via cron: */5 * * * * /var/www/kattenbak/scripts/server-security-monitor.sh
# ============================================================================

set -e

LOG_FILE="/var/log/server-security-monitor.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@catsupply.nl}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# CPU Load Check
CPU_LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | awk '{ print $1 }' | sed 's/,//')
CPU_COUNT=$(nproc)
LOAD_THRESHOLD=$(echo "$CPU_COUNT * 0.85" | bc)

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🔒 SECURITY MONITOR CHECK"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "📊 CPU Info:"
log "   - CPU Cores: $CPU_COUNT"
log "   - Current Load: $CPU_LOAD"
log "   - Load Threshold: $LOAD_THRESHOLD"

if (( $(echo "$CPU_LOAD > $LOAD_THRESHOLD" | bc -l) )); then
    log "⚠️  WARNING: High CPU load detected ($CPU_LOAD)"
    log "🔍 Top processes:"
    top -bn1 | head -20 | tee -a "$LOG_FILE"
    
    # Alert if extremely high
    if (( $(echo "$CPU_LOAD > $CPU_COUNT * 1.5" | bc -l) )); then
        log "❌ CRITICAL: Extremely high CPU load!"
        # Could send email alert here
    fi
else
    log "✅ CPU load OK"
fi

# Monero Miner Detection
log ""
log "🔍 Checking for Monero miners..."

# Check for known miner processes
MINER_PROCESSES=$(ps aux | grep -iE 'xmr|monero|minerd|xmrig|cryptonight|cpuminer|nanopool' | grep -v grep || true)
if [ -n "$MINER_PROCESSES" ]; then
    log "❌ CRITICAL: Possible miner detected!"
    log "$MINER_PROCESSES"
    # Kill suspicious processes
    ps aux | grep -iE 'xmr|monero|minerd|xmrig|cryptonight' | grep -v grep | awk '{print $2}' | xargs -r kill -9
    log "⚠️  Killed suspicious processes"
    exit 1
else
    log "✅ No miners detected"
fi

# Check for suspicious high CPU processes
SUSPICIOUS=$(ps aux --sort=-%cpu | head -15 | awk '{if ($3 > 50 && $11 !~ /^(\/usr\/bin\/|pm2|node|nginx|postgres)/) print $0}')
if [ -n "$SUSPICIOUS" ]; then
    log "⚠️  High CPU processes (non-system):"
    log "$SUSPICIOUS"
fi

# Check for unknown network connections
log ""
log "🔍 Checking network connections..."
NETSTAT=$(netstat -tuln 2>/dev/null | grep ESTABLISHED | wc -l)
log "   - Active connections: $NETSTAT"

# Check for suspicious ports (mining ports)
MINING_PORTS=$(netstat -tuln 2>/dev/null | grep -E ':(3333|4444|5555|7777|8080|8443|8888)' | grep LISTEN || true)
if [ -n "$MINING_PORTS" ]; then
    log "⚠️  Suspicious ports detected:"
    log "$MINING_PORTS"
fi

# Disk space check
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log "⚠️  WARNING: Disk usage at ${DISK_USAGE}%"
else
    log "✅ Disk usage: ${DISK_USAGE}%"
fi

# Memory check
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -gt 90 ]; then
    log "⚠️  WARNING: Memory usage at ${MEM_USAGE}%"
else
    log "✅ Memory usage: ${MEM_USAGE}%"
fi

log ""
log "✅ Security check complete"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
