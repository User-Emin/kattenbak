#!/bin/bash

# 📊 OVERBELASTING MONITORING SCRIPT
# Monitors CPU, memory, and RAG system for overload

set -e

echo "📊 OVERBELASTING MONITORING"
echo "============================"
echo ""

# CPU Check
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
echo "CPU Usage: ${CPU_USAGE}%"
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
  echo "⚠️  HIGH CPU USAGE (>80%)"
fi

# Memory Check
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
echo "Memory Usage: ${MEMORY_USAGE}%"
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
  echo "⚠️  HIGH MEMORY USAGE (>80%)"
fi

# RAG Vector Store Size
if [ -f "backend/data/vector-store.json" ]; then
  VECTOR_SIZE=$(du -h backend/data/vector-store.json | cut -f1)
  echo "RAG Vector Store: ${VECTOR_SIZE}"
else
  echo "RAG Vector Store: Not found (RAG not initialized)"
fi

# PM2 Processes
echo ""
echo "PM2 Processes:"
pm2 list | grep -E "backend|frontend|admin" || echo "PM2 not running"

# Node Processes Memory
echo ""
echo "Node Processes Memory:"
ps aux | grep -E "node|pm2" | grep -v grep | awk '{print $4, $11}' | head -5

# Database Connections
if command -v psql &> /dev/null; then
  DB_CONNECTIONS=$(psql -U postgres -d kattenbak -c "SELECT count(*) FROM pg_stat_activity;" -t 2>/dev/null || echo "N/A")
  echo ""
  echo "Database Connections: ${DB_CONNECTIONS}"
fi

echo ""
echo "============================"
