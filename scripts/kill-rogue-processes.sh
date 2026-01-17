#!/bin/bash
# ✅ CPU OPTIMIZATION: Kill rogue processes that aren't managed by PM2
# This script stops orphaned next-server processes

echo "🔍 Checking for rogue processes..."

# Get PM2 managed PIDs
PM2_PIDS=$(pm2 jlist | grep -o '"pid":[0-9]*' | grep -o '[0-9]*' || echo "")

# Kill orphaned next-server processes (not managed by PM2)
ps aux | grep 'next-server' | grep -v grep | while read -r line; do
  PID=$(echo "$line" | awk '{print $2}')
  
  # Check if PID is managed by PM2
  if echo "$PM2_PIDS" | grep -q "^$PID$"; then
    echo "✅ PID $PID is managed by PM2 (keeping)"
  else
    echo "⚠️ Killing rogue next-server process: PID $PID"
    kill -9 "$PID" 2>/dev/null || true
  fi
done

# Kill orphaned node processes with high CPU (not PM2 managed)
ps aux | grep 'node' | grep -v grep | grep -v 'pm2\|npm' | while read -r line; do
  PID=$(echo "$line" | awk '{print $2}')
  CPU=$(echo "$line" | awk '{print $3}')
  
  # Kill if CPU > 50% and not PM2 managed
  if [ -n "$CPU" ] && (( $(echo "$CPU > 50" | bc -l) )); then
    if ! echo "$PM2_PIDS" | grep -q "^$PID$"; then
      echo "⚠️ Killing high-CPU node process: PID $PID (CPU: ${CPU}%)"
      kill -9 "$PID" 2>/dev/null || true
    fi
  fi
done

echo "✅ Cleanup complete"
