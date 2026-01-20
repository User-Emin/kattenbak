#!/bin/bash
#
# 🔒 SERVER MONITORING & AUTO-MANAGEMENT
# Monitors CPU, Memory, Disk, Load
# Auto-restarts services if unhealthy
# Prevents overloading
#

set -euo pipefail

SERVER_HOST="185.224.139.74"
SERVER_USER="root"
MAX_CPU_PERCENT=80
MAX_MEMORY_PERCENT=85
MAX_LOAD=4.0

# Check and auto-fix
sshpass -p 'Pursangue66@' ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" bash << EOF
    # Get metrics
    CPU_USAGE=\$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - \$1}')
    MEMORY_USAGE=\$(free | grep Mem | awk '{printf "%.0f", \$3/\$2 * 100}')
    LOAD_AVG=\$(uptime | awk -F'load average:' '{print \$2}' | awk '{print \$1}' | sed 's/,//')
    
    echo "CPU: \${CPU_USAGE}% (max: ${MAX_CPU_PERCENT}%)"
    echo "Memory: \${MEMORY_USAGE}% (max: ${MAX_MEMORY_PERCENT}%)"
    echo "Load: \${LOAD_AVG} (max: ${MAX_LOAD})"
    
    # Check if over limits
    if (( \$(echo "\${CPU_USAGE} > ${MAX_CPU_PERCENT}" | bc -l) )) || \
       (( \${MEMORY_USAGE} > ${MAX_MEMORY_PERCENT} )) || \
       (( \$(echo "\${LOAD_AVG} > ${MAX_LOAD}" | bc -l) )); then
        echo "⚠️  Server overloaded! Restarting services..."
        pm2 restart all
        sleep 10
    fi
    
    # Health check services
    if ! curl -sf http://localhost:3101/api/v1/health > /dev/null; then
        echo "⚠️  Backend unhealthy, restarting..."
        pm2 restart backend
    fi
    
    if ! curl -sf http://localhost:3000 > /dev/null; then
        echo "⚠️  Frontend unhealthy, restarting..."
        pm2 restart frontend
    fi
    
    echo "✅ Server monitoring complete"
EOF
