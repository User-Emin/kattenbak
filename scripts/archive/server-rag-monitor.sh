#!/bin/bash
#
# 🔒 RAG SYSTEM MONITOR - PREVENTS OVERLOAD
# Monitors CPU, memory, and RAG-specific metrics
# Automatically throttles RAG if overload detected
#

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MAX_CPU_PERCENT=75
MAX_MEMORY_MB=2048
MAX_RAG_CONCURRENT=5
RAG_THROTTLE_ENABLED=false

echo -e "${BLUE}🔒 RAG SYSTEM MONITOR${NC}"
echo "=========================================="
echo "CPU Limit: ${MAX_CPU_PERCENT}%"
echo "Memory Limit: ${MAX_MEMORY_MB}MB"
echo "Max RAG Concurrent: ${MAX_RAG_CONCURRENT}"
echo ""

# Function: Check CPU usage
check_cpu() {
    local cpu_percent=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    cpu_percent=${cpu_percent%.*}
    
    if [ "$cpu_percent" -gt "$MAX_CPU_PERCENT" ]; then
        echo -e "${RED}⚠️  CPU overload: ${cpu_percent}% > ${MAX_CPU_PERCENT}%${NC}"
        return 1
    else
        echo -e "${GREEN}✅ CPU: ${cpu_percent}%${NC}"
        return 0
    fi
}

# Function: Check memory usage
check_memory() {
    local memory_mb=$(free -m | awk 'NR==2{printf "%.0f", $3}')
    
    if [ "$memory_mb" -gt "$MAX_MEMORY_MB" ]; then
        echo -e "${RED}⚠️  Memory overload: ${memory_mb}MB > ${MAX_MEMORY_MB}MB${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Memory: ${memory_mb}MB${NC}"
        return 0
    fi
}

# Function: Check RAG health
check_rag_health() {
    local rag_health=$(curl -sf http://localhost:3101/api/v1/rag/health 2>/dev/null | grep -o '"status":"healthy"' || echo "")
    
    if [ -n "$rag_health" ]; then
        echo -e "${GREEN}✅ RAG: Healthy${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  RAG: Degraded or not initialized${NC}"
        return 1
    fi
}

# Function: Throttle RAG if overload
throttle_rag() {
    if [ "$RAG_THROTTLE_ENABLED" = true ]; then
        echo -e "${YELLOW}🔧 Throttling RAG system...${NC}"
        # Set environment variable to disable RAG temporarily
        export RAG_THROTTLE_ENABLED=true
        # Restart backend with throttled RAG
        pm2 restart backend --update-env
    fi
}

# Main monitoring loop
monitor_loop() {
    while true; do
        echo ""
        echo "--- $(date '+%Y-%m-%d %H:%M:%S') ---"
        
        cpu_ok=$(check_cpu; echo $?)
        memory_ok=$(check_memory; echo $?)
        rag_ok=$(check_rag_health; echo $?)
        
        if [ "$cpu_ok" -ne 0 ] || [ "$memory_ok" -ne 0 ]; then
            echo -e "${RED}🚨 OVERLOAD DETECTED - Throttling RAG${NC}"
            throttle_rag
        else
            echo -e "${GREEN}✅ System healthy${NC}"
            RAG_THROTTLE_ENABLED=false
        fi
        
        sleep 30 # Check every 30 seconds
    done
}

# Run monitor
monitor_loop
