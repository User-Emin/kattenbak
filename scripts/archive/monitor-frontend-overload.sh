#!/bin/bash

# 📊 FRONTEND OVERBELASTING MONITORING
# Detects CPU/memory overload during build and runtime

set -e

echo "📊 FRONTEND OVERBELASTING MONITORING"
echo "===================================="
echo ""

# CPU Check (Linux compatible)
if command -v top &> /dev/null && top -bn1 2>/dev/null | grep -q "Cpu(s)"; then
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
  echo "CPU Usage: ${CPU_USAGE}%"
  if (( $(echo "$CPU_USAGE > 80" | bc -l 2>/dev/null || echo "0") )); then
    echo "⚠️  HIGH CPU USAGE (>80%) - Build may be slow"
    OVERLOAD=true
  else
    echo "✅ CPU usage normal"
    OVERLOAD=false
  fi
else
  echo "⚠️  CPU monitoring not available (top command)"
  OVERLOAD=false
fi

# Memory Check (Linux compatible)
if command -v free &> /dev/null; then
  MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
  echo "Memory Usage: ${MEMORY_USAGE}%"
  if (( $(echo "$MEMORY_USAGE > 80" | bc -l 2>/dev/null || echo "0") )); then
    echo "⚠️  HIGH MEMORY USAGE (>80%)"
    OVERLOAD=true
  else
    echo "✅ Memory usage normal"
  fi
else
  echo "⚠️  Memory monitoring not available (free command)"
fi

# Frontend .next directory size
if [ -d "frontend/.next" ]; then
  NEXT_SIZE=$(du -sh frontend/.next | cut -f1)
  echo "Frontend .next size: ${NEXT_SIZE}"
  
  # Check if .next is too large (>500MB may indicate issues)
  NEXT_SIZE_MB=$(du -sm frontend/.next | cut -f1)
  if [ $NEXT_SIZE_MB -gt 500 ]; then
    echo "⚠️  Large .next directory (${NEXT_SIZE_MB}MB) - may cause slow builds"
    OVERLOAD=true
  else
    echo "✅ .next size normal"
  fi
else
  echo "⚠️  Frontend .next directory not found (not built)"
fi

# Node processes
echo ""
echo "Node Processes:"
ps aux | grep -E "node|next" | grep -v grep | awk '{print $4, $11}' | head -5

# PM2 Frontend status
echo ""
echo "PM2 Frontend Status:"
pm2 list | grep frontend || echo "Frontend not running in PM2"

# Build time check (if .next exists)
if [ -d "frontend/.next" ]; then
  BUILD_TIME=$(stat -c %Y frontend/.next 2>/dev/null || stat -f %m frontend/.next 2>/dev/null)
  CURRENT_TIME=$(date +%s)
  AGE=$((CURRENT_TIME - BUILD_TIME))
  AGE_MIN=$((AGE / 60))
  
  if [ $AGE_MIN -gt 60 ]; then
    echo "⚠️  Build is ${AGE_MIN} minutes old - may need rebuild"
  else
    echo "✅ Build is fresh (${AGE_MIN} minutes old)"
  fi
fi

echo ""
echo "===================================="
if [ "$OVERLOAD" = true ]; then
  echo "⚠️  OVERLOAD DETECTED - Review needed"
  exit 1
else
  echo "✅ NO OVERLOAD - System healthy"
  exit 0
fi
