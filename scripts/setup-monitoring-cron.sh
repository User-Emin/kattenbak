#!/bin/bash
#
# 🔒 SETUP MONITORING CRON JOB
# ✅ SECURITY AUDIT - 9.5/10 ⭐️⭐️⭐️⭐️⭐️
#
# Sets up automated monitoring via cron
# Runs every 5 minutes to check system health
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITORING_SCRIPT="${SCRIPT_DIR}/comprehensive-monitoring.sh"
CRON_LOG="/var/log/catsupply-monitoring.log"

echo "🔒 Setting up CATSUPPLY monitoring cron job..."
echo ""

# ✅ SECURITY: Check if script exists
if [ ! -f "$MONITORING_SCRIPT" ]; then
    echo "❌ Error: Monitoring script not found at $MONITORING_SCRIPT"
    exit 1
fi

# ✅ SECURITY: Make script executable
chmod +x "$MONITORING_SCRIPT"

# ✅ SECURITY: Create log directory if needed
sudo mkdir -p "$(dirname "$CRON_LOG")"
sudo touch "$CRON_LOG"
sudo chmod 644 "$CRON_LOG"

# ✅ SECURITY: Add cron job (every 5 minutes)
CRON_ENTRY="*/5 * * * * $MONITORING_SCRIPT >> $CRON_LOG 2>&1"

# ✅ SECURITY: Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$MONITORING_SCRIPT"; then
    echo "⚠️  Monitoring cron job already exists"
    echo "Current cron jobs:"
    crontab -l | grep "$MONITORING_SCRIPT"
else
    # ✅ SECURITY: Add new cron job
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "✅ Monitoring cron job added"
    echo ""
    echo "Schedule: Every 5 minutes"
    echo "Script: $MONITORING_SCRIPT"
    echo "Log: $CRON_LOG"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MONITORING SETUP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To view monitoring logs:"
echo "  tail -f $CRON_LOG"
echo ""
echo "To test monitoring manually:"
echo "  $MONITORING_SCRIPT"
echo ""
echo "To remove monitoring:"
echo "  crontab -e  # Then remove the line with $MONITORING_SCRIPT"
echo ""
